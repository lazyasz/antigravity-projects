# ==============================================================================
# PowerShell Launcher: Real-Time Streamlit Visualization Dashboard
# ==============================================================================

$VenvStreamlit = Join-Path $PSScriptRoot ".venv\Scripts\streamlit.exe"

if (-not (Test-Path $VenvStreamlit)) {
    Write-Host "[*] Creating virtual environment (.venv)..." -ForegroundColor Cyan
    python -m venv (Join-Path $PSScriptRoot ".venv")
    & (Join-Path $PSScriptRoot ".venv\Scripts\pip.exe") install -r (Join-Path $PSScriptRoot "requirements.txt")
}

Write-Host "`n[+] Launching Snowflake Real-Time Streaming Visualizer..." -ForegroundColor Green
& $VenvStreamlit run (Join-Path $PSScriptRoot "src\dashboard_app.py")
