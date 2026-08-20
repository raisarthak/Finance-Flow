const Notification = require('../models/Notification');
const User = require('../models/User');

// Get all notifications
exports.getAll = async (req, res) => {
  try {
    const user = await User.findOne();
    const { unreadOnly } = req.query;
    const filter = { userId: user._id };
    if (unreadOnly === 'true') filter.isRead = false;

    const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
    const unreadCount = await Notification.countDocuments({ userId: user._id, isRead: false });
    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create notification
exports.create = async (req, res) => {
  try {
    const user = await User.findOne();
    const notification = await Notification.create({ ...req.body, userId: user._id });
    res.status(201).json(notification);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
};

// Mark as read
exports.markRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark all as read
exports.markAllRead = async (req, res) => {
  try {
    const user = await User.findOne();
    await Notification.updateMany({ userId: user._id, isRead: false }, { isRead: true });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete notification
exports.remove = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndDelete(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
