# PillTrack Startup Script
# This script starts both the backend and frontend servers (backend runs on 8081)

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "           PillTrack Application               " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Set JAVA_HOME (Microsoft OpenJDK 21)
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.9.10-hotspot"
Write-Host "[INFO] JAVA_HOME set to: $env:JAVA_HOME" -ForegroundColor Yellow

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Start Backend
Write-Host ""
Write-Host "[INFO] Starting Spring Boot Backend (LOCAL profile with H2)..." -ForegroundColor Green
$backendPath = Join-Path $scriptDir "backend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendPath'; .\mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local" -WindowStyle Normal

# Wait a moment for backend to initialize
Write-Host "[INFO] Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start Frontend
Write-Host "[INFO] Starting Vite Frontend..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$scriptDir'; npm run dev -- --host" -WindowStyle Normal

# Get local IP address for network access
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -eq "Wi-Fi" }).IPAddress
if (-not $localIP) {
    $localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.*" } | Select-Object -First 1).IPAddress
}

# Display links
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "           Application URLs                     " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  [LOCAL ACCESS - This PC]" -ForegroundColor Yellow
Write-Host "  App:          " -NoNewline; Write-Host "http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "  [PHONE/TABLET ACCESS]" -ForegroundColor Yellow
Write-Host "  Your WiFi IP: " -NoNewline; Write-Host "$localIP" -ForegroundColor Magenta
Write-Host "  Open on phone:" -NoNewline; Write-Host " http://${localIP}:5173" -ForegroundColor Magenta
Write-Host ""
Write-Host "  API proxied through Vite (no firewall issues!)" -ForegroundColor DarkGray
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[INFO] Both servers starting in separate windows." -ForegroundColor Yellow
Write-Host "[INFO] Make sure phone is on SAME WiFi network!" -ForegroundColor Yellow
Write-Host ""
Write-Host "[TIP] If phone still can't connect, run setup-network.ps1" -ForegroundColor DarkYellow
Write-Host "      as Administrator to add firewall rules." -ForegroundColor DarkYellow
Write-Host ""
