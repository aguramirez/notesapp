#!/bin/bash

# Exit on error
set -e

echo "==========================================="
echo "   Starting NotesApp (Spring Boot + React) "
echo "==========================================="

# Navigate to backend, build and start it in the background
echo "--> Starting Backend (Spring Boot)..."
cd backend
# Build the application
mvn clean package -DskipTests

# Run Spring Boot in the background and get PID
java -jar target/notes-0.0.1-SNAPSHOT.jar > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started in background (PID: $BACKEND_PID, logs: backend/backend.log)"

cd ..

# Navigate to frontend, install dependencies and start it
echo "--> Starting Frontend (React)..."
cd frontend
if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm install
fi

# Run frontend in foreground so the terminal stays active
echo "Frontend is starting at http://localhost:5173"
echo "Press Ctrl+C to stop both frontend and backend."

# Trap Ctrl+C to kill the backend process
cleanup() {
  echo ""
  echo "--> Stopping backend process (PID $BACKEND_PID)..."
  kill $BACKEND_PID 2>/dev/null || true
  echo "Application stopped successfully."
  exit 0
}
trap cleanup SIGINT SIGTERM

npm run dev
