# NAVIGATED Unified Hackathon Suite Launcher
# Launches both the React 19 Command Center (Port 3000) and the Python FastAPI ML Simulation Engine (Port 8000)

Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "  NAVIGATED - Dynamic Forecast of ETA for Coaching Trains" -ForegroundColor Yellow
Write-Host "  Smart India Hackathon 2026 | Problem Statement ID: SIH26028" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Cyan

$env:PATH = "C:\Program Files\nodejs;$env:APPDATA\npm;$env:PATH"
$commandDir = "C:\Users\dhruv\.gemini\antigravity-ide\scratch\navigated-command"
$mvpDir = "C:\Users\dhruv\.gemini\antigravity-ide\scratch\navigated-sih-mvp"

# 1. Start Python FastAPI ML Backend on Port 8000
Write-Host "`n[+] Starting Python FastAPI Engine on http://localhost:8000..." -ForegroundColor Yellow
Start-Process -FilePath "py" -ArgumentList "run_app.py" -WorkingDirectory $mvpDir

# 2. Start React 19 Command Center on Port 3000
Write-Host "[+] Starting React 19 Command Center on http://localhost:3000..." -ForegroundColor Green
Set-Location $commandDir
$env:PORT = "3000"
& "C:\Program Files\nodejs\node.exe" dist/index.js
