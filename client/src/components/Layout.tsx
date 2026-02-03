import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home, Target, Trophy, ShoppingBag,
  Swords, BarChart3, Cat, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { calculateLevel, formatXp } from '../utils/helpers';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/', icon: Home, label: '首頁' },
  { path: '/quests', icon: Target, label: '任務' },
  { path: '/pets', icon: Cat, label: '寵物' },
  { path: '/shop', icon: ShoppingBag, label: '商店' },
  { path: '/boss', icon: Swords, label: 'Boss戰' },
  { path: '/achievements', icon: Trophy, label: '成就' },
  { path: '/stats', icon: BarChart3, label: '統計' },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const { level, currentXp, xpForNext } = calculateLevel(user.totalXp);
  const xpPercentage = (currentXp / xpForNext) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-[#1a1025] border-b border-purple-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-amber-400 bg-clip-text text-transparent">
                🎮 Winnie's Study Quest
              </h1>

              {/* Streak Display */}
              {user.streak > 0 && (
                <motion.div
                  className="flex items-center gap-1 bg-orange-500/20 px-3 py-1 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <span className="fire-animation text-xl">🔥</span>
                  <span className="text-orange-400 font-bold">{user.streak}</span>
                </motion.div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm text-gray-400">{user.username}</div>
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 font-bold">Lv.{level}</span>
                    <span className="text-amber-400 text-sm">
                      ✨ {formatXp(user.xp)} XP
                    </span>
                  </div>
                </div>

                {/* XP Bar */}
                <div className="w-32 h-3 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-purple-500 to-purple-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPercentage}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                title="登出"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar Navigation */}
        <nav className="w-20 bg-[#1a1025] border-r border-purple-500/20 sticky top-16 h-[calc(100vh-64px)]">
          <ul className="py-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex flex-col items-center py-3 px-2 transition-all ${
                      isActive
                        ? 'text-purple-400 bg-purple-500/10'
                        : 'text-gray-400 hover:text-purple-300 hover:bg-purple-500/5'
                    }`}
                  >
                    <item.icon size={24} />
                    <span className="text-xs mt-1">{item.label}</span>
                    {isActive && (
                      <motion.div
                        className="absolute left-0 w-1 h-10 bg-purple-500 rounded-r"
                        layoutId="activeNav"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};
