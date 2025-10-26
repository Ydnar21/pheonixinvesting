import { X } from 'lucide-react';

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

interface TradeDetailModalProps {
  trade: Trade;
  onClose: () => void;
  gain: number;
  gainPercent: number;
  totalValue: number;
}

export default function TradeDetailModal({ trade, onClose, gain, gainPercent, totalValue }: TradeDetailModalProps) {
  const isPositive = gain >= 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span
              className={`font-bold text-2xl px-4 py-2 rounded border-2 ${
                isPositive
                  ? 'text-emerald-700 border-emerald-500 bg-emerald-50'
                  : 'text-red-700 border-red-500 bg-red-50'
              }`}
            >
              {trade.symbol}
            </span>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{trade.company_name}</h2>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                  trade.trade_type === 'stock'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-purple-100 text-purple-700'
                }`}
              >
                {trade.trade_type.toUpperCase()}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-6 h-6 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Performance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 rounded-lg p-4">
              <div className="text-sm text-slate-600 mb-1">Total Value</div>
              <div className="text-2xl font-bold text-slate-900">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className={`rounded-lg p-4 ${isPositive ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <div className="text-sm text-slate-600 mb-1">Gain/Loss</div>
              <div className={`text-2xl font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}${gain.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
            <div className={`rounded-lg p-4 ${isPositive ? 'bg-emerald-50' : 'bg-red-50'}`}>
              <div className="text-sm text-slate-600 mb-1">Return</div>
              <div className={`text-2xl font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{gainPercent.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Position Details */}
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Position Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-slate-600">Quantity</div>
                <div className="text-lg font-semibold text-slate-900">
                  {trade.quantity} {trade.trade_type === 'option' ? 'contracts' : 'shares'}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Cost Basis</div>
                <div className="text-lg font-semibold text-slate-900">
                  ${trade.cost_basis.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Current Price</div>
                <div className="text-lg font-semibold text-slate-900">
                  ${trade.current_price.toFixed(2)}
                </div>
              </div>
              {trade.trade_type === 'option' && (
                <>
                  <div>
                    <div className="text-sm text-slate-600">Strike Price</div>
                    <div className="text-lg font-semibold text-slate-900">
                      ${trade.strike_price?.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Option Type</div>
                    <div className="text-lg font-semibold text-slate-900 uppercase">
                      {trade.option_type}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600">Expiration</div>
                    <div className="text-lg font-semibold text-slate-900">
                      {trade.option_expiration}
                    </div>
                  </div>
                  {trade.break_even_price && (
                    <div>
                      <div className="text-sm text-slate-600">Break Even</div>
                      <div className="text-lg font-semibold text-slate-900">
                        ${trade.break_even_price.toFixed(2)}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Due Diligence Section */}
          {(trade.dd_summary || trade.price_targets) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Due Diligence</h3>

              {trade.dd_summary && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Investment Thesis</h4>
                  <p className="text-slate-900 whitespace-pre-wrap leading-relaxed">{trade.dd_summary}</p>
                </div>
              )}

              {trade.price_targets && (
                <div>
                  <h4 className="text-sm font-medium text-slate-700 mb-2">Price Targets</h4>
                  <p className="text-slate-900 whitespace-pre-wrap leading-relaxed">{trade.price_targets}</p>
                </div>
              )}

              {trade.dd_updated_at && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                  <p className="text-xs text-slate-600">
                    Last updated: {new Date(trade.dd_updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
