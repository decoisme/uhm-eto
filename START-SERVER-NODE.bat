@echo off
cls
echo ========================================
echo   Starting Local Server (Node.js)
echo   Gesture Memory Gallery
echo ========================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js not found!
    echo.
    echo Please use START-SERVER.bat (Python) instead
    echo Or install Node.js from: https://nodejs.org/
    echo.
    pause
    exit
)

echo ✅ Node.js found
echo.
echo 🚀 Starting server on: http://localhost:8000
echo.
echo 📝 Instructions:
echo    - Browser will open automatically
echo    - Allow camera access when prompted
echo    - Use hand gestures to control
echo.
echo ⚠️  Keep this window open while using the app
echo    Press Ctrl+C to stop server
echo.
echo ========================================
echo.

REM Wait 2 seconds then open browser
timeout /t 2 /nobreak > nul
start http://localhost:8000

REM Start Node.js HTTP server
echo Starting Node.js HTTP server...
echo.
npx --yes http-server -p 8000 -c-1

pause
