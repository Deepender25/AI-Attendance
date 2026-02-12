@echo off
echo Starting AttendAI (macOS Style)...

:: Install dependencies if needed (fast if already installed)
echo Checking dependencies...
call npm install

:: Start the Backend Server
echo Launching Backend...
start "AttendAI Backend" cmd /k "node server/index.js"

:: Start the Frontend Application
echo Launching Frontend...
start "AttendAI Frontend" cmd /k "npm run dev"

echo ===================================================
echo Application started!
echo Backend running in "AttendAI Backend" window
echo Frontend running in "AttendAI Frontend" window
echo ===================================================
pause
