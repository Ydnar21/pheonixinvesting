import { useState, useEffect } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { db } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import ProfileModal from '../components/ProfileModal';

interface Message {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  username?: string;
  display_name?: string;
}

export default function Community() {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadMessages() {
    try {
      const { data, error } = await db.query<Message>(
        `SELECT m.id, m.user_id, m.content, m.created_at, u.username, u.display_name
         FROM messages m
         JOIN users u ON m.user_id = u.id
         ORDER BY m.created_at DESC
         LIMIT 100`
      );

      if (!error && data) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !profile || sending) return;

    setSending(true);
    try {
      const { error } = await db.execute(
        'INSERT INTO messages (user_id, content) VALUES ($1, $2)',
        [profile.id, newMessage.trim()]
      );

      if (!error) {
        setNewMessage('');
        await loadMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  }

  function handleUserClick(userId: string) {
    setSelectedUserId(userId);
    setShowProfileModal(true);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-950 p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-slate-400 text-center">Loading community...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold gradient-text mb-2">Community Chat</h1>
          <p className="text-slate-400">Connect with other traders and investors</p>
        </div>

        {profile && (
          <div className="glass rounded-xl p-6 mb-6">
            <form onSubmit={handleSendMessage} className="flex space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Share your thoughts with the community..."
                className="flex-1 px-4 py-3 border-2 border-orange-500/30 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-slate-900/50 text-slate-200"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="btn-primary px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        )}

        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center">
              <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No messages yet. Be the first to post!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="glass rounded-xl p-6 hover:border-orange-500/30 transition">
                <div className="flex items-start space-x-4">
                  <button
                    onClick={() => handleUserClick(message.user_id)}
                    className="w-12 h-12 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center text-orange-400 font-bold hover:ring-2 hover:ring-orange-500 transition"
                  >
                    {message.username?.[0]?.toUpperCase() || 'U'}
                  </button>
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <button
                        onClick={() => handleUserClick(message.user_id)}
                        className="font-semibold text-slate-200 hover:text-orange-400 transition"
                      >
                        {message.display_name || message.username || 'Anonymous'}
                      </button>
                      <span className="text-sm text-slate-500">
                        {new Date(message.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{message.content}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {showProfileModal && selectedUserId && (
        <ProfileModal
          userId={selectedUserId}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedUserId(null);
          }}
        />
      )}
    </div>
  );
}
