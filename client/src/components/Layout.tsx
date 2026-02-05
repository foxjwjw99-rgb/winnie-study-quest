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
  { path: '/boss', icon: Swords, label: 'Boss' },
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
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-main)] font-sans">
      {/* Header */}
      <header className="bg-white border-b border-pink-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🐰</span>
              <h1 className="text-xl font-bold text-[var(--text-main)] hidden sm:block">
                Winnie's Quest
              </h1>
              {/* Mobile Title */}
              <h1 className="text-lg font-bold text-[var(--text-main)] sm:hidden">
                Quest
              </h1>

              {/* Streak Display */}
              {user.streak > 0 && (
                <div className="flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                  <span className="text-lg">🔥</span>
                  <span className="text-orange-500 font-bold text-sm">{user.streak}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-xs text-gray-400 font-medium hidden sm:block">{user.username}</div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[var(--accent)] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      Lv.{level}
                    </span>
                    <span className="text-[var(--secondary)] font-bold text-sm hidden sm:block">
                      {formatXp(user.xp)} XP
                    </span>
                  </div>
                </div>

                {/* XP Bar - Solid Color, No Gradient */}
                <div className="w-24 sm:w-32 h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-200 relative">
                  <motion.div
                    className="h-full bg-[var(--primary)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${xpPercentage}%` }}
                    transition={{ duration: 0.5 }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-gray-500">
                    {Math.floor(xpPercentage)}%
                  </div>
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-[var(--primary)] transition-colors rounded-full"
                title="登出"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex flex-col md:flex-row pb-20 md:pb-0">
        
        {/* Desktop Sidebar */}
        <nav className="hidden md:block w-64 bg-white border-r border-pink-100 sticky top-16 h-[calc(100vh-64px)] p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-[var(--radius-m)] transition-all font-bold ${
                      isActive
                        ? 'bg-[var(--primary)] text-white'
                        : 'text-gray-500 hover:bg-pink-50 hover:text-[var(--primary-dark)]'
                    }`}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-5xl mx-auto"
          >
            {children}
          </motion.div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-pink-100 pb-safe z-50">
          <ul className="flex justify-around items-center px-2 py-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path} className="flex-1">
                  <Link
                    to={item.path}
                    className={`flex flex-col items-center py-2 transition-all ${
                      isActive ? 'text-[var(--primary)]' : 'text-gray-400'
                    }`}
                  >
                    <div
                      className={`p-1.5 rounded-2xl ${isActive ? 'bg-pink-50' : ''}`}
                    >
                      <item.icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <span className={`text-[10px] font-bold mt-0.5 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                      {item.label}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

      </div>
    </div>
  );
};
