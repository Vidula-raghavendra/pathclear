#!/bin/bash

echo "🚀 Starting Traffic Analysis Server..."
echo "=================================="

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "❌ Python not found. Please install Python 3.7+"
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

echo "✅ Using Python: $PYTHON_CMD"

# Install dependencies if needed
echo "📦 Installing dependencies..."
$PYTHON_CMD install_deps.py

# Start the server
echo "🚀 Starting server..."
$PYTHON_CMD working_server.py