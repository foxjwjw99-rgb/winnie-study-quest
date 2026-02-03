import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database';
import { checkAndGrantAchievements } from '../utils';

const router = Router();

// Get all pets
router.get('/', (req, res) => {
  const pets = db.prepare('SELECT * FROM pets ORDER BY rarity, name').all() as any[];

  res.json(pets.map(p => ({
    id: p.id,
    name: p.name,
    emoji: p.emoji,
    description: p.description,
    rarity: p.rarity,
    subject: p.subject,
  })));
});

// Get user pets
router.get('/:userId', (req, res) => {
  const { userId } = req.params;

  const userPets = db.prepare(`
    SELECT up.*, p.name, p.emoji, p.description, p.rarity, p.subject
    FROM user_pets up
    JOIN pets p ON up.pet_id = p.id
    WHERE up.user_id = ?
    ORDER BY up.acquired_at DESC
  `).all(userId) as any[];

  res.json(userPets.map(up => ({
    id: up.id,
    petId: up.pet_id,
    userId: up.user_id,
    level: up.level,
    exp: up.exp,
    happiness: up.happiness,
    isHatched: Boolean(up.is_hatched),
    hatchProgress: up.hatch_progress,
    acquiredAt: up.acquired_at,
    lastInteraction: up.last_interaction,
    pet: {
      id: up.pet_id,
      name: up.name,
      emoji: up.emoji,
      description: up.description,
      rarity: up.rarity,
      subject: up.subject,
    },
  })));
});

// Open egg (from inventory)
router.post('/:userId/open-egg', (req, res) => {
  const { userId } = req.params;
  const { rarity } = req.body;

  // Check if user has the egg
  const eggItemId = `egg_${rarity}`;
  const userItem = db.prepare(`
    SELECT ui.* FROM user_items ui
    JOIN shop_items si ON ui.item_id = si.id
    WHERE ui.user_id = ? AND si.id = ? AND ui.quantity > 0
  `).get(userId, eggItemId) as any;

  if (!userItem) {
    return res.status(400).json({ error: 'No egg of this rarity in inventory' });
  }

  // Get random pet of matching rarity
  const pets = db.prepare('SELECT * FROM pets WHERE rarity = ?').all(rarity) as any[];
  if (pets.length === 0) {
    return res.status(400).json({ error: 'No pets available for this rarity' });
  }

  const randomPet = pets[Math.floor(Math.random() * pets.length)];

  // Decrease egg count
  db.prepare('UPDATE user_items SET quantity = quantity - 1 WHERE id = ?').run(userItem.id);

  // Check if user already has this pet
  const existingUserPet = db.prepare(`
    SELECT * FROM user_pets WHERE user_id = ? AND pet_id = ?
  `).get(userId, randomPet.id) as any;

  if (existingUserPet) {
    // Give XP to existing pet instead
    db.prepare('UPDATE user_pets SET exp = exp + 50 WHERE id = ?').run(existingUserPet.id);
    const updatedPet = db.prepare('SELECT * FROM user_pets WHERE id = ?').get(existingUserPet.id) as any;

    return res.json({
      userPet: {
        id: updatedPet.id,
        petId: updatedPet.pet_id,
        userId: updatedPet.user_id,
        level: updatedPet.level,
        exp: updatedPet.exp,
        happiness: updatedPet.happiness,
        isHatched: Boolean(updatedPet.is_hatched),
        hatchProgress: updatedPet.hatch_progress,
        acquiredAt: updatedPet.acquired_at,
        lastInteraction: updatedPet.last_interaction,
      },
      pet: {
        id: randomPet.id,
        name: randomPet.name,
        emoji: randomPet.emoji,
        description: randomPet.description,
        rarity: randomPet.rarity,
        subject: randomPet.subject,
      },
      duplicate: true,
    });
  }

  // Create new user pet (unhatched)
  const userPetId = uuidv4();
  db.prepare(`
    INSERT INTO user_pets (id, user_id, pet_id, level, exp, happiness, is_hatched, hatch_progress, acquired_at)
    VALUES (?, ?, ?, 1, 0, 100, 0, 0, datetime('now'))
  `).run(userPetId, userId, randomPet.id);

  const newUserPet = db.prepare('SELECT * FROM user_pets WHERE id = ?').get(userPetId) as any;

  res.json({
    userPet: {
      id: newUserPet.id,
      petId: newUserPet.pet_id,
      userId: newUserPet.user_id,
      level: newUserPet.level,
      exp: newUserPet.exp,
      happiness: newUserPet.happiness,
      isHatched: Boolean(newUserPet.is_hatched),
      hatchProgress: newUserPet.hatch_progress,
      acquiredAt: newUserPet.acquired_at,
      lastInteraction: newUserPet.last_interaction,
    },
    pet: {
      id: randomPet.id,
      name: randomPet.name,
      emoji: randomPet.emoji,
      description: randomPet.description,
      rarity: randomPet.rarity,
      subject: randomPet.subject,
    },
  });
});

// Add hatch progress (called after completing a pomodoro)
router.post('/:userPetId/hatch-progress', (req, res) => {
  const { userPetId } = req.params;

  const userPet = db.prepare('SELECT * FROM user_pets WHERE id = ?').get(userPetId) as any;

  if (!userPet) {
    return res.status(404).json({ error: 'Pet not found' });
  }

  if (userPet.is_hatched) {
    return res.status(400).json({ error: 'Pet already hatched' });
  }

  // Add progress (3 pomodoros = 1 progress, need 10 to hatch)
  const newProgress = Math.min(userPet.hatch_progress + 1, 10);

  db.prepare('UPDATE user_pets SET hatch_progress = ? WHERE id = ?').run(newProgress, userPetId);

  const updatedPet = db.prepare('SELECT * FROM user_pets WHERE id = ?').get(userPetId) as any;

  res.json({
    id: updatedPet.id,
    petId: updatedPet.pet_id,
    userId: updatedPet.user_id,
    level: updatedPet.level,
    exp: updatedPet.exp,
    happiness: updatedPet.happiness,
    isHatched: Boolean(updatedPet.is_hatched),
    hatchProgress: updatedPet.hatch_progress,
    acquiredAt: updatedPet.acquired_at,
    lastInteraction: updatedPet.last_interaction,
  });
});

// Hatch pet
router.post('/:userPetId/hatch', (req, res) => {
  const { userPetId } = req.params;

  const userPet = db.prepare('SELECT * FROM user_pets WHERE id = ?').get(userPetId) as any;

  if (!userPet) {
    return res.status(404).json({ error: 'Pet not found' });
  }

  if (userPet.is_hatched) {
    return res.status(400).json({ error: 'Pet already hatched' });
  }

  if (userPet.hatch_progress < 10) {
    return res.status(400).json({ error: 'Not enough hatch progress' });
  }

  db.prepare('UPDATE user_pets SET is_hatched = 1 WHERE id = ?').run(userPetId);

  // Check pet achievements
  checkAndGrantAchievements(userPet.user_id);

  const updatedPet = db.prepare('SELECT * FROM user_pets WHERE id = ?').get(userPetId) as any;

  res.json({
    id: updatedPet.id,
    petId: updatedPet.pet_id,
    userId: updatedPet.user_id,
    level: updatedPet.level,
    exp: updatedPet.exp,
    happiness: updatedPet.happiness,
    isHatched: Boolean(updatedPet.is_hatched),
    hatchProgress: updatedPet.hatch_progress,
    acquiredAt: updatedPet.acquired_at,
    lastInteraction: updatedPet.last_interaction,
  });
});

// Interact with pet
router.post('/:userPetId/interact', (req, res) => {
  const { userPetId } = req.params;
  const { action } = req.body; // 'feed' | 'pat' | 'play'

  const userPet = db.prepare('SELECT * FROM user_pets WHERE id = ?').get(userPetId) as any;

  if (!userPet) {
    return res.status(404).json({ error: 'Pet not found' });
  }

  if (!userPet.is_hatched) {
    return res.status(400).json({ error: 'Pet not hatched yet' });
  }

  let happinessGain = 0;
  let expGain = 0;

  switch (action) {
    case 'feed':
      happinessGain = 10;
      expGain = 5;
      break;
    case 'pat':
      happinessGain = 5;
      expGain = 3;
      break;
    case 'play':
      happinessGain = 15;
      expGain = 10;
      break;
    default:
      return res.status(400).json({ error: 'Invalid action' });
  }

  const newHappiness = Math.min(userPet.happiness + happinessGain, 100);
  const newExp = userPet.exp + expGain;

  // Level up if enough exp (100 exp per level)
  let newLevel = userPet.level;
  let remainingExp = newExp;
  while (remainingExp >= 100 && newLevel < 10) {
    remainingExp -= 100;
    newLevel++;
  }

  db.prepare(`
    UPDATE user_pets
    SET happiness = ?, exp = ?, level = ?, last_interaction = datetime('now')
    WHERE id = ?
  `).run(newHappiness, remainingExp, newLevel, userPetId);

  const updatedPet = db.prepare('SELECT * FROM user_pets WHERE id = ?').get(userPetId) as any;

  res.json({
    id: updatedPet.id,
    petId: updatedPet.pet_id,
    userId: updatedPet.user_id,
    level: updatedPet.level,
    exp: updatedPet.exp,
    happiness: updatedPet.happiness,
    isHatched: Boolean(updatedPet.is_hatched),
    hatchProgress: updatedPet.hatch_progress,
    acquiredAt: updatedPet.acquired_at,
    lastInteraction: updatedPet.last_interaction,
  });
});

export default router;
