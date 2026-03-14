/**
 * UserProfile.jsx — Full Tailwind rebuild
 *
 * Removed import of UserProfile.css which contained naked global rules:
 *   input, select, textarea { background: transparent; color: white; }
 *   .input-group { display: flex; flex-direction: column; }
 * These overrode the global .input and .input-group tokens on every page,
 * causing dark input backgrounds and broken icon alignment app-wide.
 */
import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  FaCamera, FaCopy, FaPen, FaSave, FaTimes,
  FaCheckCircle, FaGlobe, FaEnvelope, FaBuilding,
  FaUser, FaPhone, FaClock,
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const UserProfile = () => {
  const { user, updateUser } = useAuth();

  const [isEditing,   setIsEditing]   = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [saving,      setSaving]      = useState(false);
  const [saveError,   setSaveError]   = useState('');
  const [saveOk,      setSaveOk]      = useState(false);

  const [form, setForm] = useState({
    firstName: '', lastName: '', jobTitle: '', company: '',
    email: '', phone: '', location: '', timezone: '(GMT+05:30) India Standard Time',
    meetingId: '', bio: '',
  });

  useEffect(() => {
    if (!user) return;
    const [firstName = '', ...rest] = (user.fullName || '').split(' ');
    setForm({
      firstName,
      lastName:  rest.join(' '),
      jobTitle:  user.jobTitle  || '',
      company:   user.company   || '',
      email:     user.email     || '',
      phone:     user.phone     || '',
      location:  user.location  || '',
      timezone:  user.timezone  || '(GMT+05:30) India Standard Time',
      meetingId: user.pmi       || '',
      bio:       user.bio       || '',
    });
  }, [user]);

  const handleChange = (e) => {
    setSaveError('');
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true); setSaveError(''); setSaveOk(false);
    try {
      const res = await fetch(`${API}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fullName: `${form.firstName} ${form.lastName}`.trim(),
          phone: form.phone, location: form.location,
          timezone: form.timezone, company: form.company,
          jobTitle: form.jobTitle, bio: form.bio,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setSaveError(data.message || 'Failed to save. Try again.'); return; }
      updateUser(data);
      setIsEditing(false);
      setSaveOk(true);
      setTimeout(() => setSaveOk(false), 3000);
    } catch {
      setSaveError('Cannot reach server. Check your connection.');
    } finally {
      setSaving(false);
    }
  };

  const copyPmi = () => {
    navigator.clipboard.writeText(`https://amigo.com/meet/${form.meetingId}`);
    setCopySuccess('Copied!');
    setTimeout(() => setCopySuccess(''), 2500);
  };

  const initials = [form.firstName?.[0], form.lastName?.[0]]
    .filter(Boolean).join('').toUpperCase() || '?';

  // Reusable read-only / editable field row
  const Field = ({ label, name, type = 'text', icon: Icon, readOnly = false, hint }) => (
    <div className="flex flex-col gap-1">
      <label className="input-label flex items-center gap-1.5">
        {Icon && <Icon className="text-charcoal-400 text-xs" />}
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        disabled={readOnly || !isEditing}
        className={`input ${
          readOnly
            ? 'bg-beige-100 text-charcoal-400 cursor-not-allowed'
            : !isEditing
              ? 'bg-beige-50 border-transparent text-charcoal-700 cursor-default'
              : ''
        }`}
      />
      {hint && <p className="text-[11px] text-charcoal-400 mt-0.5">{hint}</p>}
    </div>
  );

  return (
    <div className="page-wrapper">
      <Header />
      <main className="flex-1 page-container py-8">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="page-title">My Profile</h1>
            <p className="page-desc">Manage your account settings and preferences</p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button className="btn-ghost px-5" onClick={() => { setIsEditing(false); setSaveError(''); }}>
                  <FaTimes /> Cancel
                </button>
                <button className="btn-primary px-5" onClick={handleSave} disabled={saving}>
                  <FaSave /> {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button className="btn-secondary px-5" onClick={() => setIsEditing(true)}>
                <FaPen /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {saveError && <div className="alert-error mb-4">{saveError}</div>}
        {saveOk    && <div className="alert-success mb-4"><FaCheckCircle /> Profile updated successfully.</div>}

        <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">

          {/* ── LEFT: Identity card ── */}
          <aside className="space-y-4">
            <div className="card flex flex-col items-center text-center gap-4">

              {/* Avatar */}
              <div className="relative mt-2">
                <div className="w-24 h-24 rounded-full bg-gradient-sage flex items-center justify-center
                                text-white text-3xl font-bold shadow-sage-md ring-4 ring-beige-200">
                  {initials}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full
                                     bg-sage-500 text-white flex items-center justify-center
                                     shadow-sm hover:bg-sage-600 transition-colors"
                    title="Change photo">
                    <FaCamera className="text-xs" />
                  </button>
                )}
              </div>

              <div>
                <h2 className="text-lg font-bold text-charcoal-900">
                  {form.firstName} {form.lastName}
                </h2>
                <p className="text-sm text-charcoal-500">{form.jobTitle || 'No title set'}</p>
                {form.company && (
                  <p className="text-xs text-charcoal-400 mt-0.5 flex items-center justify-center gap-1">
                    <FaBuilding className="text-[10px]" /> {form.company}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <span className="badge-sage">PRO PLAN</span>
                <span className="badge-mint">● Active</span>
              </div>
            </div>

            {/* PMI card */}
            <div className="card space-y-2">
              <p className="text-xs font-bold text-charcoal-400 uppercase tracking-widest">
                Personal Meeting ID
              </p>
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-charcoal-800 tracking-wider">
                  {form.meetingId
                    ? `${form.meetingId.slice(0,3)}-${form.meetingId.slice(3,6)}-${form.meetingId.slice(6)}`
                    : '—'}
                </span>
                <button onClick={copyPmi} className="btn-icon" title="Copy link">
                  <FaCopy className="text-sm" />
                </button>
              </div>
              {copySuccess && (
                <p className="text-xs text-sage-600 flex items-center gap-1">
                  <FaCheckCircle /> {copySuccess}
                </p>
              )}
              <p className="text-[11px] text-charcoal-400">
                Use this ID for instant personal meetings.
              </p>
            </div>
          </aside>

          {/* ── RIGHT: Details form ── */}
          <div className="space-y-5">

            {/* Personal Info */}
            <div className="card">
              <h3 className="section-title mb-5 pl-3 border-l-4 border-sage-400">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First Name"  name="firstName" icon={FaUser} />
                <Field label="Last Name"   name="lastName" />
                <Field label="Company"     name="company"  icon={FaBuilding} />
                <Field label="Job Title"   name="jobTitle" />
                <div className="sm:col-span-2 flex flex-col gap-1">
                  <label className="input-label">Bio</label>
                  <textarea
                    name="bio" value={form.bio} onChange={handleChange}
                    disabled={!isEditing} rows={3}
                    className={`input resize-none ${
                      !isEditing ? 'bg-beige-50 border-transparent cursor-default' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Contact & Account */}
            <div className="card">
              <h3 className="section-title mb-5 pl-3 border-l-4 border-mint-400">
                Contact &amp; Account
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Email Address" name="email" type="email"
                  icon={FaEnvelope} readOnly
                  hint="Contact admin to change your email" />
                <Field label="Phone Number" name="phone" icon={FaPhone} />
                <Field label="Location"     name="location" icon={FaGlobe} />
                <div className="flex flex-col gap-1">
                  <label className="input-label flex items-center gap-1.5">
                    <FaClock className="text-charcoal-400 text-xs" /> Timezone
                  </label>
                  <select
                    name="timezone" value={form.timezone}
                    onChange={handleChange} disabled={!isEditing}
                    className={`input ${
                      !isEditing ? 'bg-beige-50 border-transparent cursor-default' : ''
                    }`}
                  >
                    <option>(GMT-08:00) Pacific Time</option>
                    <option>(GMT-05:00) Eastern Time</option>
                    <option>(GMT+00:00) London</option>
                    <option>(GMT+05:30) India Standard Time</option>
                  </select>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserProfile;
