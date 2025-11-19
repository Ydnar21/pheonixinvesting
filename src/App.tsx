import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import Community from './pages/Community';
import News from './pages/News';
import About from './pages/About';
import Calendar from './pages/Calendar';
import Strategy from './pages/Strategy';
import AIBot from './pages/AIBot';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('calendar');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const renderPage = () => {
    switch (currentPage) {
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
        return <Calendar />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
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
