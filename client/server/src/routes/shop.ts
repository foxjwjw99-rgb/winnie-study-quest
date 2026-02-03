import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database';

const router = Router();

// Get all shop items
router.get('/', (req, res) => {
  const items = db.prepare('SELECT * FROM shop_items ORDER BY type, price').all() as any[];

  res.json(items.map(i => ({
    id: i.id,
    name: i.name,
    description: i.description,
    icon: i.icon,
    price: i.price,
    type: i.type,
    rarity: i.rarity,
  })));
});

// Get user items
router.get('/:userId/items', (req, res) => {
  const { userId } = req.params;

  const userItems = db.prepare(`
    SELECT ui.*, si.name, si.description, si.icon, si.price, si.type, si.rarity
    FROM user_items ui
    JOIN shop_items si ON ui.item_id = si.id
    WHERE ui.user_id = ? AND ui.quantity > 0
  `).all(userId) as any[];

  res.json(userItems.map(ui => ({
    id: ui.id,
    userId: ui.user_id,
    itemId: ui.item_id,
    quantity: ui.quantity,
    item: {
      id: ui.item_id,
      name: ui.name,
      description: ui.description,
      icon: ui.icon,
      price: ui.price,
      type: ui.type,
      rarity: ui.rarity,
    },
  })));
});

// Purchase item
router.post('/:userId/purchase', (req, res) => {
  const { userId } = req.params;
  const { itemId } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const item = db.prepare('SELECT * FROM shop_items WHERE id = ?').get(itemId) as any;
  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  if (user.xp < item.price) {
    return res.status(400).json({ error: 'Not enough XP' });
  }

  // Deduct XP
  db.prepare('UPDATE users SET xp = xp - ? WHERE id = ?').run(item.price, userId);

  // Add or update item in inventory
  const existingItem = db.prepare('SELECT * FROM user_items WHERE user_id = ? AND item_id = ?').get(userId, itemId) as any;

  if (existingItem) {
    db.prepare('UPDATE user_items SET quantity = quantity + 1 WHERE id = ?').run(existingItem.id);
  } else {
    db.prepare(`
      INSERT INTO user_items (id, user_id, item_id, quantity)
      VALUES (?, ?, ?, 1)
    `).run(uuidv4(), userId, itemId);
  }

  const updatedUser = db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as any;
  const userItem = db.prepare('SELECT * FROM user_items WHERE user_id = ? AND item_id = ?').get(userId, itemId) as any;

  res.json({
    user: {
      id: updatedUser.id,
      username: updatedUser.username,
      level: updatedUser.level,
      xp: updatedUser.xp,
      totalXp: updatedUser.total_xp,
      streak: updatedUser.streak,
      lastStudyDate: updatedUser.last_study_date,
      createdAt: updatedUser.created_at,
    },
    item: {
      id: userItem.id,
      userId: userItem.user_id,
      itemId: userItem.item_id,
      quantity: userItem.quantity,
    },
  });
});

export default router;
