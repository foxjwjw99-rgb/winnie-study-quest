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
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-500',
      textColor: 'text-blue-600',
    },
    {
      icon: Target,
      label: '完成任務',
      value: stats.questsCompleted,
      color: 'green',
      bgColor: 'bg-green-100',
      iconColor: 'text-green-500',
      textColor: 'text-green-600',
    },
    {
      icon: Trophy,
      label: '番茄鐘',
      value: stats.pomodorosCompleted,
      color: 'red',
      bgColor: 'bg-red-100',
      iconColor: 'text-red-500',
      textColor: 'text-red-600',
    },
    {
      icon: Swords,
      label: 'Boss擊敗',
      value: stats.bossesDefeated,
      color: 'orange',
      bgColor: 'bg-orange-100',
      iconColor: 'text-orange-500',
      textColor: 'text-orange-600',
    },
    {
      icon: Cat,
      label: '寵物收集',
      value: `${stats.petsCollected}/8`,
      color: 'pink',
      bgColor: 'bg-pink-100',
      iconColor: 'text-pink-500',
      textColor: 'text-pink-600',
    },
    {
      icon: Flame,
      label: '最長連續',
      value: `${stats.longestStreak}天`,
      color: 'amber',
      bgColor: 'bg-amber-100',
      iconColor: 'text-amber-500',
      textColor: 'text-amber-600',
    },
  ] : [];

  const maxXp = Math.max(...dailyStats.map((d) => d.xpEarned), 1);

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 mt-4">
        <BarChart3 className="text-pink-500" size={32} />
        <div>
          <h1 className="text-2xl font-bold text-gray-800">學習統計</h1>
          <p className="text-gray-500">追蹤你的學習進度</p>
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
            className="bg-gradient-to-r from-pink-100 to-orange-100 rounded-2xl p-6 border border-pink-200 mb-6 shadow-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 mb-1 font-medium">總經驗值</p>
                <p className="text-4xl font-bold text-pink-600">
                  {user.totalXp.toLocaleString()} XP
                </p>
                <p className="text-pink-500 mt-1 font-medium">等級 {level}</p>
              </div>

              <div className="text-center">
                <motion.div
                  className="text-6xl mb-2"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  🎓
                </motion.div>
                <p className="text-gray-600 text-sm font-medium">成大心理系</p>
                <p className="text-pink-500 text-sm">轉學考備戰中</p>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-3 ${stat.bgColor} rounded-xl`}>
                    <stat.icon className={stat.iconColor} size={24} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">{stat.label}</p>
                    <p className={`text-xl font-bold ${stat.textColor}`}>
                      {stat.value}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Weekly Chart */}
          <motion.div
            className="bg-white rounded-2xl p-6 border border-pink-100 shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="text-pink-500" />
              <h3 className="text-lg font-semibold text-gray-800">過去7天 XP</h3>
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
                    <div className="text-xs text-orange-500 mb-1 font-medium">
                      {day.xpEarned > 0 ? `+${day.xpEarned}` : '0'}
                    </div>
                    <motion.div
                      className="w-full bg-gradient-to-t from-pink-400 to-pink-300 rounded-t-lg"
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
            className="mt-6 bg-white rounded-2xl p-6 border border-pink-100 shadow-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="text-lg font-semibold text-gray-800 mb-4">每日詳情</h3>
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
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-gray-600 font-medium">{dateStr}</span>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                        <Target size={14} className="inline mr-1" />
                        {day.questsCompleted} 任務
                      </span>
                      <span className="text-red-500 bg-red-50 px-2 py-1 rounded-lg">
                        🍅 {day.pomodorosCompleted}
                      </span>
                      <span className="text-orange-500 font-bold bg-orange-50 px-2 py-1 rounded-lg">
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
            <p className="text-gray-500 font-medium">
              📚 持續努力，成大心理系在等著你！加油 Winnie！ 💪
            </p>
          </motion.div>
        </>
      )}
    </div>
  );
};

