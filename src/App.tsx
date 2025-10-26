import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './components/Auth';
import Navbar from './components/Navbar';
import Portfolio from './pages/Portfolio';
import Community from './pages/Community';
import News from './pages/News';
import About from './pages/About';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('portfolio');

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
      case 'portfolio':
        return <Portfolio />;
      case 'community':
        return <Community />;
      case 'news':
        return <News />;
      case 'about':
        return <About />;
      default:
        return <Portfolio />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
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
