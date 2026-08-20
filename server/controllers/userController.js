const User = require('../models/User');

// Get default user
exports.getMe = async (req, res) => {
  try {
    let user = await User.findOne();
    if (!user) {
      user = await User.create({
        name: 'Alex Johnson',
        email: 'alex@financedash.com',
        role: 'customer',
        preferences: { darkMode: true, currency: 'USD', notifications: true }
      });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
exports.updateMe = async (req, res) => {
  try {
    const { name, email, avatar, preferences } = req.body;
    const user = await User.findOne();
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (email) user.email = email;
    if (avatar) user.avatar = avatar;
    if (preferences) {
      user.preferences = { ...user.preferences, ...preferences };
    }

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
