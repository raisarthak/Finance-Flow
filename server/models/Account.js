const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['savings', 'checking', 'credit', 'investment'],
    required: true
  },
  balance: {
    type: Number,
    required: true,
    default: 0
  },
  currency: {
    type: String,
    default: 'USD'
  },
  institution: {
    type: String,
    trim: true,
    default: ''
  },
  accountNumber: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'closed'],
    default: 'active'
  },
  color: {
    type: String,
    default: '#6366f1'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Account', accountSchema);
