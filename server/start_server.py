#!/usr/bin/env python3
"""
Simple server starter script that handles dependencies gracefully
"""

import sys
import subprocess
import os

def check_dependencies():
    """Check if required dependencies are available"""
    try:
        import flask
        import flask_cors
        print("✅ Flask dependencies available")
        return True
    except ImportError as e:
        print(f"❌ Missing dependencies: {e}")
        return False

def install_basic_deps():
    """Install basic Flask dependencies"""
    print("Installing basic Flask dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "flask", "flask-cors"])
        print("✅ Basic dependencies installed")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install dependencies: {e}")
        return False

def main():
    print("🚀 Starting Traffic Analysis Server...")
    
    # Check if dependencies are available
    if not check_dependencies():
        print("Installing required dependencies...")
        if not install_basic_deps():
            print("❌ Failed to install dependencies. Please install manually:")
            print("   pip install flask flask-cors")
            sys.exit(1)
    
    # Start the server
    print("Starting Flask server...")
    try:
        # Import and run the Flask app
        from flask_server import app
        print("✅ Server ready at http://localhost:5000")
        print("✅ Health check: http://localhost:5000/api/health")
        app.run(host='0.0.0.0', port=5000, debug=False)
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()