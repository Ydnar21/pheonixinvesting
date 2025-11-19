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
    if (!user || !profile?.is_admin) return;

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
        <div className="text-center text-orange-400 text-xl font-semibold">Loading posts...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h1 className="text-6xl font-bold gradient-text mb-3">Investment Community</h1>
          <p className="text-slate-400 text-xl font-medium">Stock discussions and insights</p>
        </div>
        <button
          onClick={() => setShowNewPost(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-200 hover:scale-105 text-lg"
        >
          <Plus className="w-6 h-6" />
          <span>{profile?.is_admin ? 'New Post' : 'Submit Idea'}</span>
        </button>
      </div>

      {profile?.is_admin && submissions.length > 0 && (
        <div className="mb-8">
          <button
            onClick={() => setShowSubmissions(!showSubmissions)}
            className="flex items-center space-x-2 text-orange-400 hover:text-orange-300 font-bold mb-4 text-lg"
          >
            <Clock className="w-6 h-6" />
            <span>{submissions.length} Pending Submission{submissions.length !== 1 ? 's' : ''}</span>
          </button>

          {showSubmissions && (
            <div className="space-y-4 mb-6">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="glass rounded-xl p-6 border-2 border-orange-500/30 card-hover"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="font-bold text-orange-400 text-lg">{submission.stock_symbol}</span>
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
                      <p className="text-xs text-slate-400 font-medium">
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
                  <h3 className="text-xl font-bold text-orange-400 mb-2">{submission.title}</h3>
                  <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{submission.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {showNewPost && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div className="glass rounded-2xl shadow-2xl shadow-orange-500/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-orange-500/30">
            <div className="p-6 border-b border-orange-500/30">
              <h2 className="text-3xl font-bold text-orange-400">
                {profile?.is_admin ? 'Create New Post' : 'Submit Stock Idea'}
              </h2>
              <p className="text-slate-400 mt-1 font-medium">
                {profile?.is_admin
                  ? 'Post a stock for the community to vote on'
                  : 'Suggest a stock for the admin to post about'}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-orange-400 mb-2">
                    Stock Symbol
                  </label>
                  <input
                    type="text"
                    value={profile?.is_admin ? newPost.stock_symbol : newSubmission.stock_symbol}
                    onChange={(e) =>
                      profile?.is_admin
                        ? setNewPost({ ...newPost, stock_symbol: e.target.value.toUpperCase() })
                        : setNewSubmission({
                            ...newSubmission,
                            stock_symbol: e.target.value.toUpperCase(),
                          })
                    }
                    placeholder="AAPL"
                    className="w-full px-4 py-3 border-2 border-orange-500/30 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-slate-900/50 text-slate-200 placeholder:text-slate-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-orange-400 mb-2">
                    Stock Name
                  </label>
                  <input
                    type="text"
                    value={profile?.is_admin ? newPost.stock_name : newSubmission.stock_name}
                    onChange={(e) =>
                      profile?.is_admin
                        ? setNewPost({ ...newPost, stock_name: e.target.value })
                        : setNewSubmission({ ...newSubmission, stock_name: e.target.value })
                    }
                    placeholder="Apple Inc."
                    className="w-full px-4 py-3 border-2 border-orange-500/30 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-slate-900/50 text-slate-200 placeholder:text-slate-500"
                  />
                </div>
              </div>

              {!profile?.is_admin && (
                <div>
                  <label className="block text-sm font-bold text-orange-400 mb-2">Sentiment</label>
                  <div className="flex space-x-2">
                    {(['bullish', 'neutral', 'bearish'] as const).map((sentiment) => (
                      <button
                        key={sentiment}
                        onClick={() => setNewSubmission({ ...newSubmission, sentiment })}
                        className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border-2 transition ${
                          newSubmission.sentiment === sentiment
                            ? `${getSentimentColor(sentiment)} border-current`
                            : 'border-slate-300 text-slate-600 hover:border-slate-400'
                        }`}
                      >
                        {getSentimentIcon(sentiment)}
                        <span className="capitalize">{sentiment}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-orange-400 mb-2">Title</label>
                <input
                  type="text"
                  value={profile?.is_admin ? newPost.title : newSubmission.title}
                  onChange={(e) =>
                    profile?.is_admin
                      ? setNewPost({ ...newPost, title: e.target.value })
                      : setNewSubmission({ ...newSubmission, title: e.target.value })
                  }
                  placeholder="Why I'm bullish on AAPL"
                  className="w-full px-4 py-3 border-2 border-orange-500/30 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-slate-900/50 text-slate-200 placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-orange-400 mb-2">Content</label>
                <textarea
                  value={profile?.is_admin ? newPost.content : newSubmission.content}
                  onChange={(e) =>
                    profile?.is_admin
                      ? setNewPost({ ...newPost, content: e.target.value })
                      : setNewSubmission({ ...newSubmission, content: e.target.value })
                  }
                  placeholder="Share your analysis..."
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-orange-500/30 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-slate-900/50 text-slate-200 placeholder:text-slate-500"
                />
              </div>
            </div>

            <div className="p-6 border-t border-orange-500/30 flex justify-end space-x-3">
              <button
                onClick={() => setShowNewPost(false)}
                className="px-6 py-3 text-slate-400 hover:text-orange-400 font-bold transition text-lg"
              >
                Cancel
              </button>
              <button
                onClick={profile?.is_admin ? createPost : submitStockIdea}
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3 rounded-lg font-bold transition phoenix-glow text-lg"
              >
                {profile?.is_admin ? 'Post' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {posts.map((post) => (
          <div
            key={post.id}
            className="glass rounded-2xl overflow-hidden card-hover"
          >
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="gradient-bg text-white font-bold w-12 h-12 rounded-xl flex items-center justify-center text-lg shadow-soft">
                    {post.profiles?.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-orange-400 text-xl">
                        {post.profiles?.username || 'Anonymous'}
                      </span>
                      {post.profiles?.is_admin && (
                        <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg shadow-orange-500/30">
                          Admin
                        </span>
                      )}
                      <span className="text-slate-500 text-sm">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="font-bold text-orange-400 text-xl">{post.stock_symbol}</span>
                      <span className="text-slate-400">{post.stock_name}</span>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-3xl font-bold text-orange-400 mb-4">{post.title}</h3>
              <p className="text-slate-300 text-lg leading-relaxed whitespace-pre-wrap">{post.content}</p>
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
              <div className="flex items-center space-x-4 pt-4 border-t border-orange-500/20">
                <button
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition font-bold ${
                    likes[post.id]
                      ? 'bg-orange-500/20 text-orange-400 border-2 border-orange-500/30'
                      : 'text-slate-400 hover:bg-orange-500/10 hover:text-orange-400 border-2 border-transparent'
                  }`}
                >
                  <ThumbsUp className="w-5 h-5" />
                  <span className="font-bold">{likeCounts[post.id] || 0}</span>
                </button>
                <div className="flex items-center space-x-2 text-slate-400 font-bold">
                  <MessageSquare className="w-5 h-5" />
                  <span>{comments[post.id]?.length || 0}</span>
                </div>
              </div>
            </div>

            {comments[post.id] && comments[post.id].length > 0 && (
              <div className="bg-slate-950/50 px-6 py-4 border-t border-orange-500/20">
                <div className="space-y-4">
                  {comments[post.id].map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white font-bold w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                        {comment.profiles?.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-orange-400">
                            {comment.profiles?.username || 'Anonymous'}
                          </span>
                          <span className="text-slate-500 text-xs">
                            {new Date(comment.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-300 mt-1 leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="px-6 py-4 bg-slate-950/50 border-t border-orange-500/20">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={newComment[post.id] || ''}
                  onChange={(e) =>
                    setNewComment({ ...newComment, [post.id]: e.target.value })
                  }
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-3 border-2 border-orange-500/30 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-slate-900/50 text-slate-200 placeholder:text-slate-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addComment(post.id);
                    }
                  }}
                />
                <button
                  onClick={() => addComment(post.id)}
                  className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white p-3 rounded-lg transition phoenix-glow"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {posts.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-20 h-20 text-orange-500/30 mx-auto mb-4" />
            <p className="text-orange-400 text-2xl font-bold">No posts yet</p>
            <p className="text-slate-400 text-lg mt-2">
              {profile?.is_admin
                ? 'Create the first post!'
                : 'Check back soon for investment insights!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
