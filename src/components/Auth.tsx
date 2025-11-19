import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { TrendingUp } from 'lucide-react';

export default function Auth() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!username.trim()) {
          setError('Username is required');
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, username);
        if (error) setError(error.message);
      } else {
        const { error } = await signIn(email, password);
        if (error) setError(error.message);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glass rounded-3xl shadow-2xl p-10 phoenix-glow">
          <div className="flex items-center justify-center mb-8">
            <img
              src="/LiquidPheonix.png"
              alt="Liquid Phoenix"
              className="w-24 h-24 drop-shadow-[0_0_15px_rgba(249,115,22,0.5)]"
            />
          </div>

          <h2 className="text-5xl font-bold text-center gradient-text mb-3">
            {isSignUp ? 'Join Liquid Phoenix' : 'Welcome Back'}
          </h2>
          <p className="text-center text-slate-400 text-lg mb-10 font-medium">
            {isSignUp ? 'Create your account to get started' : 'Sign in to your account'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div>
                <label htmlFor="username" className="block text-sm font-bold text-orange-400 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-5 py-3.5 border-2 border-orange-500/30 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-slate-900/50 text-slate-200 placeholder:text-slate-500"
                  placeholder="Choose a username"
                  required={isSignUp}
                />
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-bold text-orange-400 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3.5 border-2 border-orange-500/30 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-slate-900/50 text-slate-200 placeholder:text-slate-500"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-orange-400 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3.5 border-2 border-orange-500/30 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-slate-900/50 text-slate-200 placeholder:text-slate-500"
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-950/50 border-2 border-red-500 text-red-400 px-5 py-4 rounded-xl text-sm font-bold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full gradient-bg text-white font-bold py-4 rounded-xl phoenix-glow hover:shadow-orange-500/60 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] text-lg"
            >
              {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-orange-400 hover:text-orange-300 font-bold transition-colors text-base"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>

        <div className="mt-8 text-center text-orange-400/80 text-base">
          <p className="font-bold">Liquid Phoenix - Rise from the Ashes</p>
        </div>
      </div>
    </div>
  );
}
