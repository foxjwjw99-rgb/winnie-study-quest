import axios from 'axios';
import type {
  User, Quest, Achievement, UserAchievement, ShopItem,
  UserItem, Pet, UserPet, BossBattle, StudyStats, DailyStats
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth
export const login = async (username: string): Promise<User> => {
  const { data } = await api.post('/auth/login', { username });
  return data;
};

export const getUser = async (userId: string): Promise<User> => {
  const { data } = await api.get(`/users/${userId}`);
  return data;
};

// Quests
export const getDailyQuests = async (userId: string): Promise<Quest[]> => {
  const { data } = await api.get(`/quests/${userId}/daily`);
  return data;
};

export const completeQuest = async (questId: string): Promise<{ quest: Quest; user: User; newAchievements: Achievement[] }> => {
  const { data } = await api.post(`/quests/${questId}/complete`);
  return data;
};

export const addCustomQuest = async (userId: string, quest: Partial<Quest>): Promise<Quest> => {
  const { data } = await api.post(`/quests/${userId}`, quest);
  return data;
};

// Achievements
export const getAllAchievements = async (): Promise<Achievement[]> => {
  const { data } = await api.get('/achievements');
  return data;
};

export const getUserAchievements = async (userId: string): Promise<UserAchievement[]> => {
  const { data } = await api.get(`/achievements/${userId}`);
  return data;
};

// Shop
export const getShopItems = async (): Promise<ShopItem[]> => {
  const { data } = await api.get('/shop');
  return data;
};

export const purchaseItem = async (userId: string, itemId: string): Promise<{ user: User; item: UserItem }> => {
  const { data } = await api.post(`/shop/${userId}/purchase`, { itemId });
  return data;
};

export const getUserItems = async (userId: string): Promise<(UserItem & { item: ShopItem })[]> => {
  const { data } = await api.get(`/shop/${userId}/items`);
  return data;
};

// Pets
export const getAllPets = async (): Promise<Pet[]> => {
  const { data } = await api.get('/pets');
  return data;
};

export const getUserPets = async (userId: string): Promise<(UserPet & { pet: Pet })[]> => {
  const { data } = await api.get(`/pets/${userId}`);
  return data;
};

export const openEgg = async (userId: string, rarity: string): Promise<{ userPet: UserPet; pet: Pet }> => {
  const { data } = await api.post(`/pets/${userId}/open-egg`, { rarity });
  return data;
};

export const hatchPet = async (userPetId: string): Promise<UserPet> => {
  const { data } = await api.post(`/pets/${userPetId}/hatch`);
  return data;
};

export const interactWithPet = async (userPetId: string, action: 'feed' | 'pat' | 'play'): Promise<UserPet> => {
  const { data } = await api.post(`/pets/${userPetId}/interact`, { action });
  return data;
};

export const addHatchProgress = async (userPetId: string): Promise<UserPet> => {
  const { data } = await api.post(`/pets/${userPetId}/hatch-progress`);
  return data;
};

// Boss Battles
export const getCurrentBoss = async (userId: string): Promise<BossBattle | null> => {
  const { data } = await api.get(`/boss/${userId}/current`);
  return data;
};

export const attackBoss = async (userId: string, damage: number): Promise<{ boss: BossBattle; rewards?: number }> => {
  const { data } = await api.post(`/boss/${userId}/attack`, { damage });
  return data;
};

export const getBossHistory = async (userId: string): Promise<BossBattle[]> => {
  const { data } = await api.get(`/boss/${userId}/history`);
  return data;
};

// Stats
export const getStats = async (userId: string): Promise<StudyStats> => {
  const { data } = await api.get(`/stats/${userId}`);
  return data;
};

export const getDailyStatsHistory = async (userId: string, days: number = 7): Promise<DailyStats[]> => {
  const { data } = await api.get(`/stats/${userId}/daily?days=${days}`);
  return data;
};

// Pomodoro
export const completePomodoro = async (userId: string): Promise<{ user: User; xpGained: number }> => {
  const { data } = await api.post(`/pomodoro/${userId}/complete`);
  return data;
};

export default api;
