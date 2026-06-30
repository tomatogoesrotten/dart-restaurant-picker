# Single service: build the Vite frontend, then run the stateless proxy that
# serves BOTH the built frontend (dist/) and /api from one origin.
# The proxy reads process.env.PORT (Zeabur injects it); falls back to 8787.
FROM node:22-slim
WORKDIR /app

# Install dependencies first (better layer caching).
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and build the frontend into dist/.
COPY . .
RUN npm run build

ENV NODE_ENV=production
EXPOSE 8787
CMD ["node", "server/index.js"]
