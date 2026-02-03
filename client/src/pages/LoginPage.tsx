import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, BookOpen, Trophy, Cat } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('請輸入使用者名稱');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await login(username.trim());
    } catch (err) {
      setError('登入失敗，請稍後再試');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <motion.div
            className="text-6xl mb-4"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎮
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent mb-2">
            Winnie's Study Quest
          </h1>
          <p className="text-gray-400">成大心理轉學考 學習冒險</p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <motion.div
            className="bg-[#1a1025] p-4 rounded-xl text-center border border-purple-500/20"
            whileHover={{ scale: 1.05 }}
          >
            <BookOpen className="mx-auto text-purple-400 mb-2" />
            <span className="text-gray-300 text-sm">每日任務</span>
          </motion.div>
          <motion.div
            className="bg-[#1a1025] p-4 rounded-xl text-center border border-purple-500/20"
            whileHover={{ scale: 1.05 }}
          >
            <Trophy className="mx-auto text-amber-400 mb-2" />
            <span className="text-gray-300 text-sm">成就系統</span>
          </motion.div>
          <motion.div
            className="bg-[#1a1025] p-4 rounded-xl text-center border border-purple-500/20"
            whileHover={{ scale: 1.05 }}
          >
            <Cat className="mx-auto text-pink-400 mb-2" />
            <span className="text-gray-300 text-sm">寵物收集</span>
          </motion.div>
        </div>

        {/* Login Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="bg-[#1a1025] rounded-2xl p-6 border border-purple-500/20 glow-purple"
        >
          <div className="mb-6">
            <label className="block text-gray-300 mb-2 text-sm">使用者名稱</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="輸入你的名稱開始冒險..."
              className="w-full bg-[#0f0a1a] border border-purple-500/30 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              autoFocus
            />
          </div>

          {error && (
            <motion.p
              className="text-red-400 text-sm mb-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-500 to-purple-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 hover:from-purple-600 hover:to-purple-700 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Sparkles size={20} />
            {isLoading ? '進入中...' : '開始冒險！'}
          </motion.button>
        </motion.form>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-6">
          為 Winnie 的成大心理轉學考之路加油！ 💪
        </p>
      </motion.div>
    </div>
  );
};
