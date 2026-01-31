# PillTrack Network Setup Script
# Run this script as Administrator to enable network access

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  PillTrack Network Setup" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script needs to run as Administrator!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "1. Right-click on PowerShell" -ForegroundColor Yellow
    Write-Host "2. Select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host "3. Navigate to this folder and run: .\setup-network.ps1" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host "Running as Administrator - Good!" -ForegroundColor Green
Write-Host ""

# Remove old rules if they exist
Write-Host "Removing any existing PillTrack firewall rules..." -ForegroundColor Yellow
netsh advfirewall firewall delete rule name="PillTrack Frontend" 2>$null
netsh advfirewall firewall delete rule name="PillTrack Backend" 2>$null
netsh advfirewall firewall delete rule name="PillTrack Vite" 2>$null
netsh advfirewall firewall delete rule name="PillTrack Spring" 2>$null

# Add new firewall rules
Write-Host "Adding firewall rules..." -ForegroundColor Yellow

# Frontend rules (both TCP and UDP for Vite HMR)
netsh advfirewall firewall add rule name="PillTrack Frontend" dir=in action=allow protocol=tcp localport=5173
netsh advfirewall firewall add rule name="PillTrack Vite" dir=in action=allow protocol=udp localport=5173

# Backend rule
netsh advfirewall firewall add rule name="PillTrack Backend" dir=in action=allow protocol=tcp localport=8081

Write-Host ""
Write-Host "Firewall rules added successfully!" -ForegroundColor Green
Write-Host ""

# Show current IP
$wifiIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -eq "Wi-Fi" }).IPAddress
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Your WiFi IP: $wifiIP" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Access from your phone at:" -ForegroundColor Yellow
Write-Host "  http://${wifiIP}:5173" -ForegroundColor White
Write-Host ""
Write-Host "Make sure both PC and phone are on the same WiFi network!" -ForegroundColor Yellow
Write-Host ""

# Verify rules were added
Write-Host "Verifying firewall rules..." -ForegroundColor Yellow
$rules = netsh advfirewall firewall show rule name=all | Select-String -Pattern "PillTrack"
if ($rules) {
    Write-Host "Rules verified:" -ForegroundColor Green
    $rules | ForEach-Object { Write-Host "  $_" -ForegroundColor Gray }
} else {
    Write-Host "Warning: Rules may not have been added properly" -ForegroundColor Red
}

Write-Host ""
Write-Host "Setup complete! You can now run start.ps1 to start the app." -ForegroundColor Green
Write-Host ""
pause
