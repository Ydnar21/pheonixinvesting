import { TrendingUp, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

type NavbarProps = {
  currentPage: string;
  onNavigate: (page: string) => void;
};

export default function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const { profile, signOut } = useAuth();

  const navItems = [
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'community', label: 'Community' },
    { id: 'news', label: 'News' },
    { id: 'about', label: 'About' },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => onNavigate('portfolio')}
              className="flex items-center space-x-2 group"
            >
              <div className="bg-emerald-500 p-2 rounded-lg group-hover:bg-emerald-600 transition">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900">Liquid Phoenix</span>
            </button>

            <div className="hidden md:flex space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    currentPage === item.id
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <User className="w-4 h-4 text-slate-600" />
              <span className="text-slate-700 font-medium">{profile?.username}</span>
            </div>
            <button
              onClick={signOut}
              className="flex items-center space-x-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        <div className="md:hidden flex space-x-1 pb-3 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap ${
                currentPage === item.id
                  ? 'bg-emerald-50 text-emerald-600'
                  : 'text-slate-600 hover:bg-slate-50'
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
