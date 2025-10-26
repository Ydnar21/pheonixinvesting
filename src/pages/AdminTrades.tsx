import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import AddTradeForm from '../components/AddTradeForm';

interface Trade {
  id: string;
  user_id: string;
  trade_type: string;
  symbol: string;
  company_name: string;
  quantity: number;
  cost_basis: number;
  current_price: number;
  option_expiration?: string;
  option_type?: string;
  strike_price?: number;
  created_at: string;
}

interface User {
  id: string;
  email: string;
}

export default function AdminTrades() {
  const { user, profile } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && profile?.is_admin) {
      loadUsers();
      loadTrades();
    }
  }, [user, profile]);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase.auth.admin.listUsers();
      if (!error && data) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadTrades = async () => {
    try {
      const query = supabase
        .from('user_trades')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedUser) {
        query.eq('user_id', selectedUser);
      }

      const { data, error } = await query;

      if (!error && data) {
        setTrades(data);
      }
    } catch (error) {
      console.error('Error loading trades:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUser || selectedUser === '') {
      loadTrades();
    }
  }, [selectedUser]);

  const handleDelete = async (tradeId: string) => {
    if (!confirm('Are you sure you want to delete this trade?')) return;

    try {
      const { error } = await supabase
        .from('user_trades')
        .delete()
        .eq('id', tradeId);

      if (!error) {
        loadTrades();
      }
    } catch (error) {
      console.error('Error deleting trade:', error);
    }
  };

  const handleFormSuccess = () => {
    setShowAddForm(false);
    setEditingTrade(null);
    loadTrades();
  };

  if (!profile?.is_admin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
          <p className="text-red-700">You must be an admin to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Manage User Trades</h1>
          <p className="text-slate-600">Add and manage stock and option positions for users</p>
        </div>
        <button
          onClick={() => {
            setEditingTrade(null);
            setShowAddForm(true);
          }}
          className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-2.5 rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          <span>Add Trade</span>
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Filter by User
        </label>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        >
          <option value="">All Users</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.email}
            </option>
          ))}
        </select>
      </div>

      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingTrade ? 'Edit Trade' : 'Add New Trade'}
              </h2>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingTrade(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            <AddTradeForm
              users={users}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setShowAddForm(false);
                setEditingTrade(null);
              }}
              editingTrade={editingTrade}
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-slate-700" />
            <h2 className="text-xl font-bold text-slate-900">All Trades</h2>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-600">Loading trades...</div>
        ) : trades.length === 0 ? (
          <div className="p-12 text-center text-slate-600">
            No trades found. Add a trade to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">User</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Type</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Symbol</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Company</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Quantity</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Cost Basis</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Current Price</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Details</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {trades.map((trade) => {
                  const userEmail = users.find((u) => u.id === trade.user_id)?.email || 'Unknown';

                  return (
                    <tr key={trade.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 text-sm text-slate-600">{userEmail}</td>
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
                        <span className="font-bold text-slate-900">{trade.symbol}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{trade.company_name}</td>
                      <td className="px-6 py-4 text-right text-slate-900">
                        {trade.quantity}
                        {trade.trade_type === 'option' && ' contracts'}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-600">
                        ${trade.cost_basis.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-900 font-medium">
                        ${trade.current_price.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {trade.trade_type === 'option' && (
                          <div>
                            <div className="font-medium">
                              ${trade.strike_price} {trade.option_type?.toUpperCase()}
                            </div>
                            <div className="text-xs">Exp: {trade.option_expiration}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setEditingTrade(trade);
                              setShowAddForm(true);
                            }}
                            className="p-2 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            title="Edit trade"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(trade.id)}
                            className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete trade"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
