const db = require("../models");
const User = db.users;
const bcrypt = require("bcryptjs");

// @desc    Get user profile
exports.getUserProfile = async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (user) {
    res.json({
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      pmi: user.pmi,
      avatar: user.avatar,
      // Return new fields
      company: user.company,
      jobTitle: user.jobTitle,
      bio: user.bio,
      phone: user.phone,
      location: user.location,
      timezone: user.timezone
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

// @desc    Update user profile
exports.updateUserProfile = async (req, res) => {
  const user = await User.findByPk(req.user.id);

  if (user) {
    // 1. Update fields (keep old value if new one isn't provided)
    user.fullName = req.body.fullName || user.fullName;
    user.email = req.body.email || user.email;
    user.avatar = req.body.avatar || user.avatar;
    
    // Update new fields
    user.company = req.body.company || user.company;
    user.jobTitle = req.body.jobTitle || user.jobTitle;
    user.bio = req.body.bio || user.bio;
    user.phone = req.body.phone || user.phone;
    user.location = req.body.location || user.location;
    user.timezone = req.body.timezone || user.timezone;

    // 2. Handle Password update if provided
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(req.body.password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      id: updatedUser.id,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      pmi: updatedUser.pmi,
      avatar: updatedUser.avatar,
      company: updatedUser.company,
      jobTitle: updatedUser.jobTitle,
      bio: updatedUser.bio,
      phone: updatedUser.phone,
      location: updatedUser.location,
      timezone: updatedUser.timezone
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};