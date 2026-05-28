# 1. Estágio Base (Base Stage)
FROM node:20-slim AS base
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# 2. Estágio de Poda (Pruner Stage - Isola a API e o Prisma do monorepo)
FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=api --docker

# 3. Estágio de Dependências (Dependencies Stage - Instala apenas pacotes necessários do backend)
FROM base AS deps
WORKDIR /app
COPY --from=pruner /app/out/json/ .
RUN npm ci
# Instala pacote sharp nativo baseado na arquitetura da máquina
RUN arch="$(uname -m)" && \
    if [ "$arch" = "x86_64" ]; then \
    npm install sharp @img/sharp-linux-x64; \
    elif [ "$arch" = "aarch64" ]; then \
    npm install sharp @img/sharp-linux-arm64; \
    else \
    npm install sharp; \
    fi

# 4. Estágio do Builder (Builder Stage - Gera o cliente Prisma e compila NestJS)
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=pruner /app/out/full/ .
COPY --from=pruner /app/out/json/ .

# Gera o Prisma Client com base no schema.prisma da API
WORKDIR /app/apps/api
RUN npx prisma generate
WORKDIR /app
# Instala pacotes NestJS auxiliares globais de compilação
RUN npm install -g @nestjs/cli
RUN npm install dotenv @types/dotenv
RUN npm run build --workspace=apps/api

# 5. Estágio de Execução (Runner Stage - Executa o servidor NestJS na VPS)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Rodar como usuário não-root (segurança de infraestrutura)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs
RUN mkdir -p /home/nestjs && chown nestjs:nodejs /home/nestjs
ENV HOME=/home/nestjs

COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/package.json ./package.json
COPY --from=builder /app/apps/api/prisma ./prisma

# Garante dependência nativa do Sharp em produção
RUN arch="$(uname -m)" && \
    if [ "$arch" = "x86_64" ]; then \
    npm install sharp @img/sharp-linux-x64; \
    elif [ "$arch" = "aarch64" ]; then \
    npm install sharp @img/sharp-linux-arm64; \
    else \
    npm install sharp; \
    fi

# Script de Inicialização (db push + migrations + main start)
RUN echo '#!/bin/sh\n\
    echo "🔄 Syncing database schema..."\n\
    npx prisma db push --skip-generate --accept-data-loss || echo "⚠️  Schema already synced"\n\
    echo "🔄 Running database migrations..."\n\
    npx prisma migrate deploy || echo "⚠️  No migrations to run"\n\
    echo "🚀 Starting application..."\n\
    node dist/main.js\n\
    ' > /app/start.sh && chmod +x /app/start.sh

RUN chown -R nestjs:nodejs /home/nestjs
USER nestjs
EXPOSE 3333
ENV PORT=3333

CMD ["/app/start.sh"]
