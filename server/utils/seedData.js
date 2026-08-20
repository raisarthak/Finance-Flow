const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');
const Investment = require('../models/Investment');
const Notification = require('../models/Notification');

const CATEGORIES = {
  expense: ['Food & Dining', 'Transport', 'Shopping', 'Utilities', 'Entertainment', 'Healthcare', 'Education', 'Rent', 'Insurance', 'Personal Care'],
  income: ['Salary', 'Freelance', 'Investments', 'Rental Income', 'Refund', 'Bonus']
};

const PAYMENT_METHODS = ['cash', 'card', 'bank_transfer', 'upi', 'other'];

const CATEGORY_COLORS = {
  'Food & Dining': '#ef4444',
  'Transport': '#f97316',
  'Shopping': '#eab308',
  'Utilities': '#22c55e',
  'Entertainment': '#3b82f6',
  'Healthcare': '#8b5cf6',
  'Education': '#ec4899',
  'Rent': '#6366f1',
  'Insurance': '#14b8a6',
  'Personal Care': '#f43f5e'
};

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(monthsAgo) {
  const now = new Date();
  const past = new Date();
  past.setMonth(past.getMonth() - monthsAgo);
  return new Date(past.getTime() + Math.random() * (now.getTime() - past.getTime()));
}

async function seedData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📦 Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Account.deleteMany({}),
      Transaction.deleteMany({}),
      Budget.deleteMany({}),
      Investment.deleteMany({}),
      Notification.deleteMany({})
    ]);
    console.log('🗑️  Cleared existing data');

    // Create default user
    const user = await User.create({
      name: 'Alex Johnson',
      email: 'alex@financedash.com',
      role: 'customer',
      preferences: { darkMode: true, currency: 'USD', notifications: true }
    });
    console.log('👤 Created default user:', user.name);

    // Create accounts
    const accounts = await Account.create([
      {
        userId: user._id,
        name: 'Primary Checking',
        type: 'checking',
        balance: 12450.75,
        currency: 'USD',
        institution: 'Chase Bank',
        accountNumber: '****4521',
        status: 'active',
        color: '#6366f1'
      },
      {
        userId: user._id,
        name: 'High-Yield Savings',
        type: 'savings',
        balance: 45200.00,
        currency: 'USD',
        institution: 'Marcus by Goldman Sachs',
        accountNumber: '****8903',
        status: 'active',
        color: '#10b981'
      },
      {
        userId: user._id,
        name: 'Credit Card',
        type: 'credit',
        balance: -2340.50,
        currency: 'USD',
        institution: 'American Express',
        accountNumber: '****1234',
        status: 'active',
        color: '#ef4444'
      },
      {
        userId: user._id,
        name: 'Investment Account',
        type: 'investment',
        balance: 28750.00,
        currency: 'USD',
        institution: 'Fidelity',
        accountNumber: '****6789',
        status: 'active',
        color: '#f59e0b'
      }
    ]);
    console.log('🏦 Created', accounts.length, 'accounts');

    // Create transactions for the last 6 months
    const transactions = [];
    const now = new Date();

    for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
      const targetMonth = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
      const daysInMonth = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0).getDate();

      // Monthly salary
      transactions.push({
        userId: user._id,
        accountId: accounts[0]._id,
        type: 'income',
        amount: 8500,
        category: 'Salary',
        description: 'Monthly Salary - TechCorp Inc.',
        date: new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1),
        paymentMethod: 'bank_transfer',
        isRecurring: true,
        tags: ['salary', 'recurring']
      });

      // Freelance income (some months)
      if (Math.random() > 0.4) {
        transactions.push({
          userId: user._id,
          accountId: accounts[0]._id,
          type: 'income',
          amount: randomBetween(500, 3000),
          category: 'Freelance',
          description: 'Freelance Web Development',
          date: new Date(targetMonth.getFullYear(), targetMonth.getMonth(), randomBetween(10, 25)),
          paymentMethod: 'bank_transfer',
          tags: ['freelance']
        });
      }

      // Generate 15-25 expense transactions per month
      const numExpenses = randomBetween(15, 25);
      for (let i = 0; i < numExpenses; i++) {
        const category = CATEGORIES.expense[Math.floor(Math.random() * CATEGORIES.expense.length)];
        const day = randomBetween(1, daysInMonth);
        let amount;

        switch (category) {
          case 'Rent': amount = 2200; break;
          case 'Food & Dining': amount = randomBetween(8, 120); break;
          case 'Transport': amount = randomBetween(5, 80); break;
          case 'Shopping': amount = randomBetween(15, 500); break;
          case 'Utilities': amount = randomBetween(50, 200); break;
          case 'Entertainment': amount = randomBetween(10, 150); break;
          case 'Healthcare': amount = randomBetween(20, 300); break;
          case 'Education': amount = randomBetween(30, 200); break;
          case 'Insurance': amount = randomBetween(100, 400); break;
          case 'Personal Care': amount = randomBetween(10, 100); break;
          default: amount = randomBetween(10, 200);
        }

        const descriptions = {
          'Food & Dining': ['Whole Foods Market', 'Starbucks Coffee', 'Chipotle', 'DoorDash Order', 'Local Restaurant', 'Trader Joes'],
          'Transport': ['Uber Ride', 'Gas Station', 'Metro Pass', 'Lyft', 'Parking Fee', 'Car Wash'],
          'Shopping': ['Amazon Purchase', 'Target', 'Best Buy Electronics', 'Nike Store', 'IKEA', 'Costco'],
          'Utilities': ['Electric Bill', 'Internet - Comcast', 'Water Bill', 'Gas Bill', 'Phone Bill'],
          'Entertainment': ['Netflix Subscription', 'Spotify Premium', 'Movie Tickets', 'Concert Tickets', 'Gaming'],
          'Healthcare': ['CVS Pharmacy', 'Doctor Visit', 'Gym Membership', 'Dental Checkup'],
          'Education': ['Udemy Course', 'Book Purchase', 'Online Workshop', 'Skillshare'],
          'Rent': ['Monthly Rent - Apt 4B'],
          'Insurance': ['Car Insurance', 'Health Insurance', 'Life Insurance'],
          'Personal Care': ['Haircut', 'Skincare Products', 'Spa Visit']
        };

        const descList = descriptions[category] || ['General Purchase'];
        const description = descList[Math.floor(Math.random() * descList.length)];

        transactions.push({
          userId: user._id,
          accountId: Math.random() > 0.3 ? accounts[0]._id : accounts[2]._id,
          type: 'expense',
          amount,
          category,
          description,
          date: new Date(targetMonth.getFullYear(), targetMonth.getMonth(), day),
          paymentMethod: PAYMENT_METHODS[Math.floor(Math.random() * PAYMENT_METHODS.length)],
          isRecurring: category === 'Rent' || category === 'Insurance',
          tags: [category.toLowerCase().replace(/ & /g, '-')]
        });
      }
    }

    await Transaction.insertMany(transactions);
    console.log('💸 Created', transactions.length, 'transactions');

    // Create current month budget
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    await Budget.create({
      userId: user._id,
      month: currentMonth,
      year: currentYear,
      totalLimit: 5500,
      categories: [
        { name: 'Food & Dining', limit: 800, spent: 0, color: '#ef4444' },
        { name: 'Transport', limit: 300, spent: 0, color: '#f97316' },
        { name: 'Shopping', limit: 500, spent: 0, color: '#eab308' },
        { name: 'Utilities', limit: 400, spent: 0, color: '#22c55e' },
        { name: 'Entertainment', limit: 200, spent: 0, color: '#3b82f6' },
        { name: 'Healthcare', limit: 300, spent: 0, color: '#8b5cf6' },
        { name: 'Rent', limit: 2200, spent: 0, color: '#6366f1' },
        { name: 'Personal Care', limit: 150, spent: 0, color: '#f43f5e' },
        { name: 'Education', limit: 200, spent: 0, color: '#ec4899' },
        { name: 'Insurance', limit: 450, spent: 0, color: '#14b8a6' }
      ]
    });
    console.log('💰 Created current month budget');

    // Create investments
    await Investment.create([
      {
        userId: user._id,
        name: 'Apple Inc.',
        symbol: 'AAPL',
        type: 'stocks',
        purchasePrice: 150.25,
        currentPrice: 198.50,
        quantity: 50,
        purchaseDate: new Date(2024, 2, 15),
        notes: 'Long-term hold'
      },
      {
        userId: user._id,
        name: 'Tesla Inc.',
        symbol: 'TSLA',
        type: 'stocks',
        purchasePrice: 245.00,
        currentPrice: 218.75,
        quantity: 20,
        purchaseDate: new Date(2024, 5, 10),
        notes: 'Growth stock'
      },
      {
        userId: user._id,
        name: 'Vanguard S&P 500 ETF',
        symbol: 'VOO',
        type: 'mutual_funds',
        purchasePrice: 420.00,
        currentPrice: 478.50,
        quantity: 30,
        purchaseDate: new Date(2023, 8, 1),
        notes: 'Index fund - core holding'
      },
      {
        userId: user._id,
        name: 'Bitcoin',
        symbol: 'BTC',
        type: 'crypto',
        purchasePrice: 42000.00,
        currentPrice: 67500.00,
        quantity: 0.5,
        purchaseDate: new Date(2024, 0, 15),
        notes: 'Crypto allocation'
      },
      {
        userId: user._id,
        name: 'Gold ETF',
        symbol: 'GLD',
        type: 'gold',
        purchasePrice: 185.00,
        currentPrice: 215.30,
        quantity: 40,
        purchaseDate: new Date(2023, 11, 1),
        notes: 'Hedge against inflation'
      },
      {
        userId: user._id,
        name: 'Fixed Deposit - HDFC',
        symbol: 'FD',
        type: 'fixed_deposit',
        purchasePrice: 10000.00,
        currentPrice: 10750.00,
        quantity: 1,
        purchaseDate: new Date(2024, 3, 1),
        notes: '7.5% APY - 1 year term'
      }
    ]);
    console.log('📈 Created 6 investments');

    // Create notifications
    await Notification.create([
      {
        userId: user._id,
        type: 'salary',
        title: 'Salary Received',
        message: 'Your monthly salary of $8,500 has been credited to Primary Checking.',
        isRead: false,
        priority: 'medium',
        icon: 'dollar-sign'
      },
      {
        userId: user._id,
        type: 'budget_alert',
        title: 'Budget Alert: Shopping',
        message: 'You\'ve spent 85% of your shopping budget this month. $75 remaining.',
        isRead: false,
        priority: 'high',
        icon: 'alert-triangle'
      },
      {
        userId: user._id,
        type: 'investment',
        title: 'Investment Update',
        message: 'Your Apple (AAPL) holdings are up 32.1% since purchase. Consider rebalancing.',
        isRead: false,
        priority: 'low',
        icon: 'trending-up'
      },
      {
        userId: user._id,
        type: 'bill_due',
        title: 'Bill Reminder',
        message: 'Your credit card payment of $2,340.50 is due in 5 days.',
        isRead: false,
        priority: 'high',
        icon: 'credit-card'
      },
      {
        userId: user._id,
        type: 'unusual_spending',
        title: 'Unusual Spending Detected',
        message: 'Your entertainment spending is 40% higher than last month.',
        isRead: true,
        priority: 'medium',
        icon: 'alert-circle'
      },
      {
        userId: user._id,
        type: 'achievement',
        title: 'Savings Milestone! 🎉',
        message: 'Congratulations! Your savings have crossed $45,000. Keep it up!',
        isRead: true,
        priority: 'low',
        icon: 'award'
      }
    ]);
    console.log('🔔 Created 6 notifications');

    console.log('\n✅ Database seeded successfully!');
    console.log('   Default User: alex@financedash.com');
    console.log('   Accounts: 4');
    console.log('   Transactions:', transactions.length);
    console.log('   Budget: Current month');
    console.log('   Investments: 6');
    console.log('   Notifications: 6\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seedData();
