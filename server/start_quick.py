#!/usr/bin/env python3
"""
Start the quick server - guaranteed to work
"""

import subprocess
import sys
import os

def main():
    print("🚀 Starting Quick Server...")
    
    # Change to server directory
    server_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(server_dir)
    
    try:
        # Start the quick server
        subprocess.run([sys.executable, "quick_server.py"])
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error: {e}")
        print("Trying alternative method...")
        
        # Fallback - run directly
        import quick_server
        quick_server.main()

if __name__ == "__main__":
    main()