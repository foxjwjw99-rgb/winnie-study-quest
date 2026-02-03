import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database';
import { checkAndGrantAchievements, getTaiwanDate } from '../utils';

const router = Router();

const bossNames = [
  '心理學原理魔王',
  '統計學惡龍',
  '實驗設計巨人',
  '普通心理學守護者',
  '發展心理學精靈',
  '社會心理學幽靈',
];

// Get current boss for user
router.get('/:userId/current', (req, res) => {
  const { userId } = req.params;

  const today = getTaiwanDate();
  const currentMonth = today.substring(0, 7); // YYYY-MM

  let boss = db.prepare(`
    SELECT * FROM boss_battles
    WHERE user_id = ? AND month = ?
  `).get(userId, currentMonth) as any;

  if (!boss) {
    // Create new boss for this month
    const bossName = bossNames[Math.floor(Math.random() * bossNames.length)];
    const bossHp = 500; // Base HP
    const id = uuidv4();

    db.prepare(`
      INSERT INTO boss_battles (id, user_id, boss_name, boss_hp, current_hp, month, is_defeated, rewards)
      VALUES (?, ?, ?, ?, ?, ?, 0, 0)
    `).run(id, userId, bossName, bossHp, bossHp, currentMonth);

    boss = db.prepare('SELECT * FROM boss_battles WHERE id = ?').get(id) as any;
  }

  res.json({
    id: boss.id,
    userId: boss.user_id,
    bossName: boss.boss_name,
    bossHp: boss.boss_hp,
    currentHp: boss.current_hp,
    month: boss.month,
    isDefeated: Boolean(boss.is_defeated),
    rewards: boss.rewards,
  });
});

// Attack boss
router.post('/:userId/attack', (req, res) => {
  const { userId } = req.params;
  const { damage } = req.body;

  const today = getTaiwanDate();
  const currentMonth = today.substring(0, 7);

  const boss = db.prepare(`
    SELECT * FROM boss_battles
    WHERE user_id = ? AND month = ? AND is_defeated = 0
  `).get(userId, currentMonth) as any;

  if (!boss) {
    return res.status(404).json({ error: 'No active boss battle' });
  }

  const newHp = Math.max(boss.current_hp - (damage || 10), 0);
  const isDefeated = newHp === 0;
  const rewards = isDefeated ? 500 : 0; // XP reward for defeating boss

  db.prepare(`
    UPDATE boss_battles
    SET current_hp = ?, is_defeated = ?, rewards = ?
    WHERE id = ?
  `).run(newHp, isDefeated ? 1 : 0, rewards, boss.id);

  if (isDefeated) {
    // Grant XP reward
    db.prepare('UPDATE users SET xp = xp + ?, total_xp = total_xp + ? WHERE id = ?')
      .run(rewards, rewards, userId);

    // Check boss achievements
    checkAndGrantAchievements(userId);
  }

  const updatedBoss = db.prepare('SELECT * FROM boss_battles WHERE id = ?').get(boss.id) as any;

  res.json({
    boss: {
      id: updatedBoss.id,
      userId: updatedBoss.user_id,
      bossName: updatedBoss.boss_name,
      bossHp: updatedBoss.boss_hp,
      currentHp: updatedBoss.current_hp,
      month: updatedBoss.month,
      isDefeated: Boolean(updatedBoss.is_defeated),
      rewards: updatedBoss.rewards,
    },
    rewards: isDefeated ? rewards : undefined,
  });
});

// Get boss history
router.get('/:userId/history', (req, res) => {
  const { userId } = req.params;

  const bosses = db.prepare(`
    SELECT * FROM boss_battles
    WHERE user_id = ?
    ORDER BY month DESC
  `).all(userId) as any[];

  res.json(bosses.map(b => ({
    id: b.id,
    userId: b.user_id,
    bossName: b.boss_name,
    bossHp: b.boss_hp,
    currentHp: b.current_hp,
    month: b.month,
    isDefeated: Boolean(b.is_defeated),
    rewards: b.rewards,
  })));
});

export default router;
