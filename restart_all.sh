#!/bin/bash
# Restart all NoNap services with proper logging
PROJECT_ROOT=$(pwd)

echo "Stopping existing NoNap services..."
pkill -f "uvicorn" || true
pkill -f "next-server" || true
pkill -f "expo" || true

echo "1. Starting Backend (Port 8765)..."
cd "$PROJECT_ROOT/backend"
source .venv/bin/activate 2>/dev/null || echo "Virtualenv not found, using system python"
python3 main.py > backend.log 2>&1 &

echo "2. Starting Website (Port 3000)..."
cd "$PROJECT_ROOT/website"
npm run dev > website.log 2>&1 &

echo "3. Starting App (Expo)..."
cd "$PROJECT_ROOT/app"
npx expo start --clear > expo.log 2>&1 &

echo "------------------------------------------------"
echo "All services initiated. Check logs for details:"
echo "- Backend: backend/backend.log"
echo "- Website: website/website.log"
echo "- App: app/expo.log"
echo "------------------------------------------------"
