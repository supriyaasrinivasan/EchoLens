"""
SupriAI Backend Server Startup Script
Handles dependency checking, database initialization, and server startup
"""

import sys
import subprocess
import os
from pathlib import Path

def check_python_version():
    """Ensure Python version is compatible"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 7):
        print("❌ Error: Python 3.7 or higher is required")
        print(f"   Current version: {version.major}.{version.minor}.{version.micro}")
        return False
    print(f"✓ Python version: {version.major}.{version.minor}.{version.micro}")
    return True

def check_dependencies():
    """Check if required packages are installed"""
    required = ['flask', 'flask_cors']
    optional = ['numpy', 'sklearn']
    
    missing = []
    missing_optional = []
    
    print("\n📦 Checking dependencies...")
    
    for package in required:
        try:
            __import__(package)
            print(f"  ✓ {package}")
        except ImportError:
            missing.append(package)
            print(f"  ❌ {package} (REQUIRED)")
    
    for package in optional:
        try:
            __import__(package)
            print(f"  ✓ {package} (optional)")
        except ImportError:
            missing_optional.append(package)
            print(f"  ⚠ {package} (optional - enhanced AI features disabled)")
    
    if missing:
        print("\n❌ Missing required packages. Installing...")
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install'] + missing)
            print("✓ Required packages installed successfully!")
        except subprocess.CalledProcessError:
            print("❌ Failed to install packages. Please run:")
            print(f"   pip install {' '.join(missing)}")
            return False
    
    if missing_optional:
        print("\n⚠ Optional packages not installed. For enhanced AI features, run:")
        print(f"   pip install {' '.join(missing_optional)}")
    
    return True

def check_port(port=5000):
    """Check if the port is available"""
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        try:
            s.bind(('127.0.0.1', port))
            print(f"✓ Port {port} is available")
            return True
        except OSError:
            print(f"❌ Port {port} is already in use")
            print(f"   Please close the application using port {port} or change the port in config.py")
            return False

def initialize_database():
    """Initialize the database"""
    print("\n🗄️  Initializing database...")
    try:
        from app import init_db
        init_db()
        print("✓ Database initialized successfully")
        return True
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        return False

def start_server():
    """Start the Flask server"""
    print("\n🚀 Starting SupriAI Backend Server...")
    print("=" * 60)
    print("Server URL: http://localhost:5000")
    print("Health Check: http://localhost:5000/api/health")
    print("=" * 60)
    print("\nPress Ctrl+C to stop the server\n")
    
    try:
        from app import app
        app.run(host='0.0.0.0', port=5000, debug=True, use_reloader=False)
    except KeyboardInterrupt:
        print("\n\n✓ Server stopped gracefully")
    except Exception as e:
        print(f"\n❌ Server error: {e}")
        return False
    
    return True

def main():
    """Main startup sequence"""
    print("=" * 60)
    print("         SupriAI Backend Server Startup")
    print("=" * 60)
    
    # Step 1: Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Step 2: Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Step 3: Check port availability
    if not check_port(5000):
        response = input("\nDo you want to continue anyway? (y/n): ")
        if response.lower() != 'y':
            sys.exit(1)
    
    # Step 4: Initialize database
    if not initialize_database():
        response = input("\nDatabase initialization failed. Continue anyway? (y/n): ")
        if response.lower() != 'y':
            sys.exit(1)
    
    # Step 5: Start server
    start_server()

if __name__ == '__main__':
    main()
