import { TrendingUp, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type NavbarProps = {
  currentPage: string;
  onNavigate: (page: string) => void;
};

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { profile, signOut } = useAuth();

  const navItems = [
    { id: 'calendar', label: 'Calendar' },
    { id: 'community', label: 'Community' },
    { id: 'news', label: 'News' },
    { id: 'strategy', label: 'Strategy' },
    { id: 'ai-bot', label: 'AI Bot' },
    { id: 'about', label: 'About' },
  ];

  return (
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
            <div className="flex items-center space-x-2 text-slate-400">
              <User className="w-4 h-4" />
              <span className="text-sm">{profile?.username}</span>
            </div>
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
  );
}
