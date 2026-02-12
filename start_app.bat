@echo off
echo Starting Attend Sight...

:: Install dependencies if needed (fast if already installed)
echo Checking dependencies...
call npm install

:: Start the Backend Server
echo Launching Backend...
start "Attend Sight Backend" cmd /k "node server/index.js"

:: Start the Frontend Application
echo Launching Frontend...
start "Attend Sight Frontend" cmd /k "npm run dev"

echo ===================================================
echo Application started!
echo Backend running in "Attend Sight Backend" window
echo Frontend running in "Attend Sight Frontend" window
echo ===================================================
pause
