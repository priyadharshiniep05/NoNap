#!/bin/bash
# Final Fix & Start Script for NoNap

echo "Step 1: Cleaning up ports..."
lsof -ti:8765 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
pkill -f "expo" 2>/dev/null || true
echo "Ports cleaned."

echo "Step 2: Fixing App dependencies..."
cd app
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
echo "App dependencies reinstalled."

echo "Step 3: Starting Backend..."
cd ../backend
source .venv/bin/activate 2>/dev/null || echo "Using system python"
python3 main.py > backend.log 2>&1 &
echo "Backend started in background. Log: backend/backend.log"

echo "Step 4: Starting Website..."
cd ../website
npm run dev > website.log 2>&1 &
echo "Website started in background. Log: website/website.log"

echo "Step 5: Launching Expo..."
cd ../app
npx expo start
