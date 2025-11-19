import { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, RefreshCw, AlertCircle, Clock } from 'lucide-react';

type NewsArticle = {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  stock?: string;
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
      const sortedArticles = (data.articles || []).sort((a: NewsArticle, b: NewsArticle) => {
        const dateA = new Date(a.publishedAt).getTime();
        const dateB = new Date(b.publishedAt).getTime();
        return dateB - dateA;
      });
      setArticles(sortedArticles);
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center justify-center py-20">
          <RefreshCw className="w-12 h-12 text-orange-500 animate-spin mb-4" />
          <p className="text-slate-400 text-lg">Loading latest market news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-5xl font-bold gradient-text mb-2">Market News</h1>
          <p className="text-slate-400 text-lg">Latest stock market news from Google News</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold transition disabled:opacity-50"
        >
          <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 glass border-2 border-red-500/30 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-400 font-medium">Error loading news</p>
            <p className="text-slate-400 text-sm mt-1">{error}</p>
          </div>
          <button
            onClick={handleRefresh}
            className="text-orange-400 hover:text-orange-300 font-medium text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {articles.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center">
              <Newspaper className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-300 text-lg">No news articles available</p>
              <p className="text-slate-500 text-sm mt-2">Check back later for updates</p>
            </div>
          ) : (
            <div className="glass rounded-xl overflow-hidden">
              <div className="border-b border-orange-500/20 bg-slate-900/50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Newspaper className="w-5 h-5 text-orange-400" />
                    <h2 className="text-lg font-bold text-orange-400">
                      Latest Headlines ({articles.length})
                    </h2>
                  </div>
                  <span className="text-xs text-slate-400">
                    {articles.filter(a => a.stock).length} community stock articles
                  </span>
                </div>
              </div>

              <div className="divide-y divide-orange-500/10">
                {articles.map((article, index) => (
                  <a
                    key={index}
                    href={article.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-6 py-4 hover:bg-orange-500/5 transition group"
                  >
                    <div className="flex items-start justify-between space-x-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start space-x-2 mb-2">
                          <h3 className="text-slate-200 font-medium group-hover:text-orange-400 transition leading-snug flex-1">
                            {article.title}
                          </h3>
                          {article.stock && (
                            <span className="bg-orange-500/20 text-orange-400 text-xs font-bold px-2 py-1 rounded flex-shrink-0">
                              {article.stock}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-3 text-sm text-slate-500">
                          <span className="font-medium">{article.source}</span>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{getTimeAgo(article.publishedAt)}</span>
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-orange-400 transition flex-shrink-0 mt-1" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass rounded-xl p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Newspaper className="w-5 h-5 text-orange-400" />
              <h3 className="text-lg font-bold text-orange-400">About</h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-3">
              This news feed aggregates the latest financial and stock market news from Google News.
            </p>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 mt-3">
              <p className="text-slate-300 text-xs font-semibold mb-1">Community Focus</p>
              <p className="text-slate-400 text-xs leading-relaxed">
                Articles tagged with stock symbols are specifically filtered for stocks mentioned in the Community page.
              </p>
            </div>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-bold text-orange-400 mb-4">News Sources</h3>
            <div className="space-y-2">
              {[
                'General Market News',
                'Community Stock Updates',
                'Economic Reports',
                'Corporate Earnings',
                'Market Analysis',
              ].map((topic, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 text-sm text-slate-300"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                  <span>{topic}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl p-6 text-white">
            <Newspaper className="w-8 h-8 mb-3 opacity-90" />
            <h3 className="text-lg font-bold mb-2">Stay Updated</h3>
            <p className="text-orange-50 text-sm leading-relaxed">
              Refresh this page regularly to get the latest market news and stay ahead of market
              trends.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
