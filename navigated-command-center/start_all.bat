@echo off
title NAVIGATED SIH 2026 Unified Suite
echo ======================================================================
echo   NAVIGATED - Dynamic Forecast of ETA for Coaching Trains (SIH26028)
echo ======================================================================

set "PATH=C:\Program Files\nodejs;%APPDATA%\npm;%PATH%"

echo [+] Starting Python FastAPI Engine (Port 8000)...
start "NAVIGATED FastAPI Backend" /D "C:\Users\dhruv\.gemini\antigravity-ide\scratch\navigated-sih-mvp" py run_app.py

echo [+] Starting React 19 Command Center (Port 3000)...
cd /D "C:\Users\dhruv\.gemini\antigravity-ide\scratch\navigated-command"
set PORT=3000
"C:\Program Files\nodejs\node.exe" dist\index.js
pause
