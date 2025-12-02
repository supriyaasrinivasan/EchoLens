@echo off
REM SupriAI Backend Test Script for Windows
REM Double-click this file to test all backend endpoints

echo ========================================
echo   SupriAI Backend Test Suite
echo ========================================
echo.

REM Navigate to backend directory
cd /d "%~dp0"

REM Check if test_backend.py exists
if not exist "test_backend.py" (
    echo ERROR: test_backend.py not found
    echo.
    pause
    exit /b 1
)

echo Running tests...
echo.
echo Make sure the backend server is running first!
echo (Run START_SERVER.bat in another window)
echo.
timeout /t 3 >nul

REM Run tests
python test_backend.py

echo.
echo ========================================
pause
