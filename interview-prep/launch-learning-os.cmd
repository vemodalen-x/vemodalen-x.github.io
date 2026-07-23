@echo off
setlocal
set "APP_PATH=%~dp0learning-os.html"
set "APP_URI=file:///%APP_PATH:\=/%"
set "BROWSER="

if exist "C:\Program Files\Google\Chrome\Application\chrome.exe" set "BROWSER=C:\Program Files\Google\Chrome\Application\chrome.exe"
if not defined BROWSER if exist "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" set "BROWSER=C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not defined BROWSER if exist "C:\Program Files\Microsoft\Edge\Application\msedge.exe" set "BROWSER=C:\Program Files\Microsoft\Edge\Application\msedge.exe"

if defined BROWSER (
  start "" "%BROWSER%" --app="%APP_URI%" --start-maximized
) else (
  start "" "%APP_PATH%"
)
endlocal
