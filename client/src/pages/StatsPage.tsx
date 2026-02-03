import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3, Clock, Target, Trophy, Cat, Swords, Flame, TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getStats, getDailyStatsHistory } from '../utils/api';
import { calculateLevel } from '../utils/helpers';
import type { StudyStats, DailyStats } from '../types';

export const StatsPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<StudyStats | null>(null);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      Promise.all([getStats(user.id), getDailyStatsHistory(user.id, 7)])
        .then(([s, ds]) => {
          setStats(s);
          setDailyStats(ds);
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  if (!user) return null;

  const { level } = calculateLevel(user.totalXp);

  const statCards = stats ? [
    {
      icon: Clock,
      label: '總學習時間',
      value: `${Math.floor(stats.totalStudyTime / 60)}h ${stats.totalStudyTime % 60}m`,
      color: 'blue',
    },
    {
      icon: Target,
      label: '完成任務',
      value: stats.questsCompleted,
      color: 'green',
    },
    {
      icon: Trophy,
      label: '番茄鐘',
      value: stats.pomodorosCompleted,
      color: 'red',
    },
    {
      icon: Swords,
      label: 'Boss擊敗',
      value: stats.bossesDefeated,
      color: 'orange',
    },
    {
      icon: Cat,
      label: '寵物收集',
      value: `${stats.petsCollected}/8`,
      color: 'pink',
    },
    {
      icon: Flame,
      label: '最長連續',
      value: `${stats.longestStreak}天`,
      color: 'amber',
    },
  ] : [];

  const maxXp = Math.max(...dailyStats.map((d) => d.xpEarned), 1);

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="text-purple-400" size={32} />
        <div>
          <h1 className="text-2xl font-bold text-white">學習統計</h1>
          <p className="text-gray-400">追蹤你的學習進度</p>
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
        <>
          {/* Overview Card */}
          <motion.div
            className="bg-gradient-to-r from-purple-600/20 to-amber-600/20 rounded-2xl p-6 border border-purple-500/30 mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 mb-1">總經驗值</p>
                <p className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">
                  {user.totalXp.toLocaleString()} XP
                </p>
                <p className="text-purple-300 mt-1">等級 {level}</p>
              </div>

              <div className="text-center">
                <motion.div
                  className="text-6xl mb-2"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎓
                </motion.div>
                <p className="text-gray-400 text-sm">成大心理系</p>
                <p className="text-purple-300 text-sm">轉學考備戰中</p>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                className={`bg-[#1a1025] rounded-xl p-4 border border-${stat.color}-500/20`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-3 bg-${stat.color}-500/20 rounded-xl`}>
                    <stat.icon className={`text-${stat.color}-400`} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                    <p className={`text-2xl font-bold text-${stat.color}-300`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Weekly Chart */}
          <motion.div
            className="bg-[#1a1025] rounded-2xl p-6 border border-purple-500/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="text-purple-400" />
              <h3 className="text-lg font-semibold text-white">過去7天 XP</h3>
            </div>

            <div className="flex items-end justify-between h-48 gap-2">
              {dailyStats.map((day, index) => {
                const height = (day.xpEarned / maxXp) * 100;
                const date = new Date(day.date);
                const dayName = date.toLocaleDateString('zh-TW', { weekday: 'short' });

                return (
                  <motion.div
                    key={day.date}
                    className="flex-1 flex flex-col items-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="text-xs text-amber-400 mb-1">
                      {day.xpEarned > 0 ? `+${day.xpEarned}` : '0'}
                    </div>
                    <motion.div
                      className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg"
                      initial={{ height: 0 }}
                      animate={{ height: `${Math.max(height, 5)}%` }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    />
                    <div className="text-xs text-gray-500 mt-2">{dayName}</div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Daily Stats Details */}
          <motion.div
            className="mt-6 bg-[#1a1025] rounded-2xl p-6 border border-purple-500/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="text-lg font-semibold text-white mb-4">每日詳情</h3>
            <div className="space-y-3">
              {dailyStats.map((day) => {
                const date = new Date(day.date);
                const dateStr = date.toLocaleDateString('zh-TW', {
                  month: 'short',
                  day: 'numeric',
                  weekday: 'short',
                });

                return (
                  <div
                    key={day.date}
                    className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0"
                  >
                    <span className="text-gray-300">{dateStr}</span>
                    <div className="flex items-center gap-6 text-sm">
                      <span className="text-green-400">
                        <Target size={14} className="inline mr-1" />
                        {day.questsCompleted} 任務
                      </span>
                      <span className="text-red-400">
                        🍅 {day.pomodorosCompleted}
                      </span>
                      <span className="text-amber-400 font-bold">
                        +{day.xpEarned} XP
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Motivation */}
          <motion.div
            className="mt-6 text-center py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="text-gray-400">
              📚 持續努力，成大心理系在等著你！加油 Winnie！ 💪
            </p>
          </motion.div>
        </>
      )}
    </div>
  );
};
