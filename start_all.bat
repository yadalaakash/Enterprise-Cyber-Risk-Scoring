@echo off
title AI Cyber Risk Platform - Launcher
echo ========================================================
echo   Launching AI Enterprise Cyber Risk Scoring Platform
echo ========================================================
echo.
echo Starting Backend Server (Python Flask on Port 5000)...
start "CyberRisk Backend (Flask)" cmd /k "cd /d %~dp0 && call .\venv\Scripts\activate.bat && python backend\app.py"

timeout /t 3 /nobreak >nul

echo Starting Frontend Dev Server (Vite React on Port 5173)...
start "CyberRisk Frontend (Vite)" cmd /k "cd /d %~dp0\frontend && npm run dev"

echo.
echo ========================================================
echo Both servers are launching!
echo Backend:  http://127.0.0.1:5000
echo Frontend: http://localhost:5173
echo ========================================================
echo Opening browser in 3 seconds...
timeout /t 3 /nobreak >nul
start http://localhost:5173
exit
