import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { FaCamera, FaCopy, FaPen, FaSave, FaTimes, FaCheckCircle, FaGlobe, FaEnvelope, FaBuilding } from 'react-icons/fa';
import api from '../api/axios';
import './styles/UserProfile.css';

const UserProfile = () => {
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
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

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
    }
  };

  // Handle Copy ID
  const copyToClipboard = () => {
    navigator.clipboard.writeText(user.meetingId);
    setCopySuccess('Copied!');
    setTimeout(() => setCopySuccess(''), 2000);
  };

  if (loading) return <div className="loading-screen">Loading Profile...</div>;

  return (
    <div className="profile-wrapper">
      <Header />

      <main className="profile-content">
        
        <div className="profile-header-row">
          <div>
            <h1>My Profile</h1>
            <p>Manage your account settings and preferences.</p>
            {error && <span style={{color: 'red'}}>{error}</span>}
          </div>
          <div className="header-actions">
            {isEditing ? (
              <>
                <button className="btn-cancel" onClick={() => setIsEditing(false)}>
                  <FaTimes /> Cancel
                </button>
                <button className="btn-save" onClick={handleSave}>
                  <FaSave /> Save Changes
                </button>
              </>
            ) : (
              <button className="btn-edit" onClick={() => setIsEditing(true)}>
                <FaPen /> Edit Profile
              </button>
            )}
          </div>
        </div>

        <div className="profile-grid">
          
          {/* Identity Card */}
          <aside className="identity-card">
            <div className="avatar-section">
              <div className="avatar-large">
                <span className="avatar-text">{user.firstName ? user.firstName[0] : 'U'}</span>
                {isEditing && <div className="avatar-overlay"><FaCamera /></div>}
              </div>
              <h2>{user.firstName} {user.lastName}</h2>
              <span className="user-role">{user.title || 'No Title'}</span>
            </div>

            <div className="pmi-section">
              <label>Personal Meeting ID</label>
              <div className="pmi-box">
                <span className="pmi-number">{user.meetingId}</span>
                <button className="btn-icon-copy" onClick={copyToClipboard}>
                  <FaCopy />
                </button>
              </div>
              {copySuccess && <span className="copy-feedback"><FaCheckCircle/> Link Copied</span>}
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

          {/* Details Form */}
          <section className="details-card">
            
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="input-grid">
                
                <div className="input-group">
                  <label>First Name</label>
                  <input type="text" name="firstName" value={user.firstName} onChange={handleChange} disabled={!isEditing} className={isEditing ? 'editable' : ''} />
                </div>

                <div className="input-group">
                  <label>Last Name</label>
                  <input type="text" name="lastName" value={user.lastName} onChange={handleChange} disabled={!isEditing} className={isEditing ? 'editable' : ''} />
                </div>

                <div className="input-group">
                  <label><FaBuilding className="icon-tiny"/> Company</label>
                  <input type="text" name="company" value={user.company} onChange={handleChange} disabled={!isEditing} className={isEditing ? 'editable' : ''} />
                </div>

                <div className="input-group">
                  <label>Job Title</label>
                  <input type="text" name="title" value={user.title} onChange={handleChange} disabled={!isEditing} className={isEditing ? 'editable' : ''} />
                </div>

                <div className="input-group full-width">
                  <label>Bio</label>
                  <textarea name="bio" value={user.bio} onChange={handleChange} disabled={!isEditing} className={isEditing ? 'editable' : ''} rows="3" />
                </div>

              </div>
            </div>

            <div className="divider-line"></div>

            <div className="form-section">
              <h3>Contact & Account</h3>
              <div className="input-grid">
                
                <div className="input-group">
                  <label><FaEnvelope className="icon-tiny"/> Email Address</label>
                  <input type="email" value={user.email} disabled={true} className="read-only" />
                  <span className="field-note">Contact admin to change</span>
                </div>

                <div className="input-group">
                  <label>Phone Number</label>
                  <input type="text" name="phone" value={user.phone} onChange={handleChange} disabled={!isEditing} className={isEditing ? 'editable' : ''} />
                </div>

                <div className="input-group">
                  <label><FaGlobe className="icon-tiny"/> Location</label>
                  <input type="text" name="location" value={user.location} onChange={handleChange} disabled={!isEditing} className={isEditing ? 'editable' : ''} />
                </div>

                <div className="input-group">
                  <label>Timezone</label>
                  <div className="select-wrapper">
                    <select name="timezone" value={user.timezone} onChange={handleChange} disabled={!isEditing} className={isEditing ? 'editable' : ''}>
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