import express from 'express';
import cors from 'cors';
import path from 'path';

import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import questsRoutes from './routes/quests';
import achievementsRoutes from './routes/achievements';
import shopRoutes from './routes/shop';
import petsRoutes from './routes/pets';
import bossRoutes from './routes/boss';
import statsRoutes from './routes/stats';
import pomodoroRoutes from './routes/pomodoro';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/quests', questsRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/pets', petsRoutes);
app.use('/api/boss', bossRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/pomodoro', pomodoroRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: "Winnie's Study Quest API is running!" });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist/index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🎮 Winnie's Study Quest server running on port ${PORT}`);
  console.log(`📚 API available at http://localhost:${PORT}/api`);
});

export default app;
