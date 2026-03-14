/**
 * ScheduleMeeting.jsx — Full Tailwind rebuild
 * Removed ScheduleMeeting.css which had dark global overrides.
 */
import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import {
  FaCalendarAlt, FaClock, FaLock, FaVideo,
  FaCopy, FaCheckCircle, FaUserPlus,
} from 'react-icons/fa';
import { meetingAPI, notificationAPI } from '../services/api';
import InvitePeopleModal from '../components/InvitePeopleModal';

const ScheduleMeeting = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    topic:            'Amigo Strategy Meeting',
    date:             new Date().toISOString().split('T')[0],
    time:             '10:00',
    duration:         '60',
    passcode:         Math.floor(100000 + Math.random() * 900000).toString(),
    hostVideo:        true,
    participantVideo: false,
  });

  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');
  const [created,      setCreated]      = useState(null);
  const [copied,       setCopied]       = useState(false);
  const [showInvite,   setShowInvite]   = useState(false);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(p => ({ ...p, [e.target.name]: value }));
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const scheduledAt = new Date(`${formData.date}T${formData.time}:00`).toISOString();
    try {
      const meeting = await meetingAPI.create({
        title:              formData.topic,
        passcode:           formData.passcode,
        scheduledAt,
        duration:           parseInt(formData.duration, 10),
        hostVideoOn:        formData.hostVideo,
        participantVideoOn: formData.participantVideo,
      });
      setCreated(meeting);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyInvite = () => {
    if (!created) return;
    navigator.clipboard.writeText(
      `Join my Amigo meeting:\nTopic: ${created.title}\nRoom ID: ${created.roomId}\nPasscode: ${created.passcode}\nhttps://amigo.com/join/${created.roomId}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // ── SUCCESS STATE ──────────────────────────────────────────────────────
  if (created) {
    return (
      <div className="page-wrapper">
        <Header />
        <main className="flex-1 page-container py-10">
          <div className="max-w-lg mx-auto">
            <div className="card text-center p-8 space-y-5">
              <div className="w-16 h-16 rounded-full bg-sage-100 text-sage-500 text-3xl
                              flex items-center justify-center mx-auto">
                <FaCheckCircle />
              </div>
              <div>
                <h2 className="page-title">Meeting Scheduled!</h2>
                <p className="page-desc mt-1">Your meeting has been saved and is ready to share.</p>
              </div>

              <div className="card-sage text-left space-y-2 p-4">
                <h3 className="font-semibold text-charcoal-800">{created.title}</h3>
                {[
                  ['Date',     formData.date],
                  ['Time',     `${formData.time} (${formData.duration} min)`],
                  ['Room ID',  created.roomId],
                  ['Passcode', created.passcode || '—'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-charcoal-500">{k}</span>
                    <span className="font-semibold text-charcoal-800">{v}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 bg-beige-100 border border-beige-300
                              rounded-xl px-4 py-2.5">
                <p className="flex-1 text-xs text-mint-700 font-mono truncate">
                  https://amigo.com/join/{created.roomId}
                </p>
                <button onClick={copyInvite} className="btn-icon flex-shrink-0" title="Copy link">
                  {copied ? <FaCheckCircle className="text-sage-500" /> : <FaCopy className="text-sm" />}
                </button>
              </div>

              <div className="flex gap-3 justify-center pt-2">
                <button className="btn-secondary" onClick={() => navigate('/meetings')}>
                  View My Meetings
                </button>
                <button className="btn-accent" onClick={() => setShowInvite(true)}>
                  <FaUserPlus /> Invite People
                </button>
                <button className="btn-ghost" onClick={() => {
                  setCreated(null);
                  setFormData(p => ({
                    ...p, topic: 'Amigo Strategy Meeting',
                    passcode: Math.floor(100000 + Math.random() * 900000).toString(),
                  }));
                }}>Schedule Another</button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
        {showInvite && (
          <InvitePeopleModal
            roomId={created.roomId}
            meetingTitle={created.title}
            onClose={() => setShowInvite(false)}
          />
        )}
      </div>
    );
  }

  // ── FORM STATE ────────────────────────────────────────────────────────
  return (
    <div className="page-wrapper">
      <Header />
      <main className="flex-1 page-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-8 max-w-5xl mx-auto">

          {/* LEFT: Form */}
          <div className="card space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-sage-100 text-sage-600
                              flex items-center justify-center text-lg">
                <FaCalendarAlt />
              </div>
              <div>
                <h2 className="page-title">Schedule Meeting</h2>
                <p className="page-desc">Set up the details for your next video call</p>
              </div>
            </div>

            <form onSubmit={handleSchedule} className="space-y-5">

              <div>
                <label className="input-label">Topic</label>
                <input type="text" name="topic" value={formData.topic}
                  onChange={handleChange} placeholder="Enter meeting topic"
                  className="input" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Date</label>
                  <input type="date" name="date" value={formData.date}
                    onChange={handleChange} className="input" required />
                </div>
                <div>
                  <label className="input-label">Time</label>
                  <input type="time" name="time" value={formData.time}
                    onChange={handleChange} className="input" required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Duration</label>
                  <div className="input-group">
                    <FaClock className="input-icon" />
                    <select name="duration" value={formData.duration}
                      onChange={handleChange} className="input pl-10">
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">1 Hour</option>
                      <option value="90">1.5 Hours</option>
                      <option value="120">2 Hours</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="input-label">Passcode</label>
                  <div className="input-group">
                    <FaLock className="input-icon" />
                    <input type="text" name="passcode" value={formData.passcode}
                      onChange={handleChange} className="input pl-10" />
                  </div>
                </div>
              </div>

              {/* Toggles */}
              <div className="card-sage space-y-3 p-4">
                {[
                  { name: 'hostVideo',        label: 'Host Video',        sub: 'Start with camera on' },
                  { name: 'participantVideo', label: 'Participant Video',  sub: 'Allow participants to use camera' },
                ].map(({ name, label, sub }) => (
                  <div key={name} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-charcoal-800">{label}</p>
                      <p className="text-xs text-charcoal-500">{sub}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" name={name}
                        checked={formData[name]} onChange={handleChange}
                        className="sr-only peer" />
                      <div className="w-10 h-6 bg-beige-300 rounded-full peer
                                      peer-checked:bg-sage-500
                                      after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                                      after:bg-white after:rounded-full after:h-5 after:w-5
                                      after:transition-all peer-checked:after:translate-x-4" />
                    </label>
                  </div>
                ))}
              </div>

              {error && <div className="alert-error">{error}</div>}

              <div className="flex gap-3 justify-end pt-1">
                <button type="button" className="btn-ghost"
                  onClick={() => navigate('/dashboard')}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Scheduling…' : <><FaCalendarAlt /> Schedule</>}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT: Live Preview */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-charcoal-400 uppercase tracking-widest text-center">
              Live Invitation Preview
            </p>
            <div className="card space-y-4">
              <div className="flex items-center gap-2 text-sm text-charcoal-500 font-semibold">
                <span>🤝</span> Amigo Invitation
              </div>
              <div>
                <h3 className="font-bold text-charcoal-900 text-base">
                  {formData.topic || 'Untitled Meeting'}
                </h3>
              </div>
              <div className="space-y-2 bg-beige-100 rounded-xl p-3">
                {[
                  ['Date',     formData.date],
                  ['Time',     `${formData.time} (${formData.duration} min)`],
                  ['Passcode', formData.passcode],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-charcoal-500">{k}</span>
                    <span className="font-semibold text-charcoal-800">{v}</span>
                  </div>
                ))}
              </div>
              <div className="bg-beige-50 border border-dashed border-beige-300 rounded-xl
                              px-3 py-2 text-xs text-mint-700 font-mono text-center">
                Meeting ID will appear after scheduling
              </div>
              <div className="flex items-center justify-center gap-2 pt-1 border-t border-beige-300 text-sm text-charcoal-500">
                <FaVideo className={formData.hostVideo ? 'text-sage-500' : 'text-red-400'} />
                Host Video: {formData.hostVideo ? 'On' : 'Off'}
              </div>
            </div>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ScheduleMeeting;
