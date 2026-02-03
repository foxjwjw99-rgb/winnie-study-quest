import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Target, Trophy, Cat, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PomodoroTimer } from '../components/PomodoroTimer';
import { QuestCard } from '../components/QuestCard';
import { getDailyQuests, completeQuest, getUserPets, addHatchProgress } from '../utils/api';
import { calculateLevel, getMotivationalQuote, getTimeUntilMidnightTaiwan } from '../utils/helpers';
import type { Quest, UserPet, Pet } from '../types';

export const HomePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [pets, setPets] = useState<(UserPet & { pet: Pet })[]>([]);
  const [quote] = useState(getMotivationalQuote());
  const [countdown, setCountdown] = useState(getTimeUntilMidnightTaiwan());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      Promise.all([
        getDailyQuests(user.id),
        getUserPets(user.id),
      ]).then(([questsData, petsData]) => {
        setQuests(questsData);
        setPets(petsData);
      }).finally(() => setLoading(false));
    }
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(getTimeUntilMidnightTaiwan());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCompleteQuest = async (questId: string) => {
    try {
      const { quest, user: updatedUser } = await completeQuest(questId);
      setQuests((prev) =>
        prev.map((q) => (q.id === questId ? quest : q))
      );
      updateUser(updatedUser);
    } catch (error) {
      console.error('Failed to complete quest:', error);
    }
  };

  const handlePomodoroComplete = async () => {
    // Add hatch progress to unhatched eggs
    const unhatched = pets.filter((p) => !p.isHatched);
    if (unhatched.length > 0 && user) {
      try {
        const updatedPet = await addHatchProgress(unhatched[0].id);
        setPets((prev) =>
          prev.map((p) => (p.id === updatedPet.id ? { ...p, ...updatedPet } : p))
        );
      } catch (error) {
        console.error('Failed to add hatch progress:', error);
      }
    }
  };

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div
          className="text-4xl"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          ⏳
        </motion.div>
      </div>
    );
  }

  const { level, currentXp, xpForNext } = calculateLevel(user.totalXp);
  const completedQuests = quests.filter((q) => q.isCompleted).length;
  const activePet = pets.find((p) => p.isHatched);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <motion.div
        className="bg-gradient-to-r from-purple-600/20 to-amber-600/20 rounded-2xl p-6 border border-purple-500/30"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              歡迎回來，{user.username}！ 👋
            </h2>
            <p className="text-purple-300">{quote}</p>
          </div>

          {/* Active Pet */}
          {activePet && (
            <motion.div
              className="text-5xl"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {activePet.pet.emoji}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4">
        <motion.div
          className="bg-[#1a1025] rounded-xl p-4 border border-purple-500/20"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Trophy className="text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">等級</p>
              <p className="text-2xl font-bold text-purple-300">Lv.{level}</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>{currentXp} XP</span>
              <span>{xpForNext} XP</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${(currentXp / xpForNext) * 100}%` }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-[#1a1025] rounded-xl p-4 border border-orange-500/20"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-500/20 rounded-xl">
              <Flame className="text-orange-400 fire-animation" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">連續學習</p>
              <p className="text-2xl font-bold text-orange-300">{user.streak} 天</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-[#1a1025] rounded-xl p-4 border border-green-500/20"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <Target className="text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">今日任務</p>
              <p className="text-2xl font-bold text-green-300">
                {completedQuests}/{quests.length}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-[#1a1025] rounded-xl p-4 border border-pink-500/20"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-pink-500/20 rounded-xl">
              <Cat className="text-pink-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">寵物收集</p>
              <p className="text-2xl font-bold text-pink-300">
                {pets.filter((p) => p.isHatched).length}/8
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Pomodoro Timer */}
        <div className="col-span-1">
          <PomodoroTimer onPomodoroComplete={handlePomodoroComplete} />

          {/* Quest Reset Countdown */}
          <motion.div
            className="mt-4 bg-[#1a1025] rounded-xl p-4 border border-purple-500/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Clock size={16} />
              <span className="text-sm">任務重置倒數</span>
            </div>
            <p className="text-xl font-mono text-purple-300">
              {String(countdown.hours).padStart(2, '0')}:
              {String(countdown.minutes).padStart(2, '0')}:
              {String(countdown.seconds).padStart(2, '0')}
            </p>
          </motion.div>
        </div>

        {/* Daily Quests */}
        <div className="col-span-2">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Target className="text-purple-400" />
            今日任務
          </h3>
          <div className="space-y-3">
            {quests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                載入中...
              </div>
            ) : (
              quests.map((quest) => (
                <QuestCard
                  key={quest.id}
                  quest={quest}
                  onComplete={handleCompleteQuest}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
