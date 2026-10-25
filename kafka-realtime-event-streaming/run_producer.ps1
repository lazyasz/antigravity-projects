# ==============================================================================
# PowerShell Launcher: Streaming Data Generator (Producer)
# ==============================================================================

param (
    [string]$Domain = "iot",
    [double]$Rate = 5.0,
    [int]$Total = 25,
    [string]$Topic = "iot-fleet-telemetry"
)

$VenvPython = Join-Path $PSScriptRoot ".venv\Scripts\python.exe"

if (-not (Test-Path $VenvPython)) {
    Write-Host "[*] Creating virtual environment (.venv)..." -ForegroundColor Cyan
    python -m venv (Join-Path $PSScriptRoot ".venv")
    & (Join-Path $PSScriptRoot ".venv\Scripts\pip.exe") install -r (Join-Path $PSScriptRoot "requirements.txt")
}

Write-Host "`n[+] Launching Kafka Streaming Producer..." -ForegroundColor Green
& $VenvPython (Join-Path $PSScriptRoot "src\producer.py") --domain $Domain --rate $Rate --total $Total --topic $Topic
