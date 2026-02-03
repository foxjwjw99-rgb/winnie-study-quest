import { Router } from 'express';
import db from '../database';

const router = Router();

// Get all achievements
router.get('/', (req, res) => {
  const achievements = db.prepare('SELECT * FROM achievements ORDER BY type, requirement').all() as any[];

  res.json(achievements.map(a => ({
    id: a.id,
    name: a.name,
    description: a.description,
    icon: a.icon,
    requirement: a.requirement,
    type: a.type,
    xpReward: a.xp_reward,
  })));
});

// Get user achievements
router.get('/:userId', (req, res) => {
  const { userId } = req.params;

  const userAchievements = db.prepare(`
    SELECT ua.*, a.name, a.description, a.icon, a.requirement, a.type, a.xp_reward
    FROM user_achievements ua
    JOIN achievements a ON ua.achievement_id = a.id
    WHERE ua.user_id = ?
    ORDER BY ua.unlocked_at DESC
  `).all(userId) as any[];

  res.json(userAchievements.map(ua => ({
    id: ua.id,
    achievementId: ua.achievement_id,
    userId: ua.user_id,
    unlockedAt: ua.unlocked_at,
  })));
});

export default router;
