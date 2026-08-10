@echo off
set "PAGE=%~dp0index.html"
where msedge.exe >nul 2>nul
if %errorlevel%==0 (
  start "" msedge.exe --kiosk "%PAGE%" --edge-kiosk-type=fullscreen --no-first-run
  exit /b
)
where chrome.exe >nul 2>nul
if %errorlevel%==0 (
  start "" chrome.exe --kiosk "%PAGE%" --no-first-run
  exit /b
)
start "" "%PAGE%"
