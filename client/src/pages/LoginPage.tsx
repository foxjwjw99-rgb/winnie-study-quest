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
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-main)]">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Logo & Title */}
        <div className="text-center mb-10">
          <motion.div
            className="text-7xl mb-4"
            animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            🐰
          </motion.div>
          <h1 className="text-3xl font-extrabold text-[var(--text-main)] mb-4 tracking-wide">
            Winnie's Quest
          </h1>
          <p className="text-[var(--text-light)] font-medium text-lg">成大心理轉學考 學習冒險 ✨</p>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          <motion.div
            className="bg-white p-4 rounded-[var(--radius-m)] text-center shadow-sm border border-pink-100 flex flex-col items-center gap-2"
            whileHover={{ y: -5 }}
          >
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center text-blue-500">
              <BookOpen size={24} />
            </div>
            <span className="text-[var(--text-light)] text-sm font-bold tracking-wide">每日任務</span>
          </motion.div>
          <motion.div
            className="bg-white p-4 rounded-[var(--radius-m)] text-center shadow-sm border border-pink-100 flex flex-col items-center gap-2"
            whileHover={{ y: -5 }}
          >
            <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center text-yellow-500">
              <Trophy size={24} />
            </div>
            <span className="text-[var(--text-light)] text-sm font-bold tracking-wide">成就系統</span>
          </motion.div>
          <motion.div
            className="bg-white p-4 rounded-[var(--radius-m)] text-center shadow-sm border border-pink-100 flex flex-col items-center gap-2"
            whileHover={{ y: -5 }}
          >
            <div className="bg-pink-100 w-12 h-12 rounded-full flex items-center justify-center text-pink-500">
              <Cat size={24} />
            </div>
            <span className="text-[var(--text-light)] text-sm font-bold tracking-wide">寵物收集</span>
          </motion.div>
        </div>

        {/* Login Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="card-cute p-10"
        >
          <div className="mb-8 text-left">
            <label className="block text-[var(--text-main)] mb-3 text-base font-bold ml-1 tracking-wide">
              冒險者名稱
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="輸入你的名字..."
              className="w-full bg-pink-50/50 border-2 border-pink-100 rounded-[var(--radius-m)] px-4 py-3 text-[var(--text-main)] placeholder-gray-400 focus:outline-none focus:border-[var(--primary)] focus:bg-white transition-all font-medium"
              autoFocus
            />
          </div>

          {error && (
            <motion.p
              className="text-red-400 text-sm mb-4 bg-red-50 p-3 rounded-lg text-center font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full btn-primary py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <span className="animate-pulse">準備中...</span>
            ) : (
              <>
                <Sparkles size={20} />
                開始冒險
              </>
            )}
          </motion.button>
        </motion.form>

        {/* Footer */}
        <p className="text-center text-[var(--text-light)] text-xs mt-8 font-medium opacity-60">
          為 Winnie 加油！ 💪
        </p>
      </motion.div>
    </div>
  );
};
