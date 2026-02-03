import Database, { Database as DatabaseType } from 'better-sqlite3';
import path from 'path';

const db: DatabaseType = new Database(path.join(__dirname, '..', 'study_quest.db'));

// Initialize database tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    total_xp INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    last_study_date TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS quests (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    xp_reward INTEGER DEFAULT 50,
    category TEXT DEFAULT 'study',
    is_completed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    requirement INTEGER NOT NULL,
    type TEXT NOT NULL,
    xp_reward INTEGER DEFAULT 100
  );

  CREATE TABLE IF NOT EXISTS user_achievements (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    unlocked_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (achievement_id) REFERENCES achievements(id),
    UNIQUE(user_id, achievement_id)
  );

  CREATE TABLE IF NOT EXISTS shop_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    price INTEGER NOT NULL,
    type TEXT NOT NULL,
    rarity TEXT
  );

  CREATE TABLE IF NOT EXISTS user_items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    item_id TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES shop_items(id),
    UNIQUE(user_id, item_id)
  );

  CREATE TABLE IF NOT EXISTS pets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    emoji TEXT NOT NULL,
    description TEXT NOT NULL,
    rarity TEXT NOT NULL,
    subject TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS user_pets (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    pet_id TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    exp INTEGER DEFAULT 0,
    happiness INTEGER DEFAULT 100,
    is_hatched INTEGER DEFAULT 0,
    hatch_progress INTEGER DEFAULT 0,
    acquired_at TEXT DEFAULT CURRENT_TIMESTAMP,
    last_interaction TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (pet_id) REFERENCES pets(id)
  );

  CREATE TABLE IF NOT EXISTS boss_battles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    boss_name TEXT NOT NULL,
    boss_hp INTEGER NOT NULL,
    current_hp INTEGER NOT NULL,
    month TEXT NOT NULL,
    is_defeated INTEGER DEFAULT 0,
    rewards INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS daily_stats (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    date TEXT NOT NULL,
    quests_completed INTEGER DEFAULT 0,
    xp_earned INTEGER DEFAULT 0,
    pomodoros_completed INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id),
    UNIQUE(user_id, date)
  );

  CREATE TABLE IF NOT EXISTS study_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    session_type TEXT DEFAULT 'pomodoro',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// Seed default data
const seedData = () => {
  // Seed achievements
  const achievements = [
    { id: 'ach_streak_3', name: '初心者', description: '連續學習3天', icon: '🌱', requirement: 3, type: 'streak', xp_reward: 50 },
    { id: 'ach_streak_7', name: '勤奮學子', description: '連續學習7天', icon: '📚', requirement: 7, type: 'streak', xp_reward: 100 },
    { id: 'ach_streak_30', name: '學習達人', description: '連續學習30天', icon: '🏆', requirement: 30, type: 'streak', xp_reward: 500 },
    { id: 'ach_xp_1000', name: '經驗累積', description: '累積1000 XP', icon: '⭐', requirement: 1000, type: 'xp', xp_reward: 100 },
    { id: 'ach_xp_5000', name: '經驗豐富', description: '累積5000 XP', icon: '🌟', requirement: 5000, type: 'xp', xp_reward: 300 },
    { id: 'ach_xp_10000', name: '知識寶庫', description: '累積10000 XP', icon: '💫', requirement: 10000, type: 'xp', xp_reward: 500 },
    { id: 'ach_quests_10', name: '任務新手', description: '完成10個任務', icon: '✅', requirement: 10, type: 'quests', xp_reward: 50 },
    { id: 'ach_quests_50', name: '任務高手', description: '完成50個任務', icon: '🎯', requirement: 50, type: 'quests', xp_reward: 200 },
    { id: 'ach_quests_100', name: '任務大師', description: '完成100個任務', icon: '👑', requirement: 100, type: 'quests', xp_reward: 500 },
    { id: 'ach_pets_1', name: '初次孵化', description: '孵化第一隻寵物', icon: '🐣', requirement: 1, type: 'pets', xp_reward: 100 },
    { id: 'ach_pets_4', name: '寵物愛好者', description: '收集4隻寵物', icon: '🐾', requirement: 4, type: 'pets', xp_reward: 300 },
    { id: 'ach_pets_8', name: '收藏家', description: '收集全部8隻寵物', icon: '🏅', requirement: 8, type: 'pets', xp_reward: 1000 },
    { id: 'ach_boss_1', name: '勇者初心', description: '擊敗第一個Boss', icon: '⚔️', requirement: 1, type: 'boss', xp_reward: 200 },
    { id: 'ach_boss_3', name: '勇者之路', description: '擊敗3個Boss', icon: '🗡️', requirement: 3, type: 'boss', xp_reward: 500 },
    { id: 'ach_boss_6', name: '傳說勇者', description: '擊敗6個Boss', icon: '🛡️', requirement: 6, type: 'boss', xp_reward: 1000 },
  ];

  const insertAchievement = db.prepare(`
    INSERT OR IGNORE INTO achievements (id, name, description, icon, requirement, type, xp_reward)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const ach of achievements) {
    insertAchievement.run(ach.id, ach.name, ach.description, ach.icon, ach.requirement, ach.type, ach.xp_reward);
  }

  // Seed pets
  const pets = [
    { id: 'pet_stat', name: 'Stat-Chan', emoji: '📊', description: '統計學精靈，幫助你理解數據', rarity: 'common', subject: '統計學' },
    { id: 'pet_psycho', name: 'Psycho-Kun', emoji: '🧠', description: '心理學小精靈，陪你探索心靈', rarity: 'common', subject: '心理學' },
    { id: 'pet_book', name: 'Book-Nyan', emoji: '📚', description: '愛讀書的貓咪，知識淵博', rarity: 'rare', subject: '普通心理學' },
    { id: 'pet_flame', name: 'Flame-Sprite', emoji: '🔥', description: '熱情的火焰精靈，激勵你學習', rarity: 'rare', subject: '動機心理學' },
    { id: 'pet_diamond', name: 'Diamond-Owl', emoji: '💎', description: '智慧的鑽石貓頭鷹', rarity: 'epic', subject: '認知心理學' },
    { id: 'pet_phoenix', name: 'Golden-Phoenix', emoji: '🌟', description: '傳說中的金鳳凰，帶來好運', rarity: 'legendary', subject: '全科目' },
    { id: 'pet_panda', name: 'Professor-Panda', emoji: '🎓', description: '博學的熊貓教授', rarity: 'epic', subject: '發展心理學' },
    { id: 'pet_coffee', name: 'Coffee-Slime', emoji: '☕', description: '咖啡史萊姆，提振精神', rarity: 'common', subject: '專注力' },
  ];

  const insertPet = db.prepare(`
    INSERT OR IGNORE INTO pets (id, name, emoji, description, rarity, subject)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const pet of pets) {
    insertPet.run(pet.id, pet.name, pet.emoji, pet.description, pet.rarity, pet.subject);
  }

  // Seed shop items
  const shopItems = [
    { id: 'egg_common', name: '普通蛋', description: '可能孵出普通寵物', icon: '🥚', price: 100, type: 'egg', rarity: 'common' },
    { id: 'egg_rare', name: '稀有蛋', description: '可能孵出稀有寵物', icon: '🥚', price: 300, type: 'egg', rarity: 'rare' },
    { id: 'egg_epic', name: '史詩蛋', description: '可能孵出史詩寵物', icon: '🥚', price: 600, type: 'egg', rarity: 'epic' },
    { id: 'egg_legendary', name: '傳說蛋', description: '可能孵出傳說寵物', icon: '🥚', price: 1000, type: 'egg', rarity: 'legendary' },
    { id: 'food_apple', name: '蘋果', description: '餵食寵物，增加快樂度', icon: '🍎', price: 20, type: 'food', rarity: null },
    { id: 'food_cake', name: '蛋糕', description: '餵食寵物，大幅增加快樂度', icon: '🍰', price: 50, type: 'food', rarity: null },
    { id: 'toy_ball', name: '玩具球', description: '和寵物一起玩耍', icon: '⚽', price: 30, type: 'toy', rarity: null },
    { id: 'boost_xp', name: 'XP加倍券', description: '下次任務XP翻倍', icon: '✨', price: 200, type: 'boost', rarity: null },
  ];

  const insertItem = db.prepare(`
    INSERT OR IGNORE INTO shop_items (id, name, description, icon, price, type, rarity)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const item of shopItems) {
    insertItem.run(item.id, item.name, item.description, item.icon, item.price, item.type, item.rarity);
  }
};

seedData();

export default db;
