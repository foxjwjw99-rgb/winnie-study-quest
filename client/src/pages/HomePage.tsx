import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { QuestCard } from '../components/QuestCard';
import { Clock, Calendar, Sparkles, Target } from 'lucide-react';
import { getStats, getDailyQuests, getDailyStatsHistory, getUserPets, completeQuest } from '../utils/api';
import type { Quest, DailyStats, UserPet, Pet } from '../types';

export const HomePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [dailyQuests, setDailyQuests] = useState<Quest[]>([]);
  const [todayStats, setTodayStats] = useState<DailyStats | null>(null);
  const [activePet, setActivePet] = useState<(UserPet & { pet: Pet }) | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          const [q, ds, pets] = await Promise.all([
            getDailyQuests(user.id),
            getDailyStatsHistory(user.id, 1),
            getUserPets(user.id)
          ]);
          setDailyQuests(q);
          setTodayStats(ds[ds.length - 1] || null);
          
          // Select a pet to display (highest level or first hatched)
          const hatched = pets.filter(p => p.isHatched);
          if (hatched.length > 0) {
            // Sort by level desc
            hatched.sort((a, b) => b.level - a.level);
            setActivePet(hatched[0]);
          } else {
            setActivePet(null);
          }
        } catch (error) {
          console.error("Failed to fetch home data", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [user]);

  const handleCompleteQuest = async (questId: string) => {
    try {
      const { quest, user: updatedUser } = await completeQuest(questId);
      setDailyQuests((prev) =>
        prev.map((q) => (q.id === questId ? quest : q))
      );
      updateUser(updatedUser);
      
      // Refresh stats lightly
      const [newDaily] = await Promise.all([
        getDailyStatsHistory(updatedUser.id, 1)
      ]);
      setTodayStats(newDaily[newDaily.length - 1] || null);
      
    } catch (error) {
      console.error('Failed to complete quest:', error);
    }
  };

  if (!user) return null;

  // Calculate Today's Focus Time (Approximate from Pomodoros)
  // 1 Pomodoro = 25 minutes
  const todayPomodoros = todayStats?.pomodorosCompleted || 0;
  const todayFocusHours = (todayPomodoros * 25) / 60;
  const formattedFocusTime = todayFocusHours % 1 === 0 
    ? `${todayFocusHours}h` 
    : `${todayFocusHours.toFixed(1)}h`;

  const pendingQuestsCount = dailyQuests.filter(q => !q.isCompleted).length;

  return (
    <div className="space-y-8 pb-20 md:pb-0 px-4 mt-4">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center md:text-left space-y-2"
      >
        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-800">
          早安, <span className="text-pink-500">{user.username}</span>! ☀️
        </h2>
        <p className="text-gray-500 text-lg">
          今天也要開心地學習喔！加油加油～ ✨
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Quests & Timer */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions / Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm border border-orange-100">
              <div className="bg-orange-100 p-3 rounded-full mb-2 text-orange-500">
                <Clock size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-800">
                {loading ? '-' : formattedFocusTime}
              </span>
              <span className="text-xs text-gray-400 font-bold">今日專注</span>
            </div>
            <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm border border-purple-100">
              <div className="bg-purple-100 p-3 rounded-full mb-2 text-purple-500">
                <Calendar size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-800">
                {user.streak}天
              </span>
              <span className="text-xs text-gray-400 font-bold">連續登入</span>
            </div>
            <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center text-center col-span-2 sm:col-span-1 shadow-sm border border-pink-100">
              <div className="bg-pink-100 p-3 rounded-full mb-2 text-pink-500">
                <Sparkles size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-800">
                {user.xp}
              </span>
              <span className="text-xs text-gray-400 font-bold">目前積分</span>
            </div>
          </div>

          {/* Daily Quests */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Target className="text-pink-500" />
                每日任務
              </h3>
              <span className="text-sm text-pink-500 font-bold bg-pink-50 px-3 py-1 rounded-full">
                還剩 {pendingQuestsCount} 個
              </span>
            </div>
            
            {loading ? (
               <div className="text-center py-8 text-gray-400">載入中...</div>
            ) : (
              <div className="space-y-4">
                {dailyQuests.map((quest, index) => (
                  <QuestCard 
                    key={quest.id} 
                    quest={quest} 
                    index={index} 
                    onComplete={handleCompleteQuest} 
                  />
                ))}
                {dailyQuests.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    目前沒有任務，去新增一些吧！
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pet & Status */}
        <div className="space-y-8">
          <div className="bg-white rounded-2xl p-6 relative overflow-hidden shadow-sm border border-pink-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              🐾 你的夥伴
            </h3>
            
            {activePet ? (
              <div className="flex flex-col items-center">
                <motion.div 
                  className="text-8xl mb-4 cursor-pointer"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  whileHover={{ scale: 1.1 }}
                >
                  {activePet.pet.emoji}
                </motion.div>
                
                <h4 className="text-xl font-extrabold text-gray-800">{activePet.pet.name}</h4>
                <p className="text-sm text-gray-400 font-bold mb-4">
                  Lv.{activePet.level} {activePet.pet.subject}
                </p>

                {/* Pet Stats */}
                <div className="w-full space-y-3">
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-gray-400">心情 (Happiness)</span>
                      <span className="text-pink-400">{activePet.happiness}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div 
                        className="bg-pink-400 h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${activePet.happiness}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-gray-400">經驗值 (EXP)</span>
                      <span className="text-orange-400">{activePet.exp}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div 
                        className="bg-orange-400 h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.min(activePet.exp, 100)}%` }} // Simplified exp bar
                      ></div>
                    </div>
                  </div>
                </div>
                
                <button className="w-full mt-6 bg-pink-400 hover:bg-pink-500 text-white font-bold py-3 rounded-xl transition-colors shadow-sm text-sm">
                  前往互動
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🥚</div>
                <p className="text-gray-500 font-bold mb-2">還沒有夥伴</p>
                <p className="text-sm text-gray-400 mb-4">去商店買顆蛋來孵化吧！</p>
                <button className="w-full bg-amber-400 hover:bg-amber-500 text-white font-bold py-3 rounded-xl transition-colors shadow-sm text-sm">
                  前往商店
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
