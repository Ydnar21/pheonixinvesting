import { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, RefreshCw, AlertCircle, Clock } from 'lucide-react';

type NewsArticle = {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
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
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

      if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
      } else if (diffInHours < 24) {
        return `${diffInHours}h ago`;
      } else {
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
      }
    } catch {
      return 'Recently';
    }
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
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Market News</h1>
          <p className="text-slate-600">Latest financial news from Google News</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {articles.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
              <Newspaper className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600 text-lg">No news articles available</p>
              <p className="text-slate-500 text-sm mt-2">Check back later for updates</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
                <div className="flex items-center space-x-2">
                  <Newspaper className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Latest Headlines ({articles.length})
                  </h2>
                </div>
              </div>

              <div className="divide-y divide-slate-200">
                {articles.map((article, index) => (
                  <a
                    key={index}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-6 py-4 hover:bg-slate-50 transition group"
                  >
                    <div className="flex items-start justify-between space-x-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-slate-900 font-medium group-hover:text-emerald-600 transition mb-2 leading-snug">
                          {article.title}
                        </h3>
                        <div className="flex items-center space-x-3 text-sm text-slate-500">
                          <span className="font-medium">{article.source}</span>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{getTimeAgo(article.publishedAt)}</span>
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition flex-shrink-0 mt-1" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Newspaper className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-bold text-slate-900">About</h3>
            </div>
            <p className="text-slate-600 text-sm leading-relaxed">
              This news feed aggregates the latest financial and market news from Google News, updated
              in real-time to keep you informed about market movements, economic developments, and
              investment opportunities.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Popular Topics</h3>
            <div className="space-y-2">
              {[
                'Stock Market',
                'Finance',
                'Investing',
                'Wall Street',
                'Economy',
              ].map((topic, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 text-sm text-slate-700"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                  <span>{topic}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-sm p-6 text-white">
            <Newspaper className="w-8 h-8 mb-3 opacity-90" />
            <h3 className="text-lg font-bold mb-2">Stay Updated</h3>
            <p className="text-emerald-50 text-sm leading-relaxed">
              Refresh this page regularly to get the latest market news and stay ahead of market
              trends.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
