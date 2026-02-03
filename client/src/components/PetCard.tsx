import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Hand, Gamepad2, Star } from 'lucide-react';
import type { Pet, UserPet } from '../types';
import { getRarityColor, getRarityStars } from '../utils/helpers';

interface PetCardProps {
  userPet: UserPet & { pet: Pet };
  onInteract: (userPetId: string, action: 'feed' | 'pat' | 'play') => void;
  onHatch?: (userPetId: string) => void;
}

export const PetCard: React.FC<PetCardProps> = ({ userPet, onInteract, onHatch }) => {
  const [showInteractions, setShowInteractions] = useState(false);
  const rarityColor = getRarityColor(userPet.pet.rarity);
  const stars = getRarityStars(userPet.pet.rarity);

  // Egg state
  if (!userPet.isHatched) {
    const hatchProgress = (userPet.hatchProgress / 10) * 100;

    return (
      <motion.div
        className="bg-[#1a1025] rounded-xl p-4 border border-purple-500/20"
        whileHover={{ scale: 1.02 }}
      >
        <div className="text-center">
          <motion.div
            className={`text-6xl mb-3 ${userPet.hatchProgress >= 10 ? 'egg-shake' : ''}`}
            animate={userPet.hatchProgress >= 10 ? { rotate: [-5, 5, -5] } : {}}
            transition={{ repeat: Infinity, duration: 0.3 }}
          >
            🥚
          </motion.div>

          <div className="flex justify-center gap-1 mb-2">
            {Array.from({ length: stars }).map((_, i) => (
              <Star key={i} size={14} fill={rarityColor} color={rarityColor} />
            ))}
          </div>

          <p className="text-gray-400 text-sm mb-3">
            {userPet.pet.rarity === 'legendary' ? '傳說' :
             userPet.pet.rarity === 'epic' ? '史詩' :
             userPet.pet.rarity === 'rare' ? '稀有' : '普通'}蛋
          </p>

          {/* Hatch Progress Bar */}
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
            <motion.div
              className="h-full"
              style={{ backgroundColor: rarityColor }}
              initial={{ width: 0 }}
              animate={{ width: `${hatchProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">{userPet.hatchProgress}/10 番茄鐘</p>

          {userPet.hatchProgress >= 10 && onHatch && (
            <motion.button
              onClick={() => onHatch(userPet.id)}
              className="mt-3 bg-gradient-to-r from-purple-500 to-amber-500 text-white px-4 py-2 rounded-lg font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ✨ 孵化！
            </motion.button>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-[#1a1025] rounded-xl p-4 border border-purple-500/20 relative"
      whileHover={{ scale: 1.02 }}
      onHoverStart={() => setShowInteractions(true)}
      onHoverEnd={() => setShowInteractions(false)}
    >
      <div className="text-center">
        {/* Pet Emoji */}
        <motion.div
          className="text-6xl mb-3 pet-bounce"
          whileHover={{ scale: 1.2 }}
        >
          {userPet.pet.emoji}
        </motion.div>

        {/* Rarity Stars */}
        <div className="flex justify-center gap-1 mb-2">
          {Array.from({ length: stars }).map((_, i) => (
            <Star key={i} size={14} fill={rarityColor} color={rarityColor} />
          ))}
        </div>

        {/* Pet Name & Level */}
        <h4 className="font-semibold text-white">{userPet.pet.name}</h4>
        <p className="text-purple-400 text-sm">Lv.{userPet.level}</p>

        {/* Happiness Bar */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <Heart size={14} className="text-pink-400" />
          <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${userPet.happiness}%` }}
            />
          </div>
        </div>

        {/* Subject Tag */}
        <div className="mt-2">
          <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
            {userPet.pet.subject}
          </span>
        </div>
      </div>

      {/* Interaction Buttons */}
      <AnimatePresence>
        {showInteractions && (
          <motion.div
            className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center gap-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              onClick={() => onInteract(userPet.id, 'feed')}
              className="p-3 bg-amber-500 rounded-full text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="餵食"
            >
              🍎
            </motion.button>
            <motion.button
              onClick={() => onInteract(userPet.id, 'pat')}
              className="p-3 bg-pink-500 rounded-full text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="摸摸"
            >
              <Hand size={20} />
            </motion.button>
            <motion.button
              onClick={() => onInteract(userPet.id, 'play')}
              className="p-3 bg-purple-500 rounded-full text-white"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="玩耍"
            >
              <Gamepad2 size={20} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
