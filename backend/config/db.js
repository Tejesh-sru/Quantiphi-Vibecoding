import mongoose from 'mongoose';

/**
 * Connect to MongoDB instance using Mongoose.
 * Reads connection URI from environment variable MONGO_URI.
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce_filter_db';

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected successfully to: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error(`[MongoDB] Connection failed: ${err.message}`);
    console.error(`[MongoDB] Ensure local MongoDB daemon is running (mongod) or provide a cloud MongoDB Atlas MONGO_URI in .env`);
    process.exit(1);
  }
};

export default connectDB;
