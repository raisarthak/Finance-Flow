const Investment = require('../models/Investment');
const User = require('../models/User');

// Get all investments
exports.getAll = async (req, res) => {
  try {
    const user = await User.findOne();
    const investments = await Investment.find({ userId: user._id }).sort({ createdAt: -1 });
    res.json(investments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get portfolio summary
exports.getPortfolio = async (req, res) => {
  try {
    const user = await User.findOne();
    const investments = await Investment.find({ userId: user._id });

    const portfolio = {
      totalInvested: 0,
      currentValue: 0,
      totalProfitLoss: 0,
      profitLossPercent: 0,
      byType: {},
      holdings: investments
    };

    investments.forEach(inv => {
      const invested = inv.purchasePrice * inv.quantity;
      const current = inv.currentPrice * inv.quantity;
      portfolio.totalInvested += invested;
      portfolio.currentValue += current;

      if (!portfolio.byType[inv.type]) {
        portfolio.byType[inv.type] = { invested: 0, current: 0, count: 0 };
      }
      portfolio.byType[inv.type].invested += invested;
      portfolio.byType[inv.type].current += current;
      portfolio.byType[inv.type].count += 1;
    });

    portfolio.totalProfitLoss = portfolio.currentValue - portfolio.totalInvested;
    portfolio.profitLossPercent = portfolio.totalInvested > 0
      ? ((portfolio.totalProfitLoss / portfolio.totalInvested) * 100)
      : 0;

    res.json(portfolio);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single investment
exports.getById = async (req, res) => {
  try {
    const investment = await Investment.findById(req.params.id);
    if (!investment) return res.status(404).json({ message: 'Investment not found' });
    res.json(investment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create investment
exports.create = async (req, res) => {
  try {
    const user = await User.findOne();
    const investment = await Investment.create({ ...req.body, userId: user._id });
    res.status(201).json(investment);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
};

// Update investment
exports.update = async (req, res) => {
  try {
    const investment = await Investment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!investment) return res.status(404).json({ message: 'Investment not found' });
    res.json(investment);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
};

// Delete investment
exports.remove = async (req, res) => {
  try {
    const investment = await Investment.findByIdAndDelete(req.params.id);
    if (!investment) return res.status(404).json({ message: 'Investment not found' });
    res.json({ message: 'Investment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
