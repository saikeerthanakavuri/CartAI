#!/bin/bash

echo "🚀 Starting CartAI Full Stack Application"
echo "=========================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 is not installed. Please install Python 3.8+"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+"
    exit 1
fi

# Install Python dependencies
echo "📦 Installing Python backend dependencies..."
if [ ! -f "venv/bin/activate" ]; then
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi

# Start backend in background
echo "🔧 Starting backend server..."
cd ..
source venv/bin/activate
python backend.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
echo "🌐 Starting frontend development server..."
cd frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ CartAI is now running!"
echo "🌐 Frontend: http://localhost:5173"
echo "🔗 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "📱 Features available:"
echo "  • Real-time product detection with AI"
echo "  • Camera-based product scanning"
echo "  • Automatic cart updates"
echo "  • Live inventory management"
echo "  • WebSocket real-time updates"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for user to stop
wait $FRONTEND_PID $BACKEND_PID
