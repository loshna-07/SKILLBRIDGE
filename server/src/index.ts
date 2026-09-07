import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

import authRoutes from './routes/authRoutes';
import studentRoutes from './routes/studentRoutes';
import opportunityRoutes from './routes/opportunityRoutes';
import assessmentRoutes from './routes/assessmentRoutes';
import learningRoutes from './routes/learningRoutes';
import academicianRoutes from './routes/academicianRoutes';
import institutionRoutes from './routes/institutionRoutes';
import collaborationRoutes from './routes/collaborationRoutes';
import statsRoutes from './routes/statsRoutes';
import uploadRoutes from './routes/uploadRoutes';
import matchingRoutes from './routes/matchingRoutes';
import industryRoutes from './routes/industryRoutes';
import courseRoutes from './routes/courseRoutes';
import notificationRoutes from './routes/notificationRoutes';
import { errorHandler } from './middleware/errorHandler';
import { startDatabase } from './db_service';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'SkillBridge API', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/industry', industryRoutes);
app.use('/api/academician', academicianRoutes);
app.use('/api/institution', institutionRoutes);
app.use('/api/collaboration', collaborationRoutes);
app.use('/api/collaborations', collaborationRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/upload', uploadRoutes);

// Error Handler
app.use(errorHandler);

async function start() {
  try {
    await startDatabase();
  } catch (err: any) {
    console.warn('[DB Notice]:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`=========================================`);
    console.log(`SkillBridge Backend Running on port ${PORT}`);
    console.log(`API Health: http://localhost:${PORT}/api/health`);
    console.log(`=========================================`);
  });
}

start();
