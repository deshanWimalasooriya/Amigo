<<<<<<< HEAD
const db = require("../models");
const User = db.users;
const bcrypt = require("bcryptjs");
const generateToken = require("../../utils/generateToken");

// --- HELPER: Generate Unique 9-Digit PMI ---
const generateUniquePMI = async () => {
  let isUnique = false;
  let randomPMI;

  while (!isUnique) {
    // Generate random 9-digit number (e.g., 394-201-992)
    randomPMI = Math.floor(100000000 + Math.random() * 900000000).toString();
    // Check DB to ensure it doesn't exist
    const userExists = await User.findOne({ where: { pmi: randomPMI } });
    if (!userExists) {
      isUnique = true; // Loop breaks if ID is unique
    }
  }
  return randomPMI;
};

// --- 1. REGISTER USER ---
=======
const db = require('../models');
const User = db.users;
const bcrypt = require('bcryptjs');
const generateToken = require('../../utils/generateToken');

// --- HELPER: Generate Unique 9-Digit PMI ---
const generateUniquePMI = async () => {
  let pmi;
  let exists = true;
  while (exists) {
    pmi = Math.floor(100000000 + Math.random() * 900000000).toString();
    const found = await User.findOne({ where: { pmi } });
    if (!found) exists = false;
  }
  return pmi;
};

// --- 1. REGISTER ---
>>>>>>> ravindu/master
exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

<<<<<<< HEAD
    // A. Check if user exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // B. Generate Unique PMI (Your Requirement)
    const pmi = await generateUniquePMI();

    // C. Hash the Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // D. Create User in DB
    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      pmi // Automatically assigned unique ID
    });

    // E. Send Token (Auto-Login)
    generateToken(res, user.id);

    res.status(201).json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      pmi: user.pmi
    });

=======
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'An account with that email already exists' });
    }

    const pmi = await generateUniquePMI();
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ fullName, email, password: hashedPassword, pmi });

    generateToken(res, user.id);

    res.status(201).json({
      id:       user.id,
      fullName: user.fullName,
      email:    user.email,
      pmi:      user.pmi,
    });
>>>>>>> ravindu/master
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

<<<<<<< HEAD
// --- 2. LOGIN USER ---
=======
// --- 2. LOGIN ---
>>>>>>> ravindu/master
exports.authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

<<<<<<< HEAD
    // Find User
    const user = await User.findOne({ where: { email } });

    // Check Password
    if (user && (await bcrypt.compare(password, user.password))) {
      generateToken(res, user.id);
      
      res.json({
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        pmi: user.pmi,
        avatar: user.avatar
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
=======
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    generateToken(res, user.id);

    res.json({
      id:       user.id,
      fullName: user.fullName,
      email:    user.email,
      pmi:      user.pmi,
      avatar:   user.avatar,
    });
>>>>>>> ravindu/master
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

<<<<<<< HEAD
// --- 3. LOGOUT USER ---
exports.logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0) // Expire immediately
  });
  res.status(200).json({ message: "Logged out successfully" });
};
=======
// --- 3. GET CURRENT USER ---
exports.getMe = async (req, res) => {
  const user = req.user;
  res.json({
    id:       user.id,
    fullName: user.fullName,
    email:    user.email,
    pmi:      user.pmi,
    avatar:   user.avatar,
    phone:    user.phone    || '',
    location: user.location || '',
    timezone: user.timezone || '',
    company:  user.company  || '',
    jobTitle: user.jobTitle || '',
    bio:      user.bio      || '',
  });
};

// --- 4. UPDATE PROFILE ---
exports.updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const { fullName, phone, location, timezone, company, jobTitle, bio } = req.body;

    await user.update({
      fullName:  fullName  ?? user.fullName,
      phone:     phone     ?? user.phone,
      location:  location  ?? user.location,
      timezone:  timezone  ?? user.timezone,
      company:   company   ?? user.company,
      jobTitle:  jobTitle  ?? user.jobTitle,
      bio:       bio       ?? user.bio,
    });

    res.json({
      id:       user.id,
      fullName: user.fullName,
      email:    user.email,
      pmi:      user.pmi,
      avatar:   user.avatar,
      phone:    user.phone    || '',
      location: user.location || '',
      timezone: user.timezone || '',
      company:  user.company  || '',
      jobTitle: user.jobTitle || '',
      bio:      user.bio      || '',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 5. LOGOUT ---
exports.logoutUser = (req, res) => {
  const isProd = process.env.NODE_ENV !== 'development';
  res.cookie('jwt', '', {
    httpOnly: true,
    secure:   isProd,
    sameSite: isProd ? 'none' : 'lax',
    expires:  new Date(0),
  });
  res.status(200).json({ message: 'Logged out successfully' });
};
>>>>>>> ravindu/master
