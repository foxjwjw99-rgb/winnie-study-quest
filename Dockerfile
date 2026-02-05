FROM node:18-slim

# Install basic build tools just in case (for native modules like sqlite3)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 1. Copy Root Dependencies
COPY package*.json tsconfig.json ./

# 2. Install Root Dependencies
RUN npm install

# 3. Copy Client Dependencies
# We copy this first to leverage Docker layer caching
COPY client/package*.json ./client/

# 4. Install Client Dependencies
WORKDIR /app/client
RUN npm install

# 5. Copy All Source Code
WORKDIR /app
COPY . .

# 6. Build Client (React)
WORKDIR /app/client
RUN npm run build

# 7. Build Backend (TypeScript)
WORKDIR /app
RUN npx tsc

# 8. Setup Environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# 9. Start Server
CMD ["node", "dist/index.js"]
