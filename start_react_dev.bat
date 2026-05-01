@echo off
echo Starting project_WKNsite React Development Server...
echo.
cd apps\client
echo Current directory: %CD%
echo.
echo Installing dependencies (if needed)...
call npm install
echo.
echo Starting development server...
call npm run dev
pause
