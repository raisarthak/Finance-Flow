const Account = require('../models/Account');
const User = require('../models/User');

// Get all accounts
exports.getAll = async (req, res) => {
  try {
    const user = await User.findOne();
    const accounts = await Account.find({ userId: user._id }).sort({ createdAt: -1 });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single account
exports.getById = async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) return res.status(404).json({ message: 'Account not found' });
    res.json(account);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create account
exports.create = async (req, res) => {
  try {
    const user = await User.findOne();
    const account = await Account.create({ ...req.body, userId: user._id });
    res.status(201).json(account);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
};

// Update account
exports.update = async (req, res) => {
  try {
    const account = await Account.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!account) return res.status(404).json({ message: 'Account not found' });
    res.json(account);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
};

// Delete account
exports.remove = async (req, res) => {
  try {
    const account = await Account.findByIdAndDelete(req.params.id);
    if (!account) return res.status(404).json({ message: 'Account not found' });
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
