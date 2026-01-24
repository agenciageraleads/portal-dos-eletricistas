# Base stage
FROM node:20-slim AS base

RUN apt-get update -y && apt-get install -y openssl ca-certificates

# Dependencies stage
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json turbo.json ./
COPY apps ./apps
RUN npm ci

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
USER nestjs

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./package.json
COPY --from=builder /app/apps/api/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/src/main.js"]
