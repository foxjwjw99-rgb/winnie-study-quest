import { v4 as uuidv4 } from 'uuid';
import db from './database';

export function getTaiwanDate(): string {
  const now = new Date();
  // Taiwan is UTC+8
  const taiwanOffset = 8 * 60;
  const localOffset = now.getTimezoneOffset();
  const taiwanTime = new Date(now.getTime() + (taiwanOffset + localOffset) * 60 * 1000);
  return taiwanTime.toISOString().split('T')[0];
}

export function updateStreak(userId: string): void {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
  if (!user) return;

  const today = getTaiwanDate();
  const lastStudyDate = user.last_study_date;

  let newStreak = user.streak;

  if (!lastStudyDate) {
    // First study day
    newStreak = 1;
  } else {
    const last = new Date(lastStudyDate);
    const current = new Date(today);
    const diffDays = Math.floor((current.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Same day, no change
    } else if (diffDays === 1) {
      // Consecutive day
      newStreak = user.streak + 1;
    } else {
      // Streak broken
      newStreak = 1;
    }
  }

  db.prepare(`
    UPDATE users SET streak = ?, last_study_date = ?
    WHERE id = ?
  `).run(newStreak, today, userId);
}

export function checkAndGrantAchievements(userId: string): any[] {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
  if (!user) return [];

  const achievements = db.prepare('SELECT * FROM achievements').all() as any[];
  const userAchievements = db.prepare('SELECT achievement_id FROM user_achievements WHERE user_id = ?').all(userId) as any[];
  const unlockedIds = new Set(userAchievements.map(ua => ua.achievement_id));

  const newAchievements: any[] = [];

  // Get stats for checking
  const questsCompleted = (db.prepare('SELECT COUNT(*) as count FROM quests WHERE user_id = ? AND is_completed = 1').get(userId) as any).count;
  const petsHatched = (db.prepare('SELECT COUNT(*) as count FROM user_pets WHERE user_id = ? AND is_hatched = 1').get(userId) as any).count;
  const bossesDefeated = (db.prepare('SELECT COUNT(*) as count FROM boss_battles WHERE user_id = ? AND is_defeated = 1').get(userId) as any).count;

  for (const achievement of achievements) {
    if (unlockedIds.has(achievement.id)) continue;

    let shouldUnlock = false;

    switch (achievement.type) {
      case 'streak':
        shouldUnlock = user.streak >= achievement.requirement;
        break;
      case 'xp':
        shouldUnlock = user.total_xp >= achievement.requirement;
        break;
      case 'quests':
        shouldUnlock = questsCompleted >= achievement.requirement;
        break;
      case 'pets':
        shouldUnlock = petsHatched >= achievement.requirement;
        break;
      case 'boss':
        shouldUnlock = bossesDefeated >= achievement.requirement;
        break;
    }

    if (shouldUnlock) {
      db.prepare(`
        INSERT INTO user_achievements (id, user_id, achievement_id, unlocked_at)
        VALUES (?, ?, ?, datetime('now'))
      `).run(uuidv4(), userId, achievement.id);

      // Grant XP reward
      db.prepare('UPDATE users SET xp = xp + ?, total_xp = total_xp + ? WHERE id = ?')
        .run(achievement.xp_reward, achievement.xp_reward, userId);

      newAchievements.push({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        xpReward: achievement.xp_reward,
      });
    }
  }

  return newAchievements;
}
