@echo off
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js was not found. Install Node.js LTS from https://nodejs.org/
  echo Then reopen this file.
  pause
  exit /b 1
)
if not exist "node_modules\ws" (
  echo Installing the WebSocket library first...
  call npm install
  if errorlevel 1 (
    echo Installation failed. Check your internet connection and try again.
    pause
    exit /b 1
  )
)
start "" "http://localhost:3000"
echo Demo website: http://localhost:3000
echo Keep this window open while demonstrating.
echo Press Ctrl+C to stop.
node server.js
pause
