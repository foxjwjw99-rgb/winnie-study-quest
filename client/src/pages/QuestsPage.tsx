import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { QuestCard } from '../components/QuestCard';
import { getDailyQuests, completeQuest, addCustomQuest } from '../utils/api';
import type { Quest } from '../types';

export const QuestsPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newQuest, setNewQuest] = useState({
    title: '',
    description: '',
    xpReward: 50,
    category: 'study' as Quest['category'],
  });

  useEffect(() => {
    if (user) {
      getDailyQuests(user.id)
        .then(setQuests)
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleCompleteQuest = async (questId: string) => {
    try {
      const { quest, user: updatedUser } = await completeQuest(questId);
      setQuests((prev) =>
        prev.map((q) => (q.id === questId ? quest : q))
      );
      updateUser(updatedUser);
    } catch (error) {
      console.error('Failed to complete quest:', error);
    }
  };

  const handleAddQuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newQuest.title.trim()) return;

    try {
      const quest = await addCustomQuest(user.id, newQuest);
      setQuests((prev) => [...prev, quest]);
      setShowAddModal(false);
      setNewQuest({
        title: '',
        description: '',
        xpReward: 50,
        category: 'study',
      });
    } catch (error) {
      console.error('Failed to add quest:', error);
    }
  };

  if (!user) return null;

  const completedQuests = quests.filter((q) => q.isCompleted);
  const pendingQuests = quests.filter((q) => !q.isCompleted);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Target className="text-purple-400" size={32} />
          <div>
            <h1 className="text-2xl font-bold text-white">每日任務</h1>
            <p className="text-gray-400">
              完成 {completedQuests.length}/{quests.length} 個任務
            </p>
          </div>
        </div>

        <motion.button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl font-medium transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus size={20} />
          新增任務
        </motion.button>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-amber-500"
            initial={{ width: 0 }}
            animate={{
              width: `${(completedQuests.length / Math.max(quests.length, 1)) * 100}%`,
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Quest Lists */}
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
        <div className="space-y-6">
          {/* Pending Quests */}
          {pendingQuests.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-purple-300 mb-4">
                待完成 ({pendingQuests.length})
              </h3>
              <div className="space-y-3">
                {pendingQuests.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onComplete={handleCompleteQuest}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Quests */}
          {completedQuests.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-green-300 mb-4">
                已完成 ({completedQuests.length})
              </h3>
              <div className="space-y-3">
                {completedQuests.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onComplete={handleCompleteQuest}
                  />
                ))}
              </div>
            </div>
          )}

          {quests.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">今天還沒有任務</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="text-purple-400 hover:text-purple-300"
              >
                點擊新增任務
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Quest Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#1a1025] rounded-2xl p-6 w-full max-w-md border border-purple-500/30"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">新增任務</h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddQuest} className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2 text-sm">任務標題</label>
                  <input
                    type="text"
                    value={newQuest.title}
                    onChange={(e) => setNewQuest((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-[#0f0a1a] border border-purple-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                    placeholder="例如：複習普通心理學第三章"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-300 mb-2 text-sm">任務描述</label>
                  <textarea
                    value={newQuest.description}
                    onChange={(e) => setNewQuest((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full bg-[#0f0a1a] border border-purple-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 resize-none"
                    rows={3}
                    placeholder="詳細說明..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">類別</label>
                    <select
                      value={newQuest.category}
                      onChange={(e) => setNewQuest((prev) => ({ ...prev, category: e.target.value as Quest['category'] }))}
                      className="w-full bg-[#0f0a1a] border border-purple-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value="study">📖 學習</option>
                      <option value="review">🔄 複習</option>
                      <option value="practice">✍️ 練習</option>
                      <option value="pomodoro">🍅 番茄鐘</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-300 mb-2 text-sm">XP獎勵</label>
                    <select
                      value={newQuest.xpReward}
                      onChange={(e) => setNewQuest((prev) => ({ ...prev, xpReward: parseInt(e.target.value) }))}
                      className="w-full bg-[#0f0a1a] border border-purple-500/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                    >
                      <option value={25}>25 XP (簡單)</option>
                      <option value={50}>50 XP (一般)</option>
                      <option value={100}>100 XP (困難)</option>
                      <option value={150}>150 XP (挑戰)</option>
                    </select>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-bold hover:from-purple-600 hover:to-purple-700 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  新增任務
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
