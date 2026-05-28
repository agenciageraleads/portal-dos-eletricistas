# 1. Estágio Base (Base Stage)
FROM node:20-slim AS base
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

# 2. Estágio de Poda (Pruner Stage - Isola o Monorepo de forma cirúrgica)
FROM base AS pruner
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=web --docker

# 3. Estágio de Dependências (Dependencies Stage - Instala apenas pacotes necessários do frontend)
FROM base AS deps
WORKDIR /app
# Copia apenas os package.json isolados pelo pruner
COPY --from=pruner /app/out/json/ .
RUN npm ci
# Instala binários nativos opcionais de alta performance para compilação SWC e CSS
RUN npm install --save-optional \
    lightningcss-linux-x64-gnu lightningcss-linux-arm64-gnu \
    @next/swc-linux-x64-gnu @next/swc-linux-arm64-gnu \
    @tailwindcss/oxide-linux-x64-gnu @tailwindcss/oxide-linux-arm64-gnu

# 4. Estágio do Builder (Builder Stage - Compila o Next.js utilizando apenas código do web)
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
# Copia o código-fonte podado correspondente
COPY --from=pruner /app/out/full/ .
COPY --from=pruner /app/out/json/ .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Compila o Next.js 16/14 do frontend de forma otimizada usando cache de compilação Buildx
RUN --mount=type=cache,target=/app/apps/web/.next/cache npm run build --workspace=apps/web

# 5. Estágio de Execução (Runner Stage - Executa o container final ultra-leve)
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia arquivos estáticos públicos e compilados
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
