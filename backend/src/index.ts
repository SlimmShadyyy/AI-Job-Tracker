// backend/src/index.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/authRoutes.js'; 
import aiRoutes from './routes/aiRoutes.js';
import appRoutes from './routes/appRoutes.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', 
  credentials: true,
}));
app.use(express.json()); 

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/applications', appRoutes);
app.get('/', (req: Request, res: Response) => {
  res.send('Job Tracker API is running successfully!');
});

mongoose.connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });