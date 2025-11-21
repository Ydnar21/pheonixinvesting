import { Calendar as CalendarIcon, ExternalLink, DollarSign, TrendingUp, Building2 } from 'lucide-react';

export default function Calendar() {
  const calendarResources = [
    {
      title: 'Economic Calendar',
      description: 'Track key economic events, data releases, and central bank meetings',
      icon: DollarSign,
      color: 'from-blue-500 to-cyan-500',
      links: [
        { name: 'Investing.com Economic Calendar', url: 'https://www.investing.com/economic-calendar/' },
        { name: 'Forex Factory Calendar', url: 'https://www.forexfactory.com/calendar' },
        { name: 'Trading Economics Calendar', url: 'https://tradingeconomics.com/calendar' },
        { name: 'MarketWatch Economic Calendar', url: 'https://www.marketwatch.com/economy-politics/calendar' },
      ],
    },
    {
      title: 'Earnings Calendar',
      description: 'Stay updated on corporate earnings reports and conference calls',
      icon: Building2,
      color: 'from-purple-500 to-pink-500',
      links: [
        { name: 'Yahoo Finance Earnings Calendar', url: 'https://finance.yahoo.com/calendar/earnings' },
        { name: 'Earnings Whispers', url: 'https://www.earningswhispers.com/calendar' },
        { name: 'Nasdaq Earnings Calendar', url: 'https://www.nasdaq.com/market-activity/earnings' },
        { name: 'Seeking Alpha Earnings Calendar', url: 'https://seekingalpha.com/earnings/earnings-calendar' },
      ],
    },
    {
      title: 'Market Events',
      description: 'Monitor IPOs, dividends, and other important market events',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500',
      links: [
        { name: 'MarketBeat Dividend Calendar', url: 'https://www.marketbeat.com/dividends/calendar/' },
        { name: 'IPO Calendar - Nasdaq', url: 'https://www.nasdaq.com/market-activity/ipos' },
        { name: 'Stock Splits Calendar', url: 'https://www.marketbeat.com/stock-splits/' },
        { name: 'Ex-Dividend Calendar', url: 'https://www.thestreet.com/dividends/calendar' },
      ],
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-2">
          <CalendarIcon className="w-10 h-10 text-orange-500" />
          <h1 className="text-5xl font-bold gradient-text">Market Calendars</h1>
        </div>
        <p className="text-slate-400 text-lg">
          Access comprehensive economic and earnings calendars to stay ahead of market-moving events
        </p>
      </div>

      <div className="space-y-8">
        {calendarResources.map((resource, index) => {
          const Icon = resource.icon;
          return (
            <div key={index} className="glass rounded-2xl overflow-hidden">
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

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resource.links.map((link, linkIndex) => (
                    <a
                      key={linkIndex}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center justify-between p-4 rounded-xl border-2 border-orange-500/20 hover:border-orange-500 hover:bg-orange-500/5 transition-all"
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
        <h3 className="text-xl font-bold text-orange-400 mb-4">Why Use Market Calendars?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        </div>
      </div>

      <div className="mt-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-8 text-white">
        <div className="flex items-start space-x-4">
          <CalendarIcon className="w-12 h-12 flex-shrink-0 opacity-90" />
          <div>
            <h3 className="text-2xl font-bold mb-2">Pro Tip</h3>
            <p className="text-orange-50 leading-relaxed">
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
