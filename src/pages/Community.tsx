import { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, TrendingUp, TrendingDown, Minus, Send } from 'lucide-react';
import { supabase, StockPost, PostComment } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<StockPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<{ [key: string]: PostComment[] }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [likes, setLikes] = useState<{ [key: string]: boolean }>({});
  const [likeCounts, setLikeCounts] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_posts')
        .select(`
          *,
          profiles(username, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);

      if (data) {
        data.forEach((post) => {
          loadComments(post.id);
          loadLikes(post.id);
        });
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          *,
          profiles(username, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setComments((prev) => ({ ...prev, [postId]: data || [] }));
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const loadLikes = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', postId);

      if (error) throw error;

      setLikeCounts((prev) => ({ ...prev, [postId]: data?.length || 0 }));

      if (user) {
        const userLiked = data?.some((like) => like.user_id === user.id);
        setLikes((prev) => ({ ...prev, [postId]: userLiked || false }));
      }
    } catch (error) {
      console.error('Error loading likes:', error);
    }
  };

  const addComment = async (postId: string) => {
    if (!user || !newComment[postId]?.trim()) return;

    try {
      const { error } = await supabase.from('post_comments').insert([
        {
          post_id: postId,
          user_id: user.id,
          content: newComment[postId],
        },
      ]);

      if (error) throw error;

      setNewComment((prev) => ({ ...prev, [postId]: '' }));
      loadComments(postId);
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const toggleLike = async (postId: string) => {
    if (!user) return;

    try {
      if (likes[postId]) {
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('post_likes').insert([
          {
            post_id: postId,
            user_id: user.id,
          },
        ]);

        if (error) throw error;
      }

      loadLikes(postId);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return <TrendingUp className="w-4 h-4" />;
      case 'bearish':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'bg-emerald-100 text-emerald-700';
      case 'bearish':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center text-slate-600">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Investment Community</h1>
        <p className="text-slate-600">Stock discussions and insights</p>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <div
            key={post.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="bg-emerald-500 text-white font-bold w-10 h-10 rounded-full flex items-center justify-center">
                    {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold text-slate-900">
                        {post.profiles?.username || 'Anonymous'}
                      </span>
                      <span className="text-slate-500 text-sm">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="font-bold text-emerald-600">{post.stock_symbol}</span>
                      <span className="text-slate-600 text-sm">{post.stock_name}</span>
                      <span
                        className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${getSentimentColor(
                          post.sentiment
                        )}`}
                      >
                        {getSentimentIcon(post.sentiment)}
                        <span>{post.sentiment}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">{post.title}</h3>
              <p className="text-slate-700 whitespace-pre-wrap">{post.content}</p>

              <div className="flex items-center space-x-4 mt-4 pt-4 border-t border-slate-200">
                <button
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition ${
                    likes[post.id]
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span className="font-medium">{likeCounts[post.id] || 0}</span>
                </button>
                <div className="flex items-center space-x-2 text-slate-600">
                  <MessageSquare className="w-4 h-4" />
                  <span className="font-medium">{comments[post.id]?.length || 0}</span>
                </div>
              </div>
            </div>

            {comments[post.id] && comments[post.id].length > 0 && (
              <div className="bg-slate-50 px-6 py-4 border-t border-slate-200">
                <div className="space-y-4">
                  {comments[post.id].map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <div className="bg-slate-300 text-slate-700 font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm">
                        {comment.profiles?.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold text-slate-900 text-sm">
                            {comment.profiles?.username || 'Anonymous'}
                          </span>
                          <span className="text-slate-500 text-xs">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-700 text-sm mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newComment[post.id] || ''}
                  onChange={(e) =>
                    setNewComment({ ...newComment, [post.id]: e.target.value })
                  }
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addComment(post.id);
                    }
                  }}
                />
                <button
                  onClick={() => addComment(post.id)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg transition"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No posts yet</p>
            <p className="text-slate-500 text-sm mt-2">Check back soon for investment insights!</p>
          </div>
        )}
      </div>
    </div>
  );
}
