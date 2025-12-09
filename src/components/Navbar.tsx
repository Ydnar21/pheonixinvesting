import { useState, useEffect } from 'react';
import { TrendingUp, LogOut, User, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/supabase';
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
    }
  }, [profile]);

  async function loadUnreadCount() {
    if (!profile) return;
    setUnreadCount(0);
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
    { id: 'community', label: 'Community' },
    { id: 'news', label: 'News' },
    { id: 'calendar', label: 'Resources' },
    { id: 'strategy', label: 'Strategy' },
    { id: 'ai-bot', label: 'AI Bot' },
    { id: 'about', label: 'About' },
  ];

  const adminItems = profile?.is_admin ? [
    { id: 'watchlist-approval', label: 'Approvals' },
    { id: 'admin', label: 'Admin' },
  ] : [];

  return (
    <>
    <nav className="bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => onNavigate('watchlist')}
              className="flex items-center space-x-3 group"
            >
              <img
                src="/public/LiquidPheonix.png"
                alt="Liquid Phoenix"
                className="w-10 h-10 transition-transform group-hover:scale-110"
              />
              <span className="text-xl font-bold bg-gradient-to-r from-orange-500 to-orange-400 bg-clip-text text-transparent">Liquid Phoenix</span>
            </button>

            <div className="hidden md:flex space-x-1">
              {[...navItems, ...adminItems].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/25'
                      : 'text-slate-400 hover:text-orange-400 hover:bg-slate-800/50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleOpenMessages()}
              className="relative p-2.5 text-slate-400 hover:text-orange-400 hover:bg-slate-800/50 rounded-lg transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-600 to-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-lg">
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setShowProfile(true)}
              className="flex items-center space-x-2 px-3 py-2 text-slate-300 hover:text-orange-400 hover:bg-slate-800/50 rounded-lg transition-all"
            >
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">{profile?.username}</span>
            </button>
            <button
              onClick={signOut}
              className="flex items-center space-x-2 px-3 py-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Sign Out</span>
            </button>
          </div>
        </div>

        <div className="md:hidden flex space-x-1 pb-3 overflow-x-auto">
          {[...navItems, ...adminItems].map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-3 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm ${
                currentPage === item.id
                  ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg shadow-orange-500/25'
                  : 'text-slate-400 hover:text-orange-400 hover:bg-slate-800/50'
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
