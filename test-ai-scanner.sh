#!/bin/bash

echo "🧪 CartAI AI Scanner Test"
echo "========================="

cd /home/sai-keerthana27008/repo/CartAI/frontend

echo "1. Starting development server..."
npm run dev &
DEV_PID=$!

echo "2. Waiting for server to start..."
sleep 5

echo ""
echo "✅ Frontend is running at: http://localhost:5173"
echo ""
echo "🧪 Testing Instructions:"
echo "1. Open the app in your browser"
echo "2. Click 'Customer Login' and enter any mobile number"
echo "3. Go to the Cart tab"
echo "4. Click '🤖 Start AI Scanner'"
echo "5. Show a Lays packet (or image of Lays) to the camera"
echo "6. Check the browser console (F12) for debug logs"
echo ""
echo "🔍 What to Look For:"
echo "• Camera should open and show live feed"
echo "• When you show Lays, you should see console logs starting with 🔍, 📡, 🤖"
echo "• If AI works: Product should be detected with confidence %"
echo "• If AI fails: Fallback detection should kick in after 1 second"
echo "• Product should appear in cart when detected"
echo ""
echo "❌ If Nothing Happens:"
echo "• Check if camera permission is granted"
echo "• Verify .env file has VITE_GEMINI_API_KEY set"
echo "• Look at browser console for error messages"
echo ""
echo "Press Ctrl+C to stop the server"

wait $DEV_PID
