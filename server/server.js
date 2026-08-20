const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in dev
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/accounts', require('./routes/accounts'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/budgets', require('./routes/budgets'));
app.use('/api/investments', require('./routes/investments'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Seed database with demo data if empty
async function autoSeed() {
  const User = require('./models/User');
  const count = await User.countDocuments();
  if (count === 0) {
    console.log('📦 Database is empty, auto-seeding demo data...');
    const seedModule = require('./utils/seedInMemory');
    await seedModule();
    console.log('✅ Auto-seed complete!');
  }
}

// Connect to MongoDB and start server
async function startServer() {
  let mongoUri = process.env.MONGODB_URI;

  // Try connecting to external MongoDB first
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    // Fall back to in-memory MongoDB
    console.log('⚠️  Local MongoDB not available, starting in-memory MongoDB...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    mongoUri = mongod.getUri();
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to In-Memory MongoDB');

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.disconnect();
      await mongod.stop();
      process.exit(0);
    });
    process.on('SIGTERM', async () => {
      await mongoose.disconnect();
      await mongod.stop();
      process.exit(0);
    });
  }

  // Auto-seed if database is empty
  await autoSeed();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  });
}

startServer().catch(err => {
  console.error('❌ Failed to start server:', err.message);
  process.exit(1);
});

module.exports = app;
