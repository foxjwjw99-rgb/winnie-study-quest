import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star } from 'lucide-react';
import type { Quest } from '../types';

interface QuestCardProps {
  quest: Quest;
  onComplete?: (questId: string) => void;
  index?: number;
  isLoading?: boolean;
}

const categoryEmojis: Record<string, string> = {
  study: '📖',
  review: '🔄',
  practice: '✍️',
  pomodoro: '🍅',
};

// Cute pastel backgrounds for icons
const categoryColors: Record<string, string> = {
  study: 'bg-blue-100 text-blue-500',
  review: 'bg-green-100 text-green-500',
  practice: 'bg-orange-100 text-orange-500',
  pomodoro: 'bg-red-100 text-red-500',
};

export const QuestCard: React.FC<QuestCardProps> = ({ quest, onComplete, index = 0, isLoading }) => {
  // Default to 'study' if category not found
  const categoryStyle = categoryColors[quest.category || 'study'] || categoryColors.study;
  const emoji = categoryEmojis[quest.category || 'study'] || '📝';

  return (
    <motion.div
      className={`relative card-cute p-4 flex items-center gap-4 ${
        quest.isCompleted ? 'opacity-60 grayscale-[0.5]' : ''
      }`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={!quest.isCompleted ? { scale: 1.02, y: -2 } : {}}
    >
      {/* Category Icon */}
      <div className={`w-12 h-12 rounded-[var(--radius-m)] ${categoryStyle} flex items-center justify-center text-2xl shadow-sm`}>
        {emoji}
      </div>

      {/* Quest Info */}
      <div className="flex-1 min-w-0">
        <h4 className={`font-bold text-lg truncate ${quest.isCompleted ? 'line-through text-gray-400' : 'text-[var(--text-main)]'}`}>
          {quest.title}
        </h4>
        {quest.description && (
          <p className="text-[var(--text-light)] text-sm mt-0.5 truncate">{quest.description}</p>
        )}
      </div>

      {/* Right Side: XP & Action */}
      <div className="flex flex-col items-end gap-2 min-w-[80px]">
        <div className="flex items-center gap-1 bg-yellow-50 border border-yellow-100 px-2 py-1 rounded-full">
          <Star size={14} className="text-yellow-500 fill-yellow-500" />
          <span className="text-yellow-600 font-extrabold text-xs">+{quest.xpReward || 50}</span>
        </div>

        {/* Complete Button */}
        {!quest.isCompleted && onComplete && (
          <motion.button
            onClick={() => onComplete(quest.id)}
            disabled={isLoading}
            className="flex items-center gap-1 bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white px-3 py-1.5 rounded-full text-xs font-bold transition-colors shadow-sm disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Check size={14} strokeWidth={3} />
            完成
          </motion.button>
        )}
      </div>

      {/* Completed Stamp */}
      {quest.isCompleted && (
        <motion.div
          className="absolute -right-2 -top-2 bg-green-100 text-green-600 p-1.5 rounded-full border-2 border-white shadow-md z-10"
          initial={{ scale: 0, rotate: 180 }}
          animate={{ scale: 1, rotate: 0 }}
        >
          <Check size={20} strokeWidth={3} />
        </motion.div>
      )}
    </motion.div>
  );
};
