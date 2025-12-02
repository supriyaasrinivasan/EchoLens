@echo off
REM SupriAI Backend Server Startup Script for Windows
REM Double-click this file to start the server

echo ========================================
echo   SupriAI Backend Server Startup
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.7 or higher from https://www.python.org/
    echo.
    pause
    exit /b 1
)

echo Python is installed
python --version
echo.

REM Navigate to backend directory
cd /d "%~dp0"

REM Check if start_server.py exists
if not exist "start_server.py" (
    echo ERROR: start_server.py not found
    echo Please ensure you're running this script from the backend folder
    echo.
    pause
    exit /b 1
)

echo Starting SupriAI Backend Server...
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start the server
python start_server.py

pause
