import { useState, useEffect } from 'react';
import { TrendingUp, LogOut, User, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import ProfileModal from './ProfileModal';
import Messages from './Messages';

type NavbarProps = {
  currentPage: string;
  onNavigate: (page: string) => void;
};

interface DirectMessageInfo {
  userId: string;
  username: string;
}

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { profile, signOut } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      loadUnreadCount();
      const subscription = supabase
        .channel('unread-messages')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'direct_messages',
            filter: `receiver_id=eq.${profile.id}`,
          },
          () => {
            loadUnreadCount();
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [profile]);

  async function loadUnreadCount() {
    if (!profile) return;

    const { data } = await supabase.rpc('get_unread_message_count', {
      user_id: profile.id,
    });

    setUnreadCount(data || 0);
  }

  function handleOpenMessages(userId?: string, username?: string) {
    setShowMessages(true);
    if (userId) {
      setSelectedUserId(userId);
    }
  }

  function handleCloseMessages() {
    setShowMessages(false);
    setSelectedUserId(null);
    loadUnreadCount();
  }

  const navItems = [
    { id: 'calendar', label: 'Calendar' },
    { id: 'community', label: 'Community' },
    { id: 'news', label: 'News' },
    { id: 'strategy', label: 'Strategy' },
    { id: 'ai-bot', label: 'AI Bot' },
    { id: 'about', label: 'About' },
  ];

  return (
    <>
    <nav className="bg-slate-900 border-b border-orange-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => onNavigate('calendar')}
              className="flex items-center space-x-2"
            >
              <img
                src="/src/LiquidPheonix.png.png"
                alt="Liquid Phoenix"
                className="w-10 h-10"
              />
              <span className="text-xl font-bold text-orange-500">Liquid Phoenix</span>
            </button>

            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    currentPage === item.id
                      ? 'bg-orange-500 text-white'
                      : 'text-slate-400 hover:text-orange-500'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleOpenMessages()}
              className="relative p-2 text-slate-400 hover:text-orange-500 transition"
            >
              <MessageCircle className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowProfile(true)}
              className="flex items-center space-x-2 text-slate-400 hover:text-orange-500 transition"
            >
              <User className="w-4 h-4" />
              <span className="text-sm">{profile?.username}</span>
            </button>
            <button
              onClick={signOut}
              className="flex items-center space-x-1 text-slate-400 hover:text-orange-500 transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Sign Out</span>
            </button>
          </div>
        </div>

        <div className="md:hidden flex space-x-1 pb-3 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-3 py-2 rounded-lg font-medium transition whitespace-nowrap text-sm ${
                currentPage === item.id
                  ? 'bg-orange-500 text-white'
                  : 'text-slate-400 hover:text-orange-500'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
    {showProfile && profile && (
      <ProfileModal
        userId={profile.id}
        onClose={() => setShowProfile(false)}
        onOpenMessages={handleOpenMessages}
      />
    )}
    {showMessages && <Messages onClose={handleCloseMessages} />}
    </>
  );
}
