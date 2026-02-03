import { Router } from 'express';
import db from '../database';

const router = Router();

// Get user stats
router.get('/:userId', (req, res) => {
  const { userId } = req.params;

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Total study time (from study sessions)
  const studyTime = db.prepare(`
    SELECT COALESCE(SUM(duration_minutes), 0) as total
    FROM study_sessions
    WHERE user_id = ?
  `).get(userId) as any;

  // Total quests completed
  const questsCompleted = db.prepare(`
    SELECT COUNT(*) as count
    FROM quests
    WHERE user_id = ? AND is_completed = 1
  `).get(userId) as any;

  // Total pomodoros completed
  const pomodoros = db.prepare(`
    SELECT COUNT(*) as count
    FROM study_sessions
    WHERE user_id = ? AND session_type = 'pomodoro'
  `).get(userId) as any;

  // Bosses defeated
  const bossesDefeated = db.prepare(`
    SELECT COUNT(*) as count
    FROM boss_battles
    WHERE user_id = ? AND is_defeated = 1
  `).get(userId) as any;

  // Pets collected (hatched)
  const petsCollected = db.prepare(`
    SELECT COUNT(*) as count
    FROM user_pets
    WHERE user_id = ? AND is_hatched = 1
  `).get(userId) as any;

  // Achievements unlocked
  const achievementsUnlocked = db.prepare(`
    SELECT COUNT(*) as count
    FROM user_achievements
    WHERE user_id = ?
  `).get(userId) as any;

  // Longest streak
  const longestStreak = db.prepare(`
    SELECT MAX(streak) as max
    FROM users
    WHERE id = ?
  `).get(userId) as any;

  res.json({
    totalStudyTime: studyTime.total || 0,
    questsCompleted: questsCompleted.count || 0,
    pomodorosCompleted: pomodoros.count || 0,
    bossesDefeated: bossesDefeated.count || 0,
    petsCollected: petsCollected.count || 0,
    achievementsUnlocked: achievementsUnlocked.count || 0,
    currentStreak: user.streak || 0,
    longestStreak: longestStreak.max || user.streak || 0,
  });
});

// Get daily stats history
router.get('/:userId/daily', (req, res) => {
  const { userId } = req.params;
  const days = parseInt(req.query.days as string) || 7;

  const stats = db.prepare(`
    SELECT date, quests_completed, xp_earned, pomodoros_completed
    FROM daily_stats
    WHERE user_id = ?
    ORDER BY date DESC
    LIMIT ?
  `).all(userId, days) as any[];

  // Fill in missing days with zeros
  const result: any[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];

    const existing = stats.find(s => s.date === dateStr);
    if (existing) {
      result.push({
        date: existing.date,
        questsCompleted: existing.quests_completed,
        xpEarned: existing.xp_earned,
        pomodorosCompleted: existing.pomodoros_completed,
      });
    } else {
      result.push({
        date: dateStr,
        questsCompleted: 0,
        xpEarned: 0,
        pomodorosCompleted: 0,
      });
    }
  }

  res.json(result.reverse());
});

export default router;
