import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { AchievementBadge } from '../components/AchievementBadge';
import { getAllAchievements, getUserAchievements } from '../utils/api';
import type { Achievement, UserAchievement } from '../types';

export const AchievementsPage: React.FC = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      Promise.all([getAllAchievements(), getUserAchievements(user.id)])
        .then(([allAch, userAch]) => {
          setAchievements(allAch);
          setUserAchievements(userAch);
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (!user) return null;

  const unlockedCount = userAchievements.length;
  const totalCount = achievements.length;
  const unlockedAchievementIds = new Set(userAchievements.map((ua) => ua.achievementId));

  const groupedAchievements = {
    streak: achievements.filter((a) => a.type === 'streak'),
    xp: achievements.filter((a) => a.type === 'xp'),
    quests: achievements.filter((a) => a.type === 'quests'),
    pets: achievements.filter((a) => a.type === 'pets'),
    boss: achievements.filter((a) => a.type === 'boss'),
  };

  const typeLabels: Record<string, { label: string; icon: string }> = {
    streak: { label: '連續學習', icon: '🔥' },
    xp: { label: '經驗累積', icon: '✨' },
    quests: { label: '任務達人', icon: '📋' },
    pets: { label: '寵物收集', icon: '🐾' },
    boss: { label: 'Boss挑戰', icon: '⚔️' },
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="text-amber-400" size={32} />
          <div>
            <h1 className="text-2xl font-bold text-white">成就系統</h1>
            <p className="text-gray-400">
              解鎖 {unlockedCount}/{totalCount} 個成就
            </p>
          </div>
        </div>

        {/* Progress Ring */}
        <div className="relative w-20 h-20">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r="35"
              fill="none"
              stroke="#2d1f3d"
              strokeWidth="6"
            />
            <motion.circle
              cx="40"
              cy="40"
              r="35"
              fill="none"
              stroke="#F59E0B"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={220}
              initial={{ strokeDashoffset: 220 }}
              animate={{
                strokeDashoffset: 220 - (220 * unlockedCount) / Math.max(totalCount, 1),
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-amber-400 font-bold text-lg">
              {Math.round((unlockedCount / Math.max(totalCount, 1)) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <motion.div
            className="text-4xl"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            ⏳
          </motion.div>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedAchievements).map(([type, achs]) => {
            if (achs.length === 0) return null;

            const typeInfo = typeLabels[type];
            const unlockedInCategory = achs.filter((a) =>
              unlockedAchievementIds.has(a.id)
            ).length;

            return (
              <div key={type}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <span>{typeInfo.icon}</span>
                    {typeInfo.label}
                  </h3>
                  <span className="text-gray-400 text-sm">
                    {unlockedInCategory}/{achs.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {achs.map((achievement) => {
                    const unlocked = userAchievements.find(
                      (ua) => ua.achievementId === achievement.id
                    );

                    return (
                      <AchievementBadge
                        key={achievement.id}
                        achievement={achievement}
                        unlocked={unlocked}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Total XP from Achievements */}
      <motion.div
        className="mt-8 bg-[#1a1025] rounded-xl p-6 border border-amber-500/30 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <p className="text-gray-400 mb-2">成就獎勵總計</p>
        <p className="text-3xl font-bold text-amber-400">
          +{userAchievements.reduce((acc, ua) => {
            const ach = achievements.find((a) => a.id === ua.achievementId);
            return acc + (ach?.xpReward || 0);
          }, 0)} XP
        </p>
      </motion.div>
    </div>
  );
};
