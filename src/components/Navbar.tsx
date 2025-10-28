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

  const adminItems = profile?.is_admin
    ? [{ id: 'admin-trades', label: 'Manage Trades' }]
    : [];

  return (
    <nav className="glass sticky top-0 z-50 border-b border-slate-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center space-x-8">
            <button
              onClick={() => onNavigate('portfolio')}
              className="flex items-center space-x-3 group"
            >
              <div className="gradient-bg p-2.5 rounded-xl group-hover:scale-110 transition-transform duration-200 shadow-soft">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold gradient-text">Liquid Phoenix</span>
            </button>

            <div className="hidden md:flex space-x-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-soft'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              {adminItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 ${
                    currentPage === item.id
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-soft'
                      : 'text-orange-600 hover:bg-orange-50 hover:text-orange-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-4 py-2 bg-slate-100/80 rounded-xl">
              <User className="w-4 h-4 text-slate-600" />
              <span className="text-slate-700 font-semibold">{profile?.username}</span>
            </div>
            <button
              onClick={signOut}
              className="flex items-center space-x-2 px-5 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">Sign Out</span>
            </button>
          </div>
        </div>

        <div className="md:hidden flex space-x-2 pb-4 overflow-x-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap ${
                currentPage === item.id
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-soft'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
          {adminItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`px-4 py-2.5 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap ${
                currentPage === item.id
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-soft'
                  : 'text-orange-600 hover:bg-orange-50'
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
