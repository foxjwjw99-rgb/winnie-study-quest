import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import type { Quest } from '../types';

interface QuestCardProps {
  quest: Quest;
  onComplete: (questId: string) => void;
  isLoading?: boolean;
}

const categoryEmojis: Record<string, string> = {
  study: '📖',
  review: '🔄',
  practice: '✍️',
  pomodoro: '🍅',
};

const categoryColors: Record<string, string> = {
  study: 'from-blue-500 to-blue-600',
  review: 'from-green-500 to-green-600',
  practice: 'from-orange-500 to-orange-600',
  pomodoro: 'from-red-500 to-red-600',
};

export const QuestCard: React.FC<QuestCardProps> = ({ quest, onComplete, isLoading }) => {
  return (
    <motion.div
      className={`relative bg-[#1a1025] rounded-xl p-4 border transition-all ${
        quest.isCompleted
          ? 'border-green-500/30 opacity-60'
          : 'border-purple-500/20 hover:border-purple-500/40'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: quest.isCompleted ? 1 : 1.02 }}
    >
      <div className="flex items-start gap-4">
        {/* Category Icon */}
        <div
          className={`w-12 h-12 rounded-lg bg-gradient-to-br ${
            categoryColors[quest.category]
          } flex items-center justify-center text-2xl`}
        >
          {categoryEmojis[quest.category]}
        </div>

        {/* Quest Info */}
        <div className="flex-1">
          <h4 className={`font-semibold ${quest.isCompleted ? 'line-through text-gray-500' : 'text-white'}`}>
            {quest.title}
          </h4>
          <p className="text-gray-400 text-sm mt-1">{quest.description}</p>
        </div>

        {/* XP Reward */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-1 bg-amber-500/20 px-2 py-1 rounded-full">
            <Star size={14} className="text-amber-400" />
            <span className="text-amber-400 font-bold text-sm">+{quest.xpReward} XP</span>
          </div>

          {/* Complete Button */}
          {!quest.isCompleted && (
            <motion.button
              onClick={() => onComplete(quest.id)}
              disabled={isLoading}
              className="flex items-center gap-1 bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Check size={16} />
              完成
            </motion.button>
          )}
        </div>
      </div>

      {/* Completed Badge */}
      {quest.isCompleted && (
        <motion.div
          className="absolute top-2 right-2"
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
        >
          <div className="bg-green-500 text-white p-1 rounded-full">
            <Check size={16} />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
