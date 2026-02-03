import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database';

const router = Router();

// Login (create user if not exists)
router.post('/login', (req, res) => {
  const { username } = req.body;

  if (!username || typeof username !== 'string' || username.trim().length === 0) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const trimmedUsername = username.trim();

  // Check if user exists
  let user = db.prepare('SELECT * FROM users WHERE username = ?').get(trimmedUsername) as any;

  if (!user) {
    // Create new user
    const id = uuidv4();
    db.prepare(`
      INSERT INTO users (id, username, level, xp, total_xp, streak, created_at)
      VALUES (?, ?, 1, 0, 0, 0, datetime('now'))
    `).run(id, trimmedUsername);

    user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);

    // Create default daily quests for new user
    createDailyQuests(id);
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

function createDailyQuests(userId: string) {
  const defaultQuests = [
    { title: '完成3個番茄鐘', description: '專注學習75分鐘', xp_reward: 75, category: 'pomodoro' },
    { title: '複習普通心理學', description: '複習至少30分鐘', xp_reward: 50, category: 'review' },
    { title: '練習統計學題目', description: '完成10題練習', xp_reward: 60, category: 'practice' },
    { title: '閱讀心理學文章', description: '閱讀一篇相關文章', xp_reward: 40, category: 'study' },
    { title: '筆記整理', description: '整理今日學習筆記', xp_reward: 30, category: 'study' },
  ];

  const insertQuest = db.prepare(`
    INSERT INTO quests (id, user_id, title, description, xp_reward, category, is_completed, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, datetime('now'))
  `);

  for (const quest of defaultQuests) {
    insertQuest.run(uuidv4(), userId, quest.title, quest.description, quest.xp_reward, quest.category);
  }
}

export default router;
