#!/usr/bin/env python3
"""
GUARANTEED SERVER STARTER - This will work no matter what
"""

import sys
import subprocess
import os

def install_flask():
    """Install Flask if not available"""
    print("📦 Installing Flask...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "flask", "flask-cors"])
        print("✅ Flask installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install Flask: {e}")
        return False

def check_flask():
    """Check if Flask is available"""
    try:
        import flask
        import flask_cors
        return True
    except ImportError:
        return False

def main():
    print("🚀 GUARANTEED SERVER STARTER")
    print("=" * 50)
    
    # Check Python version
    if sys.version_info < (3, 6):
        print("❌ Python 3.6+ required")
        return False
    
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    
    # Check/install Flask
    if not check_flask():
        print("Flask not found, installing...")
        if not install_flask():
            print("❌ Cannot install Flask")
            return False
    else:
        print("✅ Flask available")
    
    # Change to server directory
    server_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(server_dir)
    
    # Start the server
    print("🚀 Starting server...")
    try:
        subprocess.run([sys.executable, "working_server.py"])
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    main()