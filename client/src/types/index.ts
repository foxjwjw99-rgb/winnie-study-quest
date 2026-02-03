export interface User {
  id: string;
  username: string;
  level: number;
  xp: number;
  totalXp: number;
  streak: number;
  lastStudyDate: string | null;
  createdAt: string;
}

export interface Quest {
  id: string;
  userId: string;
  title: string;
  description: string;
  xpReward: number;
  category: 'study' | 'review' | 'practice' | 'pomodoro';
  isCompleted: boolean;
  createdAt: string;
  completedAt: string | null;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: number;
  type: 'streak' | 'xp' | 'quests' | 'pets' | 'boss';
  xpReward: number;
}

export interface UserAchievement {
  id: string;
  achievementId: string;
  userId: string;
  unlockedAt: string;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  type: 'egg' | 'food' | 'toy' | 'boost';
  rarity?: PetRarity;
}

export interface UserItem {
  id: string;
  userId: string;
  itemId: string;
  quantity: number;
}

export type PetRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Pet {
  id: string;
  name: string;
  emoji: string;
  description: string;
  rarity: PetRarity;
  subject: string;
}

export interface UserPet {
  id: string;
  petId: string;
  userId: string;
  level: number;
  exp: number;
  happiness: number;
  isHatched: boolean;
  hatchProgress: number;
  acquiredAt: string;
  lastInteraction: string | null;
}

export interface BossBattle {
  id: string;
  userId: string;
  bossName: string;
  bossHp: number;
  currentHp: number;
  month: string;
  isDefeated: boolean;
  rewards: number;
}

export interface StudyStats {
  totalStudyTime: number;
  questsCompleted: number;
  pomodorosCompleted: number;
  bossesDefeated: number;
  petsCollected: number;
  achievementsUnlocked: number;
  currentStreak: number;
  longestStreak: number;
}

export interface DailyStats {
  date: string;
  questsCompleted: number;
  xpEarned: number;
  pomodorosCompleted: number;
}
