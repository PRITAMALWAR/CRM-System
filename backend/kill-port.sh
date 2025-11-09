#!/bin/bash
# Script to kill process on port 5000

PORT=5000

echo "Checking for process on port $PORT..."

PID=$(lsof -ti:$PORT 2>/dev/null)

if [ -z "$PID" ]; then
    echo "No process found on port $PORT"
    exit 0
fi

echo "Found process $PID on port $PORT"
echo "Killing process..."
kill -9 $PID 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Process killed successfully"
else
    echo "❌ Failed to kill process. Try running with sudo:"
    echo "   sudo kill -9 $PID"
fi


