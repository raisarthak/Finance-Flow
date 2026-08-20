const mongoose = require('mongoose');

const budgetCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  limit: {
    type: Number,
    required: true,
    min: 0
  },
  spent: {
    type: Number,
    default: 0,
    min: 0
  },
  color: {
    type: String,
    default: '#6366f1'
  }
}, { _id: true });

const budgetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  categories: [budgetCategorySchema],
  totalLimit: {
    type: Number,
    required: true,
    min: 0
  }
}, {
  timestamps: true
});

// Compound index to ensure one budget per user per month
budgetSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
