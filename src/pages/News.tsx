import { Newspaper, ExternalLink, Clock } from 'lucide-react';

export default function News() {
  const newsArticles = [
    {
      id: 1,
      title: 'Federal Reserve Holds Interest Rates Steady Amid Economic Uncertainty',
      source: 'Financial Times',
      time: '2 hours ago',
      category: 'Economy',
      excerpt: 'The Federal Reserve maintained its benchmark interest rate, signaling a cautious approach as officials assess recent economic data and inflation trends.',
      url: '#',
    },
    {
      id: 2,
      title: 'Tech Giants Report Mixed Earnings as AI Investments Surge',
      source: 'Bloomberg',
      time: '4 hours ago',
      category: 'Technology',
      excerpt: 'Major technology companies unveiled quarterly results showing varied performance, with substantial increases in AI-related capital expenditures across the sector.',
      url: '#',
    },
    {
      id: 3,
      title: 'Energy Sector Rallies on Supply Concerns and Geopolitical Tensions',
      source: 'Reuters',
      time: '6 hours ago',
      category: 'Energy',
      excerpt: 'Oil and gas stocks surged as traders responded to supply disruptions and ongoing geopolitical developments affecting major producing regions.',
      url: '#',
    },
    {
      id: 4,
      title: 'Consumer Confidence Index Shows Unexpected Decline',
      source: 'Wall Street Journal',
      time: '8 hours ago',
      category: 'Economy',
      excerpt: 'The latest consumer confidence survey revealed a surprising drop, raising questions about household spending patterns heading into the holiday season.',
      url: '#',
    },
    {
      id: 5,
      title: 'Electric Vehicle Manufacturers Face Growing Competition',
      source: 'CNBC',
      time: '10 hours ago',
      category: 'Automotive',
      excerpt: 'Traditional automakers are rapidly expanding their EV offerings, intensifying competition in a market previously dominated by Tesla and newer startups.',
      url: '#',
    },
    {
      id: 6,
      title: 'Biotechnology Breakthrough Sends Healthcare Stocks Higher',
      source: 'MarketWatch',
      time: '12 hours ago',
      category: 'Healthcare',
      excerpt: 'A major pharmaceutical company announced promising clinical trial results, triggering a rally across the healthcare and biotechnology sectors.',
      url: '#',
    },
    {
      id: 7,
      title: 'Retail Sales Data Exceeds Expectations for Third Consecutive Month',
      source: 'Financial Times',
      time: '14 hours ago',
      category: 'Retail',
      excerpt: 'Commerce Department figures showed robust consumer spending, with particular strength in e-commerce and discretionary categories.',
      url: '#',
    },
    {
      id: 8,
      title: 'Cryptocurrency Markets Experience Renewed Volatility',
      source: 'CoinDesk',
      time: '16 hours ago',
      category: 'Crypto',
      excerpt: 'Digital asset prices swung sharply following regulatory developments and comments from central bank officials regarding digital currencies.',
      url: '#',
    },
  ];

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Economy: 'bg-blue-100 text-blue-700',
      Technology: 'bg-emerald-100 text-emerald-700',
      Energy: 'bg-orange-100 text-orange-700',
      Automotive: 'bg-slate-100 text-slate-700',
      Healthcare: 'bg-rose-100 text-rose-700',
      Retail: 'bg-amber-100 text-amber-700',
      Crypto: 'bg-violet-100 text-violet-700',
    };
    return colors[category] || 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Financial News</h1>
        <p className="text-slate-600">Stay updated with the latest market developments and trends</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {newsArticles.map((article) => (
            <article
              key={article.id}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-3">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${getCategoryColor(
                    article.category
                  )}`}
                >
                  {article.category}
                </span>
                <div className="flex items-center space-x-1 text-slate-500 text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{article.time}</span>
                </div>
              </div>

              <h2 className="text-xl font-bold text-slate-900 mb-2 hover:text-emerald-600 transition cursor-pointer">
                {article.title}
              </h2>

              <p className="text-slate-600 mb-4 leading-relaxed">{article.excerpt}</p>

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <span className="text-sm font-medium text-slate-700">{article.source}</span>
                <a
                  href={article.url}
                  className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-700 font-medium text-sm transition"
                >
                  <span>Read more</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Newspaper className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-bold text-slate-900">Market Overview</h3>
            </div>

            <div className="space-y-4">
              <div className="pb-4 border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-medium">S&P 500</span>
                  <span className="text-emerald-600 font-bold">+0.52%</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-1">4,783.45</div>
              </div>

              <div className="pb-4 border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-medium">Nasdaq</span>
                  <span className="text-emerald-600 font-bold">+0.78%</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-1">15,042.68</div>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-medium">Dow Jones</span>
                  <span className="text-red-600 font-bold">-0.12%</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 mt-1">37,440.34</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Trending Topics</h3>
            <div className="space-y-3">
              {['AI & Machine Learning', 'Electric Vehicles', 'Interest Rates', 'Renewable Energy', 'Cryptocurrency'].map(
                (topic, index) => (
                  <button
                    key={index}
                    className="w-full text-left px-4 py-2.5 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 rounded-lg transition font-medium"
                  >
                    {topic}
                  </button>
                )
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-sm p-6 text-white">
            <h3 className="text-lg font-bold mb-2">Stay Informed</h3>
            <p className="text-emerald-50 text-sm mb-4">
              Get real-time market updates and breaking news delivered to your inbox.
            </p>
            <button className="w-full bg-white text-emerald-600 font-semibold py-2.5 rounded-lg hover:bg-emerald-50 transition">
              Subscribe to Newsletter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
