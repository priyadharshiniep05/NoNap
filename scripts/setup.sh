#!/bin/bash
# One-command environment setup
set -e

echo "Setting up NoNap..."

echo "1. Backend Setup"
cd ~/Desktop/NoNap/backend
python3.11 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Download dlib shape predictor
if [ ! -f "models/shape_predictor_68_face_landmarks.dat" ]; then
    echo "Downloading dlib shape predictor..."
    python3.11 -c "import urllib.request; urllib.request.urlretrieve('https://github.com/davisking/dlib-models/raw/master/shape_predictor_68_face_landmarks.dat.bz2', 'models/shape_predictor_68_face_landmarks.dat.bz2')"
    bzip2 -d models/shape_predictor_68_face_landmarks.dat.bz2
fi

echo "2. App Setup"
cd ../app
npm install --legacy-peer-deps

echo "3. Website Setup"
cd ../website
npm install --legacy-peer-deps

echo "Setup Complete!"
