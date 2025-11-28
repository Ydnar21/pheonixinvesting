import { useState, useEffect } from 'react';
import { TrendingUp, Plus, Clock, Target, DollarSign, Building2, ChevronDown, ChevronUp, Pencil } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface WatchlistStock {
  id: string;
  symbol: string;
  company_name: string;
  sector: string;
  term: 'long' | 'short';
  notes: string | null;
  current_price: number | null;
  target_price: number | null;
  added_at: string;
  submitted_by_user: string | null;
  profiles: {
    username: string;
  } | null;
}

interface WatchlistSubmission {
  id: string;
  symbol: string;
  company_name: string;
  sector: string;
  term: 'long' | 'short';
  notes: string | null;
  status: 'pending' | 'approved' | 'denied';
  submitted_at: string;
}

export default function Watchlist() {
  const { profile } = useAuth();
  const [stocks, setStocks] = useState<WatchlistStock[]>([]);
  const [mySubmissions, setMySubmissions] = useState<WatchlistSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSubmitForm, setShowSubmitForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingStock, setEditingStock] = useState<WatchlistStock | null>(null);
  const [expandedSector, setExpandedSector] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    symbol: '',
    company_name: '',
    sector: 'Technology',
    term: 'long' as 'long' | 'short',
    notes: '',
    current_price: '',
    target_price: '',
  });

  const sectors = [
    'Technology',
    'Healthcare',
    'Finance',
    'Energy',
    'Consumer Discretionary',
    'Consumer Staples',
    'Industrials',
    'Materials',
    'Real Estate',
    'Utilities',
    'Communication Services',
  ];

  useEffect(() => {
    loadWatchlist();
    loadMySubmissions();
  }, [profile]);

  async function loadWatchlist() {
    const { data, error } = await supabase
      .from('watchlist_stocks')
      .select(`
        *,
        profiles:submitted_by_user (
          username
        )
      `)
      .order('sector', { ascending: true })
      .order('symbol', { ascending: true });

    if (!error && data) {
      setStocks(data as WatchlistStock[]);
    }
    setLoading(false);
  }

  async function loadMySubmissions() {
    if (!profile) return;

    const { data, error } = await supabase
      .from('watchlist_submissions')
      .select('*')
      .eq('submitted_by', profile.id)
      .order('submitted_at', { ascending: false });

    if (!error && data) {
      setMySubmissions(data);
    }
  }

  async function handleAddStock(e: React.FormEvent) {
    e.preventDefault();
    if (!profile?.is_admin) return;

    const { error } = await supabase.from('watchlist_stocks').insert({
      symbol: formData.symbol.toUpperCase(),
      company_name: formData.company_name,
      sector: formData.sector,
      term: formData.term,
      notes: formData.notes || null,
      current_price: formData.current_price ? parseFloat(formData.current_price) : null,
      target_price: formData.target_price ? parseFloat(formData.target_price) : null,
      added_by: profile.id,
    });

    if (!error) {
      setShowAddForm(false);
      setFormData({
        symbol: '',
        company_name: '',
        sector: 'Technology',
        term: 'long',
        notes: '',
        current_price: '',
        target_price: '',
      });
      loadWatchlist();
    }
  }

  async function handleSubmitStock(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    const { error } = await supabase.from('watchlist_submissions').insert({
      symbol: formData.symbol.toUpperCase(),
      company_name: formData.company_name,
      sector: formData.sector,
      term: formData.term,
      notes: formData.notes || null,
      submitted_by: profile.id,
    });

    if (!error) {
      setShowSubmitForm(false);
      setFormData({
        symbol: '',
        company_name: '',
        sector: 'Technology',
        term: 'long',
        notes: '',
        current_price: '',
        target_price: '',
      });
      loadMySubmissions();
    }
  }

  async function handleDeleteStock(id: string) {
    if (!profile?.is_admin) return;
    if (!confirm('Are you sure you want to remove this stock from the watchlist?')) return;

    const { error } = await supabase.from('watchlist_stocks').delete().eq('id', id);

    if (!error) {
      loadWatchlist();
    }
  }

  function handleEditStock(stock: WatchlistStock) {
    if (!profile?.is_admin) return;
    setEditingStock(stock);
    setFormData({
      symbol: stock.symbol,
      company_name: stock.company_name,
      sector: stock.sector,
      term: stock.term,
      notes: stock.notes || '',
      current_price: stock.current_price?.toString() || '',
      target_price: stock.target_price?.toString() || '',
    });
    setShowEditForm(true);
  }

  async function handleUpdateStock(e: React.FormEvent) {
    e.preventDefault();
    if (!profile?.is_admin || !editingStock) return;

    const { error } = await supabase
      .from('watchlist_stocks')
      .update({
        notes: formData.notes || null,
        current_price: formData.current_price ? parseFloat(formData.current_price) : null,
        target_price: formData.target_price ? parseFloat(formData.target_price) : null,
      })
      .eq('id', editingStock.id);

    if (!error) {
      setShowEditForm(false);
      setEditingStock(null);
      setFormData({
        symbol: '',
        company_name: '',
        sector: 'Technology',
        term: 'long',
        notes: '',
        current_price: '',
        target_price: '',
      });
      loadWatchlist();
    }
  }

  const stocksBySector = stocks.reduce((acc, stock) => {
    if (!acc[stock.sector]) {
      acc[stock.sector] = { long: [], short: [] };
    }
    acc[stock.sector][stock.term].push(stock);
    return acc;
  }, {} as Record<string, { long: WatchlistStock[]; short: WatchlistStock[] }>);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-orange-500 border-r-transparent border-b-transparent border-l-transparent mx-auto mb-3"></div>
          <p className="text-slate-400">Loading watchlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-10 h-10 text-orange-500" />
            <h1 className="text-5xl font-bold gradient-text">Watchlist</h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowSubmitForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Submit Stock</span>
            </button>
            {profile?.is_admin && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add to Watchlist</span>
              </button>
            )}
          </div>
        </div>
        <p className="text-slate-400 text-lg">
          Community curated stocks organized by sector and investment timeframe
        </p>
      </div>

      {mySubmissions.length > 0 && (
        <div className="mb-8 glass rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-orange-400 mb-4">My Submissions</h2>
          <div className="space-y-3">
            {mySubmissions.map((submission) => (
              <div key={submission.id} className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-1">
                      <span className="text-xl font-bold text-orange-400">{submission.symbol}</span>
                      <span className="text-slate-300">{submission.company_name}</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        submission.term === 'long' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {submission.term.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{submission.sector}</p>
                    {submission.notes && <p className="text-sm text-slate-300 mt-2">{submission.notes}</p>}
                  </div>
                  <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                    submission.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                    submission.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {submission.status.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {Object.entries(stocksBySector).map(([sector, { long, short }]) => (
          <div key={sector} className="glass rounded-2xl overflow-hidden">
            <button
              onClick={() => setExpandedSector(expandedSector === sector ? null : sector)}
              className="w-full bg-gradient-to-r from-orange-500/20 to-red-500/20 p-6 flex items-center justify-between hover:from-orange-500/30 hover:to-red-500/30 transition"
            >
              <div className="flex items-center space-x-4">
                <Building2 className="w-6 h-6 text-orange-400" />
                <h2 className="text-2xl font-bold text-white">{sector}</h2>
                <span className="text-slate-400 text-sm">
                  {long.length + short.length} stock{long.length + short.length !== 1 ? 's' : ''}
                </span>
              </div>
              {expandedSector === sector ? (
                <ChevronUp className="w-6 h-6 text-slate-400" />
              ) : (
                <ChevronDown className="w-6 h-6 text-slate-400" />
              )}
            </button>

            {expandedSector === sector && (
              <div className="p-6 space-y-6">
                {long.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center space-x-2">
                      <Clock className="w-5 h-5" />
                      <span>Long Term</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {long.map((stock) => (
                        <div key={stock.id} className="bg-slate-800/50 rounded-xl p-4 border border-green-500/20">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="text-xl font-bold text-orange-400">{stock.symbol}</h4>
                              <p className="text-slate-300">{stock.company_name}</p>
                              {stock.profiles && (
                                <p className="text-xs text-slate-500 mt-1">
                                  Suggested by @{stock.profiles.username}
                                </p>
                              )}
                            </div>
                            {profile?.is_admin && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditStock(stock)}
                                  className="text-orange-400 hover:text-orange-300 text-sm"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteStock(stock.id)}
                                  className="text-red-400 hover:text-red-300 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                          </div>
                          {stock.notes && <p className="text-sm text-slate-400 mb-2">{stock.notes}</p>}
                          <div className="flex items-center space-x-4 text-sm">
                            {stock.current_price && (
                              <div className="flex items-center space-x-1 text-slate-300">
                                <DollarSign className="w-4 h-4" />
                                <span>${stock.current_price}</span>
                              </div>
                            )}
                            {stock.target_price && (
                              <div className="flex items-center space-x-1 text-green-400">
                                <Target className="w-4 h-4" />
                                <span>${stock.target_price}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {short.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center space-x-2">
                      <Clock className="w-5 h-5" />
                      <span>Short Term</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {short.map((stock) => (
                        <div key={stock.id} className="bg-slate-800/50 rounded-xl p-4 border border-blue-500/20">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="text-xl font-bold text-orange-400">{stock.symbol}</h4>
                              <p className="text-slate-300">{stock.company_name}</p>
                              {stock.profiles && (
                                <p className="text-xs text-slate-500 mt-1">
                                  Suggested by @{stock.profiles.username}
                                </p>
                              )}
                            </div>
                            {profile?.is_admin && (
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => handleEditStock(stock)}
                                  className="text-orange-400 hover:text-orange-300 text-sm"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteStock(stock.id)}
                                  className="text-red-400 hover:text-red-300 text-sm"
                                >
                                  Remove
                                </button>
                              </div>
                            )}
                          </div>
                          {stock.notes && <p className="text-sm text-slate-400 mb-2">{stock.notes}</p>}
                          <div className="flex items-center space-x-4 text-sm">
                            {stock.current_price && (
                              <div className="flex items-center space-x-1 text-slate-300">
                                <DollarSign className="w-4 h-4" />
                                <span>${stock.current_price}</span>
                              </div>
                            )}
                            {stock.target_price && (
                              <div className="flex items-center space-x-1 text-blue-400">
                                <Target className="w-4 h-4" />
                                <span>${stock.target_price}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showAddForm && profile?.is_admin && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="glass rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-orange-400 mb-4">Add Stock to Watchlist</h2>
            <form onSubmit={handleAddStock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Symbol</label>
                <input
                  type="text"
                  required
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                  placeholder="AAPL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                  placeholder="Apple Inc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Sector</label>
                <select
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                >
                  {sectors.map((sector) => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Term</label>
                <select
                  value={formData.term}
                  onChange={(e) => setFormData({ ...formData, term: e.target.value as 'long' | 'short' })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                >
                  <option value="long">Long Term</option>
                  <option value="short">Short Term</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Current Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.current_price}
                    onChange={(e) => setFormData({ ...formData, current_price: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Target Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.target_price}
                    onChange={(e) => setFormData({ ...formData, target_price: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                  rows={3}
                  placeholder="Why this stock?"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition font-medium"
                >
                  Add Stock
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-slate-700 text-white py-2 rounded-lg hover:bg-slate-600 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showSubmitForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="glass rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-orange-400 mb-4">Submit Stock Pick</h2>
            <p className="text-slate-400 text-sm mb-4">
              Submit your stock pick for admin review. If approved, it will be added to the community watchlist.
            </p>
            <form onSubmit={handleSubmitStock} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Symbol</label>
                <input
                  type="text"
                  required
                  value={formData.symbol}
                  onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                  placeholder="AAPL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                  placeholder="Apple Inc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Sector</label>
                <select
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                >
                  {sectors.map((sector) => (
                    <option key={sector} value={sector}>{sector}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Term</label>
                <select
                  value={formData.term}
                  onChange={(e) => setFormData({ ...formData, term: e.target.value as 'long' | 'short' })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                >
                  <option value="long">Long Term</option>
                  <option value="short">Short Term</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Why this stock?</label>
                <textarea
                  required
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                  rows={3}
                  placeholder="Share your investment thesis..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition font-medium"
                >
                  Submit for Review
                </button>
                <button
                  type="button"
                  onClick={() => setShowSubmitForm(false)}
                  className="flex-1 bg-slate-700 text-white py-2 rounded-lg hover:bg-slate-600 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditForm && editingStock && profile?.is_admin && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="glass rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold text-orange-400 mb-4">Edit Watchlist Stock</h2>
            <div className="bg-slate-800/50 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-xl font-bold text-orange-400">{editingStock.symbol}</span>
                <span className="text-slate-300">{editingStock.company_name}</span>
              </div>
            </div>
            <form onSubmit={handleUpdateStock} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Current Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.current_price}
                    onChange={(e) => setFormData({ ...formData, current_price: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Target Price</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.target_price}
                    onChange={(e) => setFormData({ ...formData, target_price: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description / Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-orange-500 focus:outline-none"
                  rows={4}
                  placeholder="Add notes about this stock..."
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  className="flex-1 bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 transition font-medium"
                >
                  Update Stock
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingStock(null);
                  }}
                  className="flex-1 bg-slate-700 text-white py-2 rounded-lg hover:bg-slate-600 transition font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
