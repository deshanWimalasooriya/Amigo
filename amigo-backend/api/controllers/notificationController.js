/**
 * notificationController.js
 *
 * Endpoints:
 *   GET    /api/notifications            — get all for logged-in user
 *   PATCH  /api/notifications/:id/read   — mark one as read
 *   PATCH  /api/notifications/read-all   — mark all as read
 *   POST   /api/notifications/invite     — send invitation by roomId + email list
 *
 * Cron (internal):
 *   Every minute — finds meetings starting in ~10 min, sends reminder
 *   notifications + emails to the host (extend to invitees if you store them).
 */
const cron           = require('node-cron');
const db             = require('../models');
const emailService   = require('../../utils/emailService');

const Notification = db.notifications;
const Meeting      = db.meetings;
const User         = db.users;
const { Op }       = db.Sequelize;

// io is injected from server.js after socket setup
let _io = null;
exports.setIo = (io) => { _io = io; };

// ── Helper: push real-time notification to a user's socket rooms ──────────
const pushToUser = (userId, payload) => {
  if (_io) _io.to(`user:${userId}`).emit('notification', payload);
};

// ── 1. GET ALL ────────────────────────────────────────────────────────────
exports.getAll = async (req, res) => {
  try {
    const rows = await Notification.findAll({
      where:  { userId: req.user.id },
      order:  [['createdAt', 'DESC']],
      limit:  50,
    });
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── 2. MARK ONE READ ──────────────────────────────────────────────────────
exports.markRead = async (req, res) => {
  try {
    const n = await Notification.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!n) return res.status(404).json({ message: 'Not found' });
    await n.update({ isRead: true });
    res.json(n);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── 3. MARK ALL READ ──────────────────────────────────────────────────────
exports.markAllRead = async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    );
    res.json({ message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── 4. INVITE PEOPLE ──────────────────────────────────────────────────────
// POST /api/notifications/invite
// Body: { roomId, meetingTitle, emails: ['a@b.com', ...] }
exports.invitePeople = async (req, res) => {
  try {
    const { roomId, meetingTitle, emails } = req.body;

    if (!roomId || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: 'roomId and emails[] are required' });
    }

    const meeting = await Meeting.findOne({ where: { roomId } });
    if (!meeting) return res.status(404).json({ message: 'Meeting not found' });

    const sender = await User.findByPk(req.user.id);
    const results = [];

    for (const email of emails) {
      // Check if the invited person is a registered user
      const invitedUser = await User.findOne({ where: { email } });

      // Create an in-app notification if they have an account
      if (invitedUser) {
        const notif = await Notification.create({
          userId:  invitedUser.id,
          type:    'invitation',
          title:   `Meeting invitation: ${meeting.title}`,
          message: `${sender.fullName} has invited you to join "${meeting.title}". Room ID: ${roomId}`,
          isRead:  false,
          meta:    JSON.stringify({ roomId, meetingTitle: meeting.title }),
        });
        pushToUser(invitedUser.id, notif);
      }

      // Always send the email (works for non-registered guests too)
      try {
        await emailService.sendMeetingInvitation({
          toEmail:      email,
          toName:       invitedUser?.fullName || '',
          fromName:     sender.fullName,
          meetingTitle: meeting.title,
          roomId,
          passcode:     meeting.passcode,
          scheduledAt:  meeting.scheduledAt,
        });
        results.push({ email, status: 'sent' });
      } catch (emailErr) {
        console.error(`Email failed for ${email}:`, emailErr.message);
        results.push({ email, status: 'email_failed', error: emailErr.message });
      }
    }

    res.json({ message: 'Invitations processed', results });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── 5. CRON — 10-minute reminder ──────────────────────────────────────────
// Runs every minute; finds meetings whose scheduledAt is 9-11 minutes away
// and haven't had a reminder sent yet.
exports.startReminderCron = () => {
  cron.schedule('* * * * *', async () => {
    try {
      const now    = new Date();
      const from   = new Date(now.getTime() + 9  * 60 * 1000);
      const to     = new Date(now.getTime() + 11 * 60 * 1000);

      const meetings = await Meeting.findAll({
        where: {
          status:      'scheduled',
          scheduledAt: { [Op.between]: [from, to] },
          reminderSent: false,
        },
        include: [{ model: User, as: 'host', attributes: ['id','fullName','email'] }],
      });

      for (const m of meetings) {
        // In-app notification
        const notif = await Notification.create({
          userId:  m.hostId,
          type:    'reminder',
          title:   `⏰ Starting soon: ${m.title}`,
          message: `Your meeting "${m.title}" starts in ~10 minutes. Room ID: ${m.roomId}`,
          isRead:  false,
          meta:    JSON.stringify({ roomId: m.roomId }),
        });
        pushToUser(m.hostId, notif);

        // Email reminder
        try {
          await emailService.sendReminderEmail({
            toEmail:     m.host.email,
            toName:      m.host.fullName,
            meetingTitle: m.title,
            roomId:      m.roomId,
            scheduledAt: m.scheduledAt,
          });
        } catch (e) {
          console.error('Reminder email failed:', e.message);
        }

        // Mark reminderSent so we don't fire again
        await m.update({ reminderSent: true });
      }
    } catch (err) {
      console.error('Reminder cron error:', err.message);
    }
  });
  console.log('✅ Meeting reminder cron started (runs every minute)');
};
