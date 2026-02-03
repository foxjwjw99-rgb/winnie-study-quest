import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, SkipForward, Coffee } from 'lucide-react';
import { usePomodoro } from '../hooks/usePomodoro';
import { formatTime } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { completePomodoro } from '../utils/api';

interface PomodoroTimerProps {
  onPomodoroComplete?: () => void;
}

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ onPomodoroComplete }) => {
  const { user, updateUser } = useAuth();

  const handleComplete = async () => {
    if (!user) return;
    try {
      const { user: updatedUser } = await completePomodoro(user.id);
      updateUser(updatedUser);
      onPomodoroComplete?.();
    } catch (error) {
      console.error('Failed to complete pomodoro:', error);
    }
  };

  const {
    timeLeft,
    isRunning,
    isBreak,
    completedPomodoros,
    start,
    pause,
    reset,
    skip,
  } = usePomodoro({ onComplete: handleComplete });

  const progress = isBreak
    ? (timeLeft / (5 * 60)) * 100
    : (timeLeft / (25 * 60)) * 100;

  return (
    <motion.div
      className="bg-[#1a1025] rounded-2xl p-6 border border-purple-500/20 glow-purple"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      <div className="text-center">
        <h3 className="text-lg font-semibold text-purple-300 mb-4 flex items-center justify-center gap-2">
          {isBreak ? (
            <>
              <Coffee className="text-amber-400" />
              休息時間
            </>
          ) : (
            <>
              🍅 番茄鐘
            </>
          )}
        </h3>

        {/* Timer Circle */}
        <div className="relative w-48 h-48 mx-auto mb-6">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="#2d1f3d"
              strokeWidth="8"
            />
            <motion.circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke={isBreak ? '#F59E0B' : '#8B5CF6'}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={553}
              strokeDashoffset={553 - (553 * progress) / 100}
              initial={{ strokeDashoffset: 553 }}
              animate={{ strokeDashoffset: 553 - (553 * progress) / 100 }}
              transition={{ duration: 0.5 }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.span
                key={timeLeft}
                className="text-4xl font-bold text-white"
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
              >
                {formatTime(timeLeft)}
              </motion.span>
            </AnimatePresence>
            <span className="text-gray-400 text-sm mt-1">
              {isBreak ? '休息中...' : '專注學習！'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-3 mb-4">
          <motion.button
            onClick={reset}
            className="p-3 bg-gray-700 rounded-full text-gray-300 hover:bg-gray-600 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw size={20} />
          </motion.button>

          <motion.button
            onClick={isRunning ? pause : start}
            className={`p-4 rounded-full text-white ${
              isRunning
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-purple-500 hover:bg-purple-600'
            } transition-colors`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {isRunning ? <Pause size={24} /> : <Play size={24} />}
          </motion.button>

          <motion.button
            onClick={skip}
            className="p-3 bg-gray-700 rounded-full text-gray-300 hover:bg-gray-600 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <SkipForward size={20} />
          </motion.button>
        </div>

        {/* Completed Count */}
        <div className="flex items-center justify-center gap-1 text-gray-400">
          <span>今日完成:</span>
          <span className="text-amber-400 font-bold">{completedPomodoros}</span>
          <span>🍅</span>
        </div>
      </div>
    </motion.div>
  );
};
