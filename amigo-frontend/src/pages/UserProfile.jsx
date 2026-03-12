import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import {
  FaCamera, FaCopy, FaPen, FaSave, FaTimes,
  FaCheckCircle, FaGlobe, FaEnvelope, FaBuilding,
} from 'react-icons/fa';
import './styles/UserProfile.css';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const UserProfile = () => {
  const { user, updateUser } = useAuth();

  const [isEditing, setIsEditing]     = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [saving, setSaving]           = useState(false);
  const [saveError, setSaveError]     = useState('');

  // Local form state — seeded from global auth context
  const [form, setForm] = useState({
    firstName:  '',
    lastName:   '',
    jobTitle:   '',
    company:    '',
    email:      '',
    phone:      '',
    location:   '',
    timezone:   '(GMT+05:30) India Standard Time',
    meetingId:  '',
    bio:        '',
  });

  // Whenever the global user object changes (e.g. after session rehydration),
  // sync it back into local form state so the UI always shows real data.
  useEffect(() => {
    if (!user) return;
    const [firstName = '', ...rest] = (user.fullName || '').split(' ');
    const lastName = rest.join(' ');
    setForm({
      firstName,
      lastName,
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
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch(`${API}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          fullName: `${form.firstName} ${form.lastName}`.trim(),
          phone:    form.phone,
          location: form.location,
          timezone: form.timezone,
          company:  form.company,
          jobTitle: form.jobTitle,
          bio:      form.bio,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSaveError(data.message || 'Failed to save. Try again.');
        return;
      }

      // Push updated fields back to global auth context so every
      // component (e.g. Header, Dashboard greeting) reflects the change
      updateUser(data);
      setIsEditing(false);
    } catch {
      setSaveError('Cannot reach server. Check your connection.');
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`https://amigo.com/meet/${form.meetingId}`);
    setCopySuccess('Copied!');
    setTimeout(() => setCopySuccess(''), 2000);
  };

  return (
    <div className="profile-wrapper">
      <Header />

      <main className="profile-content">

        <div className="profile-header-row">
          <div>
            <h1>My Profile</h1>
            <p>Manage your account settings and preferences.</p>
          </div>
          <div className="header-actions">
            {isEditing ? (
              <>
                <button className="btn-cancel" onClick={() => { setIsEditing(false); setSaveError(''); }}>
                  <FaTimes /> Cancel
                </button>
                <button className="btn-save" onClick={handleSave} disabled={saving}>
                  <FaSave /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button className="btn-edit" onClick={() => setIsEditing(true)}>
                <FaPen /> Edit Profile
              </button>
            )}
          </div>
        </div>

        {saveError && (
          <div style={{
            background: 'rgba(239,68,68,0.12)', border: '1px solid #ef4444',
            borderRadius: 8, padding: '10px 14px', marginBottom: 16,
            color: '#fca5a5', fontSize: '0.875rem',
          }}>
            {saveError}
          </div>
        )}

        <div className="profile-grid">

          {/* LEFT: Identity Card */}
          <aside className="identity-card">
            <div className="avatar-section">
              <div className="avatar-large">
                <span className="avatar-text">
                  {form.firstName ? form.firstName[0].toUpperCase() : '?'}
                </span>
                {isEditing && <div className="avatar-overlay"><FaCamera /></div>}
              </div>
              <h2>{form.firstName} {form.lastName}</h2>
              <span className="user-role">{form.jobTitle || 'No title set'}</span>
            </div>

            <div className="pmi-section">
              <label>Personal Meeting ID</label>
              <div className="pmi-box">
                <span className="pmi-number">
                  {form.meetingId
                    ? `${form.meetingId.slice(0,3)}-${form.meetingId.slice(3,6)}-${form.meetingId.slice(6)}`
                    : '—'}
                </span>
                <button className="btn-icon-copy" onClick={copyToClipboard}>
                  <FaCopy />
                </button>
              </div>
              {copySuccess && <span className="copy-feedback"><FaCheckCircle /> Link Copied</span>}
              <p className="pmi-hint">Use this ID for instant personal meetings.</p>
            </div>

            <div className="account-meta">
              <div className="meta-row">
                <span className="label">Plan</span>
                <span className="value badge-pro">PRO PLAN</span>
              </div>
              <div className="meta-row">
                <span className="label">Status</span>
                <span className="value active-text">Active</span>
              </div>
            </div>
          </aside>

          {/* RIGHT: Details Form */}
          <section className="details-card">

            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="input-grid">

                <div className="input-group">
                  <label>First Name</label>
                  <input type="text" name="firstName" value={form.firstName}
                    onChange={handleChange} disabled={!isEditing}
                    className={isEditing ? 'editable' : ''} />
                </div>

                <div className="input-group">
                  <label>Last Name</label>
                  <input type="text" name="lastName" value={form.lastName}
                    onChange={handleChange} disabled={!isEditing}
                    className={isEditing ? 'editable' : ''} />
                </div>

                <div className="input-group">
                  <label><FaBuilding className="icon-tiny" /> Company</label>
                  <input type="text" name="company" value={form.company}
                    onChange={handleChange} disabled={!isEditing}
                    className={isEditing ? 'editable' : ''} />
                </div>

                <div className="input-group">
                  <label>Job Title</label>
                  <input type="text" name="jobTitle" value={form.jobTitle}
                    onChange={handleChange} disabled={!isEditing}
                    className={isEditing ? 'editable' : ''} />
                </div>

                <div className="input-group full-width">
                  <label>Bio</label>
                  <textarea name="bio" value={form.bio}
                    onChange={handleChange} disabled={!isEditing}
                    className={isEditing ? 'editable' : ''}
                    rows="3" />
                </div>

              </div>
            </div>

            <div className="divider-line"></div>

            <div className="form-section">
              <h3>Contact &amp; Account</h3>
              <div className="input-grid">

                <div className="input-group">
                  <label><FaEnvelope className="icon-tiny" /> Email Address</label>
                  <input type="email" value={form.email} disabled className="read-only" />
                  <span className="field-note">Contact admin to change</span>
                </div>

                <div className="input-group">
                  <label>Phone Number</label>
                  <input type="text" name="phone" value={form.phone}
                    onChange={handleChange} disabled={!isEditing}
                    className={isEditing ? 'editable' : ''} />
                </div>

                <div className="input-group">
                  <label><FaGlobe className="icon-tiny" /> Location</label>
                  <input type="text" name="location" value={form.location}
                    onChange={handleChange} disabled={!isEditing}
                    className={isEditing ? 'editable' : ''} />
                </div>

                <div className="input-group">
                  <label>Timezone</label>
                  <div className="select-wrapper">
                    <select name="timezone" value={form.timezone}
                      onChange={handleChange} disabled={!isEditing}
                      className={isEditing ? 'editable' : ''}>
                      <option>(GMT-08:00) Pacific Time</option>
                      <option>(GMT-05:00) Eastern Time</option>
                      <option>(GMT+00:00) London</option>
                      <option>(GMT+05:30) India Standard Time</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>

          </section>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
