const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Investment = require('../models/Investment');
const User = require('../models/User');

// Get dashboard summary KPIs
exports.getSummary = async (req, res) => {
  try {
    const user = await User.findOne();
    if (!user) return res.status(404).json({ message: 'User not found' });

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Total balance across all accounts
    const accounts = await Account.find({ userId: user._id, status: 'active' });
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    // This month income & expenses
    const monthlyAgg = await Transaction.aggregate([
      {
        $match: {
          userId: user._id,
          date: { $gte: monthStart, $lte: monthEnd }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    const monthlyIncome = monthlyAgg.find(a => a._id === 'income')?.total || 0;
    const monthlyExpenses = monthlyAgg.find(a => a._id === 'expense')?.total || 0;
    const savingsRate = monthlyIncome > 0
      ? (((monthlyIncome - monthlyExpenses) / monthlyIncome) * 100)
      : 0;

    // Investment portfolio value
    const investments = await Investment.find({ userId: user._id });
    const investmentValue = investments.reduce((sum, inv) => sum + (inv.currentPrice * inv.quantity), 0);

    // Net worth
    const netWorth = totalBalance + investmentValue;

    // Previous month for comparison
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const prevMonthAgg = await Transaction.aggregate([
      {
        $match: {
          userId: user._id,
          date: { $gte: prevMonthStart, $lte: prevMonthEnd }
        }
      },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' }
        }
      }
    ]);

    const prevIncome = prevMonthAgg.find(a => a._id === 'income')?.total || 0;
    const prevExpenses = prevMonthAgg.find(a => a._id === 'expense')?.total || 0;

    res.json({
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      savingsRate: Math.round(savingsRate * 10) / 10,
      netWorth,
      investmentValue,
      accountCount: accounts.length,
      trends: {
        income: prevIncome > 0 ? (((monthlyIncome - prevIncome) / prevIncome) * 100).toFixed(1) : 0,
        expenses: prevExpenses > 0 ? (((monthlyExpenses - prevExpenses) / prevExpenses) * 100).toFixed(1) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get chart data
exports.getCharts = async (req, res) => {
  try {
    const user = await User.findOne();
    const { months = 6 } = req.query;

    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    // Monthly income vs expense
    const monthlyData = await Transaction.aggregate([
      {
        $match: {
          userId: user._id,
          date: { $gte: startDate }
        }
      },
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

    // Category breakdown (current month)
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const categoryData = await Transaction.aggregate([
      {
        $match: {
          userId: user._id,
          type: 'expense',
          date: { $gte: currentMonthStart, $lte: currentMonthEnd }
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

    // Savings trend
    const savingsData = [];
    for (let i = parseInt(months) - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mStart = new Date(d.getFullYear(), d.getMonth(), 1);
      const mEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);

      const monthAgg = await Transaction.aggregate([
        {
          $match: {
            userId: user._id,
            date: { $gte: mStart, $lte: mEnd }
          }
        },
        {
          $group: {
            _id: '$type',
            total: { $sum: '$amount' }
          }
        }
      ]);

      const inc = monthAgg.find(a => a._id === 'income')?.total || 0;
      const exp = monthAgg.find(a => a._id === 'expense')?.total || 0;

      savingsData.push({
        month: mStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        income: inc,
        expenses: exp,
        savings: inc - exp
      });
    }

    res.json({
      monthlyData,
      categoryData,
      savingsData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
