const express    = require('express');
const router     = express.Router();
const ctrl       = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// All routes require a valid JWT session
router.use(protect);

router.get ('/',              ctrl.getAll);       // GET  /api/notifications
router.patch('/read-all',     ctrl.markAllRead);  // PATCH /api/notifications/read-all
router.patch('/:id/read',     ctrl.markRead);     // PATCH /api/notifications/:id/read
router.post ('/invite',       ctrl.invitePeople); // POST  /api/notifications/invite

module.exports = router;
