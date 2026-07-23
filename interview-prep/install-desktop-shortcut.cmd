@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-desktop-shortcut.ps1" -AppDirectory "%~dp0"
if errorlevel 1 (
  echo.
  echo Failed to create the desktop shortcut.
  pause
) else (
  echo.
  echo Desktop shortcut created successfully.
  timeout /t 3 /nobreak >nul
)
endlocal
