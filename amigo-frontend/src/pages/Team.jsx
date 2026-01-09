import React, { useState } from 'react';
import Header from '../components/Header';
import { 
  FaUserPlus, FaSearch, FaEllipsisH, FaEnvelope, FaVideo, 
  FaTrash, FaCrown, FaCircle 
} from 'react-icons/fa';
import './styles/Team.css';
import Footer from '../components/Footer';

const Team = () => {
  const [activeTab, setActiveTab] = useState('members'); // members | pending
  const [searchQuery, setSearchQuery] = useState('');

  // --- Mock Data ---
  const teamData = [
    {
      id: 1,
      name: "John Doe",
      role: "Admin",
      email: "john@amigo.com",
      status: "online",
      avatarColor: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
      initials: "JD"
    },
    {
      id: 2,
      name: "Sarah Smith",
      role: "Member",
      email: "sarah@amigo.com",
      status: "busy",
      avatarColor: "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)",
      initials: "SS"
    },
    {
      id: 3,
      name: "Mike Johnson",
      role: "Member",
      email: "mike@amigo.com",
      status: "offline",
      avatarColor: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
      initials: "MJ"
    },
    {
      id: 4,
      name: "Emily Davis",
      role: "Designer",
      email: "emily@amigo.com",
      status: "online",
      avatarColor: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
      initials: "ED"
    }
  ];

  const pendingInvites = [
    { id: 5, email: "alex.dev@gmail.com", date: "Invited 2 days ago" },
    { id: 6, email: "finance@partner.com", date: "Invited 1 hour ago" }
  ];

  // Filter Logic
  const filteredMembers = teamData.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="team-wrapper">
      <Header />
      
      <div className="team-container">
        
        {/* --- Header Section --- */}
        <div className="team-header">
          <div className="header-text">
            <h2>Team Management</h2>
            <p>Manage access, roles, and collaboration settings.</p>
          </div>
          
          <button className="btn-invite">
            <FaUserPlus /> Invite Member
          </button>
        </div>

        {/* --- Stats Bar --- */}
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-value">12</span>
            <span className="stat-label">Total Seats</span>
          </div>
          <div className="divider-v"></div>
          <div className="stat-item">
            <span className="stat-value">4</span>
            <span className="stat-label">Active Now</span>
          </div>
          <div className="divider-v"></div>
          <div className="stat-item">
            <span className="stat-value">2</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>

        {/* --- Controls & Tabs --- */}
        <div className="controls-row">
          <div className="tabs-pill">
            <button 
              className={`pill-btn ${activeTab === 'members' ? 'active' : ''}`}
              onClick={() => setActiveTab('members')}
            >
              Active Members
            </button>
            <button 
              className={`pill-btn ${activeTab === 'pending' ? 'active' : ''}`}
              onClick={() => setActiveTab('pending')}
            >
              Pending Invites
            </button>
          </div>

          <div className="search-pill">
            <FaSearch />
            <input 
              type="text" 
              placeholder="Find a member..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* --- Grid Layout --- */}
        {activeTab === 'members' ? (
          <div className="team-grid">
            {filteredMembers.map((member) => (
              <div key={member.id} className="member-card">
                
                {/* Card Header (Actions) */}
                <div className="card-top-actions">
                  <span className={`status-dot ${member.status}`} title={member.status}></span>
                  <button className="btn-icon-dots"><FaEllipsisH /></button>
                </div>

                {/* Avatar & Info */}
                <div className="member-avatar" style={{ background: member.avatarColor }}>
                  {member.initials}
                </div>
                
                <h3 className="member-name">
                  {member.name} 
                  {member.role === 'Admin' && <FaCrown className="crown-icon" title="Admin" />}
                </h3>
                <p className="member-email">{member.email}</p>
                <span className="member-role-badge">{member.role}</span>

                {/* Hover Overlay Actions */}
                <div className="hover-actions">
                  <button className="action-chip primary">
                    <FaVideo /> Call
                  </button>
                  <button className="action-chip secondary">
                    <FaEnvelope /> Email
                  </button>
                </div>

              </div>
            ))}
          </div>
        ) : (
          // Pending Invites List
          <div className="pending-list">
            {pendingInvites.map((invite) => (
              <div key={invite.id} className="invite-row">
                <div className="invite-info">
                  <div className="icon-envelope"><FaEnvelope /></div>
                  <div>
                    <h4>{invite.email}</h4>
                    <span>{invite.date}</span>
                  </div>
                </div>
                <button className="btn-revoke"><FaTrash /> Revoke</button>
              </div>
            ))}
          </div>
        )}

      </div>
      <Footer />
    </div>
  );
};

export default Team;