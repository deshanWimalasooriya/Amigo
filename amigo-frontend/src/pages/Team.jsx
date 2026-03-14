/**
 * Team.jsx — Full Tailwind rebuild
 *
 * FIX: Was mixing Team.css dark-mode classes (team-wrapper, member-card,
 * stats-bar, btn-invite, search-pill, etc.) with the rest of the app which
 * uses pure Tailwind + a beige/sage light theme. This caused the Team page
 * to render as a completely different dark app inside the same shell.
 *
 * All CSS-module references removed. Rebuilt with the shared design tokens
 * used by every other page: card, page-title, btn-primary, badge-sage,
 * input-group, empty-state, etc. Modals now use the same light/card style.
 */
import React, { useState, useEffect, useCallback } from 'react';
import Header  from '../components/Header';
import Footer  from '../components/Footer';
import {
  FaUserPlus, FaSearch, FaEnvelope, FaVideo,
  FaTrash, FaCrown, FaUsers, FaTimes,
} from 'react-icons/fa';
import { teamAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).filter(Boolean).join('').toUpperCase().slice(0, 2);

const AVATAR_COLORS = [
  'bg-sage-400',  'bg-mint-500',  'bg-amber-400',
  'bg-rose-400',  'bg-indigo-400','bg-cyan-500',
];
const avatarColor = (id) => AVATAR_COLORS[id % AVATAR_COLORS.length];

const Team = () => {
  const { user } = useAuth();

  const [teams,       setTeams]       = useState([]);
  const [activeTeam,  setActiveTeam]  = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [search,      setSearch]      = useState('');

  const [showCreate,  setShowCreate]  = useState(false);
  const [newName,     setNewName]     = useState('');
  const [newDesc,     setNewDesc]     = useState('');
  const [creating,    setCreating]    = useState(false);

  const [showInvite,  setShowInvite]  = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting,    setInviting]    = useState(false);
  const [inviteError, setInviteError] = useState('');

  const loadTeams = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await teamAPI.getMy();
      setTeams(data);
      if (data.length > 0) setActiveTeam(prev => prev ? (data.find(t => t.id === prev.id) || data[0]) : data[0]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTeams(); }, [loadTeams]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      const team = await teamAPI.create({ name: newName.trim(), description: newDesc.trim() });
      setTeams(prev => [...prev, team]);
      setActiveTeam(team);
      setShowCreate(false); setNewName(''); setNewDesc('');
    } catch (err) { alert(err.message); }
    finally { setCreating(false); }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!activeTeam || !inviteEmail.trim()) return;
    setInviting(true); setInviteError('');
    try {
      await teamAPI.addMember(activeTeam.id, { email: inviteEmail.trim() });
      await loadTeams();
      setShowInvite(false); setInviteEmail('');
    } catch (err) { setInviteError(err.message); }
    finally { setInviting(false); }
  };

  const handleRemove = async (teamId, userId) => {
    if (!window.confirm('Remove this member from the team?')) return;
    try {
      await teamAPI.removeMember(teamId, userId);
      await loadTeams();
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm('Delete this team permanently?')) return;
    try {
      await teamAPI.delete(teamId);
      const rest = teams.filter(t => t.id !== teamId);
      setTeams(rest);
      setActiveTeam(rest[0] || null);
    } catch (err) { alert(err.message); }
  };

  const members = activeTeam?.members || [];
  const filtered = members.filter(m =>
    m.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    m.user?.email?.toLowerCase().includes(search.toLowerCase())
  );
  const isOwner = activeTeam?.createdBy === user?.id;

  return (
    <div className="page-wrapper">
      <Header />
      <main className="flex-1 page-container py-8">

        {/* ── Page header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="page-title">Team Management</h1>
            <p className="page-desc">Manage access, roles, and collaboration</p>
          </div>
          <div className="flex gap-2">
            {isOwner && (
              <button className="btn-secondary" onClick={() => setShowInvite(true)}>
                <FaUserPlus /> Invite Member
              </button>
            )}
            <button className="btn-primary" onClick={() => setShowCreate(true)}>
              <FaUsers /> New Team
            </button>
          </div>
        </div>

        {/* ── Error ── */}
        {error && <div className="alert-error mb-4">{error}</div>}

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1,2,3].map(i => (
              <div key={i} className="card animate-pulse space-y-4">
                <div className="w-16 h-16 rounded-full bg-beige-200 mx-auto" />
                <div className="h-4 bg-beige-200 rounded w-1/2 mx-auto" />
                <div className="h-3 bg-beige-200 rounded w-2/3 mx-auto" />
              </div>
            ))}
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && teams.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon"><FaUsers /></div>
            <p className="text-sm font-semibold text-charcoal-700">No teams yet</p>
            <p className="text-xs text-charcoal-500 mt-1 mb-4">Create a team to start collaborating</p>
            <button className="btn-primary" onClick={() => setShowCreate(true)}>
              <FaUsers /> Create Team
            </button>
          </div>
        )}

        {!loading && teams.length > 0 && (
          <>
            {/* ── Team selector tabs ── */}
            <div className="flex gap-1 p-1 bg-beige-100 border border-beige-300
                            rounded-2xl w-fit mb-6 flex-wrap">
              {teams.map(t => (
                <button key={t.id} onClick={() => setActiveTeam(t)}
                  className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200
                              ${ activeTeam?.id === t.id
                                ? 'bg-white shadow-card text-charcoal-900'
                                : 'text-charcoal-500 hover:text-charcoal-700'}`}>
                  {t.name}
                </button>
              ))}
            </div>

            {/* ── Stats bar ── */}
            <div className="card flex flex-wrap items-center gap-6 mb-6 py-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-charcoal-900">{members.length}</p>
                <p className="text-xs text-charcoal-500 mt-0.5">Members</p>
              </div>
              <div className="w-px h-8 bg-beige-300" />
              <div className="text-center">
                <p className="text-2xl font-bold text-charcoal-900">
                  {members.filter(m => m.role === 'admin').length}
                </p>
                <p className="text-xs text-charcoal-500 mt-0.5">Admins</p>
              </div>
              <div className="w-px h-8 bg-beige-300" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-charcoal-700 truncate">
                  {activeTeam?.description || 'No description'}
                </p>
                <p className="text-xs text-charcoal-400 mt-0.5">About this team</p>
              </div>
              {isOwner && (
                <button
                  onClick={() => handleDelete(activeTeam.id)}
                  className="btn-ghost text-red-500 hover:bg-red-50 text-xs px-3 py-2 ml-auto">
                  <FaTrash /> Delete Team
                </button>
              )}
            </div>

            {/* ── Search ── */}
            <div className="flex justify-end mb-4">
              <div className="input-group max-w-xs w-full">
                <FaSearch className="input-icon" />
                <input type="text" placeholder="Find a member…"
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="input-with-icon" />
              </div>
            </div>

            {/* ── Members grid ── */}
            {filtered.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><FaUsers /></div>
                <p className="text-sm text-charcoal-500">
                  {search ? 'No members match your search' : 'No members yet'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filtered.map(member => (
                  <div key={member.id}
                    className="card group relative flex flex-col items-center text-center
                               gap-3 py-6 px-4 hover:shadow-card-hover transition-all duration-200">

                    {/* Role badge + Remove button */}
                    <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                      <span className="badge-beige text-[10px] uppercase tracking-wider">
                        {member.role}
                      </span>
                      {isOwner && member.userId !== user?.id && (
                        <button
                          onClick={() => handleRemove(activeTeam.id, member.userId)}
                          className="w-6 h-6 rounded-full bg-red-50 text-red-400
                                     flex items-center justify-center hover:bg-red-100
                                     transition-colors opacity-0 group-hover:opacity-100"
                          title="Remove member">
                          <FaTimes className="text-[10px]" />
                        </button>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center
                                    text-white text-xl font-bold mt-4
                                    ${avatarColor(member.userId ?? 0)}`}>
                      {member.user?.avatar
                        ? <img src={member.user.avatar} alt=""
                            className="w-full h-full rounded-full object-cover" />
                        : getInitials(member.user?.fullName)}
                    </div>

                    {/* Name + crown */}
                    <div>
                      <p className="text-sm font-bold text-charcoal-900 flex items-center
                                   justify-center gap-1.5">
                        {member.user?.fullName || 'Unknown'}
                        {member.role === 'admin' &&
                          <FaCrown className="text-amber-400 text-xs" title="Admin" />}
                      </p>
                      <p className="text-xs text-charcoal-500 mt-0.5 truncate max-w-[160px]">
                        {member.user?.email}
                      </p>
                    </div>

                    {/* Hover action buttons */}
                    <div className="flex gap-2 w-full mt-1 opacity-0 group-hover:opacity-100
                                    transition-opacity duration-200">
                      <button className="btn-secondary flex-1 text-xs py-1.5 justify-center">
                        <FaVideo /> Call
                      </button>
                      <a href={`mailto:${member.user?.email}`}
                        className="btn-ghost flex-1 text-xs py-1.5 justify-center
                                   flex items-center gap-1.5 text-charcoal-600
                                   hover:text-charcoal-800">
                        <FaEnvelope /> Email
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
      <Footer />

      {/* ── CREATE TEAM MODAL ── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm
                        flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md">
            <h3 className="section-title mb-4">Create New Team</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="input-label">Team Name *</label>
                <input type="text" value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Engineering Team"
                  className="input" required autoFocus />
              </div>
              <div>
                <label className="input-label">Description <span className="text-charcoal-400">(optional)</span></label>
                <textarea value={newDesc} onChange={e => setNewDesc(e.target.value)}
                  placeholder="What is this team for?"
                  rows={3} className="input resize-none" />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="btn-ghost px-5 py-2">Cancel</button>
                <button type="submit" disabled={creating} className="btn-primary px-5 py-2">
                  {creating ? 'Creating…' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── INVITE MEMBER MODAL ── */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm
                        flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md">
            <h3 className="section-title mb-1">Invite Member</h3>
            <p className="text-xs text-charcoal-500 mb-4">
              The user must already have an Amigo account.
            </p>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="input-label">Email Address *</label>
                <div className="input-group">
                  <FaEnvelope className="input-icon" />
                  <input type="email" value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    placeholder="member@amigo.com"
                    className="input-with-icon" required autoFocus />
                </div>
              </div>
              {inviteError && <div className="alert-error">{inviteError}</div>}
              <div className="flex gap-2 justify-end pt-1">
                <button type="button"
                  onClick={() => { setShowInvite(false); setInviteError(''); setInviteEmail(''); }}
                  className="btn-ghost px-5 py-2">Cancel</button>
                <button type="submit" disabled={inviting} className="btn-primary px-5 py-2">
                  {inviting ? 'Adding…' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;
