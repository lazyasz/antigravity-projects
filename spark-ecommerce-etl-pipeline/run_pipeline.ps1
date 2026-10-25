# ==============================================================================
# Cloud Data Engineering Lab - Assignment 02
# End-to-End Pipeline Runner Script
# ==============================================================================

Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host " Cloud Data Engineering Lab: Assignment 02 - Spark ETL Pipeline" -ForegroundColor Green
Write-Host " Amazon S3  -->  Apache Spark  -->  Amazon RDS MySQL" -ForegroundColor Yellow
Write-Host "==================================================================" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Configure Environments
$env:HADOOP_HOME = "$scriptDir\hadoop"
$env:SPARK_HOME = "$scriptDir\.venv\Lib\site-packages\pyspark"
$env:PYSPARK_PYTHON = "$scriptDir\.venv\Scripts\python.exe"

$pythonExe = "$scriptDir\.venv\Scripts\python.exe"
if (-Not (Test-Path $pythonExe)) {
    $pythonExe = "python"
}

Write-Host "`n[*] Running ETL Pipeline via PySpark..." -ForegroundColor Cyan
& $pythonExe "$scriptDir\src\etl_pipeline.py"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[+] Executing Amazon RDS MySQL Verification Queries..." -ForegroundColor Green
    & $pythonExe "$scriptDir\src\verify_data.py"
} else {
    Write-Host "`n[!] ETL pipeline finished with error code: $LASTEXITCODE" -ForegroundColor Red
}
