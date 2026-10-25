# ==============================================================================
# PowerShell Launcher: Kafka Stream Consumer & Monitor
# ==============================================================================

param (
    [string]$Topic = "iot-fleet-telemetry",
    [int]$MaxMessages = 25
)

$VenvPython = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"

if (-not (Test-Path $VenvPython)) {
    Write-Host "[*] Creating virtual environment (.venv)..." -ForegroundColor Cyan
    python -m venv (Join-Path $PSScriptRoot ".venv")
    & (Join-Path $PSScriptRoot ".venv\Scripts\pip.exe") install -r (Join-Path $PSScriptRoot "requirements.txt")
}

Write-Host "`n[+] Launching Kafka Stream Consumer..." -ForegroundColor Green
& $VenvPython (Join-Path $PSScriptRoot "src\consumer.py") --topic $Topic --max-messages $MaxMessages --from-beginning
