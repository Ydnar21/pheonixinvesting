import { useState, useEffect, useRef } from 'react';
import { X, Send, MessageCircle, User } from 'lucide-react';
import { db } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface MessagesProps {
  onClose: () => void;
}

interface Conversation {
  userId: string;
  username: string;
  profilePicture: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  read: boolean;
  created_at: string;
}

export default function Messages({ onClose }: MessagesProps) {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(() => {
      loadConversations();
      if (selectedConversation) {
        loadMessages(selectedConversation);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [selectedConversation]);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      markMessagesAsRead(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  async function loadConversations() {
    if (!profile) return;
    setConversations([]);
  }

  async function loadMessages(userId: string) {
    if (!profile) return;
    setMessages([]);
  }

  async function markMessagesAsRead(userId: string) {
    if (!profile) return;
  }

  async function sendMessage() {
    if (!profile || !selectedConversation || !newMessage.trim()) return;
    setSending(true);
    setNewMessage('');
    setSending(false);
  }

  const selectedConvData = conversations.find((c) => c.userId === selectedConversation);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="glass rounded-2xl max-w-5xl w-full h-[600px] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-orange-500/20">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-6 h-6 text-orange-400" />
            <h2 className="text-2xl font-bold text-orange-400">Messages</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-orange-500/10 rounded-lg transition"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-1/3 border-r border-orange-500/20 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-slate-400 text-sm">
                  No conversations yet. Follow other users to start chatting!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-orange-500/10">
                {conversations.map((conv) => (
                  <button
                    key={conv.userId}
                    onClick={() => setSelectedConversation(conv.userId)}
                    className={`w-full p-4 text-left hover:bg-orange-500/5 transition ${
                      selectedConversation === conv.userId ? 'bg-orange-500/10' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex-shrink-0 overflow-hidden">
                        {conv.profilePicture ? (
                          <img
                            src={conv.profilePicture}
                            alt={conv.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-orange-400 font-bold">
                            {conv.username[0].toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-slate-200 truncate">
                            {conv.username}
                          </p>
                          {conv.unreadCount > 0 && (
                            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 truncate">{conv.lastMessage}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col">
            {selectedConversation && selectedConvData ? (
              <>
                <div className="p-4 border-b border-orange-500/20 bg-slate-900/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden">
                      {selectedConvData.profilePicture ? (
                        <img
                          src={selectedConvData.profilePicture}
                          alt={selectedConvData.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-orange-400 font-bold">
                          {selectedConvData.username[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <p className="font-semibold text-slate-200">
                      {selectedConvData.username}
                    </p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg) => {
                    const isSent = msg.sender_id === profile?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-2xl ${
                            isSent
                              ? 'bg-orange-500 text-white'
                              : 'bg-slate-800 text-slate-200'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isSent ? 'text-orange-100' : 'text-slate-500'
                            }`}
                          >
                            {new Date(msg.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 border-t border-orange-500/20">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border-2 border-orange-500/30 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-slate-900/50 text-slate-200"
                      disabled={sending}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={sending || !newMessage.trim()}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-slate-400">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
