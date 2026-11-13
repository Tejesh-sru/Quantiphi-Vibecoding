import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import productRoutes from './routes/productRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB Database
connectDB();

// 1. Core Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2. Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 3. API Routes
app.use('/api/products', productRoutes);

// 4. Fallback 404 Route Handler
app.use(notFound);

// 5. Centralized Global Error Handler
app.use(errorHandler);

// 6. Start HTTP Server
const server = app.listen(PORT, () => {
  console.log(`[Express] Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
});

// Graceful process termination handling
const handleGracefulShutdown = (signal) => {
  console.log(`\n[Process] Received ${signal}. Closing server gracefully...`);
  server.close(() => {
    console.log('[Process] HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));
process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));

export default app;
