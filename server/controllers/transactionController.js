const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Get all transactions with filtering
exports.getAll = async (req, res) => {
  try {
    const user = await User.findOne();
    const { type, category, accountId, startDate, endDate, page = 1, limit = 20 } = req.query;

    const filter = { userId: user._id };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (accountId) filter.accountId = accountId;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const total = await Transaction.countDocuments(filter);
    const transactions = await Transaction.find(filter)
      .populate('accountId', 'name type color')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single transaction
exports.getById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id).populate('accountId', 'name type');
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create transaction
exports.create = async (req, res) => {
  try {
    const user = await User.findOne();
    const transaction = await Transaction.create({ ...req.body, userId: user._id });
    const populated = await transaction.populate('accountId', 'name type color');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
};

// Update transaction
exports.update = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('accountId', 'name type color');
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
};

// Delete transaction
exports.remove = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get monthly summary
exports.getSummary = async (req, res) => {
  try {
    const user = await User.findOne();
    const { months = 6 } = req.query;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    const summary = await Transaction.aggregate([
      { $match: { userId: user._id, date: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            type: '$type'
          },
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get category breakdown
exports.getCategories = async (req, res) => {
  try {
    const user = await User.findOne();
    const { month, year } = req.query;

    const now = new Date();
    const targetMonth = month ? parseInt(month) : now.getMonth() + 1;
    const targetYear = year ? parseInt(year) : now.getFullYear();

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const categories = await Transaction.aggregate([
      {
        $match: {
          userId: user._id,
          type: 'expense',
          date: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
