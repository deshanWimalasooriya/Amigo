import React, { useState } from 'react';
import Header from '../components/Header';
import { FaCamera, FaCopy, FaPen, FaSave, FaTimes, FaCheckCircle, FaGlobe, FaEnvelope, FaBuilding } from 'react-icons/fa';
import './styles/UserProfile.css';

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');

  // Mock User Data State
  const [user, setUser] = useState({
    firstName: 'Alex',
    lastName: 'Sterling',
    title: 'Senior Product Manager',
    company: 'Amigo Tech Solutions',
    email: 'alex.sterling@amigo.tech',
    phone: '+1 (555) 019-2834',
    location: 'San Francisco, CA',
    timezone: '(GMT-08:00) Pacific Time',
    meetingId: '394-201-992', // Personal Meeting ID
    bio: 'Leading product initiatives for next-gen video communication tools. Passionate about remote work culture.'
  });

  // Handle Input Change
  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  // Handle Save
  const handleSave = () => {
    setIsEditing(false);
    // Here you would send data to backend
    console.log("Saved User Data:", user);
  };

  // Handle Copy ID
  const copyToClipboard = () => {
    navigator.clipboard.writeText(`https://amigo.com/meet/${user.meetingId}`);
    setCopySuccess('Copied!');
    setTimeout(() => setCopySuccess(''), 2000);
  };

  return (
    <div className="profile-wrapper">
      <Header />

      <main className="profile-content">
        
        {/* Page Title & Actions */}
        <div className="profile-header-row">
          <div>
            <h1>My Profile</h1>
            <p>Manage your account settings and preferences.</p>
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
          
          {/* --- LEFT COLUMN: Identity Card --- */}
          <aside className="identity-card">
            <div className="avatar-section">
              <div className="avatar-large">
                <span className="avatar-text">{user.firstName[0]}</span>
                {isEditing && (
                  <div className="avatar-overlay">
                    <FaCamera />
                  </div>
                )}
              </div>
              <h2>{user.firstName} {user.lastName}</h2>
              <span className="user-role">{user.title}</span>
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

          {/* --- RIGHT COLUMN: Details Form --- */}
          <section className="details-card">
            
            {/* Section 1: Personal Information */}
            <div className="form-section">
              <h3>Personal Information</h3>
              <div className="input-grid">
                
                <div className="input-group">
                  <label>First Name</label>
                  <input 
                    type="text" 
                    name="firstName" 
                    value={user.firstName} 
                    onChange={handleChange} 
                    disabled={!isEditing}
                    className={isEditing ? 'editable' : ''}
                  />
                </div>

                <div className="input-group">
                  <label>Last Name</label>
                  <input 
                    type="text" 
                    name="lastName" 
                    value={user.lastName} 
                    onChange={handleChange} 
                    disabled={!isEditing}
                    className={isEditing ? 'editable' : ''}
                  />
                </div>

                <div className="input-group">
                  <label><FaBuilding className="icon-tiny"/> Company</label>
                  <input 
                    type="text" 
                    name="company" 
                    value={user.company} 
                    onChange={handleChange} 
                    disabled={!isEditing}
                    className={isEditing ? 'editable' : ''}
                  />
                </div>

                <div className="input-group">
                  <label>Job Title</label>
                  <input 
                    type="text" 
                    name="title" 
                    value={user.title} 
                    onChange={handleChange} 
                    disabled={!isEditing}
                    className={isEditing ? 'editable' : ''}
                  />
                </div>

                <div className="input-group full-width">
                  <label>Bio</label>
                  <textarea 
                    name="bio" 
                    value={user.bio} 
                    onChange={handleChange} 
                    disabled={!isEditing}
                    className={isEditing ? 'editable' : ''}
                    rows="3"
                  />
                </div>

              </div>
            </div>

            <div className="divider-line"></div>

            {/* Section 2: Account & Contact */}
            <div className="form-section">
              <h3>Contact & Account</h3>
              <div className="input-grid">
                
                <div className="input-group">
                  <label><FaEnvelope className="icon-tiny"/> Email Address</label>
                  <input 
                    type="email" 
                    value={user.email} 
                    disabled={true} /* Emails usually hard to change */
                    className="read-only"
                  />
                  <span className="field-note">Contact admin to change</span>
                </div>

                <div className="input-group">
                  <label>Phone Number</label>
                  <input 
                    type="text" 
                    name="phone" 
                    value={user.phone} 
                    onChange={handleChange} 
                    disabled={!isEditing}
                    className={isEditing ? 'editable' : ''}
                  />
                </div>

                <div className="input-group">
                  <label><FaGlobe className="icon-tiny"/> Location</label>
                  <input 
                    type="text" 
                    name="location" 
                    value={user.location} 
                    onChange={handleChange} 
                    disabled={!isEditing}
                    className={isEditing ? 'editable' : ''}
                  />
                </div>

                <div className="input-group">
                  <label>Timezone</label>
                  <div className="select-wrapper">
                    <select 
                      name="timezone" 
                      value={user.timezone} 
                      onChange={handleChange} 
                      disabled={!isEditing}
                      className={isEditing ? 'editable' : ''}
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

          </section>
        </div>

      </main>
    </div>
  );
};

export default UserProfile;