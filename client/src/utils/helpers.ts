import type { PetRarity } from '../types';

export const calculateLevel = (totalXp: number): { level: number; currentXp: number; xpForNext: number } => {
  // XP formula: each level requires level * 100 XP
  let level = 1;
  let xpRemaining = totalXp;

  while (xpRemaining >= level * 100) {
    xpRemaining -= level * 100;
    level++;
  }

  return {
    level,
    currentXp: xpRemaining,
    xpForNext: level * 100,
  };
};

export const formatXp = (xp: number): string => {
  if (xp >= 1000000) {
    return `${(xp / 1000000).toFixed(1)}M`;
  }
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K`;
  }
  return xp.toString();
};

export const getRarityColor = (rarity: PetRarity): string => {
  switch (rarity) {
    case 'common':
      return '#9CA3AF'; // gray
    case 'rare':
      return '#3B82F6'; // blue
    case 'epic':
      return '#8B5CF6'; // purple
    case 'legendary':
      return '#F59E0B'; // gold
    default:
      return '#9CA3AF';
  }
};

export const getRarityStars = (rarity: PetRarity): number => {
  switch (rarity) {
    case 'common':
      return 1;
    case 'rare':
      return 2;
    case 'epic':
      return 3;
    case 'legendary':
      return 4;
    default:
      return 1;
  }
};

export const getTaiwanDate = (): string => {
  const now = new Date();
  // Taiwan is UTC+8
  const taiwanOffset = 8 * 60;
  const localOffset = now.getTimezoneOffset();
  const taiwanTime = new Date(now.getTime() + (taiwanOffset + localOffset) * 60 * 1000);
  return taiwanTime.toISOString().split('T')[0];
};

export const getTimeUntilMidnightTaiwan = (): { hours: number; minutes: number; seconds: number } => {
  const now = new Date();
  const taiwanOffset = 8 * 60;
  const localOffset = now.getTimezoneOffset();
  const taiwanTime = new Date(now.getTime() + (taiwanOffset + localOffset) * 60 * 1000);

  const midnight = new Date(taiwanTime);
  midnight.setHours(24, 0, 0, 0);

  const diff = midnight.getTime() - taiwanTime.getTime();

  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const getMotivationalQuote = (): string => {
  const quotes = [
    "每一次的努力都是成功的基石！💪",
    "成大心理系在等著你！🎓",
    "今天的汗水是明天的榮耀！✨",
    "堅持就是勝利！加油 Winnie！🌟",
    "學習是最好的投資！📚",
    "相信自己，你一定可以的！💖",
    "一步一步，終會到達目的地！🏆",
    "困難是暫時的，成長是永恆的！🌱",
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
};
