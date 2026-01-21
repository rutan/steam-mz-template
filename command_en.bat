@echo off
chcp 65001 >nul

rem Check whether Node.js is installed
node -v >nul 2>&1
if %errorlevel% neq 0 (
  echo Node.js is not installed.
  pause
  exit /b
)

:menu
echo ----------------------------------------
echo RPG Maker MZ Steam Template
echo ----------------------------------------
echo 1. Setup tools (npm install)
echo 2. Run game (npm run dev)
echo 3. Package for Steam (npm run package)
echo 0. Exit
echo.
set /p choice=Enter your choice: 

if "%choice%"=="1" goto command_setup
if "%choice%"=="2" goto command_dev
if "%choice%"=="3" goto command_package
if "%choice%"=="0" goto end
echo Invalid choice. Please try again.
echo.
goto menu

:command_setup
echo Running npm install...
call npm install
echo.
echo Setup complete.
echo.
goto menu

:command_dev
echo Starting dev run...
echo Use Ctrl + C to stop this process.
call npm run dev
echo.
echo Game closed.
echo.
goto menu

:command_package
echo Packaging the game...
call npm run package
echo.
echo Package complete.
echo Output is saved in the out folder.
echo.
goto menu

:end
echo Exiting.
exit
