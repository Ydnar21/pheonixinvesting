import { Calendar as CalendarIcon, ExternalLink, DollarSign, TrendingUp, Building2, Activity } from 'lucide-react';

export default function Calendar() {
  const calendarResources = [
    {
      title: 'Economic Calendar',
      description: 'Track key economic events, data releases, and central bank meetings',
      icon: DollarSign,
      color: 'from-blue-500 to-cyan-500',
      links: [
        { name: 'MarketWatch Economic Calendar', url: 'https://www.marketwatch.com/economy-politics/calendar' },
      ],
    },
    {
      title: 'Earnings Calendar',
      description: 'Stay updated on corporate earnings reports and conference calls',
      icon: Building2,
      color: 'from-purple-500 to-pink-500',
      links: [
        { name: 'Earnings Whispers', url: 'https://www.earningswhispers.com/calendar' },
        { name: 'Nasdaq Earnings Calendar', url: 'https://www.nasdaq.com/market-activity/earnings' },
      ],
    },
    {
      title: 'Market Events',
      description: 'Monitor IPOs, stock splits, and analyst recommendations',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
      links: [
        { name: 'IPO Calendar', url: 'https://www.nasdaq.com/market-activity/ipos' },
        { name: 'Stock Splits Calendar', url: 'https://www.marketbeat.com/stock-splits/' },
        { name: 'TipRanks - Analyst Ratings', url: 'https://www.tipranks.com/' },
      ],
    },
    {
      title: 'Market Sentiment',
      description: 'Gauge investor sentiment and market psychology indicators',
      icon: Activity,
      color: 'from-green-500 to-emerald-500',
      links: [
        { name: 'CNN Fear & Greed Index', url: 'https://www.cnn.com/markets/fear-and-greed' },
        { name: 'VIX Index - CBOE', url: 'https://www.cboe.com/tradable_products/vix/' },
        { name: 'Put/Call Ratio - CBOE', url: 'https://www.cboe.com/us/options/market_statistics/daily/' },
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl border border-orange-500/30">
            <CalendarIcon className="w-8 h-8 text-orange-400" />
          </div>
          <div>
            <h1 className="text-5xl font-bold gradient-text mb-1">Resources</h1>
            <p className="text-slate-400 text-base">
              Access comprehensive market calendars, sentiment indicators, and essential trading resources
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {calendarResources.map((resource, index) => {
          const Icon = resource.icon;
          return (
            <div key={index} className="glass rounded-2xl overflow-hidden card-hover">
              <div className={`bg-gradient-to-r ${resource.color} p-6`}>
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">{resource.title}</h2>
                    <p className="text-white/90 text-sm">{resource.description}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-900/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {resource.links.map((link, linkIndex) => (
                    <a
                      key={linkIndex}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-4 rounded-xl bg-slate-900/50 border border-slate-700/50 hover:border-orange-500/50 hover:bg-slate-800/50 transition-all"
                    >
                      <span className="font-medium text-slate-200 group-hover:text-orange-400 transition">
                        {link.name}
                      </span>
                      <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-orange-400 transition" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 glass rounded-2xl p-6">
        <h3 className="text-xl font-bold text-orange-400 mb-4">Why Use These Resources?</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-3">
              <DollarSign className="w-6 h-6 text-blue-400 mb-2" />
              <h4 className="font-bold text-slate-200 mb-1">Economic Data</h4>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Track CPI, GDP, unemployment, and Fed meetings that drive market volatility and trends.
            </p>
          </div>
          <div>
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4 mb-3">
              <Building2 className="w-6 h-6 text-purple-400 mb-2" />
              <h4 className="font-bold text-slate-200 mb-1">Earnings Reports</h4>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Monitor quarterly earnings releases to anticipate stock movements and identify opportunities.
            </p>
          </div>
          <div>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mb-3">
              <TrendingUp className="w-6 h-6 text-orange-400 mb-2" />
              <h4 className="font-bold text-slate-200 mb-1">Market Events</h4>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Stay informed about dividends, IPOs, and stock splits that impact portfolio returns.
            </p>
          </div>
          <div>
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-3">
              <Activity className="w-6 h-6 text-green-400 mb-2" />
              <h4 className="font-bold text-slate-200 mb-1">Market Sentiment</h4>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Use sentiment indicators like Fear & Greed Index to gauge market psychology and contrarian signals.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 glass rounded-2xl p-8 bg-gradient-to-br from-orange-500/10 to-orange-600/10 border-orange-500/30">
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-orange-500/20 rounded-xl">
            <CalendarIcon className="w-8 h-8 text-orange-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-orange-400 mb-2">Pro Tip</h3>
            <p className="text-slate-300 leading-relaxed">
              Bookmark these calendars and check them daily. Major economic releases and earnings reports
              often create significant trading opportunities. Combine calendar insights with your community
              discussions for better-informed investment decisions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
