#!/bin/bash

echo "Installing Startup Validation App (Clean Version)..."

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Install frontend dependencies (without React Router)
echo "Installing frontend dependencies..."
cd ui
npm install
cd ..

echo "Installation complete!"
echo ""
echo "To start the app:"
echo "1. Backend: cd backend && npm start"
echo "2. Frontend: cd ui && npm start"
echo ""
echo "The app will be available at http://localhost:3000"
echo "Dashboard will be at http://localhost:3000/dashboard.html"
