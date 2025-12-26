# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/api/package*.json ./apps/api/

# Install dependencies
RUN npm ci

# Copy source code
COPY apps/api ./apps/api

# Generate Prisma Client
WORKDIR /app/apps/api
RUN npx prisma generate

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/api/package*.json ./apps/api/

# Install production dependencies only
RUN npm ci --omit=dev

# Copy built application and Prisma files
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/prisma ./apps/api/prisma
COPY --from=builder /app/apps/api/node_modules/.prisma ./apps/api/node_modules/.prisma

# Create uploads directory
RUN mkdir -p /app/apps/api/uploads

WORKDIR /app/apps/api

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/main.js"]
