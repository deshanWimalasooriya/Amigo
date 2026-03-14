/**
 * NotificationPanel.jsx — Rebuilt to fetch real notifications from API
 * and allow mark-as-read.
 */
import React, { useEffect, useState, useRef } from 'react';
import {
  FaBell, FaTimes, FaCheckDouble,
  FaCalendarAlt, FaUserPlus, FaClock, FaVideo,
} from 'react-icons/fa';
import { notificationAPI } from '../services/api';

const iconFor = (type) => {
  if (type === 'invitation') return <FaUserPlus className="text-mint-500" />;
  if (type === 'reminder')   return <FaClock    className="text-sage-500" />;
  if (type === 'meeting')    return <FaVideo    className="text-sage-600" />;
  return <FaCalendarAlt className="text-charcoal-400" />;
};

const NotificationPanel = ({ onUnreadCountChange }) => {
  const [open,          setOpen]          = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading,       setLoading]       = useState(false);
  const panelRef = useRef(null);

  const unread = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    onUnreadCountChange?.(unread);
  }, [unread, onUnreadCountChange]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationAPI.getAll();
      setNotifications(data);
    } catch {
      // silently ignore — bell still works offline
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markRead = async (id) => {
    try {
      await notificationAPI.markRead(id);
      setNotifications(p => p.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const markAllRead = async () => {
    try {
      await notificationAPI.markAllRead();
      setNotifications(p => p.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        className="btn-icon relative"
        onClick={() => { setOpen(o => !o); if (!open) fetchNotifications(); }}
        title="Notifications"
      >
        <FaBell className="text-sm" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 rounded-full
                           bg-mint-500 border-2 border-beige-50
                           text-[9px] font-bold text-white flex items-center justify-center px-0.5">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-beige-50 border border-beige-300
                        rounded-2xl shadow-card-hover z-50 animate-scale-in overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-beige-200">
            <p className="text-sm font-bold text-charcoal-800">Notifications</p>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button onClick={markAllRead}
                  className="text-xs text-sage-600 hover:text-sage-700 font-semibold
                             flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-sage-50
                             transition-colors">
                  <FaCheckDouble className="text-[10px]" /> Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="btn-icon w-7 h-7">
                <FaTimes className="text-xs" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="px-4 py-8 text-center">
                <span className="spinner" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <FaBell className="text-2xl text-charcoal-300 mx-auto mb-2" />
                <p className="text-sm text-charcoal-500">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <button
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`w-full text-left flex items-start gap-3 px-4 py-3
                              border-b border-beige-100 hover:bg-beige-100
                              transition-colors last:border-0
                              ${!n.isRead ? 'bg-mint-50' : ''}`}
                >
                  <div className="w-7 h-7 rounded-xl bg-beige-200 flex items-center justify-center
                                  flex-shrink-0 mt-0.5 text-xs">
                    {iconFor(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-charcoal-800 leading-snug">{n.title}</p>
                    <p className="text-xs text-charcoal-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[10px] text-charcoal-400 mt-1">
                      {new Date(n.createdAt).toLocaleString('en-US', {
                        month: 'short', day: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-mint-500 flex-shrink-0 mt-1.5" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
