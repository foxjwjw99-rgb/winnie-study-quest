import { Router } from 'express';
import db from '../database';

const router = Router();

// Get user by ID
router.get('/:userId', (req, res) => {
  const { userId } = req.params;

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    id: user.id,
    username: user.username,
    level: user.level,
    xp: user.xp,
    totalXp: user.total_xp,
    streak: user.streak,
    lastStudyDate: user.last_study_date,
    createdAt: user.created_at,
  });
});

// Update user
router.put('/:userId', (req, res) => {
  const { userId } = req.params;
  const { level, xp, totalXp, streak, lastStudyDate } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  db.prepare(`
    UPDATE users
    SET level = ?, xp = ?, total_xp = ?, streak = ?, last_study_date = ?
    WHERE id = ?
  `).run(
    level ?? user.level,
    xp ?? user.xp,
    totalXp ?? user.total_xp,
    streak ?? user.streak,
    lastStudyDate ?? user.last_study_date,
    userId
  );

  const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;

  res.json({
    id: updatedUser.id,
    username: updatedUser.username,
    level: updatedUser.level,
    xp: updatedUser.xp,
    totalXp: updatedUser.total_xp,
    streak: updatedUser.streak,
    lastStudyDate: updatedUser.last_study_date,
    createdAt: updatedUser.created_at,
  });
});

export default router;
