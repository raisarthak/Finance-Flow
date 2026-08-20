const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Get all budgets
exports.getAll = async (req, res) => {
  try {
    const user = await User.findOne();
    const budgets = await Budget.find({ userId: user._id }).sort({ year: -1, month: -1 });
    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get current month budget with live spending data
exports.getCurrent = async (req, res) => {
  try {
    const user = await User.findOne();
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    let budget = await Budget.findOne({ userId: user._id, month, year });
    if (!budget) {
      return res.json(null);
    }

    // Calculate actual spending per category from transactions
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const spending = await Transaction.aggregate([
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
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Update budget categories with actual spending
    const budgetObj = budget.toObject();
    budgetObj.categories = budgetObj.categories.map(cat => {
      const spendingItem = spending.find(s => s._id.toLowerCase() === cat.name.toLowerCase());
      return {
        ...cat,
        spent: spendingItem ? spendingItem.total : 0
      };
    });

    // Calculate total spent
    budgetObj.totalSpent = spending.reduce((sum, s) => sum + s.total, 0);

    res.json(budgetObj);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create budget
exports.create = async (req, res) => {
  try {
    const user = await User.findOne();
    const budget = await Budget.create({ ...req.body, userId: user._id });
    res.status(201).json(budget);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Budget already exists for this month' });
    }
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
};

// Update budget
exports.update = async (req, res) => {
  try {
    const budget = await Budget.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    res.json(budget);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
};

// Delete budget
exports.remove = async (req, res) => {
  try {
    const budget = await Budget.findByIdAndDelete(req.params.id);
    if (!budget) return res.status(404).json({ message: 'Budget not found' });
    res.json({ message: 'Budget deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
