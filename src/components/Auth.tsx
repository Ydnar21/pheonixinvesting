import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TrendingUp } from 'lucide-react';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!username.trim()) {
        setError('Username is required');
        setLoading(false);
        return;
      }

      if (isSignUp) {
        const { error } = await signUp(username, password);
        if (error) setError(error.message);
      } else {
        const { error } = await signIn(username, password);
        if (error) setError(error.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-400 blur-2xl opacity-20"></div>
              <img
                src="/src/LiquidPheonix.png"
                alt="Liquid Phoenix"
                className="w-20 h-20 relative"
              />
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center gradient-text mb-2">
            {isSignUp ? 'Join Liquid Phoenix' : 'Welcome Back'}
          </h2>
          <p className="text-center text-slate-400 mb-8">
            {isSignUp ? 'Create your account to get started' : 'Sign in to continue'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="input-field"
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-950/30 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg text-sm backdrop-blur-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-base"
            >
              {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-orange-400 hover:text-orange-300 text-sm transition-colors font-medium"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-slate-600 text-sm">
          <p>© 2025 Liquid Phoenix. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
