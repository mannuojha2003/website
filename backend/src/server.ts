// backend/src/server.ts

import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';

// 🛣️ Route imports
import authRoutes from './routes/auth';
import entriesRoutes from './routes/entries';
import unitRoutes from './routes/units';
import scheduleRoutes from './routes/schedule';
import todoRoutes from './routes/todos';
import registerRoutes from './routes/register';
// 📦 Load .env variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/dashboard';

// 🔧 Middleware setup
app.use(cors({
  origin: 'http://localhost:5173', // ✅ Allow frontend origin
  credentials: true,               // ✅ Allow cookies, auth headers
}));

app.use(express.json()); // Parse incoming JSON requests

// 🚏 Mount all routes
app.use('/api/auth', authRoutes);
app.use('/api/entries', entriesRoutes);
app.use('/api/units', unitRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/register', registerRoutes);

// ✅ Optional: Global error handler
// app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
//   console.error('Unhandled error:', err);
//   res.status(500).json({ message: 'Something went wrong!' });
// });

// 🌐 Connect to MongoDB and start server
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1);
  });
