const express = require('express');
const router = express.Router();
const { createMeeting, getMyMeetings } = require('../controllers/meetingController');
const { protect } = require('../middleware/authMiddleware');

// Matches /api/meetings
router.route('/')
  .post(protect, createMeeting)  // Save Meeting
  .get(protect, getMyMeetings);  // Get List

module.exports = router;