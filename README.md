# 🎮 Winnie's Study Quest

A gamified study tracking web application with Pokemon-style pet collection system, designed to help Winnie prepare for her 成大心理轉學考 (National Cheng Kung University Psychology Transfer Exam).

![Dark Mode RPG Theme](https://img.shields.io/badge/theme-dark%20RPG-8B5CF6)
![Built with React](https://img.shields.io/badge/React-18-61DAFB)
![Built with Vite](https://img.shields.io/badge/Vite-7.3-646CFF)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)

---

## ✨ Features

### 🎯 Core System
- **Simple Authentication** - Username-only login (no password required)
- **Level/XP System** - Progress tracking with visual progress bars
- **Daily Quests** - Auto-generated tasks that reset at midnight (Taiwan timezone)
- **Streak Tracking** - Consecutive study days with 🔥 fire animation
- **Pomodoro Timer** - Built-in 25/5 minute timer
- **Achievement System** - 15 achievements across 5 categories
- **Shop System** - Buy power-ups and pet eggs with earned XP
- **Boss Battles** - Monthly mock exam challenges
- **Statistics Dashboard** - Visual charts for study metrics

### 🐾 Pokemon-Style Pet Collection
- **8 Collectible Pets** with different rarities:
  - 📊 Stat-Chan (Statistics Pet) - Common ⭐
  - 🧠 Psycho-Kun (Psychology Pet) - Common ⭐
  - 📚 Book-Nyan (Book Cat) - Rare ⭐⭐
  - 🔥 Flame-Sprite - Rare ⭐⭐
  - 💎 Diamond-Owl - Epic ⭐⭐⭐
  - 🌟 Golden-Phoenix - Legendary ⭐⭐⭐⭐
  - 🎓 Professor-Panda - Epic ⭐⭐⭐
  - ☕ Coffee-Slime - Common ⭐

- **Pet Egg Hatching** - Complete 10 Pomodoros to hatch an egg
- **Pet Leveling** - Level up your pets from Lv.1 to Lv.10
- **Pet Interactions** - Feed, pat, and play with your pets
- **Pokedex** - Track your collection progress

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with **TypeScript**
- **Vite 7.3** for lightning-fast development
- **Tailwind CSS** for styling
- **Framer Motion** for smooth animations
- **React Router** for navigation

### Backend
- **Node.js** with **Express**
- **SQLite** for data persistence
- **TypeScript** for type safety

### Design
- **Dark theme** with purple (#8B5CF6) and gold (#F59E0B) accents
- **RPG-inspired UI** with gamification elements
- **Responsive design** for desktop and mobile

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/foxjwjw99-rgb/winnie-study-quest.git
cd winnie-study-quest/client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

This will start both:
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3001

---

## 📁 Project Structure

```
winnie-study-quest/
├── client/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── context/        # React context (Auth)
│   │   ├── hooks/          # Custom hooks (Pomodoro)
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # API client & helpers
│   ├── server/
│   │   └── src/
│   │       ├── routes/     # Express API routes
│   │       ├── database.ts # SQLite setup & seeding
│   │       └── utils.ts    # Server utilities
│   └── package.json
└── README.md
```

---

## 🎮 How to Use

### 1. Login
- Enter any username (creates account if new)
- No password required!

### 2. Complete Daily Quests
- Check off tasks to earn XP
- Quests reset at midnight Taiwan time

### 3. Use Pomodoro Timer
- Study in focused 25-minute sessions
- Each session counts toward egg hatching!

### 4. Collect Pets
- Buy eggs from the shop with XP
- Complete Pomodoros to hatch them
- Level up your pets by studying

### 5. Track Progress
- View statistics and achievements
- Monitor your study streak
- Challenge monthly boss battles

---

## 🎯 Study Subjects

Designed for **成大心理轉學考** preparation:
- 📊 **心理統計** (Psychology Statistics)
- 🧠 **心理學概論** (Introduction to Psychology)
- 📚 **英文** (English)

---

## 🐛 Known Issues

- Cloudflare Tunnel compatibility (use localhost for now)
- Mobile responsiveness being improved

---

## 🤝 Contributing

This is a personal project for Winnie's exam preparation. Feel free to fork and adapt for your own study needs!

---

## 📄 License

MIT License - feel free to use and modify!

---

## 💖 Credits

- **Designed for**: Winnie (Jimmy's girlfriend)
- **Built by**: 狐狸 (FoxBot) 🦊 powered by Claude Code (Opus 4.5)
- **For**: 成大心理轉學考 preparation

---

## 📞 Support

If you have questions or issues:
1. Open an issue on GitHub
2. Check the code comments for implementation details

---

**Good luck with your exam, Winnie! 加油！** 📚✨

---

*Made with ❤️ and ☕ by an AI fox who believes in Winnie's success!* 🦊
