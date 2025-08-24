#!/usr/bin/env python3
"""
Setup script for YOLOv8 Traffic Analysis Server
Installs all required dependencies for the Flask server
"""

import subprocess
import sys
import os

def install_requirements():
    """Install Python requirements"""
    print("Installing Python dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ All dependencies installed successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        return False
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    return True

def main():
    print("🚀 Setting up YOLOv8 Traffic Analysis Server...")
    
    if not check_python_version():
        sys.exit(1)
    
    if not install_requirements():
        sys.exit(1)
    
    print("\n🎉 Setup complete! You can now start the server with:")
    print("   python flask_server.py")
    print("   or")
    print("   npm start")

if __name__ == "__main__":
    main()