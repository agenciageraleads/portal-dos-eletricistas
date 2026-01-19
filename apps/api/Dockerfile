# Base stage
FROM node:20-slim AS base

# Install system dependencies for sharp (image processing library)
RUN apt-get update -y && apt-get install -y \
    openssl \
    ca-certificates \
    libvips-dev \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Dependencies stage
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json turbo.json ./
COPY apps ./apps
RUN npm ci
# Force rebuild sharp for AMD64 after npm ci (image processing library)
RUN npm rebuild sharp

# Builder stage
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma Client
WORKDIR /app/apps/api
RUN npx prisma generate
WORKDIR /app
# Build API
RUN npm install -g @nestjs/cli
RUN npm install dotenv @types/dotenv
RUN npm run build --workspace=apps/api

# Runner stage
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./package.json
COPY --from=builder /app/apps/api/prisma ./prisma

# Rebuild sharp for current platform in production image  
RUN npm rebuild sharp

USER nestjs

EXPOSE 3333

CMD ["node", "dist/main.js"]
