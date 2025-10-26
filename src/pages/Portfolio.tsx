import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Percent, BarChart3, ExternalLink, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import PlaidLink from '../components/PlaidLink';

interface Holding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  cost_basis: number;
  current_price: number;
  institution_value: number;
}

export default function Portfolio() {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const demoData = {
    totalValue: 45678.32,
    dayChange: 234.56,
    dayChangePercent: 0.52,
    positions: [
      { symbol: 'AAPL', name: 'Apple Inc.', shares: 10, avgCost: 175.32, currentPrice: 182.45, value: 1824.50 },
      { symbol: 'TSLA', name: 'Tesla Inc.', shares: 5, avgCost: 245.67, currentPrice: 258.34, value: 1291.70 },
      { symbol: 'MSFT', name: 'Microsoft Corp.', shares: 8, avgCost: 340.12, currentPrice: 352.89, value: 2823.12 },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', shares: 15, avgCost: 480.23, currentPrice: 495.67, value: 7435.05 },
    ],
  };

  useEffect(() => {
    if (user) {
      checkConnection();
      loadHoldings();
    }
  }, [user]);

  const checkConnection = async () => {
    try {
      const { data, error } = await supabase
        .from('plaid_items')
        .select('id')
        .eq('user_id', user?.id)
        .limit(1);

      if (!error && data && data.length > 0) {
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Error checking connection:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadHoldings = async () => {
    try {
      const { data, error } = await supabase
        .from('portfolio_holdings')
        .select('*')
        .eq('user_id', user?.id)
        .order('institution_value', { ascending: false });

      if (!error && data) {
        setHoldings(data);
      }
    } catch (error) {
      console.error('Error loading holdings:', error);
    }
  };

  const syncHoldings = async () => {
    setSyncing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/plaid-handler/sync_holdings`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      await loadHoldings();
    } catch (error) {
      console.error('Error syncing holdings:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleConnectionSuccess = () => {
    setIsConnected(true);
    loadHoldings();
  };

  const calculateGainLoss = (quantity: number, costBasis: number, currentPrice: number) => {
    const gain = (currentPrice - costBasis) * quantity;
    const gainPercent = ((currentPrice - costBasis) / costBasis) * 100;
    return { gain, gainPercent };
  };

  const totalValue = isConnected
    ? holdings.reduce((sum, h) => sum + h.institution_value, 0)
    : demoData.totalValue;

  const displayPositions = isConnected
    ? holdings.map((h) => ({
        symbol: h.symbol,
        name: h.name,
        shares: h.quantity,
        avgCost: h.cost_basis,
        currentPrice: h.current_price,
        value: h.institution_value,
      }))
    : demoData.positions;

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Sign In Required</h2>
          <p className="text-slate-600">Please sign in to view your portfolio.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Portfolio Dashboard</h1>
          <p className="text-slate-600">Track your investments and monitor performance</p>
        </div>
        {isConnected && (
          <button
            onClick={syncHoldings}
            disabled={syncing}
            className="flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-4 py-2 rounded-lg transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
            <span>{syncing ? 'Syncing...' : 'Sync'}</span>
          </button>
        )}
      </div>

      {!isConnected && !loading && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-4">
            <div className="bg-amber-100 p-3 rounded-lg">
              <ExternalLink className="w-6 h-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-900 mb-2">
                Connect Your Robinhood Account
              </h3>
              <p className="text-amber-800 mb-4">
                Link your Robinhood account with read-only access to automatically sync your portfolio data, positions, and account value in real-time.
              </p>
              <PlaidLink onSuccess={handleConnectionSuccess} />
              <div className="mt-4 space-y-2">
                <p className="text-sm text-amber-700 font-medium">
                  Currently showing demo data. Connect your account to view your real portfolio.
                </p>
                <div className="bg-white/50 rounded-lg p-3 text-sm text-amber-800">
                  <p className="font-semibold mb-1">Security Note:</p>
                  <p>
                    Robinhood integration uses OAuth 2.0 through Plaid, a secure financial aggregation service,
                    ensuring read-only access without storing your credentials. Your login information is never shared with
                    or stored by this application.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600 text-sm font-medium">Total Value</span>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600 text-sm font-medium">Today's Change</span>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-600">
            +${demoData.dayChange.toFixed(2)}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600 text-sm font-medium">Today's Return</span>
            <Percent className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-emerald-600">
            +{demoData.dayChangePercent.toFixed(2)}%
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <BarChart3 className="w-6 h-6 text-slate-700" />
            <h2 className="text-xl font-bold text-slate-900">Your Positions</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Symbol</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Company</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Shares</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Avg Cost</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Current Price</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Total Value</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Gain/Loss</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {displayPositions.map((position) => {
                const { gain, gainPercent } = calculateGainLoss(
                  position.shares,
                  position.avgCost,
                  position.currentPrice
                );
                const isPositive = gain >= 0;

                return (
                  <tr key={position.symbol} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900">{position.symbol}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{position.name}</td>
                    <td className="px-6 py-4 text-right text-slate-900">{position.shares}</td>
                    <td className="px-6 py-4 text-right text-slate-600">
                      ${position.avgCost.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-900 font-medium">
                      ${position.currentPrice.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-900 font-semibold">
                      ${position.value.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={`font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}${gain.toFixed(2)}
                      </div>
                      <div className={`text-sm ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isPositive ? '+' : ''}{gainPercent.toFixed(2)}%
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
