# ==============================================================================
# PowerShell Launcher: Snowflake Streaming Analytics Verifier
# ==============================================================================

param (
    [int]$Events = 50
)

$VenvPython = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"

if (-not (Test-Path $VenvPython)) {
    Write-Host "[*] Creating virtual environment (.venv)..." -ForegroundColor Cyan
    python -m venv (Join-Path $PSScriptRoot ".venv")
    & (Join-Path $PSScriptRoot ".venv\Scripts\pip.exe") install -r (Join-Path $PSScriptRoot "requirements.txt")
}

Write-Host "`n[1] Ingesting $Events streaming events into Snowflake buffer..." -ForegroundColor Green
& $VenvPython (Join-Path $PSScriptRoot "src\stream_to_snowflake.py") --events $Events

Write-Host "`n[2] Executing Real-Time Snowflake Analytics (Counting & Windowing)..." -ForegroundColor Green
& $VenvPython (Join-Path $PSScriptRoot "src\verify_analytics.py")
