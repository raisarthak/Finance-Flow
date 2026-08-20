const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['customer', 'advisor', 'admin'],
    default: 'customer'
  },
  avatar: {
    type: String,
    default: ''
  },
  preferences: {
    darkMode: { type: Boolean, default: true },
    currency: { type: String, default: 'USD' },
    notifications: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
