#!/bin/bash
# start_services.sh

PROJECT_ROOT=$(pwd)

# 1. Kill existing
lsof -ti:8765 | xargs kill -9 2>/dev/null || true
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
pkill -f "expo" 2>/dev/null || true

# 2. Start Backend
echo "Starting Backend..."
cd "$PROJECT_ROOT/backend"
./.venv/bin/python main.py > backend.log 2>&1 &
echo $! > backend.pid

# 3. Start Website
echo "Starting Website..."
cd "$PROJECT_ROOT/website"
npm run dev > website.log 2>&1 &
echo $! > website.pid

# 4. Start App
echo "Starting App (Expo)..."
cd "$PROJECT_ROOT/app"
npx expo start --clear > expo.log 2>&1 &
echo $! > expo.pid

echo "All services starting in background."
echo "Check logs:"
echo "- Backend: backend/backend.log"
echo "- Website: website/website.log"
echo "- App: app/expo.log"
