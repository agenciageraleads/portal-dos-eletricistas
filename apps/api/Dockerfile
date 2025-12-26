# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
# Como o contexto já é apps/api (defino no Railway), copiamos localmente
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code relative to current directory
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY --from=builder /app/package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built application and Prisma files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/main.js"]
