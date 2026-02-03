import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Sparkles, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ShopItemCard } from '../components/ShopItemCard';
import { getShopItems, purchaseItem, getUserItems, openEgg } from '../utils/api';
import type { ShopItem, UserItem } from '../types';

export const ShopPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [userItems, setUserItems] = useState<(UserItem & { item: ShopItem })[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      Promise.all([getShopItems(), getUserItems(user.id)])
        .then(([items, uItems]) => {
          setShopItems(items);
          setUserItems(uItems);
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handlePurchase = async (itemId: string) => {
    if (!user || purchasing) return;

    setPurchasing(true);
    try {
      const { user: updatedUser, item } = await purchaseItem(user.id, itemId);
      updateUser(updatedUser);

      // Update user items
      const shopItem = shopItems.find((i) => i.id === itemId);
      if (shopItem) {
        setUserItems((prev) => {
          const existing = prev.find((i) => i.itemId === itemId);
          if (existing) {
            return prev.map((i) =>
              i.itemId === itemId ? { ...i, quantity: item.quantity } : i
            );
          }
          return [...prev, { ...item, item: shopItem }];
        });
      }

      setNotification(`成功購買 ${shopItem?.name}！`);
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification('購買失敗，請稍後再試');
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setPurchasing(false);
    }
  };

  const handleOpenEgg = async (rarity: string) => {
    if (!user) return;

    try {
      const { pet } = await openEgg(user.id, rarity);

      // Decrease egg count
      setUserItems((prev) =>
        prev.map((i) => {
          if (i.item.type === 'egg' && i.item.rarity === rarity) {
            return { ...i, quantity: i.quantity - 1 };
          }
          return i;
        }).filter((i) => i.quantity > 0)
      );

      setNotification(`獲得了 ${pet.name}！趕快去孵化牠吧！`);
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification('開蛋失敗，請稍後再試');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  if (!user) return null;

  const eggs = shopItems.filter((i) => i.type === 'egg');
  const otherItems = shopItems.filter((i) => i.type !== 'egg');

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ShoppingBag className="text-amber-400" size={32} />
          <div>
            <h1 className="text-2xl font-bold text-white">商店</h1>
            <p className="text-gray-400">使用 XP 購買道具</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* XP Balance */}
          <div className="flex items-center gap-2 bg-[#1a1025] px-4 py-2 rounded-xl border border-amber-500/30">
            <Sparkles className="text-amber-400" size={20} />
            <span className="text-amber-300 font-bold">{user.xp} XP</span>
          </div>

          {/* Inventory Button */}
          <motion.button
            onClick={() => setShowInventory(!showInventory)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              showInventory
                ? 'bg-purple-500 text-white'
                : 'bg-[#1a1025] text-purple-400 border border-purple-500/30'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Package size={20} />
            背包
          </motion.button>
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
      ) : showInventory ? (
        /* Inventory View */
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-purple-300">我的道具</h3>

          {userItems.length === 0 ? (
            <div className="text-center py-12">
              <motion.div
                className="text-6xl mb-4"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                📦
              </motion.div>
              <p className="text-gray-400">背包是空的</p>
              <p className="text-gray-500 text-sm">去商店購買一些道具吧！</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {userItems.map((userItem) => (
                <motion.div
                  key={userItem.id}
                  className="bg-[#1a1025] rounded-xl p-4 border border-purple-500/20"
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">{userItem.item.icon}</div>
                    <h4 className="font-semibold text-white">{userItem.item.name}</h4>
                    <p className="text-purple-400 text-sm">x{userItem.quantity}</p>

                    {userItem.item.type === 'egg' && (
                      <motion.button
                        onClick={() => handleOpenEgg(userItem.item.rarity!)}
                        className="mt-3 bg-gradient-to-r from-purple-500 to-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium w-full"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        開蛋！
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Shop View */
        <div className="space-y-8">
          {/* Eggs Section */}
          <div>
            <h3 className="text-lg font-semibold text-amber-300 mb-4 flex items-center gap-2">
              🥚 寵物蛋
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {eggs.map((item) => (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  userXp={user.xp}
                  onPurchase={handlePurchase}
                  isLoading={purchasing}
                />
              ))}
            </div>
          </div>

          {/* Other Items Section */}
          <div>
            <h3 className="text-lg font-semibold text-purple-300 mb-4 flex items-center gap-2">
              🎁 道具
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {otherItems.map((item) => (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  userXp={user.xp}
                  onPurchase={handlePurchase}
                  isLoading={purchasing}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className="fixed bottom-6 right-6 bg-purple-500/90 text-white px-6 py-3 rounded-xl shadow-lg"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
