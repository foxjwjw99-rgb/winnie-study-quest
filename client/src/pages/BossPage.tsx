import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Swords, History, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BossBattleCard } from '../components/BossBattleCard';
import { getCurrentBoss, attackBoss, getBossHistory } from '../utils/api';
import type { BossBattle } from '../types';

export const BossPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [currentBoss, setCurrentBoss] = useState<BossBattle | null>(null);
  const [history, setHistory] = useState<BossBattle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAttacking, setIsAttacking] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (user) {
      Promise.all([getCurrentBoss(user.id), getBossHistory(user.id)])
        .then(([boss, hist]) => {
          setCurrentBoss(boss);
          setHistory(hist);
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleAttack = async () => {
    if (!user || !currentBoss || isAttacking) return;

    setIsAttacking(true);
    try {
      const { boss, rewards } = await attackBoss(user.id, 10);
      setCurrentBoss(boss);

      if (boss.isDefeated && rewards) {
        // Update user XP
        updateUser({
          ...user,
          xp: user.xp + rewards,
          totalXp: user.totalXp + rewards,
        });
      }
    } catch (error) {
      console.error('Failed to attack boss:', error);
    } finally {
      setIsAttacking(false);
    }
  };

  if (!user) return null;

  const defeatedBosses = history.filter((b) => b.isDefeated);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Swords className="text-red-400" size={32} />
          <div>
            <h1 className="text-2xl font-bold text-white">Boss 戰</h1>
            <p className="text-gray-400">
              挑戰每月模擬考魔王！
            </p>
          </div>
        </div>

        <motion.button
          onClick={() => setShowHistory(!showHistory)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
            showHistory
              ? 'bg-red-500 text-white'
              : 'bg-[#1a1025] text-red-400 border border-red-500/30'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <History size={20} />
          戰鬥記錄
        </motion.button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <motion.div
          className="bg-[#1a1025] rounded-xl p-4 border border-red-500/20"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-3">
            <Trophy className="text-amber-400" />
            <div>
              <p className="text-gray-400 text-sm">已擊敗</p>
              <p className="text-2xl font-bold text-amber-300">{defeatedBosses.length}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-[#1a1025] rounded-xl p-4 border border-purple-500/20"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-3">
            <Swords className="text-purple-400" />
            <div>
              <p className="text-gray-400 text-sm">總攻擊次數</p>
              <p className="text-2xl font-bold text-purple-300">
                {history.reduce((acc, b) => acc + (b.bossHp - b.currentHp) / 10, 0)}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="bg-[#1a1025] rounded-xl p-4 border border-green-500/20"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">✨</span>
            <div>
              <p className="text-gray-400 text-sm">獲得獎勵</p>
              <p className="text-2xl font-bold text-green-300">
                {defeatedBosses.reduce((acc, b) => acc + b.rewards, 0)} XP
              </p>
            </div>
          </div>
        </motion.div>
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
      ) : showHistory ? (
        /* History View */
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-red-300 mb-4">戰鬥記錄</h3>

          {history.length === 0 ? (
            <div className="text-center py-12">
              <motion.div
                className="text-6xl mb-4"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                ⚔️
              </motion.div>
              <p className="text-gray-400">還沒有戰鬥記錄</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((boss) => (
                <motion.div
                  key={boss.id}
                  className={`bg-[#1a1025] rounded-xl p-4 border ${
                    boss.isDefeated ? 'border-green-500/30' : 'border-red-500/30'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">
                        {boss.isDefeated ? '🏆' : '💀'}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white">{boss.bossName}</h4>
                        <p className="text-gray-400 text-sm">{boss.month}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      {boss.isDefeated ? (
                        <div className="text-green-400">
                          <span className="font-bold">已擊敗</span>
                          <p className="text-sm">+{boss.rewards} XP</p>
                        </div>
                      ) : (
                        <div className="text-red-400">
                          <span className="font-bold">挑戰中</span>
                          <p className="text-sm">{boss.currentHp}/{boss.bossHp} HP</p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : currentBoss ? (
        /* Current Boss */
        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <BossBattleCard
              boss={currentBoss}
              onAttack={handleAttack}
              isAttacking={isAttacking}
            />
          </div>
        </div>
      ) : (
        /* No Boss */
        <div className="text-center py-12">
          <motion.div
            className="text-6xl mb-4"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎉
          </motion.div>
          <h3 className="text-xl font-bold text-white mb-2">本月無Boss</h3>
          <p className="text-gray-400">下個月會有新的挑戰！</p>
        </div>
      )}

      {/* Tips */}
      <motion.div
        className="mt-8 bg-[#1a1025] rounded-xl p-4 border border-purple-500/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h4 className="font-semibold text-purple-300 mb-2">💡 小提示</h4>
        <ul className="text-gray-400 text-sm space-y-1">
          <li>• 每完成一個每日任務可以對Boss造成10點傷害</li>
          <li>• 擊敗Boss可以獲得豐厚的XP獎勵</li>
          <li>• Boss會在每月初重置</li>
          <li>• 努力學習就是最強的武器！</li>
        </ul>
      </motion.div>
    </div>
  );
};
