const jwt = require('jsonwebtoken');
const db = require('../models');
const User = db.users;

const protect = async (req, res, next) => {
  let token;

  // 1. Check if the 'jwt' cookie exists
  token = req.cookies.jwt;

  if (token) {
    try {
      // 2. Verify the token using your Secret Key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Find the user in DB and attach to the request object
      // We exclude the password for security
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      next(); // Pass control to the controller
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };