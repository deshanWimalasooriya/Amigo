const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
<<<<<<< HEAD
  // 1. Create the token
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d' // Token valid for 30 days
  });

  // 2. Attach it to the Response as a Secure Cookie
  res.cookie('jwt', token, {
    httpOnly: true, // Frontend JS cannot read this (Prevents XSS attacks)
    secure: process.env.NODE_ENV !== 'development', // Use secure cookies in production
    sameSite: 'strict', // Prevent CSRF attacks
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days in ms
  });
};

module.exports = generateToken;
=======
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  const isProd = process.env.NODE_ENV !== 'development';

  res.cookie('jwt', token, {
    httpOnly: true,   // JS cannot read the cookie (prevents XSS)
    secure:   isProd, // HTTPS only in production
    sameSite: isProd ? 'none' : 'lax', // 'none' required for cross-origin (Vercel → Railway)
    maxAge:   30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

module.exports = generateToken;
>>>>>>> ravindu/master
