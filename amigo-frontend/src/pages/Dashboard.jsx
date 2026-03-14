import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  FaVideo, FaKeyboard, FaCalendarPlus, FaDesktop,
  FaEllipsisH, FaClock, FaHistory,
  FaUsers, FaCheckCircle,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { meetingAPI } from '../services/api';
import { getAvatarGradient } from '../design-tokens';

const formatMeetingTime = (isoDate) => {
  if (!isoDate) return 'Instant';
  const d   = new Date(isoDate);
  const now = new Date();
  const isToday    = d.toDateString() === now.toDateString();
  const isTomorrow = d.toDateString() === new Date(now.getTime() + 86400000).toDateString();
  const timeStr    = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  if (isToday)    return `Today ${timeStr}`;
  if (isTomorrow) return `Tomorrow ${timeStr}`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ` ${timeStr}`;
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const getGreetingEmoji = () => {
  const h = new Date().getHours();
  if (h < 12) return '☀️';
  if (h < 17) return '👋';
  return '🌙';
};

const SkeletonRow = () => (
  <div className="flex items-center gap-4 py-3 border-b border-beige-200 animate-pulse">
    <div className="w-12 h-10 rounded-xl bg-beige-200" />
    <div className="flex-1 space-y-2">
      <div className="h-3.5 bg-beige-200 rounded w-2/3" />
      <div className="h-3 bg-beige-200 rounded w-1/3" />
    </div>
    <div className="w-16 h-8 bg-beige-200 rounded-xl" />
  </div>
);

const QUICK_ACTIONS = [
  { icon: <FaKeyboard />,    label: 'Join with Code', sub: 'Enter room ID',   path: '/join',             iconBg: 'bg-mint-100 text-mint-600' },
  { icon: <FaCalendarPlus />,label: 'Schedule',       sub: 'Calendar',        path: '/schedule-meeting', iconBg: 'bg-sage-100 text-sage-600' },
  { icon: <FaDesktop />,     label: 'Share Screen',   sub: 'Present now',     path: null,                iconBg: 'bg-beige-300 text-charcoal-600' },
];

const Dashboard = () => {
  const navigate   = useNavigate();
  const { user }   = useAuth();

  const [stats,    setStats]    = useState({ totalHosted: 0, upcoming: 0, ended: 0 });
  const [upcoming, setUpcoming] = useState([]);
  const [history,  setHistory]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  const firstName  = user?.fullName?.split(' ')[0] || 'there';
  const greeting   = getGreeting();
  const emoji      = getGreetingEmoji();
  const avatarGrad = getAvatarGradient(user?.id ?? 0);

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, upcomingData, historyData] = await Promise.all([
          meetingAPI.getStats(),
          meetingAPI.getMy(),
          meetingAPI.getHistory(),
        ]);
        setStats(statsData);
        setUpcoming(upcomingData);
        setHistory(historyData.slice(0, 4));
      } catch (err) {
        console.error('Dashboard load error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleStart = async (roomId, meetingId, meetingTitle) => {
    try {
      await meetingAPI.start(roomId);
      navigate(`/room/${roomId}`, {
        state: { isHost: true, meetingId, title: meetingTitle, userName: user?.fullName || 'Host' },
      });
    } catch (err) {
      console.error(err.message);
    }
  };

  return (
    <div className="page-wrapper">
      <Header />
      <main className="flex-1 page-container py-8 space-y-8">

        {/* Welcome Banner */}
        <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-6
                            bg-gradient-to-br from-sage-50 via-beige-100 to-mint-50
                            border border-beige-300 rounded-3xl p-6 sm:p-8 shadow-card">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center
                           text-white text-xl font-bold flex-shrink-0 shadow-sage-sm"
              style={{ background: avatarGrad }}>
              {user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-charcoal-900">
                {greeting}, {firstName} {emoji}
              </h1>
              <p className="text-sm text-charcoal-500 mt-0.5">
                {currentDate}
                {stats.upcoming > 0
                  ? ` • ${stats.upcoming} upcoming meeting${stats.upcoming > 1 ? 's' : ''}`
                  : ' • No upcoming meetings today'}
              </p>
            </div>
          </div>

          {/* Single New Meeting button — no dropdown */}
          <button
            className="btn-primary flex-shrink-0 px-6 py-3 text-base"
            onClick={() => navigate('/new-meeting')}
          >
            <FaVideo /> New Meeting
          </button>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-3 gap-4">
          {[
            { label: 'Hosted',   value: stats.totalHosted ?? 0, icon: <FaVideo />,       color: 'text-sage-500',     bg: 'bg-sage-100'  },
            { label: 'Upcoming', value: stats.upcoming    ?? 0, icon: <FaClock />,       color: 'text-mint-600',     bg: 'bg-mint-100'  },
            { label: 'Ended',    value: stats.ended       ?? 0, icon: <FaCheckCircle />, color: 'text-charcoal-500', bg: 'bg-beige-200' },
          ].map(({ label, value, icon, color, bg }) => (
            <div key={label} className="stat-card">
              <div className={`w-9 h-9 rounded-xl ${bg} ${color} flex items-center justify-center text-sm mb-2`}>{icon}</div>
              <p className="stat-value">{loading ? <span className="skeleton inline-block w-8 h-7 rounded" /> : value}</p>
              <p className="stat-label">{label}</p>
            </div>
          ))}
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map(({ icon, label, sub, path, iconBg }) => (
            <button key={label} onClick={() => path && navigate(path)}
              className="card-hover flex items-center gap-4 text-left">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 ${iconBg}`}>{icon}</div>
              <div>
                <p className="text-sm font-semibold text-charcoal-800">{label}</p>
                <p className="text-xs text-charcoal-500 mt-0.5">{sub}</p>
              </div>
            </button>
          ))}
        </section>

        {/* Data split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="card lg:col-span-2">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-beige-300">
              <div>
                <h2 className="section-title">Upcoming Meetings</h2>
                <p className="section-subtitle">Your next sessions</p>
              </div>
              <button className="text-xs font-semibold text-sage-600 hover:text-sage-700 transition-colors"
                onClick={() => navigate('/meetings')}>View All →</button>
            </div>
            {loading ? (<div className="space-y-1"><SkeletonRow /><SkeletonRow /><SkeletonRow /></div>)
            : upcoming.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><FaClock /></div>
                <p className="text-sm font-semibold text-charcoal-700">No upcoming meetings</p>
                <p className="text-xs text-charcoal-500 mt-1 mb-4">Schedule one and it'll appear here</p>
                <button className="btn-secondary text-xs" onClick={() => navigate('/schedule-meeting')}>
                  <FaCalendarPlus /> Schedule a Meeting
                </button>
              </div>
            ) : (
              <div className="divide-y divide-beige-200">
                {upcoming.slice(0, 4).map((m) => {
                  const d = m.scheduledAt ? new Date(m.scheduledAt) : null;
                  const timeStr = d ? d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'Now';
                  const [timePart, ampm] = timeStr.split(' ');
                  return (
                    <div key={m.id} className="flex items-center gap-4 py-3.5">
                      <div className="flex flex-col items-center min-w-[52px] bg-beige-100 rounded-xl px-2 py-1.5">
                        <span className="text-base font-bold text-charcoal-900 leading-none">{timePart}</span>
                        <span className="text-[10px] font-semibold text-charcoal-400 uppercase tracking-wide mt-0.5">{ampm || 'NOW'}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-charcoal-800 truncate">{m.title}</p>
                        <p className="text-xs text-charcoal-500 mt-0.5">ID: {m.roomId} · {m.duration} min</p>
                      </div>
                      <button className="btn-primary text-xs px-4 py-2 flex-shrink-0"
                        onClick={() => handleStart(m.roomId, m.id, m.title)}>Start</button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="card">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-beige-300">
              <div>
                <h2 className="section-title">Recent History</h2>
                <p className="section-subtitle">Past meetings</p>
              </div>
              <button className="btn-icon w-7 h-7" onClick={() => navigate('/history')} title="View all">
                <FaEllipsisH className="text-xs" />
              </button>
            </div>
            {loading ? (
              <div className="space-y-3">{[1,2,3].map(i => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-beige-300 mt-1.5 flex-shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 bg-beige-200 rounded w-3/4" />
                    <div className="h-2.5 bg-beige-200 rounded w-1/2" />
                  </div>
                </div>
              ))}</div>
            ) : history.length === 0 ? (
              <div className="empty-state py-10">
                <div className="empty-icon"><FaHistory /></div>
                <p className="text-xs text-charcoal-500">No past meetings yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((m) => (
                  <div key={m.id} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-mint-400 mt-1.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-charcoal-800 truncate">{m.title}</p>
                      <p className="text-xs text-charcoal-500 mt-0.5">{formatMeetingTime(m.endedAt)}</p>
                    </div>
                  </div>
                ))}
                <button className="text-xs text-sage-600 hover:text-sage-700 font-semibold mt-2 transition-colors"
                  onClick={() => navigate('/history')}>View all history →</button>
              </div>
            )}
          </aside>
        </div>

        {/* Team strip */}
        <section className="card-sage flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer
                           hover:border-sage-300 transition-colors"
          onClick={() => navigate('/team')}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sage-200 text-sage-700 flex items-center justify-center">
              <FaUsers />
            </div>
            <div>
              <p className="text-sm font-semibold text-charcoal-800">Your Team</p>
              <p className="text-xs text-charcoal-500">View members, invite colleagues</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-sage-600">→ Open Team</span>
        </section>

      </main>
      <Footer />
      <Footer />
    </div>
  );
};

export default Dashboard;

