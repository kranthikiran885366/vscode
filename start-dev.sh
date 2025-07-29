
#!/bin/bash

echo "Starting AI-Powered IDE Platform..."

# Start databases with Docker
echo "Starting databases..."
docker-compose up -d mongodb redis

# Wait for databases to be ready
echo "Waiting for databases to start..."
sleep 10

# Start backend services
echo "Starting backend services..."

# Auth Service
cd services/auth-service
npm install
npm run dev &
AUTH_PID=$!

# Project Service  
cd ../project-service
npm install
npm run dev &
PROJECT_PID=$!

# Collaboration Service
cd ../collaboration-service
npm install
npm run dev &
COLLAB_PID=$!

# Terminal Service
cd ../terminal-service
npm install
npm run dev &
TERMINAL_PID=$!

# AI Service
cd ../ai-service
pip install -r requirements.txt
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8001 &
AI_PID=$!

# Execution Service
cd ../execution-service
pip install -r requirements.txt
python -m uvicorn src.main:app --reload --host 0.0.0.0 --port 8002 &
EXEC_PID=$!

# Return to root and start frontend
cd ../..
npm run dev &
FRONTEND_PID=$!

echo "All services started!"
echo "Frontend: http://localhost:3000"
echo "Auth Service: http://localhost:3001"
echo "Project Service: http://localhost:3002"
echo "Collaboration Service: http://localhost:3003"
echo "Terminal Service: http://localhost:3004"
echo "AI Service: http://localhost:8001"
echo "Execution Service: http://localhost:8002"

# Wait for Ctrl+C
trap "echo 'Shutting down...'; kill $AUTH_PID $PROJECT_PID $COLLAB_PID $TERMINAL_PID $AI_PID $EXEC_PID $FRONTEND_PID; docker-compose down; exit" SIGINT SIGTERM

wait
