import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, TrendingUp, TrendingDown } from 'lucide-react';
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

interface EventSubmission {
  id: string;
  title: string;
  description: string;
  event_date: string;
  sentiment: 'bullish' | 'bearish';
  status: 'pending' | 'approved' | 'rejected';
  user_id: string;
}

export default function Calendar() {
  const { profile } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [submissions, setSubmissions] = useState<EventSubmission[]>([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    event_date: new Date().toISOString().split('T')[0],
    sentiment: 'bullish' as 'bullish' | 'bearish',
  });

  useEffect(() => {
    loadEvents();
    if (profile?.is_admin) {
      loadSubmissions();
    }
  }, [profile?.is_admin]);

  async function loadEvents() {
    const { data } = await supabase
      .from('calendar_events')
      .select('*')
      .eq('is_approved', true)
      .gte('event_date', new Date().toISOString().split('T')[0])
      .order('event_date');
    if (data) setEvents(data);
  }

  async function loadSubmissions() {
    const { data } = await supabase
      .from('calendar_event_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setSubmissions(data);
  }

  async function submitEvent() {
    if (!profile) return;

    const { error } = await supabase
      .from('calendar_event_submissions')
      .insert([
        {
          title: newEvent.title,
          description: newEvent.description,
          event_date: newEvent.event_date,
          sentiment: newEvent.sentiment,
          user_id: profile.id,
          status: 'pending',
        },
      ]);

    if (error) {
      alert('Failed to submit event: ' + error.message);
      return;
    }

    alert('Event submitted for review!');
    setNewEvent({
      title: '',
      description: '',
      event_date: new Date().toISOString().split('T')[0],
      sentiment: 'bullish',
    });
    setShowSubmitModal(false);
  }

  async function approveSubmission(id: string) {
    const submission = submissions.find((s) => s.id === id);
    if (!submission) return;

    const { error: updateError } = await supabase
      .from('calendar_event_submissions')
      .update({
        status: 'approved',
        reviewed_by: profile?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      alert('Failed to approve: ' + updateError.message);
      return;
    }

    const { error: insertError } = await supabase
      .from('calendar_events')
      .insert([
        {
          title: submission.title,
          description: submission.description,
          event_date: submission.event_date,
          sentiment: submission.sentiment,
          created_by: submission.user_id,
          approved_by: profile?.id,
          is_approved: true,
        },
      ]);

    if (!insertError) {
      loadEvents();
      loadSubmissions();
    }
  }

  async function rejectSubmission(id: string) {
    const { error } = await supabase
      .from('calendar_event_submissions')
      .update({
        status: 'rejected',
        reviewed_by: profile?.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (!error) {
      loadSubmissions();
    }
  }

  async function createDirectEvent() {
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
    setShowSubmitModal(false);
    loadEvents();
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
          <p className="text-slate-600 text-lg">Track bullish and bearish market events</p>
        </div>
        <button
          onClick={() => setShowSubmitModal(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>{profile?.is_admin ? 'New Event' : 'Suggest Event'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <div className="glass rounded-2xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-slate-900">
                {monthName} {year}
              </h2>
              <div className="flex space-x-4">
                <button
                  onClick={() => setCurrentDate(new Date(year, month - 1))}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date(year, month + 1))}
                  className="p-2 hover:bg-slate-100 rounded-lg transition"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-bold text-slate-600 py-2">
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
                        ? 'border-slate-200 hover:border-orange-300 hover:bg-orange-50'
                        : 'border-transparent bg-slate-50'
                    }`}
                  >
                    {day && (
                      <div>
                        <div className="font-bold text-slate-900 mb-1">{day}</div>
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
              <h3 className="font-bold text-slate-900 mb-4">
                {new Date(selectedDate).toLocaleDateString('default', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {getEventsForDate(parseInt(selectedDate.split('-')[2])).map((event) => (
                  <div
                    key={event.id}
                    className={`p-3 rounded-lg border-l-4 ${
                      event.sentiment === 'bullish'
                        ? 'border-l-green-500 bg-green-50'
                        : 'border-l-red-500 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {event.sentiment === 'bullish' ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                      <p className="font-bold text-slate-900">{event.title}</p>
                    </div>
                    <p className="text-sm text-slate-600">{event.description}</p>
                  </div>
                ))}
                {getEventsForDate(parseInt(selectedDate.split('-')[2])).length === 0 && (
                  <p className="text-slate-500 text-center py-4">No events this day</p>
                )}
              </div>
            </div>
          )}

          {profile?.is_admin && (
            <button
              onClick={() => setShowAdminPanel(!showAdminPanel)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-semibold transition"
            >
              {showAdminPanel ? 'Hide Panel' : 'Show Admin Panel'}
            </button>
          )}
        </div>
      </div>

      {showAdminPanel && profile?.is_admin && (
        <div className="mt-8 glass rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Admin: Event Submissions</h2>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {submissions.filter((s) => s.status === 'pending').length === 0 ? (
              <p className="text-slate-500">No pending submissions</p>
            ) : (
              submissions
                .filter((s) => s.status === 'pending')
                .map((submission) => (
                  <div
                    key={submission.id}
                    className={`p-4 border-2 rounded-lg ${
                      submission.sentiment === 'bullish'
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-slate-900">{submission.title}</h3>
                        <p className="text-sm text-slate-600">
                          {new Date(submission.event_date).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold ${
                          submission.sentiment === 'bullish'
                            ? 'bg-green-600 text-white'
                            : 'bg-red-600 text-white'
                        }`}
                      >
                        {submission.sentiment}
                      </span>
                    </div>
                    <p className="text-slate-700 mb-3">{submission.description}</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => approveSubmission(submission.id)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectSubmission(submission.id)}
                        className="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {profile?.is_admin ? 'Create Event' : 'Suggest Event'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white/50"
                  placeholder="Event title"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Description
                </label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white/50 resize-none"
                  rows={3}
                  placeholder="Brief description"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={newEvent.event_date}
                  onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-slate-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all bg-white/50"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Sentiment
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={newEvent.sentiment === 'bullish'}
                      onChange={() => setNewEvent({ ...newEvent, sentiment: 'bullish' })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-slate-700">Bullish</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      checked={newEvent.sentiment === 'bearish'}
                      onChange={() => setNewEvent({ ...newEvent, sentiment: 'bearish' })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm font-medium text-slate-700">Bearish</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-8">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 px-4 py-2 border-2 border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={profile?.is_admin ? createDirectEvent : submitEvent}
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-lg font-medium transition"
              >
                {profile?.is_admin ? 'Create' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
