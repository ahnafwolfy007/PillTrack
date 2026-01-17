# PillTrack Startup Script
# This script starts both the backend and frontend servers

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "           PillTrack Application               " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# JAVA_HOME setup removed to use system default
# $env:JAVA_HOME = "C:\Program Files\JetBrains\IntelliJ IDEA 2025.2.4\jbr"
# Write-Host "[INFO] JAVA_HOME set to: $env:JAVA_HOME" -ForegroundColor Yellow

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Backend
Write-Host ""
Write-Host "[INFO] Starting Spring Boot Backend..." -ForegroundColor Green
$backendPath = Join-Path $scriptDir "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; .\mvnw.cmd spring-boot:run" -WindowStyle Normal

# Wait a moment for backend to initialize
Write-Host "[INFO] Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start Frontend
Write-Host "[INFO] Starting Vite Frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptDir'; npm run dev" -WindowStyle Normal

# Display links
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "           Application URLs                     " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Frontend:     " -NoNewline; Write-Host "http://localhost:5173" -ForegroundColor Green
Write-Host "  Backend API:  " -NoNewline; Write-Host "http://localhost:8080/api" -ForegroundColor Green
Write-Host "  Swagger UI:   " -NoNewline; Write-Host "http://localhost:8080/api/swagger-ui.html" -ForegroundColor Green
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[INFO] Both servers are starting in separate windows." -ForegroundColor Yellow
Write-Host "[INFO] Please wait for them to fully initialize." -ForegroundColor Yellow
Write-Host ""
