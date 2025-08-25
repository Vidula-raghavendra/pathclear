@echo off
echo 🚀 Starting Traffic Analysis Server...
echo =====================================

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found. Please install Python 3.6+
    pause
    exit /b 1
)

echo ✅ Python found

REM Install Flask
echo 📦 Installing Flask...
python -m pip install flask flask-cors

REM Create uploads directory
if not exist "uploads\videos" mkdir uploads\videos
echo ✅ Created uploads directory

REM Start the server
echo 🚀 Starting server...
python working_server.py

pause