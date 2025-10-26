import { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Clock, RefreshCw, AlertCircle } from 'lucide-react';

type NewsArticle = {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  imageUrl: string | null;
};

export default function News() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      setError(null);
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/fetch-market-news`;
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const response = await fetch(apiUrl, { headers });

      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const data = await response.json();
      setArticles(data.articles || []);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError('Unable to load news. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchNews();
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }
  };

  const getCategoryFromSource = (source: string): string => {
    const lowerSource = source.toLowerCase();
    if (lowerSource.includes('tech') || lowerSource.includes('wired')) return 'Technology';
    if (lowerSource.includes('crypto') || lowerSource.includes('coin')) return 'Crypto';
    if (lowerSource.includes('energy')) return 'Energy';
    if (lowerSource.includes('health')) return 'Healthcare';
    return 'Economy';
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Economy: 'bg-blue-100 text-blue-700',
      Technology: 'bg-emerald-100 text-emerald-700',
      Energy: 'bg-orange-100 text-orange-700',
      Healthcare: 'bg-rose-100 text-rose-700',
      Crypto: 'bg-violet-100 text-violet-700',
    };
    return colors[category] || 'bg-slate-100 text-slate-700';
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCw className="w-12 h-12 text-emerald-500 animate-spin mb-4" />
          <p className="text-slate-600 text-lg">Loading latest market news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Financial News</h1>
          <p className="text-slate-600">Stay updated with the latest market developments and trends</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 font-medium">Error loading news</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="text-red-600 hover:text-red-700 font-medium text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {articles.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <Newspaper className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">No news articles available</p>
              <p className="text-slate-500 text-sm mt-2">Check back later for updates</p>
            </div>
          ) : (
            articles.map((article, index) => {
              const category = getCategoryFromSource(article.source);
              return (
                <article
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${getCategoryColor(
                        category
                      )}`}
                    >
                      {category}
                    </span>
                    <div className="flex items-center space-x-1 text-slate-500 text-sm">
                      <Clock className="w-4 h-4" />
                      <span>{getTimeAgo(article.publishedAt)}</span>
                    </div>
                  </div>

                  <h2 className="text-xl font-bold text-slate-900 mb-2 hover:text-emerald-600 transition">
                    {article.title}
                  </h2>

                  {article.description && (
                    <p className="text-slate-600 mb-4 leading-relaxed">{article.description}</p>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <span className="text-sm font-medium text-slate-700">{article.source}</span>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-emerald-600 hover:text-emerald-700 font-medium text-sm transition"
                    >
                      <span>Read more</span>
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </article>
              );
            })
          )}
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
                  <span className="text-emerald-600 font-bold">Live</span>
                </div>
                <div className="text-sm text-slate-500 mt-1">Check financial sites for real-time data</div>
              </div>

              <div className="pb-4 border-b border-slate-200">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-medium">Nasdaq</span>
                  <span className="text-emerald-600 font-bold">Live</span>
                </div>
                <div className="text-sm text-slate-500 mt-1">Check financial sites for real-time data</div>
              </div>

              <div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-medium">Dow Jones</span>
                  <span className="text-emerald-600 font-bold">Live</span>
                </div>
                <div className="text-sm text-slate-500 mt-1">Check financial sites for real-time data</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">News Sources</h3>
            <div className="space-y-2 text-sm text-slate-600">
              <p>Real-time news from:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-700">
                <li>Financial Times</li>
                <li>Bloomberg</li>
                <li>Reuters</li>
                <li>Wall Street Journal</li>
                <li>CNBC</li>
                <li>MarketWatch</li>
              </ul>
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
