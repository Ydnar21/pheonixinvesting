import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Percent, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import TradeDetailModal from '../components/TradeDetailModal';

interface Trade {
  id: string;
  trade_type: string;
  symbol: string;
  company_name: string;
  quantity: number;
  cost_basis: number;
  current_price: number;
  option_expiration?: string;
  option_type?: string;
  strike_price?: number;
  break_even_price?: number;
  dd_summary?: string;
  price_targets?: string;
  dd_updated_at?: string;
}

export default function Portfolio() {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [editingSummary, setEditingSummary] = useState<string | null>(null);
  const [summaryText, setSummaryText] = useState('');

  useEffect(() => {
    if (user) {
      loadTrades();
      checkAdminStatus();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkAdminStatus = async () => {
    if (!user) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();

      if (data) {
        setIsAdmin(data.is_admin);
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const loadTrades = async () => {
    try {
      const { data, error } = await supabase
        .from('user_trades')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setTrades(data);
      }
    } catch (error) {
      console.error('Error loading trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGainLoss = (trade: Trade) => {
    if (trade.trade_type === 'option') {
      const contractValue = trade.current_price * 100;
      const costPerContract = trade.cost_basis * 100;
      const totalValue = contractValue * trade.quantity;
      const totalCost = costPerContract * trade.quantity;
      const gain = totalValue - totalCost;
      const gainPercent = ((trade.current_price - trade.cost_basis) / trade.cost_basis) * 100;
      return { gain, gainPercent, totalValue };
    } else {
      const gain = (trade.current_price - trade.cost_basis) * trade.quantity;
      const gainPercent = ((trade.current_price - trade.cost_basis) / trade.cost_basis) * 100;
      const totalValue = trade.current_price * trade.quantity;
      return { gain, gainPercent, totalValue };
    }
  };

  const handleEditSummary = (tradeId: string, currentSummary: string) => {
    setEditingSummary(tradeId);
    setSummaryText(currentSummary || '');
  };

  const handleSaveSummary = async (tradeId: string) => {
    try {
      const { error } = await supabase
        .from('user_trades')
        .update({
          dd_summary: summaryText,
          dd_updated_at: new Date().toISOString()
        })
        .eq('id', tradeId);

      if (!error) {
        await loadTrades();
        setEditingSummary(null);
        setSummaryText('');
      }
    } catch (error) {
      console.error('Error saving summary:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingSummary(null);
    setSummaryText('');
  };

  const calculateTotalValue = () => {
    return trades.reduce((sum, trade) => {
      const { totalValue } = calculateGainLoss(trade);
      return sum + totalValue;
    }, 0);
  };

  const calculateTotalGain = () => {
    return trades.reduce((sum, trade) => {
      const { gain } = calculateGainLoss(trade);
      return sum + gain;
    }, 0);
  };

  const totalValue = calculateTotalValue();
  const totalGain = calculateTotalGain();
  const totalGainPercent = trades.length > 0
    ? (totalGain / (totalValue - totalGain)) * 100
    : 0;

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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Portfolio Dashboard</h1>
        <p className="text-slate-600">Shared investment portfolio managed by admin</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600 text-sm font-medium">Total Value</span>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-3xl font-bold text-slate-900">
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600 text-sm font-medium">Total Gain/Loss</span>
            <TrendingUp className={`w-5 h-5 ${totalGain >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
          </div>
          <div className={`text-3xl font-bold ${totalGain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {totalGain >= 0 ? '+' : ''}${totalGain.toFixed(2)}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-600 text-sm font-medium">Total Return</span>
            <Percent className={`w-5 h-5 ${totalGain >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
          </div>
          <div className={`text-3xl font-bold ${totalGain >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {totalGain >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%
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

        {loading ? (
          <div className="p-12 text-center text-slate-600">Loading positions...</div>
        ) : trades.length === 0 ? (
          <div className="p-12 text-center text-slate-600">
            No positions yet. The admin will add trades to the portfolio.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Type</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Symbol</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Company</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Quantity</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Avg Cost</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Current Price</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Total Value</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Details</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Gain/Loss</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {trades.map((trade) => {
                  const { gain, gainPercent, totalValue } = calculateGainLoss(trade);
                  const isPositive = gain >= 0;

                  return (
                    <>
                      <tr
                        key={trade.id}
                        onClick={() => setSelectedTrade(trade)}
                        className="hover:bg-slate-50 transition cursor-pointer"
                      >
                        <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            trade.trade_type === 'stock'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {trade.trade_type.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`font-bold px-3 py-1 rounded border-2 ${
                            isPositive
                              ? 'text-emerald-700 border-emerald-500 bg-emerald-50'
                              : 'text-red-700 border-red-500 bg-red-50'
                          }`}
                        >
                          {trade.symbol}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{trade.company_name}</td>
                      <td className="px-6 py-4 text-right text-slate-900">
                        {trade.quantity}
                        {trade.trade_type === 'option' && ' contracts'}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-600">
                        ${trade.cost_basis.toFixed(2)}
                        {trade.trade_type === 'option' && <div className="text-xs text-slate-500">/contract</div>}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-900 font-medium">
                        ${trade.current_price.toFixed(2)}
                        {trade.trade_type === 'option' && <div className="text-xs text-slate-500">/contract</div>}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-900 font-semibold">
                        ${totalValue.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {trade.trade_type === 'option' && (
                          <div>
                            <div className="font-medium">
                              ${trade.strike_price} {trade.option_type?.toUpperCase()}
                            </div>
                            <div className="text-xs">Exp: {trade.option_expiration}</div>
                            {trade.break_even_price && (
                              <div className="text-xs text-slate-500">B/E: ${trade.break_even_price}</div>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className={`font-semibold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                          {isPositive ? '+' : ''}${gain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className={`text-sm ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                          {isPositive ? '+' : ''}{gainPercent.toFixed(2)}%
                        </div>
                      </td>
                    </tr>
                    {isAdmin && (
                      <tr key={`${trade.id}-summary`} className="bg-blue-50 border-t border-blue-100">
                        <td colSpan={9} className="px-6 py-4">
                          {editingSummary === trade.id ? (
                            <div className="space-y-3" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-start justify-between">
                                <label className="text-sm font-medium text-slate-700">Quick Summary</label>
                              </div>
                              <textarea
                                value={summaryText}
                                onChange={(e) => setSummaryText(e.target.value)}
                                placeholder="Add a quick summary about this position..."
                                rows={2}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                              />
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleSaveSummary(trade.id)}
                                  className="px-4 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                                >
                                  Save
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-4 py-1.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm font-medium"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between" onClick={(e) => e.stopPropagation()}>
                              <div className="flex-1">
                                {trade.dd_summary ? (
                                  <p className="text-sm text-slate-700">{trade.dd_summary}</p>
                                ) : (
                                  <p className="text-sm text-slate-500 italic">No summary added yet</p>
                                )}
                              </div>
                              <button
                                onClick={() => handleEditSummary(trade.id, trade.dd_summary || '')}
                                className="ml-4 px-3 py-1 text-xs text-blue-600 hover:bg-blue-100 rounded-lg transition font-medium"
                              >
                                {trade.dd_summary ? 'Edit' : 'Add Summary'}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedTrade && (
        <TradeDetailModal
          trade={selectedTrade}
          onClose={() => setSelectedTrade(null)}
          gain={calculateGainLoss(selectedTrade).gain}
          gainPercent={calculateGainLoss(selectedTrade).gainPercent}
          totalValue={calculateGainLoss(selectedTrade).totalValue}
        />
      )}
    </div>
  );
}
