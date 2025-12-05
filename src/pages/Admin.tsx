import { useState } from 'react';
import { RefreshCw, Settings, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UpdateResult {
  message: string;
  updated: Array<{ symbol: string; price: number }>;
  failed: string[];
  timestamp: string;
}

export default function Admin() {
  const { profile } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [result, setResult] = useState<UpdateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUpdatePrices() {
    setUpdating(true);
    setError(null);
    setResult(null);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(
        `${supabaseUrl}/functions/v1/update-stock-prices`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update stock prices');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setUpdating(false);
    }
  }

  if (!profile?.is_admin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-slate-400 text-lg">Access denied. Admin privileges required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <Settings className="w-10 h-10 text-orange-500" />
          <h1 className="text-5xl font-bold gradient-text">Admin Dashboard</h1>
        </div>
        <p className="text-slate-400 text-lg">
          Manage system settings and perform administrative tasks
        </p>
      </div>

      <div className="glass rounded-2xl p-8">
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-3">
            <TrendingUp className="w-6 h-6 text-orange-400" />
            <h2 className="text-2xl font-bold text-white">Stock Price Updates</h2>
          </div>
          <p className="text-slate-400 mb-6">
            Manually trigger an update of all stock prices in the watchlist. This fetches current prices from Google Finance.
          </p>

          <button
            onClick={handleUpdatePrices}
            disabled={updating}
            className="flex items-center space-x-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-5 h-5 ${updating ? 'animate-spin' : ''}`} />
            <span>{updating ? 'Updating Prices...' : 'Update Stock Prices'}</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mt-6">
            <div className="flex items-center space-x-2 text-red-400">
              <XCircle className="w-5 h-5" />
              <span className="font-medium">Error: {error}</span>
            </div>
          </div>
        )}

        {result && (
          <div className="bg-slate-800/50 rounded-lg p-6 mt-6">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <h3 className="text-lg font-bold text-white">{result.message}</h3>
            </div>

            {result.updated.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-300 mb-2">
                  Successfully Updated ({result.updated.length}):
                </h4>
                <div className="space-y-1">
                  {result.updated.map((item) => (
                    <div key={item.symbol} className="flex items-center justify-between text-sm">
                      <span className="text-orange-400 font-medium">{item.symbol}</span>
                      <span className="text-slate-400">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.failed.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-red-400 mb-2">
                  Failed to Update ({result.failed.length}):
                </h4>
                <div className="space-y-1">
                  {result.failed.map((symbol) => (
                    <div key={symbol} className="text-sm text-red-400">
                      {symbol}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-500">
                Last updated: {new Date(result.timestamp).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
