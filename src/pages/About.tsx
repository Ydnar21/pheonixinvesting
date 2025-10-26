import { TrendingUp, Users, BarChart3, Newspaper } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center bg-emerald-500 p-4 rounded-2xl mb-6">
          <TrendingUp className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-4">About My Portfolio</h1>
        <p className="text-xl text-slate-600 max-w-3xl mx-auto">
          A personal investment tracking platform with portfolio monitoring, community insights, and market news
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">What This Is</h2>
        <p className="text-slate-700 text-lg leading-relaxed mb-4">
          This is a personal portfolio tracking website designed to monitor my investments and share insights with the community.
          The platform provides real-time visibility into portfolio performance, positions, and returns.
        </p>
        <p className="text-slate-700 text-lg leading-relaxed">
          Visitors can view my portfolio performance, read stock discussions and insights I share in the community section,
          and stay informed about market trends through the curated news feed.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="bg-emerald-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <BarChart3 className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Portfolio Dashboard</h3>
          <p className="text-slate-600">
            View real-time portfolio performance including total value, daily changes, and detailed position breakdowns
            with gain/loss tracking. Portfolio data syncs with Robinhood for accurate, up-to-date information.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="bg-blue-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Community Insights</h3>
          <p className="text-slate-600">
            Read investment insights, stock analyses, and market commentary. Posts include stock symbols, sentiment
            indicators (bullish/bearish/neutral), and detailed discussions about specific investments and strategies.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="bg-amber-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <Newspaper className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Market News</h3>
          <p className="text-slate-600">
            Stay updated with curated financial news and market analysis. The news section provides coverage of
            economic developments, company earnings, sector trends, and major market movements.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="bg-emerald-100 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Real-Time Tracking</h3>
          <p className="text-slate-600">
            Portfolio metrics update in real-time, providing current valuations, percentage changes, and performance
            tracking across all positions. Monitor investment performance with professional-grade analytics.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg p-8 text-white mb-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div>
              <div className="bg-white bg-opacity-20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Portfolio View</h3>
              <p className="text-emerald-50">
                Comprehensive dashboard showing holdings, values, and performance metrics with Robinhood integration.
              </p>
            </div>
            <div>
              <div className="bg-white bg-opacity-20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Stock Discussions</h3>
              <p className="text-emerald-50">
                Investment insights and stock analyses with sentiment indicators and detailed commentary.
              </p>
            </div>
            <div>
              <div className="bg-white bg-opacity-20 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Newspaper className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">News Feed</h3>
              <p className="text-emerald-50">
                Curated financial news covering market trends, economic data, and investment opportunities.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Transparent Investing</h2>
        <p className="text-slate-600 text-lg mb-6 max-w-2xl mx-auto">
          This platform provides full transparency into my investment portfolio and strategy.
          All positions, performance metrics, and insights are shared openly with the community.
        </p>
      </div>
    </div>
  );
}
