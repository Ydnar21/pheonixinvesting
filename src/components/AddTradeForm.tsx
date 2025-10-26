import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
}

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
  break_even_price?: number;
}

interface AddTradeFormProps {
  users: User[];
  onSuccess: () => void;
  onCancel: () => void;
  editingTrade?: Trade | null;
}

export default function AddTradeForm({ users, onSuccess, onCancel, editingTrade }: AddTradeFormProps) {
  const [tradeType, setTradeType] = useState<'stock' | 'option'>('stock');
  const [symbol, setSymbol] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [costBasis, setCostBasis] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [optionExpiration, setOptionExpiration] = useState('');
  const [optionType, setOptionType] = useState<'call' | 'put'>('call');
  const [strikePrice, setStrikePrice] = useState('');
  const [breakEvenPrice, setBreakEvenPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingTrade) {
      setTradeType(editingTrade.trade_type as 'stock' | 'option');
      setSymbol(editingTrade.symbol);
      setCompanyName(editingTrade.company_name);
      setQuantity(editingTrade.quantity.toString());
      setCostBasis(editingTrade.cost_basis.toString());
      setCurrentPrice(editingTrade.current_price.toString());
      if (editingTrade.option_expiration) {
        setOptionExpiration(editingTrade.option_expiration);
      }
      if (editingTrade.option_type) {
        setOptionType(editingTrade.option_type as 'call' | 'put');
      }
      if (editingTrade.strike_price) {
        setStrikePrice(editingTrade.strike_price.toString());
      }
      if (editingTrade.break_even_price) {
        setBreakEvenPrice(editingTrade.break_even_price.toString());
      }
    }
  }, [editingTrade]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      const tradeData: any = {
        user_id: user.id,
        trade_type: tradeType,
        symbol: symbol.toUpperCase(),
        company_name: companyName,
        quantity: parseFloat(quantity),
        cost_basis: parseFloat(costBasis),
        current_price: parseFloat(currentPrice),
        updated_at: new Date().toISOString(),
      };

      if (tradeType === 'option') {
        if (!optionExpiration || !strikePrice || !breakEvenPrice) {
          setError('Option expiration, strike price, and break-even price are required for options');
          setSubmitting(false);
          return;
        }
        tradeData.option_expiration = optionExpiration;
        tradeData.option_type = optionType;
        tradeData.strike_price = parseFloat(strikePrice);
        tradeData.break_even_price = parseFloat(breakEvenPrice);
      } else {
        tradeData.option_expiration = null;
        tradeData.option_type = null;
        tradeData.strike_price = null;
        tradeData.break_even_price = null;
      }

      if (editingTrade) {
        const { error: updateError } = await supabase
          .from('user_trades')
          .update(tradeData)
          .eq('id', editingTrade.id);

        if (updateError) throw updateError;
      } else {
        tradeData.added_by = user.id;

        const { error: insertError } = await supabase
          .from('user_trades')
          .insert([tradeData]);

        if (insertError) throw insertError;
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to save trade');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Trade Type *
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="stock"
              checked={tradeType === 'stock'}
              onChange={(e) => setTradeType(e.target.value as 'stock' | 'option')}
              className="mr-2"
            />
            <span>Stock Shares</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="option"
              checked={tradeType === 'option'}
              onChange={(e) => setTradeType(e.target.value as 'stock' | 'option')}
              className="mr-2"
            />
            <span>Options</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Stock Symbol *
          </label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="AAPL"
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Company Name *
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            placeholder="Apple Inc."
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {tradeType === 'option' ? 'Number of Contracts *' : 'Number of Shares *'}
        </label>
        <input
          type="number"
          step="any"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder={tradeType === 'option' ? '10' : '100'}
          required
          className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
        />
      </div>

      {tradeType === 'stock' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Average Price Bought At *
            </label>
            <input
              type="number"
              step="0.01"
              value={costBasis}
              onChange={(e) => setCostBasis(e.target.value)}
              placeholder="150.00"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Current Price *
            </label>
            <input
              type="number"
              step="0.01"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
              placeholder="155.00"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Avg Price Per Contract *
            </label>
            <input
              type="number"
              step="0.01"
              value={costBasis}
              onChange={(e) => setCostBasis(e.target.value)}
              placeholder="2.50"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Current Price Per Contract *
            </label>
            <input
              type="number"
              step="0.01"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
              placeholder="3.50"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Break-Even Price *
            </label>
            <input
              type="number"
              step="0.01"
              value={breakEvenPrice}
              onChange={(e) => setBreakEvenPrice(e.target.value)}
              placeholder="152.50"
              required={tradeType === 'option'}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {tradeType === 'option' && (
        <div className="border-t border-slate-200 pt-6 space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Option Details</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Expiration Date *
              </label>
              <input
                type="date"
                value={optionExpiration}
                onChange={(e) => setOptionExpiration(e.target.value)}
                required={tradeType === 'option'}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Option Type *
              </label>
              <select
                value={optionType}
                onChange={(e) => setOptionType(e.target.value as 'call' | 'put')}
                required={tradeType === 'option'}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="call">Call</option>
                <option value="put">Put</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Strike Price *
              </label>
              <input
                type="number"
                step="0.01"
                value={strikePrice}
                onChange={(e) => setStrikePrice(e.target.value)}
                placeholder="160.00"
                required={tradeType === 'option'}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-end space-x-4 pt-6 border-t border-slate-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
        >
          {submitting ? 'Saving...' : editingTrade ? 'Update Trade' : 'Add Trade'}
        </button>
      </div>
    </form>
  );
}
