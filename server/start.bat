@echo off
echo 🚀 Starting Traffic Analysis Server...
echo ==================================

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python 3.7+
    pause
    exit /b 1
)

echo ✅ Python found

REM Install dependencies
echo 📦 Installing dependencies...
python install_deps.py

REM Start the server
echo 🚀 Starting server...
python working_server.py

pause