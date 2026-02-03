import React from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart } from 'lucide-react';
import type { ShopItem } from '../types';
import { getRarityColor, getRarityStars } from '../utils/helpers';

interface ShopItemCardProps {
  item: ShopItem;
  userXp: number;
  onPurchase: (itemId: string) => void;
  isLoading?: boolean;
}

export const ShopItemCard: React.FC<ShopItemCardProps> = ({
  item,
  userXp,
  onPurchase,
  isLoading,
}) => {
  const canAfford = userXp >= item.price;
  const rarityColor = item.rarity ? getRarityColor(item.rarity) : '#8B5CF6';
  const stars = item.rarity ? getRarityStars(item.rarity) : 0;

  return (
    <motion.div
      className={`bg-[#1a1025] rounded-xl p-4 border transition-all ${
        canAfford ? 'border-purple-500/30 hover:border-purple-500/50' : 'border-gray-700/30 opacity-60'
      }`}
      whileHover={canAfford ? { scale: 1.03, y: -5 } : {}}
    >
      <div className="text-center">
        {/* Item Icon */}
        <motion.div
          className="text-5xl mb-3"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {item.icon}
        </motion.div>

        {/* Rarity Stars for eggs */}
        {item.type === 'egg' && stars > 0 && (
          <div className="flex justify-center gap-1 mb-2">
            {Array.from({ length: stars }).map((_, i) => (
              <Star key={i} size={12} fill={rarityColor} color={rarityColor} />
            ))}
          </div>
        )}

        {/* Item Name */}
        <h4 className="font-semibold text-white">{item.name}</h4>
        <p className="text-gray-400 text-xs mt-1 h-8">{item.description}</p>

        {/* Type Badge */}
        <div className="mt-2 mb-3">
          <span className={`text-xs px-2 py-1 rounded-full ${
            item.type === 'egg' ? 'bg-purple-500/20 text-purple-300' :
            item.type === 'food' ? 'bg-amber-500/20 text-amber-300' :
            item.type === 'toy' ? 'bg-pink-500/20 text-pink-300' :
            'bg-blue-500/20 text-blue-300'
          }`}>
            {item.type === 'egg' ? '蛋' :
             item.type === 'food' ? '食物' :
             item.type === 'toy' ? '玩具' : '加成'}
          </span>
        </div>

        {/* Price & Buy Button */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-1">
            <span className="text-amber-400">✨</span>
            <span className={`font-bold ${canAfford ? 'text-amber-300' : 'text-gray-500'}`}>
              {item.price}
            </span>
          </div>

          <motion.button
            onClick={() => onPurchase(item.id)}
            disabled={!canAfford || isLoading}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              canAfford
                ? 'bg-purple-500 hover:bg-purple-600 text-white'
                : 'bg-gray-700 text-gray-500 cursor-not-allowed'
            }`}
            whileHover={canAfford ? { scale: 1.05 } : {}}
            whileTap={canAfford ? { scale: 0.95 } : {}}
          >
            <ShoppingCart size={14} />
            購買
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
