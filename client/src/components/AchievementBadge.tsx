import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import type { Achievement, UserAchievement } from '../types';

interface AchievementBadgeProps {
  achievement: Achievement;
  unlocked?: UserAchievement;
}

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({
  achievement,
  unlocked,
}) => {
  const isUnlocked = !!unlocked;

  return (
    <motion.div
      className={`relative bg-[#1a1025] rounded-xl p-4 border transition-all ${
        isUnlocked
          ? 'border-amber-500/40 glow-gold'
          : 'border-gray-700/40 opacity-60'
      }`}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div
          className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl ${
            isUnlocked
              ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/20'
              : 'bg-gray-800'
          }`}
        >
          {isUnlocked ? (
            <motion.span
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {achievement.icon}
            </motion.span>
          ) : (
            <Lock className="text-gray-600" size={24} />
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h4 className={`font-semibold ${isUnlocked ? 'text-amber-300' : 'text-gray-500'}`}>
            {achievement.name}
          </h4>
          <p className="text-gray-400 text-sm mt-1">{achievement.description}</p>

          {isUnlocked && unlocked && (
            <p className="text-xs text-gray-500 mt-2">
              解鎖於 {new Date(unlocked.unlockedAt).toLocaleDateString('zh-TW')}
            </p>
          )}
        </div>

        {/* XP Reward */}
        <div className={`text-right ${isUnlocked ? 'text-amber-400' : 'text-gray-600'}`}>
          <span className="font-bold">+{achievement.xpReward}</span>
          <span className="text-sm"> XP</span>
        </div>
      </div>

      {/* Unlocked Shine Effect */}
      {isUnlocked && (
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-amber-500/10 to-transparent"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
        />
      )}
    </motion.div>
  );
};
