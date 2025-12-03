@echo off
echo ========================================
echo SupriAI Backend Server Startup
echo ========================================
echo.

cd /d "%~dp0backend"

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Kill any existing process on port 5000
echo Checking for existing processes on port 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5000 ^| findstr LISTENING') do (
    echo Stopping existing process on port 5000 (PID: %%a)
    taskkill /PID %%a /F >nul 2>&1
)

echo Installing Python dependencies...
pip install -r requirements.txt --quiet

echo Installing Node.js dependencies...
call npm install --silent

echo.
echo Starting SupriAI Backend Server...
echo.
echo The server will run on http://localhost:5000
echo Press Ctrl+C to stop the server
echo.

REM Start the Node.js server (which calls Python AI service)
node server.js

pause
