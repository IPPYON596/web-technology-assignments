require('dotenv').config();
const mongoose = require('mongoose');

async function connectDB() {
  try {
    mongoose.set('strictQuery', true);
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bookstore';
    const conn = await mongoose.connect(mongoUri);
    console.log(`[DB] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error('[DB] Connection error:', err.message);
    });
  } catch (err) {
    console.error(`[DB] Failed to connect to MongoDB: ${err.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
