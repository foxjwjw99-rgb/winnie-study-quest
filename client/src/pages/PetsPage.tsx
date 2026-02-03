import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cat, Book, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PetCard } from '../components/PetCard';
import { getAllPets, getUserPets, interactWithPet, hatchPet } from '../utils/api';
import { getRarityColor, getRarityStars } from '../utils/helpers';
import type { Pet, UserPet } from '../types';

export const PetsPage: React.FC = () => {
  const { user } = useAuth();
  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [userPets, setUserPets] = useState<(UserPet & { pet: Pet })[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPokedex, setShowPokedex] = useState(false);

  useEffect(() => {
    if (user) {
      Promise.all([getAllPets(), getUserPets(user.id)])
        .then(([pets, uPets]) => {
          setAllPets(pets);
          setUserPets(uPets);
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleInteract = async (userPetId: string, action: 'feed' | 'pat' | 'play') => {
    try {
      const updatedPet = await interactWithPet(userPetId, action);
      setUserPets((prev) =>
        prev.map((p) => (p.id === updatedPet.id ? { ...p, ...updatedPet } : p))
      );
    } catch (error) {
      console.error('Failed to interact with pet:', error);
    }
  };

  const handleHatch = async (userPetId: string) => {
    try {
      const updatedPet = await hatchPet(userPetId);
      setUserPets((prev) =>
        prev.map((p) => (p.id === updatedPet.id ? { ...p, ...updatedPet } : p))
      );
    } catch (error) {
      console.error('Failed to hatch pet:', error);
    }
  };

  if (!user) return null;

  const hatchedPets = userPets.filter((p) => p.isHatched);
  const unhatchedPets = userPets.filter((p) => !p.isHatched);
  const collectedPetIds = new Set(hatchedPets.map((p) => p.petId));

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Cat className="text-pink-400" size={32} />
          <div>
            <h1 className="text-2xl font-bold text-white">寵物收集</h1>
            <p className="text-gray-400">
              收集 {hatchedPets.length}/{allPets.length} 隻寵物
            </p>
          </div>
        </div>

        <motion.button
          onClick={() => setShowPokedex(!showPokedex)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
            showPokedex
              ? 'bg-amber-500 text-white'
              : 'bg-[#1a1025] text-amber-400 border border-amber-500/30'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Book size={20} />
          寵物圖鑑
        </motion.button>
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
      ) : showPokedex ? (
        /* Pokedex View */
        <div className="grid grid-cols-4 gap-4">
          {allPets.map((pet) => {
            const isCollected = collectedPetIds.has(pet.id);
            const rarityColor = getRarityColor(pet.rarity);
            const stars = getRarityStars(pet.rarity);

            return (
              <motion.div
                key={pet.id}
                className={`bg-[#1a1025] rounded-xl p-4 border transition-all ${
                  isCollected
                    ? 'border-purple-500/40'
                    : 'border-gray-700/40 opacity-50'
                }`}
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-center">
                  <motion.div
                    className="text-5xl mb-3"
                    animate={isCollected ? { y: [0, -5, 0] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    {isCollected ? pet.emoji : '❓'}
                  </motion.div>

                  <div className="flex justify-center gap-1 mb-2">
                    {Array.from({ length: stars }).map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        fill={isCollected ? rarityColor : '#4B5563'}
                        color={isCollected ? rarityColor : '#4B5563'}
                      />
                    ))}
                  </div>

                  <h4 className="font-semibold text-white">
                    {isCollected ? pet.name : '???'}
                  </h4>
                  <p className="text-gray-400 text-xs mt-1">
                    {isCollected ? pet.description : '尚未發現'}
                  </p>

                  {isCollected && (
                    <span className="inline-block mt-2 text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                      {pet.subject}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        /* My Pets View */
        <div className="space-y-8">
          {/* Unhatched Eggs */}
          {unhatchedPets.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-amber-300 mb-4">
                🥚 待孵化 ({unhatchedPets.length})
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {unhatchedPets.map((pet) => (
                  <PetCard
                    key={pet.id}
                    userPet={pet}
                    onInteract={handleInteract}
                    onHatch={handleHatch}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Hatched Pets */}
          {hatchedPets.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-purple-300 mb-4">
                我的寵物 ({hatchedPets.length})
              </h3>
              <div className="grid grid-cols-4 gap-4">
                {hatchedPets.map((pet) => (
                  <PetCard
                    key={pet.id}
                    userPet={pet}
                    onInteract={handleInteract}
                  />
                ))}
              </div>
            </div>
          )}

          {userPets.length === 0 && (
            <div className="text-center py-12">
              <motion.div
                className="text-6xl mb-4"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🥚
              </motion.div>
              <p className="text-gray-400 mb-2">還沒有寵物</p>
              <p className="text-gray-500 text-sm">
                去商店購買寵物蛋開始收集吧！
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pokedex Modal Animation */}
      <AnimatePresence>
        {showPokedex && (
          <motion.div
            className="fixed bottom-6 right-6 bg-amber-500/90 text-white px-4 py-2 rounded-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            收集進度: {hatchedPets.length}/{allPets.length}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
