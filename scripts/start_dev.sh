#!/bin/bash
# Start backend + Expo simultaneously
set -e

echo "Starting NoNap Dev Environment..."

# Find local IP
LOCAL_IP=$(ipconfig getifaddr en0 || echo "localhost")
echo "Local IP for App: $LOCAL_IP"

# Terminal 1 - Backend
osascript -e 'tell app "Terminal" to do script "cd ~/Desktop/NoNap/backend && source .venv/bin/activate && python main.py"'

# Terminal 2 - Expo App
osascript -e 'tell app "Terminal" to do script "cd ~/Desktop/NoNap/app && npx expo start"'

# Terminal 3 - Website
osascript -e 'tell app "Terminal" to do script "cd ~/Desktop/NoNap/website && npm run dev"'
