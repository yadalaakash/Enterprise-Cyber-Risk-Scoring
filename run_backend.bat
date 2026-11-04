@echo off
echo ========================================================
echo Starting AI Cyber-Risk Scoring Platform Backend (Port 5000)
echo ========================================================
cd /d "%~dp0"
call .\venv\Scripts\activate.bat
python backend\app.py
pause
