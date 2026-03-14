/**
 * InvitePeopleModal.jsx
 * Allows sending meeting invitations to email addresses via
 * POST /api/notifications/invite
 */
import React, { useState } from 'react';
import { FaTimes, FaUserPlus, FaCheckCircle, FaEnvelope } from 'react-icons/fa';
import { notificationAPI } from '../services/api';

const InvitePeopleModal = ({ roomId, meetingTitle, onClose }) => {
  const [emailInput, setEmailInput] = useState('');
  const [emails,     setEmails]     = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState(false);

  const addEmail = () => {
    const trimmed = emailInput.trim().toLowerCase();
    const valid   = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
    if (!valid) { setError('Please enter a valid email address.'); return; }
    if (emails.includes(trimmed)) { setError('Already added.'); return; }
    setEmails(p => [...p, trimmed]);
    setEmailInput('');
    setError('');
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') { e.preventDefault(); addEmail(); } };
  const removeEmail   = (em) => setEmails(p => p.filter(e => e !== em));

  const handleSend = async () => {
    if (emails.length === 0) { setError('Add at least one email.'); return; }
    setLoading(true); setError('');
    try {
      await notificationAPI.invitePeople({ roomId, meetingTitle, emails });
      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (err) {
      setError(err.message || 'Failed to send invitations.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-md space-y-5 p-6 animate-scale-in">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-mint-100 text-mint-600 flex items-center justify-center">
              <FaUserPlus />
            </div>
            <div>
              <h3 className="section-title">Invite People</h3>
              <p className="section-subtitle">Room ID: {roomId}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon"><FaTimes /></button>
        </div>

        {success ? (
          <div className="alert-success">
            <FaCheckCircle /> Invitations sent successfully!
          </div>
        ) : (
          <>
            <div>
              <label className="input-label">Email addresses</label>
              <div className="input-group">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  value={emailInput}
                  onChange={e => { setEmailInput(e.target.value); setError(''); }}
                  onKeyDown={handleKeyDown}
                  placeholder="colleague@company.com"
                  className="input-with-icon pr-24"
                />
                <button type="button" onClick={addEmail}
                  className="absolute right-2 btn-secondary text-xs px-3 py-1.5">
                  Add
                </button>
              </div>
              <p className="text-[11px] text-charcoal-400 mt-1">Press Enter or click Add for each email</p>
            </div>

            {emails.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {emails.map(em => (
                  <span key={em}
                    className="badge-mint flex items-center gap-1.5 pr-1">
                    {em}
                    <button onClick={() => removeEmail(em)}
                      className="text-mint-500 hover:text-mint-700 transition-colors">
                      <FaTimes className="text-[10px]" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {error && <div className="alert-error">{error}</div>}

            <div className="flex gap-3 justify-end">
              <button className="btn-ghost" onClick={onClose}>Cancel</button>
              <button className="btn-accent" onClick={handleSend} disabled={loading}>
                {loading ? 'Sending…' : <><FaUserPlus /> Send Invites</>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InvitePeopleModal;
