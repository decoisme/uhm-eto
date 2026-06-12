@echo off
cls
echo ========================================
echo   Starting Local Server
echo   Gesture Memory Gallery
echo ========================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python not found!
    echo.
    echo Please install Python from: https://www.python.org/downloads/
    echo Or use alternative method below:
    echo.
    echo Alternative: Use VSCode Live Server extension
    echo 1. Install "Live Server" extension in VSCode
    echo 2. Right-click index.html
    echo 3. Select "Open with Live Server"
    echo.
    pause
    exit
)

echo ✅ Python found
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

REM Start Python HTTP server
echo Starting Python HTTP server...
echo.
python -m http.server 8000

pause

