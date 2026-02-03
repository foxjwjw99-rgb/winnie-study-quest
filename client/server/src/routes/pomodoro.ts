import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database';
import { getTaiwanDate, updateStreak } from '../utils';

const router = Router();

// Complete a pomodoro session
router.post('/:userId/complete', (req, res) => {
  const { userId } = req.params;

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const xpGained = 25; // XP per pomodoro

  // Record study session
  db.prepare(`
    INSERT INTO study_sessions (id, user_id, duration_minutes, session_type, created_at)
    VALUES (?, ?, 25, 'pomodoro', datetime('now'))
  `).run(uuidv4(), userId);

  // Update user XP
  db.prepare(`
    UPDATE users SET xp = xp + ?, total_xp = total_xp + ?
    WHERE id = ?
  `).run(xpGained, xpGained, userId);

  // Update streak
  updateStreak(userId);

  // Update daily stats
  const today = getTaiwanDate();
  db.prepare(`
    INSERT INTO daily_stats (id, user_id, date, quests_completed, xp_earned, pomodoros_completed)
    VALUES (?, ?, ?, 0, ?, 1)
    ON CONFLICT(user_id, date) DO UPDATE SET
      xp_earned = xp_earned + ?,
      pomodoros_completed = pomodoros_completed + 1
  `).run(uuidv4(), userId, today, xpGained, xpGained);

  const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;

  res.json({
    user: {
      id: updatedUser.id,
      username: updatedUser.username,
      level: updatedUser.level,
      xp: updatedUser.xp,
      totalXp: updatedUser.total_xp,
      streak: updatedUser.streak,
      lastStudyDate: updatedUser.last_study_date,
      createdAt: updatedUser.created_at,
    },
    xpGained,
  });
});

export default router;
