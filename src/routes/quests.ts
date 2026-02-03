import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database';
import { checkAndGrantAchievements, updateStreak, getTaiwanDate } from '../utils';

const router = Router();

// Get daily quests for user
router.get('/:userId/daily', (req, res) => {
  const { userId } = req.params;
  const today = getTaiwanDate();

  // Get today's quests
  let quests = db.prepare(`
    SELECT * FROM quests
    WHERE user_id = ? AND date(created_at) = date(?)
    ORDER BY created_at ASC
  `).all(userId, today) as any[];

  // If no quests for today, create default ones
  if (quests.length === 0) {
    createDailyQuests(userId);
    quests = db.prepare(`
      SELECT * FROM quests
      WHERE user_id = ? AND date(created_at) = date(?)
      ORDER BY created_at ASC
    `).all(userId, today) as any[];
  }

  res.json(quests.map(q => ({
    id: q.id,
    userId: q.user_id,
    title: q.title,
    description: q.description,
    xpReward: q.xp_reward,
    category: q.category,
    isCompleted: Boolean(q.is_completed),
    createdAt: q.created_at,
    completedAt: q.completed_at,
  })));
});

// Add custom quest
router.post('/:userId', (req, res) => {
  const { userId } = req.params;
  const { title, description, xpReward, category } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO quests (id, user_id, title, description, xp_reward, category, is_completed, created_at)
    VALUES (?, ?, ?, ?, ?, ?, 0, datetime('now'))
  `).run(id, userId, title, description || '', xpReward || 50, category || 'study');

  const quest = db.prepare('SELECT * FROM quests WHERE id = ?').get(id) as any;

  res.json({
    id: quest.id,
    userId: quest.user_id,
    title: quest.title,
    description: quest.description,
    xpReward: quest.xp_reward,
    category: quest.category,
    isCompleted: Boolean(quest.is_completed),
    createdAt: quest.created_at,
    completedAt: quest.completed_at,
  });
});

// Complete quest
router.post('/:questId/complete', (req, res) => {
  const { questId } = req.params;

  const quest = db.prepare('SELECT * FROM quests WHERE id = ?').get(questId) as any;

  if (!quest) {
    return res.status(404).json({ error: 'Quest not found' });
  }

  if (quest.is_completed) {
    return res.status(400).json({ error: 'Quest already completed' });
  }

  // Mark quest as completed
  db.prepare(`
    UPDATE quests SET is_completed = 1, completed_at = datetime('now')
    WHERE id = ?
  `).run(questId);

  // Get user and update XP
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(quest.user_id) as any;
  const newXp = user.xp + quest.xp_reward;
  const newTotalXp = user.total_xp + quest.xp_reward;

  // Calculate new level
  let level = 1;
  let xpForLeveling = newTotalXp;
  while (xpForLeveling >= level * 100) {
    xpForLeveling -= level * 100;
    level++;
  }

  // Update user
  db.prepare(`
    UPDATE users SET xp = ?, total_xp = ?, level = ?
    WHERE id = ?
  `).run(newXp, newTotalXp, level, quest.user_id);

  // Update streak
  updateStreak(quest.user_id);

  // Update daily stats
  const today = getTaiwanDate();
  db.prepare(`
    INSERT INTO daily_stats (id, user_id, date, quests_completed, xp_earned, pomodoros_completed)
    VALUES (?, ?, ?, 1, ?, 0)
    ON CONFLICT(user_id, date) DO UPDATE SET
      quests_completed = quests_completed + 1,
      xp_earned = xp_earned + ?
  `).run(uuidv4(), quest.user_id, today, quest.xp_reward, quest.xp_reward);

  // Check achievements
  const newAchievements = checkAndGrantAchievements(quest.user_id);

  // Get updated user and quest
  const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(quest.user_id) as any;
  const updatedQuest = db.prepare('SELECT * FROM quests WHERE id = ?').get(questId) as any;

  res.json({
    quest: {
      id: updatedQuest.id,
      userId: updatedQuest.user_id,
      title: updatedQuest.title,
      description: updatedQuest.description,
      xpReward: updatedQuest.xp_reward,
      category: updatedQuest.category,
      isCompleted: Boolean(updatedQuest.is_completed),
      createdAt: updatedQuest.created_at,
      completedAt: updatedQuest.completed_at,
    },
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
    newAchievements,
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
