import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
<<<<<<< HEAD
import { FaCamera, FaCopy, FaPen, FaSave, FaTimes, FaCheckCircle, FaGlobe, FaEnvelope, FaBuilding } from 'react-icons/fa';
import api from '../api/axios';
=======
import {
  FaCamera, FaCopy, FaPen, FaSave, FaTimes,
  FaCheckCircle, FaGlobe, FaEnvelope, FaBuilding,
} from 'react-icons/fa';
>>>>>>> ravindu/master
import './styles/UserProfile.css';
import { useAuth } from '../context/AuthContext';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const UserProfile = () => {
<<<<<<< HEAD
  const [isEditing, setIsEditing] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // User Data State
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    location: '',
    timezone: '',
    meetingId: '',
    bio: ''
  });

  // 1. Fetch Data on Load
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get('/users/profile');
        
        // Split Full Name
        const names = data.fullName.split(' ');
        const fName = names[0];
        const lName = names.slice(1).join(' ') || '';

        // Map API data to UI State
        setUser({
          firstName: fName,
          lastName: lName,
          email: data.email,
          meetingId: data.pmi,
          // Now connecting the real DB fields:
          title: data.jobTitle || '', 
          company: data.company || '',
          phone: data.phone || '',
          location: data.location || '',
          timezone: data.timezone || '',
          bio: data.bio || ''
        });
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch profile", err);
        setError("Could not load profile data");
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle Input Change
=======
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

>>>>>>> ravindu/master
  const handleChange = (e) => {
    setSaveError('');
    setForm({ ...form, [e.target.name]: e.target.value });
  };

<<<<<<< HEAD
  // 2. Handle Save (Send ALL data to Backend)
  const handleSave = async () => {
    try {
      const fullName = `${user.firstName} ${user.lastName}`.trim();

      await api.put('/users/profile', {
        fullName: fullName,
        email: user.email,
        // Sending the new fields:
        company: user.company,
        jobTitle: user.title, // Note: Backend expects 'jobTitle'
        bio: user.bio,
        phone: user.phone,
        location: user.location,
        timezone: user.timezone
      });

      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save changes.");
=======
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
>>>>>>> ravindu/master
    }
  };

  const copyToClipboard = () => {
<<<<<<< HEAD
    navigator.clipboard.writeText(user.meetingId);
=======
    navigator.clipboard.writeText(`https://amigo.com/meet/${form.meetingId}`);
>>>>>>> ravindu/master
    setCopySuccess('Copied!');
    setTimeout(() => setCopySuccess(''), 2000);
  };

  if (loading) return <div className="loading-screen">Loading Profile...</div>;

  return (
    <div className="profile-wrapper">
      <Header />

      <main className="profile-content">
<<<<<<< HEAD
        
=======

>>>>>>> ravindu/master
        <div className="profile-header-row">
          <div>
            <h1>My Profile</h1>
            <p>Manage your account settings and preferences.</p>
            {error && <span style={{color: 'red'}}>{error}</span>}
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
<<<<<<< HEAD
          
          {/* Identity Card */}
          <aside className="identity-card">
            <div className="avatar-section">
              <div className="avatar-large">
                <span className="avatar-text">{user.firstName ? user.firstName[0] : 'U'}</span>
                {isEditing && <div className="avatar-overlay"><FaCamera /></div>}
              </div>
              <h2>{user.firstName} {user.lastName}</h2>
              <span className="user-role">{user.title || 'No Title'}</span>
=======

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
>>>>>>> ravindu/master
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
<<<<<<< HEAD
              {copySuccess && <span className="copy-feedback"><FaCheckCircle/> Link Copied</span>}
=======
              {copySuccess && <span className="copy-feedback"><FaCheckCircle /> Link Copied</span>}
              <p className="pmi-hint">Use this ID for instant personal meetings.</p>
>>>>>>> ravindu/master
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

<<<<<<< HEAD
          {/* Details Form */}
          <section className="details-card">
            
=======
          {/* RIGHT: Details Form */}
          <section className="details-card">

>>>>>>> ravindu/master
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="input-grid">

                <div className="input-group">
                  <label>First Name</label>
<<<<<<< HEAD
                  <input type="text" name="firstName" value={user.firstName} onChange={handleChange} disabled={!isEditing} className={isEditing ? 'editable' : ''} />
=======
                  <input type="text" name="firstName" value={form.firstName}
                    onChange={handleChange} disabled={!isEditing}
                    className={isEditing ? 'editable' : ''} />
>>>>>>> ravindu/master
                </div>

                <div className="input-group">
                  <label>Last Name</label>
<<<<<<< HEAD
                  <input type="text" name="lastName" value={user.lastName} onChange={handleChange} disabled={!isEditing} className={isEditing ? 'editable' : ''} />
                </div>

                <div className="input-group">
                  <label><FaBuilding className="icon-tiny"/> Company</label>
                  <input type="text" name="company" value={user.company} onChange={handleChange} disabled={!isEditing} className={isEditing ? 'editable' : ''} />
=======
                  <input type="text" name="lastName" value={form.lastName}
                    onChange={handleChange} disabled={!isEditing}
                    className={isEditing ? 'editable' : ''} />
                </div>

                <div className="input-group">
                  <label><FaBuilding className="icon-tiny" /> Company</label>
                  <input type="text" name="company" value={form.company}
                    onChange={handleChange} disabled={!isEditing}
                    className={isEditing ? 'editable' : ''} />
>>>>>>> ravindu/master
                </div>

                <div className="input-group">
                  <label>Job Title</label>
<<<<<<< HEAD
                  <input type="text" name="title" value={user.title} onChange={handleChange} disabled={!isEditing} className={isEditing ? 'editable' : ''} />
=======
                  <input type="text" name="jobTitle" value={form.jobTitle}
                    onChange={handleChange} disabled={!isEditing}
                    className={isEditing ? 'editable' : ''} />
>>>>>>> ravindu/master
                </div>

                <div className="input-group full-width">
                  <label>Bio</label>
<<<<<<< HEAD
                  <textarea name="bio" value={user.bio} onChange={handleChange} disabled={!isEditing} className={isEditing ? 'editable' : ''} rows="3" />
=======
                  <textarea name="bio" value={form.bio}
                    onChange={handleChange} disabled={!isEditing}
                    className={isEditing ? 'editable' : ''}
                    rows="3" />
>>>>>>> ravindu/master
                </div>

              </div>
            </div>

            <div className="divider-line"></div>

            <div className="form-section">
              <h3>Contact &amp; Account</h3>
              <div className="input-grid">

                <div className="input-group">
<<<<<<< HEAD
                  <label><FaEnvelope className="icon-tiny"/> Email Address</label>
                  <input type="email" value={user.email} disabled={true} className="read-only" />
=======
                  <label><FaEnvelope className="icon-tiny" /> Email Address</label>
                  <input type="email" value={form.email} disabled className="read-only" />
>>>>>>> ravindu/master
                  <span className="field-note">Contact admin to change</span>
                </div>

                <div className="input-group">
                  <label>Phone Number</label>
<<<<<<< HEAD
                  <input type="text" name="phone" value={user.phone} onChange={handleChange} disabled={!isEditing} className={isEditing ? 'editable' : ''} />
                </div>

                <div className="input-group">
                  <label><FaGlobe className="icon-tiny"/> Location</label>
                  <input type="text" name="location" value={user.location} onChange={handleChange} disabled={!isEditing} className={isEditing ? 'editable' : ''} />
=======
                  <input type="text" name="phone" value={form.phone}
                    onChange={handleChange} disabled={!isEditing}
                    className={isEditing ? 'editable' : ''} />
                </div>

                <div className="input-group">
                  <label><FaGlobe className="icon-tiny" /> Location</label>
                  <input type="text" name="location" value={form.location}
                    onChange={handleChange} disabled={!isEditing}
                    className={isEditing ? 'editable' : ''} />
>>>>>>> ravindu/master
                </div>

                <div className="input-group">
                  <label>Timezone</label>
                  <div className="select-wrapper">
<<<<<<< HEAD
                    <select name="timezone" value={user.timezone} onChange={handleChange} disabled={!isEditing} className={isEditing ? 'editable' : ''}>
=======
                    <select name="timezone" value={form.timezone}
                      onChange={handleChange} disabled={!isEditing}
                      className={isEditing ? 'editable' : ''}>
>>>>>>> ravindu/master
                      <option>(GMT-08:00) Pacific Time</option>
                      <option>(GMT-05:00) Eastern Time</option>
                      <option>(GMT+00:00) London</option>
                      <option>(GMT+05:30) India Standard Time</option>
                      <option>(GMT+08:00) Singapore</option>
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
