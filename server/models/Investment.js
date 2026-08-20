const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  symbol: {
    type: String,
    trim: true,
    default: ''
  },
  type: {
    type: String,
    enum: ['stocks', 'mutual_funds', 'crypto', 'gold', 'fixed_deposit', 'bonds', 'real_estate'],
    required: true
  },
  purchasePrice: {
    type: Number,
    required: true,
    min: 0
  },
  currentPrice: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  purchaseDate: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Virtual for total invested
investmentSchema.virtual('totalInvested').get(function() {
  return this.purchasePrice * this.quantity;
});

// Virtual for current value
investmentSchema.virtual('currentValue').get(function() {
  return this.currentPrice * this.quantity;
});

// Virtual for profit/loss
investmentSchema.virtual('profitLoss').get(function() {
  return (this.currentPrice - this.purchasePrice) * this.quantity;
});

// Virtual for profit/loss percentage
investmentSchema.virtual('profitLossPercent').get(function() {
  if (this.purchasePrice === 0) return 0;
  return ((this.currentPrice - this.purchasePrice) / this.purchasePrice) * 100;
});

// Ensure virtuals are included in JSON
investmentSchema.set('toJSON', { virtuals: true });
investmentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Investment', investmentSchema);
