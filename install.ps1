# PillTrack Installation Script
# This script installs all dependencies for both frontend and backend

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "       PillTrack Dependency Installer           " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

# Set JAVA_HOME (Microsoft OpenJDK 21)
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-21.0.9.10-hotspot"

# ============================================
# Check Prerequisites
# ============================================
Write-Host "[INFO] Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

# Check Node.js
$nodeVersion = $null
try {
    $nodeVersion = node --version 2>$null
} catch {}

if ($nodeVersion) {
    Write-Host "[OK] Node.js found: $nodeVersion" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Node.js is not installed!" -ForegroundColor Red
    Write-Host "        Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Check npm
$npmVersion = $null
try {
    $npmVersion = npm --version 2>$null
} catch {}

if ($npmVersion) {
    Write-Host "[OK] npm found: v$npmVersion" -ForegroundColor Green
} else {
    Write-Host "[ERROR] npm is not installed!" -ForegroundColor Red
    exit 1
}

# Check Java
if (Test-Path $env:JAVA_HOME) {
    $javaVersion = & "$env:JAVA_HOME\bin\java" --version 2>&1 | Select-Object -First 1
    Write-Host "[OK] Java found: $javaVersion" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Java 21 is not installed at expected location!" -ForegroundColor Red
    Write-Host "        Expected: $env:JAVA_HOME" -ForegroundColor Red
    Write-Host "        Please install Microsoft OpenJDK 21 from:" -ForegroundColor Red
    Write-Host "        https://learn.microsoft.com/en-us/java/openjdk/download" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "       Installing Frontend Dependencies         " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Install frontend dependencies
Set-Location $scriptDir
Write-Host "[INFO] Running npm install..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Frontend dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to install frontend dependencies!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "       Installing Backend Dependencies          " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Install backend dependencies (Maven will download them)
$backendPath = Join-Path $scriptDir "backend"
Set-Location $backendPath

Write-Host "[INFO] Running Maven dependency resolution..." -ForegroundColor Yellow
.\mvnw.cmd dependency:resolve

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Backend dependencies downloaded successfully!" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to download backend dependencies!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[INFO] Compiling backend..." -ForegroundColor Yellow
.\mvnw.cmd compile -DskipTests

if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Backend compiled successfully!" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to compile backend!" -ForegroundColor Red
    exit 1
}

# Return to script directory
Set-Location $scriptDir

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "           Installation Complete!               " -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "All dependencies have been installed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "To start the application, run:" -ForegroundColor Yellow
Write-Host "  .\start.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Or start individually:" -ForegroundColor Yellow
Write-Host "  Frontend: npm run dev" -ForegroundColor White
Write-Host "  Backend:  cd backend; .\mvnw.cmd spring-boot:run" -ForegroundColor White
Write-Host ""
