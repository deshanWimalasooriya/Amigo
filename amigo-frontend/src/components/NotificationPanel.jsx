import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalendarAlt, FaUserPlus, FaInfoCircle, FaExclamationTriangle } from 'react-icons/fa';
import './styles/NotificationPanel.css';

// Helper to get icon based on type
const getIcon = (type) => {
  switch (type) {
    case 'meeting': return <FaCalendarAlt className="notif-icon-svg color-blue" />;
    case 'invite': return <FaUserPlus className="notif-icon-svg color-green" />;
    case 'alert': return <FaExclamationTriangle className="notif-icon-svg color-orange" />;
    default: return <FaInfoCircle className="notif-icon-svg color-gray" />;
  }
};

const NotificationPanel = ({ notifications, isOpen }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="notification-panel"
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className="notif-header">
            <h3>Notifications</h3>
            <span className="mark-read">Mark all as read</span>
          </div>

          {/* List */}
          <div className="notif-list">
            {notifications.length > 0 ? (
              notifications.map((item) => (
                <div key={item.id} className={`notif-item ${item.unread ? 'unread' : ''}`}>
                  <div className="notif-icon">
                    {getIcon(item.type)}
                  </div>
                  <div className="notif-content">
                    <p className="notif-title">{item.title}</p>
                    <p className="notif-msg">{item.message}</p>
                    <span className="notif-time">{item.time}</span>
                  </div>
                  {item.unread && <div className="unread-dot"></div>}
                </div>
              ))
            ) : (
              <div className="empty-state">
                <p>No new notifications</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="notif-footer">
            <button>View All History</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;