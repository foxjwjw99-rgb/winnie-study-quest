import React from 'react';
import { motion } from 'framer-motion';
import { Swords, Trophy, Skull } from 'lucide-react';
import type { BossBattle } from '../types';

interface BossBattleCardProps {
  boss: BossBattle;
  onAttack: () => void;
  isAttacking?: boolean;
}

const bossEmojis: Record<string, string> = {
  '心理學原理魔王': '🧠',
  '統計學惡龍': '📊',
  '實驗設計巨人': '🔬',
  '普通心理學守護者': '📚',
  '發展心理學精靈': '👶',
  '社會心理學幽靈': '👥',
};

export const BossBattleCard: React.FC<BossBattleCardProps> = ({
  boss,
  onAttack,
  isAttacking,
}) => {
  const hpPercentage = (boss.currentHp / boss.bossHp) * 100;
  const bossEmoji = bossEmojis[boss.bossName] || '👹';

  return (
    <motion.div
      className={`bg-[#1a1025] rounded-2xl p-6 border ${
        boss.isDefeated
          ? 'border-green-500/30'
          : 'border-red-500/30'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="text-center">
        {/* Boss Header */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <Swords className="text-red-400" />
          <h3 className="text-xl font-bold text-red-300">{boss.month} Boss戰</h3>
        </div>

        {/* Boss Emoji */}
        <motion.div
          className="text-8xl mb-4"
          animate={
            boss.isDefeated
              ? { opacity: 0.5, rotate: 180, y: 20 }
              : isAttacking
              ? { x: [-10, 10, -10, 10, 0] }
              : { y: [0, -10, 0] }
          }
          transition={
            boss.isDefeated
              ? { duration: 0.5 }
              : isAttacking
              ? { duration: 0.3 }
              : { duration: 2, repeat: Infinity }
          }
        >
          {bossEmoji}
        </motion.div>

        {/* Boss Name */}
        <h4 className="text-2xl font-bold text-white mb-2">{boss.bossName}</h4>

        {/* HP Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-400">HP</span>
            <span className={boss.isDefeated ? 'text-green-400' : 'text-red-400'}>
              {boss.currentHp} / {boss.bossHp}
            </span>
          </div>
          <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${
                hpPercentage > 50
                  ? 'bg-gradient-to-r from-green-500 to-green-400'
                  : hpPercentage > 25
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-400'
                  : 'bg-gradient-to-r from-red-500 to-red-400'
              }`}
              initial={{ width: '100%' }}
              animate={{ width: `${hpPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Status */}
        {boss.isDefeated ? (
          <motion.div
            className="flex flex-col items-center gap-3"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <div className="flex items-center gap-2 text-green-400">
              <Trophy />
              <span className="text-xl font-bold">已擊敗！</span>
            </div>
            <div className="text-amber-400">
              獲得獎勵: +{boss.rewards} XP 🎉
            </div>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <p className="text-gray-400 text-sm">
              完成任務來攻擊Boss！每完成一個任務造成10點傷害。
            </p>

            <motion.button
              onClick={onAttack}
              disabled={isAttacking}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Swords size={20} />
              {isAttacking ? '攻擊中...' : '發動攻擊！'}
            </motion.button>

            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
              <Skull size={16} />
              <span>挑戰時限：本月底前</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
