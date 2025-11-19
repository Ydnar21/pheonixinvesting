import { useState, useEffect } from 'react';
import { X, Upload, Edit2, Users, MessageCircle, UserPlus, UserMinus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface ProfileModalProps {
  userId: string;
  onClose: () => void;
  onOpenMessages?: (userId: string, username: string) => void;
}

interface UserProfile {
  id: string;
  username: string;
  bio: string | null;
  profile_picture_url: string | null;
  is_admin: boolean;
}

interface FollowStats {
  followers: number;
  following: number;
}

export default function ProfileModal({ userId, onClose, onOpenMessages }: ProfileModalProps) {
  const { profile: currentUserProfile } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [followStats, setFollowStats] = useState<FollowStats>({ followers: 0, following: 0 });
  const [isFollowing, setIsFollowing] = useState(false);
  const [isMutualFollow, setIsMutualFollow] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editBio, setEditBio] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = currentUserProfile?.id === userId;

  useEffect(() => {
    loadProfile();
    loadFollowStats();
    checkFollowStatus();
  }, [userId]);

  async function loadProfile() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error loading profile:', error);
    } else {
      setProfile(data);
      setEditBio(data.bio || '');
    }
    setLoading(false);
  }

  async function loadFollowStats() {
    const { data: followers } = await supabase
      .from('user_follows')
      .select('id')
      .eq('following_id', userId);

    const { data: following } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', userId);

    setFollowStats({
      followers: followers?.length || 0,
      following: following?.length || 0,
    });
  }

  async function checkFollowStatus() {
    if (!currentUserProfile || isOwnProfile) return;

    const { data: followData } = await supabase
      .from('user_follows')
      .select('id')
      .eq('follower_id', currentUserProfile.id)
      .eq('following_id', userId)
      .maybeSingle();

    setIsFollowing(!!followData);

    const { data: mutualData } = await supabase
      .rpc('are_mutual_follows', {
        user1_id: currentUserProfile.id,
        user2_id: userId,
      });

    setIsMutualFollow(mutualData || false);
  }

  async function handleFollow() {
    if (!currentUserProfile) return;

    if (isFollowing) {
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_id', currentUserProfile.id)
        .eq('following_id', userId);

      if (!error) {
        setIsFollowing(false);
        loadFollowStats();
        checkFollowStatus();
      }
    } else {
      const { error } = await supabase
        .from('user_follows')
        .insert([
          {
            follower_id: currentUserProfile.id,
            following_id: userId,
          },
        ]);

      if (!error) {
        setIsFollowing(true);
        loadFollowStats();
        checkFollowStatus();
      }
    }
  }

  async function handleProfilePictureUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !currentUserProfile) return;

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUserProfile.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ profile_picture_url: publicUrl })
        .eq('id', currentUserProfile.id);

      if (updateError) throw updateError;

      loadProfile();
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  }

  async function handleSaveBio() {
    if (!currentUserProfile) return;

    const { error } = await supabase
      .from('profiles')
      .update({ bio: editBio })
      .eq('id', currentUserProfile.id);

    if (!error) {
      setIsEditing(false);
      loadProfile();
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="glass rounded-2xl max-w-2xl w-full p-8">
          <p className="text-slate-400 text-center">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="glass rounded-2xl max-w-2xl w-full p-8">
          <p className="text-slate-400 text-center">Profile not found</p>
          <button onClick={onClose} className="mt-4 w-full bg-orange-500 text-white py-2 rounded-lg">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="glass rounded-2xl max-w-2xl w-full my-8">
        <div className="relative h-32 bg-gradient-to-r from-orange-500 to-red-500 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full transition"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-6 -mt-16 mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-4 border-slate-900 overflow-hidden bg-slate-800">
                {profile.profile_picture_url ? (
                  <img
                    src={profile.profile_picture_url}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-orange-400">
                    {profile.username[0].toUpperCase()}
                  </div>
                )}
              </div>
              {isOwnProfile && (
                <label className="absolute bottom-0 right-0 p-2 bg-orange-500 hover:bg-orange-600 rounded-full cursor-pointer transition">
                  <Upload className="w-4 h-4 text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-3xl font-bold text-white">{profile.username}</h2>
                {profile.is_admin && (
                  <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                    ADMIN
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-6 text-sm text-slate-400">
                <div>
                  <span className="font-bold text-white">{followStats.followers}</span> Followers
                </div>
                <div>
                  <span className="font-bold text-white">{followStats.following}</span> Following
                </div>
              </div>
            </div>

            {!isOwnProfile && currentUserProfile && (
              <div className="flex space-x-2">
                <button
                  onClick={handleFollow}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition ${
                    isFollowing
                      ? 'bg-slate-700 hover:bg-slate-600 text-white'
                      : 'bg-orange-500 hover:bg-orange-600 text-white'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserMinus className="w-4 h-4" />
                      <span>Unfollow</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Follow</span>
                    </>
                  )}
                </button>
                {isMutualFollow && onOpenMessages && (
                  <button
                    onClick={() => onOpenMessages(userId, profile.username)}
                    className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Message</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-slate-700 pt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-300">Bio</h3>
              {isOwnProfile && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-orange-400 hover:text-orange-300 text-sm flex items-center space-x-1"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>Edit</span>
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-orange-500/30 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-slate-900/50 text-slate-200 resize-none"
                  rows={4}
                  placeholder="Tell us about yourself..."
                  maxLength={500}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveBio}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg font-semibold transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditBio(profile.bio || '');
                    }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-semibold transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-slate-400 leading-relaxed">
                {profile.bio || 'No bio yet.'}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
