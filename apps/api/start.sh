#!/bin/sh
# Startup script for Railway deployment
# Runs Prisma migrations before starting the app

echo "🔄 Running Prisma migrations..."
npx prisma generate
npx prisma migrate deploy

echo "🚀 Starting application..."
node dist/src/main.js
