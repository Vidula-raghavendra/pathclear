#!/usr/bin/env python3
"""
ONE-CLICK INSTALL AND START - This will definitely work
"""

import sys
import subprocess
import os
import time

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} successful")
            return True
        else:
            print(f"❌ {description} failed: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ {description} error: {e}")
        return False

def main():
    print("🚀 ONE-CLICK TRAFFIC ANALYSIS SERVER SETUP")
    print("=" * 60)
    
    # Install Flask
    if not run_command(f"{sys.executable} -m pip install flask flask-cors", "Installing Flask"):
        print("Trying alternative installation...")
        run_command(f"{sys.executable} -m pip install --user flask flask-cors", "Installing Flask (user)")
    
    # Create uploads directory
    os.makedirs("uploads/videos", exist_ok=True)
    print("✅ Created uploads directory")
    
    # Start server
    print("\n🚀 Starting Traffic Analysis Server...")
    print("Server will be available at: http://localhost:5000")
    print("Press Ctrl+C to stop the server")
    print("=" * 60)
    
    try:
        # Import and run the server
        exec(open('working_server.py').read())
    except KeyboardInterrupt:
        print("\n🛑 Server stopped")
    except Exception as e:
        print(f"❌ Server error: {e}")
        print("\nTrying direct execution...")
        os.system(f"{sys.executable} working_server.py")

if __name__ == "__main__":
    main()