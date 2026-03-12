const express = require('express');
const router = express.Router();
const {
  registerUser,
  authUser,
  logoutUser,
  getMe,
  updateProfile,
} = require('../controllers/authController');
const protect = require('../middleware/protect');

router.post('/register', registerUser);          // POST /api/auth/register
router.post('/login',    authUser);              // POST /api/auth/login
router.post('/logout',   logoutUser);            // POST /api/auth/logout
router.get('/me',        protect, getMe);        // GET  /api/auth/me  (protected)
router.put('/profile',   protect, updateProfile);// PUT  /api/auth/profile (protected)

module.exports = router;
