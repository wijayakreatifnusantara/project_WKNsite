@echo off
echo Starting project_WKNsite Development Environment...
echo.

echo Starting Python Backend Server on port 8000...
start "WKNsite Backend Server" cmd /k "cd apps\server && ..\..\.venv\Scripts\python.exe main.py"

echo Starting React Development Server...
cd apps\client
echo Current directory: %CD%
echo.
echo Installing dependencies (if needed)...
call npm install
echo.
echo Starting development server...
call npm run dev
pause
