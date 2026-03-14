/**
 * emailService.js
 * Nodemailer transporter wrapper.
 * Set SMTP_* vars in .env — works with Gmail (App Password),
 * Mailgun SMTP, SendGrid SMTP, or any other SMTP provider.
 */
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST   || 'smtp.gmail.com',
  port:   parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',  // true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * sendMeetingInvitation
 * Sends a branded HTML email invitation to one recipient.
 */
exports.sendMeetingInvitation = async ({ toEmail, toName, fromName, meetingTitle, roomId, passcode, scheduledAt }) => {
  const joinUrl  = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/join`;
  const dateStr  = scheduledAt
    ? new Date(scheduledAt).toLocaleString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long',
        day: 'numeric', hour: '2-digit', minute: '2-digit',
      })
    : 'Instant / Now';

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
    <body style="margin:0;padding:0;background:#f9f6ef;font-family:'Inter',Arial,sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr><td align="center" style="padding:40px 16px;">
          <table width="520" cellpadding="0" cellspacing="0"
            style="background:#fff;border-radius:16px;border:1px solid #e8dcc8;overflow:hidden;">

            <!-- Header -->
            <tr>
              <td style="background:linear-gradient(135deg,#5a8f67,#2d9ea1);padding:28px 36px;">
                <p style="margin:0;font-size:22px;font-weight:800;color:#fff;">🤝 Amigo</p>
                <p style="margin:6px 0 0;font-size:13px;color:rgba(255,255,255,0.8);">You've been invited to a meeting</p>
              </td>
            </tr>

            <!-- Body -->
            <tr><td style="padding:32px 36px;">
              <p style="margin:0 0 6px;font-size:15px;color:#454949;">Hi ${toName || 'there'},</p>
              <p style="margin:0 0 24px;font-size:15px;color:#5f6566;">
                <strong style="color:#353838;">${fromName}</strong> has invited you to join a video meeting on Amigo.
              </p>

              <div style="background:#f9f6ef;border:1px solid #e8dcc8;border-radius:12px;padding:20px 24px;margin-bottom:24px;">
                <p style="margin:0 0 14px;font-size:18px;font-weight:700;color:#353838;">${meetingTitle}</p>
                <table width="100%">
                  <tr><td style="color:#5f6566;font-size:13px;padding:4px 0;">📅 Date & Time</td>
                      <td style="color:#353838;font-size:13px;font-weight:600;padding:4px 0;text-align:right;">${dateStr}</td></tr>
                  <tr><td style="color:#5f6566;font-size:13px;padding:4px 0;">🔑 Room ID</td>
                      <td style="color:#353838;font-size:14px;font-weight:700;padding:4px 0;text-align:right;font-family:monospace;">${roomId}</td></tr>
                  ${passcode ? `<tr><td style="color:#5f6566;font-size:13px;padding:4px 0;">🔒 Passcode</td>
                      <td style="color:#353838;font-size:13px;font-weight:600;padding:4px 0;text-align:right;">${passcode}</td></tr>` : ''}
                </table>
              </div>

              <div style="text-align:center;">
                <a href="${joinUrl}?roomId=${roomId}"
                  style="display:inline-block;background:linear-gradient(135deg,#5a8f67,#477356);
                         color:#fff;font-size:15px;font-weight:700;padding:14px 36px;
                         border-radius:12px;text-decoration:none;">Join Meeting</a>
              </div>
            </td></tr>

            <!-- Footer -->
            <tr><td style="padding:16px 36px 24px;border-top:1px solid #f2ebe0;">
              <p style="margin:0;font-size:11px;color:#c9b590;text-align:center;">
                Amigo · Calm, Collaborative, Connected · You received this because ${fromName} invited you.
              </p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from:    `"Amigo Meetings" <${process.env.SMTP_USER}>`,
    to:      toEmail,
    subject: `📅 You're invited: ${meetingTitle}`,
    html,
  });
};

/**
 * sendReminderEmail
 * 10-minute pre-meeting reminder.
 */
exports.sendReminderEmail = async ({ toEmail, toName, meetingTitle, roomId, scheduledAt }) => {
  const joinUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/join?roomId=${roomId}`;
  await transporter.sendMail({
    from:    `"Amigo Meetings" <${process.env.SMTP_USER}>`,
    to:      toEmail,
    subject: `⏰ Reminder: "${meetingTitle}" starts in 10 minutes`,
    html: `
      <div style="font-family:'Inter',Arial,sans-serif;background:#f9f6ef;padding:32px;">
        <h2 style="color:#5a8f67;">⏰ Meeting Reminder</h2>
        <p>Hi ${toName || 'there'},</p>
        <p>Your meeting <strong>${meetingTitle}</strong> starts in <strong>10 minutes</strong>.</p>
        <p style="font-size:14px;color:#5f6566;">Room ID: <strong style="font-family:monospace;">${roomId}</strong></p>
        <a href="${joinUrl}" style="display:inline-block;background:#5a8f67;color:#fff;padding:12px 28px;
           border-radius:10px;text-decoration:none;font-weight:700;margin-top:12px;">Join Now</a>
      </div>
    `,
  });
};
