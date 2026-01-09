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
exports.registerUser = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

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

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 2. LOGIN USER ---
exports.authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 3. LOGOUT USER ---
exports.logoutUser = (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0) // Expire immediately
  });
  res.status(200).json({ message: "Logged out successfully" });
};