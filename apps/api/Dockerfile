# Base stage
FROM node:20-slim AS base

# Install system dependencies
RUN apt-get update -y && apt-get install -y \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Dependencies stage
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json turbo.json ./
COPY apps ./apps
RUN npm ci
# Install sharp based on architecture
RUN arch="$(uname -m)" && \
    if [ "$arch" = "x86_64" ]; then \
    npm install sharp @img/sharp-linux-x64; \
    elif [ "$arch" = "aarch64" ]; then \
    npm install sharp @img/sharp-linux-arm64; \
    else \
    npm install sharp; \
    fi

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

# Create home directory for nestjs user to avoid npm EACCES errors
RUN mkdir -p /home/nestjs && chown nestjs:nodejs /home/nestjs
ENV HOME=/home/nestjs

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./package.json
COPY --from=builder /app/apps/api/prisma ./prisma

# Install sharp based on architecture
RUN arch="$(uname -m)" && \
    if [ "$arch" = "x86_64" ]; then \
    npm install sharp @img/sharp-linux-x64; \
    elif [ "$arch" = "aarch64" ]; then \
    npm install sharp @img/sharp-linux-arm64; \
    else \
    npm install sharp; \
    fi

# Criar script de startup que roda migrations + seed + inicia app
RUN echo '#!/bin/sh\n\
    echo "🔄 Running database migrations..."\n\
    npx prisma migrate deploy\n\
    echo "🌱 Running database seed..."\n\
    npx prisma db seed || echo "⚠️  Seed already executed or failed (skipping)"\n\
    echo "🚀 Starting application..."\n\
    node dist/main.js\n\
    ' > /app/start.sh && chmod +x /app/start.sh

# Fix: Ensure nestjs user owns the cache created by the previous root command
RUN chown -R nestjs:nodejs /home/nestjs

USER nestjs

EXPOSE 3333

CMD ["/app/start.sh"]
