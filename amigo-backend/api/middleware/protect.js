const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.users;

/**
 * protect middleware
 * Reads the JWT from the httpOnly cookie, verifies it,
 * and attaches the user record to req.user.
 * Returns 401 if the token is missing, invalid, or expired.
 */
const protect = async (req, res, next) => {
  const token = req.cookies?.jwt;

  if (!token) {
    return res.status(401).json({ message: 'Not authorised — no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request (exclude password)
    req.user = await User.findOne({
      where: { id: decoded.id },
      attributes: { exclude: ['password'] },
    });

    if (!req.user) {
      return res.status(401).json({ message: 'Not authorised — user not found' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorised — token invalid or expired' });
  }
};

module.exports = protect;
