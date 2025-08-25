#!/usr/bin/env python3
"""
Install only the essential dependencies needed for the server
"""

import subprocess
import sys
import os

def install_package(package):
    """Install a single package"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        print(f"✅ {package} installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to install {package}: {e}")
        return False

def main():
    print("🚀 Installing essential server dependencies...")
    print("=" * 50)
    
    # Only install what we absolutely need
    essential_packages = [
        "flask",
        "flask-cors"
    ]
    
    success_count = 0
    for package in essential_packages:
        if install_package(package):
            success_count += 1
    
    print("=" * 50)
    if success_count == len(essential_packages):
        print("🎉 All dependencies installed successfully!")
        print("You can now start the server with: python working_server.py")
    else:
        print(f"⚠️  {success_count}/{len(essential_packages)} packages installed")
        print("Some packages failed to install, but the server might still work")

if __name__ == "__main__":
    main()