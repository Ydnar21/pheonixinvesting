import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  sentiment: 'bullish' | 'bearish';
  created_by: string;
  is_approved: boolean;
}

interface EventVote {
  id: string;
  event_id: string;
  user_id: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
}

interface VoteCount {
  bullish: number;
  bearish: number;
  neutral: number;
}

export default function Calendar() {
  const { profile } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [votes, setVotes] = useState<Record<string, EventVote[]>>({});
  const [userVotes, setUserVotes] = useState<Record<string, EventVote>>({});
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_date: new Date().toISOString().split('T')[0],
    sentiment: 'bullish' as 'bullish' | 'bearish',
  });

  useEffect(() => {
    loadEvents();
    loadVotes();
  }, []);

  async function loadEvents() {
    const { data } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('is_approved', true)
      .order('event_date');
    if (data) setEvents(data);
  }

  async function loadVotes() {
    const { data } = await supabase
      .from('calendar_event_votes')
      .select('*');

    if (data) {
      const votesByEvent: Record<string, EventVote[]> = {};
      const userVoteMap: Record<string, EventVote> = {};

      data.forEach((vote: EventVote) => {
        if (!votesByEvent[vote.event_id]) {
          votesByEvent[vote.event_id] = [];
        }
        votesByEvent[vote.event_id].push(vote);

        if (vote.user_id === profile?.id) {
          userVoteMap[vote.event_id] = vote;
        }
      });

      setVotes(votesByEvent);
      setUserVotes(userVoteMap);
    }
  }

  async function createEvent() {
    if (!profile?.is_admin) return;

    const { error } = await supabase
      .from('calendar_events')
      .insert([
        {
          title: newEvent.title,
          description: newEvent.description,
          event_date: newEvent.event_date,
          sentiment: newEvent.sentiment,
          created_by: profile.id,
          approved_by: profile.id,
          is_approved: true,
        },
      ]);

    if (error) {
      alert('Failed to create event: ' + error.message);
      return;
    }

    alert('Event created!');
    setNewEvent({
      title: '',
      description: '',
      event_date: new Date().toISOString().split('T')[0],
      sentiment: 'bullish',
    });
    setShowEventModal(false);
    loadEvents();
  }

  async function deleteEvent(eventId: string) {
    if (!profile?.is_admin) return;

    if (!confirm('Are you sure you want to delete this event?')) return;

    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId);

    if (!error) {
      loadEvents();
    }
  }

  async function voteOnEvent(eventId: string, sentiment: 'bullish' | 'bearish' | 'neutral') {
    if (!profile) return;

    const existingVote = userVotes[eventId];

    if (existingVote) {
      const { error } = await supabase
        .from('calendar_event_votes')
        .update({ sentiment, updated_at: new Date().toISOString() })
        .eq('id', existingVote.id);

      if (!error) {
        loadVotes();
      }
    } else {
      const { error } = await supabase
        .from('calendar_event_votes')
        .insert([
          {
            event_id: eventId,
            user_id: profile.id,
            sentiment,
          },
        ]);

      if (!error) {
        loadVotes();
      }
    }
  }

  function getVoteCounts(eventId: string): VoteCount {
    const eventVotes = votes[eventId] || [];
    return {
      bullish: eventVotes.filter(v => v.sentiment === 'bullish').length,
      bearish: eventVotes.filter(v => v.sentiment === 'bearish').length,
      neutral: eventVotes.filter(v => v.sentiment === 'neutral').length,
    };
  }

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = [];

  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getEventsForDate = (day: number | null) => {
    if (!day) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((e) => e.event_date === dateStr);
  };

  const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-5xl font-bold gradient-text mb-2">Market Calendar</h1>
          <p className="text-slate-400 text-lg">Track market events and vote on sentiment</p>
        </div>
        {profile?.is_admin && (
          <button
            onClick={() => setShowEventModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>New Event</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="glass rounded-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-orange-400">
                {monthName} {year}
              </h2>
              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentDate(new Date(year, month - 1))}
                  className="p-2 hover:bg-orange-500/10 rounded-lg transition text-slate-300"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date(year, month + 1))}
                  className="p-2 hover:bg-orange-500/10 rounded-lg transition text-slate-300"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-bold text-slate-400 py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {days.map((day, idx) => {
                const dayEvents = getEventsForDate(day);
                return (
                  <div
                    key={idx}
                    onClick={() => day && setSelectedDate(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)}
                    className={`min-h-24 p-2 rounded-lg border-2 transition-all cursor-pointer ${
                      day
                        ? 'border-orange-500/20 hover:border-orange-500/50 hover:bg-orange-500/5'
                        : 'border-transparent bg-slate-900/50'
                    }`}
                  >
                    {day && (
                      <div>
                        <div className="font-bold text-slate-200 mb-1">{day}</div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 2).map((event) => (
                            <div
                              key={event.id}
                              className={`text-xs px-2 py-1 rounded text-white truncate font-semibold ${
                                event.sentiment === 'bullish'
                                  ? 'bg-green-500'
                                  : 'bg-red-500'
                              }`}
                            >
                              {event.title}
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <div className="text-xs text-slate-500 px-2">
                              +{dayEvents.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          {selectedDate && (
            <div className="glass rounded-2xl p-6">
              <h3 className="font-bold text-orange-400 mb-4">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('default', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </h3>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {getEventsForDate(parseInt(selectedDate.split('-')[2])).map((event) => {
                  const voteCounts = getVoteCounts(event.id);
                  const userVote = userVotes[event.id];

                  return (
                    <div
                      key={event.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        event.sentiment === 'bullish'
                          ? 'border-l-green-500 bg-green-500/10'
                          : 'border-l-red-500 bg-red-500/10'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        {event.sentiment === 'bullish' ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                        <p className="font-bold text-slate-200 flex-1">{event.title}</p>
                        {profile?.is_admin && (
                          <button
                            onClick={() => deleteEvent(event.id)}
                            className="text-red-400 hover:text-red-300 text-xs"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 mb-3">{event.description}</p>

                      <div className="border-t border-slate-700 pt-3 mt-3">
                        <p className="text-xs text-slate-500 font-semibold mb-2">Community Sentiment</p>
                        <div className="flex space-x-2 mb-2">
                          <button
                            onClick={() => voteOnEvent(event.id, 'bullish')}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition ${
                              userVote?.sentiment === 'bullish'
                                ? 'bg-green-500 text-white'
                                : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                            }`}
                          >
                            <TrendingUp className="w-3 h-3 inline mr-1" />
                            {voteCounts.bullish}
                          </button>
                          <button
                            onClick={() => voteOnEvent(event.id, 'neutral')}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition ${
                              userVote?.sentiment === 'neutral'
                                ? 'bg-slate-500 text-white'
                                : 'bg-slate-500/20 text-slate-400 hover:bg-slate-500/30'
                            }`}
                          >
                            <Minus className="w-3 h-3 inline mr-1" />
                            {voteCounts.neutral}
                          </button>
                          <button
                            onClick={() => voteOnEvent(event.id, 'bearish')}
                            className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition ${
                              userVote?.sentiment === 'bearish'
                                ? 'bg-red-500 text-white'
                                : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                            }`}
                          >
                            <TrendingDown className="w-3 h-3 inline mr-1" />
                            {voteCounts.bearish}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {getEventsForDate(parseInt(selectedDate.split('-')[2])).length === 0 && (
                  <p className="text-slate-500 text-center py-4">No events this day</p>
                )}
              </div>
            </div>
          )}

          <div className="glass rounded-2xl p-6">
            <h3 className="font-bold text-orange-400 mb-3">How to Vote</h3>
            <div className="space-y-2 text-sm text-slate-400">
              <p><span className="text-green-400 font-semibold">Bullish:</span> Positive for markets</p>
              <p><span className="text-slate-400 font-semibold">Neutral:</span> No clear impact</p>
              <p><span className="text-red-400 font-semibold">Bearish:</span> Negative for markets</p>
            </div>
          </div>
        </div>
      </div>

      {showEventModal && profile?.is_admin && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-orange-400 mb-6">Create Event</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-orange-500/30 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-slate-900/50 text-slate-200"
                  placeholder="Event title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-orange-500/30 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-slate-900/50 text-slate-200 resize-none"
                  rows={3}
                  placeholder="Brief description"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={newEvent.event_date}
                  onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-orange-500/30 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-slate-900/50 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Initial Sentiment
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={newEvent.sentiment === 'bullish'}
                      onChange={() => setNewEvent({ ...newEvent, sentiment: 'bullish' })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-slate-300">Bullish</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={newEvent.sentiment === 'bearish'}
                      onChange={() => setNewEvent({ ...newEvent, sentiment: 'bearish' })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-slate-300">Bearish</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-8">
              <button
                onClick={() => setShowEventModal(false)}
                className="flex-1 px-4 py-2 border-2 border-slate-600 text-slate-300 rounded-lg font-medium hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={createEvent}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
