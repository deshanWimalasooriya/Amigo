const express = require('express');
const router = express.Router();
const { registerUser, authUser, logoutUser } = require('../controllers/authController');

// Define the paths
router.post('/register', registerUser); // POST /api/auth/register
router.post('/login', authUser);       // POST /api/auth/login
router.post('/logout', logoutUser);    // POST /api/auth/logout

module.exports = router;