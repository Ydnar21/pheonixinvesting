import { useState } from 'react';
import { AuthProvider, useAuth } from './context/FirebaseAuthContext';
import FirebaseAuth from './components/FirebaseAuth';
import Navbar from './components/Navbar';
import Community from './pages/Community';
import News from './pages/News';
import About from './pages/About';
import Calendar from './pages/Calendar';
import Strategy from './pages/Strategy';
import AIBot from './pages/AIBot';
import Watchlist from './pages/Watchlist';
import WatchlistApproval from './pages/WatchlistApproval';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('watchlist');

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-orange-500 border-r-transparent border-b-transparent border-l-transparent mx-auto mb-3"></div>
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <FirebaseAuth />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'watchlist':
        return <Watchlist />;
      case 'watchlist-approval':
        return <WatchlistApproval />;
      case 'calendar':
        return <Calendar />;
      case 'community':
        return <Community />;
      case 'news':
        return <News />;
      case 'strategy':
        return <Strategy />;
      case 'ai-bot':
        return <AIBot />;
      case 'about':
        return <About />;
      default:
        return <Watchlist />;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar currentPage={currentPage} onNavigate={setCurrentPage} />
      {renderPage()}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
