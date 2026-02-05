# Project Constitution: Winnie's Study Quest

## 1. Vision & Core Values

**"Make studying a magical adventure for Winnie."**

This project is a gamified study dashboard designed specifically for Winnie to prepare for her NCKU Psychology Transfer Exam. It transforms study sessions into quests, rewards progress with cute pets, and visualizes achievements to maintain high motivation and engagement.

## 2. Design Principles

### 🎨 Clean & Cute UI/UX
- **Aesthetic**: Use a "Sakura Pink" and "Soft Rounded" design language. Colors should be warm, inviting, and easy on the eyes (e.g., pastel pinks, soft creams, warm oranges).
- **Spaciousness**: Avoid clutter. Use generous whitespace (padding/margin) to create a relaxed atmosphere.
- **Interactions**:
    - **Micro-animations**: Buttons should bounce softly, cards should float or glow on hover.
    - **Feedback**: Every action (completing a quest, feeding a pet) must have immediate, satisfying visual feedback (e.g., confetti, sound effects, cheerful toast messages).
- **Accessibility**: Ensure text has sufficient contrast, even with pastel colors. Fonts should be readable yet friendly (e.g., Nunito, Quicksand).

### 🤝 Encouraging Interactions
- **Tone of Voice**: The app should speak like a supportive friend. Use encouraging messages like "Great job!", "Keep going!", "You're doing amazing!".
- **Gamification**:
    - **Daily Quests**: Clear, achievable goals for each day.
    - **Pet System**: Pets are companions, not just Tamagotchis. They react to study progress.
    - **Achievements**: Celebrate milestones, big and small.

## 3. Technical Standards

### 🛡️ Robust Backend Stability
- **Error Handling**: Every API endpoint must have `try-catch` blocks. Errors should be logged on the server but return user-friendly messages to the client. Never crash the server on a bad request.
- **Data Integrity**: Use SQLite with transactions where appropriate to ensure data consistency (e.g., when granting XP and leveling up simultaneously).
- **Scalability**: While currently for a single user, structure the code (routes, controllers, services) to allow for easy expansion.

### 🏗️ Maintainable Code Structure
- **Frontend (React + Vite)**:
    - **Componentization**: Break down UI into small, reusable components (e.g., `QuestCard`, `PetStatus`).
    - **Hooks**: Use custom hooks (e.g., `useAuth`, `useQuests`) to separate logic from view.
    - **Styling**: Use TailwindCSS for utility-first styling, but keep complex animations or custom themes in `index.css` or dedicated modules if needed.
- **Backend (Express + SQLite)**:
    - **RESTful API**: Follow standard REST conventions for route naming and HTTP methods.
    - **Type Safety**: Use TypeScript interfaces for all data models (User, Quest, Pet).

## 4. Development Workflow
- **Spec-Driven**: Define requirements clearly before coding.
- **Iterative Improvement**: Start with core features (Quests, Timer), then polish (Animations, Pets), then expand (Shop, Boss Battles).
- **Linting & Formatting**: Ensure code is clean and consistent using ESLint/Prettier.

---
*This constitution is a living document. As Winnie's needs evolve, so shall these principles.*
