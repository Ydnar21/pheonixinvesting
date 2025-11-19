import { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, TrendingUp, TrendingDown, Minus, Send, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { supabase, StockPost, PostComment, StockSubmission, StockVote } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import VotingSection from '../components/VotingSection';

export default function Community() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<StockPost[]>([]);
  const [submissions, setSubmissions] = useState<StockSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<{ [key: string]: PostComment[] }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [likes, setLikes] = useState<{ [key: string]: boolean }>({});
  const [likeCounts, setLikeCounts] = useState<{ [key: string]: number }>({});
  const [votes, setVotes] = useState<{ [key: string]: StockVote }>({});
  const [voteCounts, setVoteCounts] = useState<{ [key: string]: { shortTerm: { bullish: number; bearish: number; neutral: number }; longTerm: { bullish: number; bearish: number; neutral: number } } }>({});
  const [showNewPost, setShowNewPost] = useState(false);
  const [showSubmissions, setShowSubmissions] = useState(false);
  const [newPost, setNewPost] = useState({
    stock_symbol: '',
    stock_name: '',
    title: '',
    content: '',
    sentiment: 'neutral' as 'bullish' | 'bearish' | 'neutral',
  });
  const [newSubmission, setNewSubmission] = useState({
    stock_symbol: '',
    stock_name: '',
    title: '',
    content: '',
    sentiment: 'neutral' as 'bullish' | 'bearish' | 'neutral',
  });

  useEffect(() => {
    loadPosts();
    if (profile?.is_admin) {
      loadSubmissions();
    }
  }, [profile]);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_posts')
        .select(`
          *,
          profiles(username, avatar_url, is_admin)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);

      if (data) {
        data.forEach((post) => {
          loadComments(post.id);
          loadLikes(post.id);
          loadVotes(post.id);
        });
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_submissions')
        .select(`
          *,
          profiles(username)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
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

  const createPost = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.from('stock_posts').insert([
        {
          user_id: user.id,
          stock_symbol: newPost.stock_symbol,
          stock_name: newPost.stock_name,
          title: newPost.title,
          content: newPost.content,
          sentiment: 'neutral',
        },
      ]);

      if (error) throw error;

      setNewPost({
        stock_symbol: '',
        stock_name: '',
        title: '',
        content: '',
        sentiment: 'neutral',
      });
      setShowNewPost(false);
      loadPosts();
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const submitStockIdea = async () => {
    if (!user) return;

    try {
      const { error } = await supabase.from('stock_submissions').insert([
        {
          user_id: user.id,
          ...newSubmission,
        },
      ]);

      if (error) throw error;

      setNewSubmission({
        stock_symbol: '',
        stock_name: '',
        title: '',
        content: '',
        sentiment: 'neutral',
      });
      setShowNewPost(false);
      alert('Stock idea submitted! The admin will review it soon.');
    } catch (error) {
      console.error('Error submitting idea:', error);
    }
  };

  const handleSubmission = async (submissionId: string, action: 'approve' | 'reject') => {
    if (!user || !profile?.is_admin) return;

    try {
      if (action === 'approve') {
        const submission = submissions.find((s) => s.id === submissionId);
        if (!submission) return;

        const { error: postError } = await supabase.from('stock_posts').insert([
          {
            user_id: user.id,
            stock_symbol: submission.stock_symbol,
            stock_name: submission.stock_name,
            title: submission.title,
            content: submission.content,
            sentiment: 'neutral',
            submission_id: submissionId,
          },
        ]);

        if (postError) throw postError;
      }

      const { error: updateError } = await supabase
        .from('stock_submissions')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', submissionId);

      if (updateError) throw updateError;

      loadSubmissions();
      if (action === 'approve') {
        loadPosts();
      }
    } catch (error) {
      console.error('Error handling submission:', error);
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

  const loadVotes = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('stock_votes')
        .select('*')
        .eq('post_id', postId);

      if (error) throw error;

      const counts = {
        shortTerm: { bullish: 0, bearish: 0, neutral: 0 },
        longTerm: { bullish: 0, bearish: 0, neutral: 0 },
      };

      data?.forEach((vote) => {
        const shortTerm = vote.short_term_sentiment as 'bullish' | 'bearish' | 'neutral';
        const longTerm = vote.long_term_sentiment as 'bullish' | 'bearish' | 'neutral';

        if (shortTerm === 'bullish' || shortTerm === 'bearish' || shortTerm === 'neutral') {
          counts.shortTerm[shortTerm]++;
        }

        if (longTerm === 'bullish' || longTerm === 'bearish' || longTerm === 'neutral') {
          counts.longTerm[longTerm]++;
        }
      });

      setVoteCounts((prev) => ({ ...prev, [postId]: counts }));

      if (user) {
        const userVote = data?.find((vote) => vote.user_id === user.id);
        if (userVote) {
          setVotes((prev) => ({ ...prev, [postId]: userVote }));
        }
      }
    } catch (error) {
      console.error('Error loading votes:', error);
    }
  };

  const handleVote = async (
    postId: string,
    shortTermSentiment: 'bullish' | 'bearish' | 'neutral',
    longTermSentiment: 'bullish' | 'bearish' | 'neutral'
  ) => {
    if (!user) return;

    try {
      const existingVote = votes[postId];

      if (existingVote) {
        const { error } = await supabase
          .from('stock_votes')
          .update({
            short_term_sentiment: shortTermSentiment,
            long_term_sentiment: longTermSentiment,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingVote.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('stock_votes').insert([
          {
            post_id: postId,
            user_id: user.id,
            short_term_sentiment: shortTermSentiment,
            long_term_sentiment: longTermSentiment,
          },
        ]);

        if (error) throw error;
      }

      loadVotes(postId);
    } catch (error) {
      console.error('Error voting:', error);
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
        <div className="text-center text-slate-400">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-orange-500 mb-1">Investment Community</h1>
          <p className="text-slate-300">Share your stock insights and analysis</p>
        </div>
        <button
          onClick={() => setShowNewPost(true)}
          className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <Plus className="w-5 h-5" />
          <span>New Post</span>
        </button>
      </div>

      {profile?.is_admin && submissions.length > 0 && (
        <div className="mb-8">
          <button
            onClick={() => setShowSubmissions(!showSubmissions)}
            className="flex items-center space-x-2 text-orange-500 hover:text-orange-400 font-medium mb-4"
          >
            <Clock className="w-5 h-5" />
            <span>{submissions.length} Pending Submission{submissions.length !== 1 ? 's' : ''}</span>
          </button>

          {showSubmissions && (
            <div className="space-y-4 mb-6">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="glass rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-bold text-orange-500">{submission.stock_symbol}</span>
                        <span className="text-slate-400 text-sm">{submission.stock_name}</span>
                        <span
                          className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${getSentimentColor(
                            submission.sentiment
                          )}`}
                        >
                          {getSentimentIcon(submission.sentiment)}
                          <span>{submission.sentiment}</span>
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        Submitted by {submission.profiles?.username} on{' '}
                        {new Date(submission.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSubmission(submission.id, 'approve')}
                        className="flex items-center space-x-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg transition text-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleSubmission(submission.id, 'reject')}
                        className="flex items-center space-x-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition text-sm"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-orange-500 mb-2">{submission.title}</h3>
                  <p className="text-slate-400 whitespace-pre-wrap">{submission.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showNewPost && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="glass rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-orange-500/20">
              <h2 className="text-2xl font-bold text-orange-500">
                Create New Post
              </h2>
              <p className="text-slate-300 mt-1">
                Share your stock analysis with the community
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Stock Symbol
                  </label>
                  <input
                    type="text"
                    value={newPost.stock_symbol}
                    onChange={(e) => setNewPost({ ...newPost, stock_symbol: e.target.value.toUpperCase() })}
                    placeholder="AAPL"
                    className="w-full px-4 py-2 border border-orange-500/30 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 bg-slate-950 text-white placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Stock Name
                  </label>
                  <input
                    type="text"
                    value={newPost.stock_name}
                    onChange={(e) => setNewPost({ ...newPost, stock_name: e.target.value })}
                    placeholder="Apple Inc."
                    className="w-full px-4 py-2 border border-orange-500/30 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 bg-slate-950 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  value={newPost.title}
                  onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                  placeholder="Why I'm bullish on AAPL"
                  className="w-full px-4 py-2 border border-orange-500/30 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 bg-slate-950 text-white placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Content</label>
                <textarea
                  value={newPost.content}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  placeholder="Share your analysis..."
                  rows={6}
                  className="w-full px-4 py-2 border border-orange-500/30 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 bg-slate-950 text-white placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-orange-500/20 flex justify-end space-x-3">
              <button
                onClick={() => setShowNewPost(false)}
                className="px-4 py-2 text-slate-300 hover:text-orange-500 transition"
              >
                Cancel
              </button>
              <button
                onClick={createPost}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {posts.map((post) => (
          <div
            key={post.id}
            className="glass rounded-lg overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="gradient-bg text-white font-bold w-12 h-12 rounded-xl flex items-center justify-center text-lg shadow-soft">
                    {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-orange-500">
                        {post.profiles?.username || 'Anonymous'}
                      </span>
                      {post.profiles?.is_admin && (
                        <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded font-medium">
                          Admin
                        </span>
                      )}
                      <span className="text-slate-400 text-xs">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="font-bold text-orange-500">{post.stock_symbol}</span>
                      <span className="text-slate-300 text-sm">{post.stock_name}</span>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-xl font-bold text-orange-500 mb-3">{post.title}</h3>
              <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Voting Section */}
            <div className="px-6 pb-4">
              <VotingSection
                postId={post.id}
                userVote={votes[post.id]}
                voteCounts={voteCounts[post.id] || { shortTerm: { bullish: 0, bearish: 0, neutral: 0 }, longTerm: { bullish: 0, bearish: 0, neutral: 0 } }}
                onVote={handleVote}
              />
            </div>

            <div className="px-6">
              <div className="flex items-center space-x-3 pt-4 border-t border-orange-500/20">
                <button
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded transition ${
                    likes[post.id]
                      ? 'bg-orange-500/10 text-orange-500'
                      : 'text-slate-300 hover:text-orange-500'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-sm font-medium">{likeCounts[post.id] || 0}</span>
                </button>
                <div className="flex items-center space-x-1 text-slate-300">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm font-medium">{comments[post.id]?.length || 0}</span>
                </div>
              </div>
            </div>

            {comments[post.id] && comments[post.id].length > 0 && (
              <div className="bg-slate-950/50 px-6 py-3 border-t border-orange-500/20">
                <div className="space-y-3">
                  {comments[post.id].map((comment) => (
                    <div key={comment.id} className="flex space-x-2">
                      <div className="bg-orange-500 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm">
                        {comment.profiles?.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-orange-500 text-sm">
                            {comment.profiles?.username || 'Anonymous'}
                          </span>
                          <span className="text-slate-400 text-xs">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-200 text-sm mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="px-6 py-3 bg-slate-950/50 border-t border-orange-500/20">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newComment[post.id] || ''}
                  onChange={(e) =>
                    setNewComment({ ...newComment, [post.id]: e.target.value })
                  }
                  placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 border border-orange-500/30 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-500 bg-slate-950 text-white placeholder:text-slate-500 text-sm"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addComment(post.id);
                    }
                  }}
                />
                <button
                  onClick={() => addComment(post.id)}
                  className="bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-lg transition"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-orange-500/30 mx-auto mb-3" />
            <p className="text-orange-500 text-lg font-bold">No posts yet</p>
            <p className="text-slate-300 text-sm mt-1">
              Be the first to share your stock analysis!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
