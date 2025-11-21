import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface Submission {
  id: string;
  symbol: string;
  company_name: string;
  sector: string;
  term: 'long' | 'short';
  notes: string | null;
  status: 'pending' | 'approved' | 'denied';
  submitted_at: string;
  submitted_by: string;
  profiles: {
    username: string;
  };
}

export default function WatchlistApproval() {
  const { profile } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (profile?.is_admin) {
      loadSubmissions();
    }
  }, [profile, filter]);

  async function loadSubmissions() {
    let query = supabase
      .from('watchlist_submissions')
      .select(`
        *,
        profiles:submitted_by (
          username
        )
      `)
      .order('submitted_at', { ascending: false });

    if (filter === 'pending') {
      query = query.eq('status', 'pending');
    }

    const { data, error } = await query;

    if (!error && data) {
      setSubmissions(data as Submission[]);
    }
    setLoading(false);
  }

  async function handleApprove(submission: Submission) {
    if (!profile?.is_admin) return;

    const { error: updateError } = await supabase
      .from('watchlist_submissions')
      .update({
        status: 'approved',
        reviewed_by: profile.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: adminNotes[submission.id] || null,
      })
      .eq('id', submission.id);

    if (updateError) {
      alert('Error updating submission');
      return;
    }

    const { error: insertError } = await supabase.from('watchlist_stocks').insert({
      symbol: submission.symbol,
      company_name: submission.company_name,
      sector: submission.sector,
      term: submission.term,
      notes: submission.notes,
      added_by: profile.id,
    });

    if (!insertError) {
      loadSubmissions();
      setAdminNotes({ ...adminNotes, [submission.id]: '' });
    }
  }

  async function handleDeny(submissionId: string) {
    if (!profile?.is_admin) return;

    const { error } = await supabase
      .from('watchlist_submissions')
      .update({
        status: 'denied',
        reviewed_by: profile.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: adminNotes[submissionId] || null,
      })
      .eq('id', submissionId);

    if (!error) {
      loadSubmissions();
      setAdminNotes({ ...adminNotes, [submissionId]: '' });
    }
  }

  if (!profile?.is_admin) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass rounded-2xl p-8 text-center">
          <p className="text-slate-400 text-lg">Access denied. Admin privileges required.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-orange-500 border-r-transparent border-b-transparent border-l-transparent mx-auto mb-3"></div>
          <p className="text-slate-400">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-10 h-10 text-orange-500" />
            <h1 className="text-5xl font-bold gradient-text">Watchlist Approvals</h1>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'pending'
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              All
            </button>
          </div>
        </div>
        <p className="text-slate-400 text-lg">
          Review and approve community stock submissions for the watchlist
        </p>
      </div>

      {submissions.length === 0 ? (
        <div className="glass rounded-2xl p-8 text-center">
          <Clock className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">
            {filter === 'pending' ? 'No pending submissions' : 'No submissions found'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div key={submission.id} className="glass rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-2xl font-bold text-orange-400">{submission.symbol}</h3>
                    <span className="text-xl text-slate-300">{submission.company_name}</span>
                    <span className={`px-3 py-1 rounded-lg text-sm font-bold ${
                      submission.term === 'long' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {submission.term.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-slate-400 mb-3">
                    <span className="font-medium">{submission.sector}</span>
                    <span>•</span>
                    <span>Submitted by {submission.profiles.username}</span>
                    <span>•</span>
                    <span>{new Date(submission.submitted_at).toLocaleDateString()}</span>
                  </div>
                  {submission.notes && (
                    <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                      <p className="text-sm font-medium text-slate-300 mb-1">Investment Thesis:</p>
                      <p className="text-slate-400">{submission.notes}</p>
                    </div>
                  )}
                </div>
                <span className={`px-3 py-1 rounded-lg text-sm font-bold ml-4 ${
                  submission.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                  submission.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                  'bg-red-500/20 text-red-400'
                }`}>
                  {submission.status.toUpperCase()}
                </span>
              </div>

              {submission.status === 'pending' && (
                <div className="border-t border-slate-700 pt-4">
                  <label className="block text-sm font-medium text-slate-300 mb-2">Admin Notes (optional)</label>
                  <textarea
                    value={adminNotes[submission.id] || ''}
                    onChange={(e) => setAdminNotes({ ...adminNotes, [submission.id]: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-orange-500 focus:outline-none mb-3"
                    rows={2}
                    placeholder="Add feedback for the submitter..."
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleApprove(submission)}
                      className="flex items-center space-x-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve & Add to Watchlist</span>
                    </button>
                    <button
                      onClick={() => handleDeny(submission.id)}
                      className="flex items-center space-x-2 px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Deny</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
