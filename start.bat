@echo off
chcp 65001 >nul 2>&1
title Pet Adventure - Launcher

echo ============================================
echo     Pet Adventure - Launcher
echo     Ban Ji You Hua Da Shi Companion
echo ============================================
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found!
    echo Please install Python 3.8+ from: https://www.python.org/downloads/
    echo Check "Add Python to PATH" during install.
    pause
    exit /b 1
)

:: Show Python version
python --version

:: Install Flask
echo.
echo [1/2] Installing dependencies...
python -m pip install flask --quiet --disable-pip-version-check
if errorlevel 1 (
    echo Retrying with --user flag...
    python -m pip install flask --user --quiet --disable-pip-version-check
)
if errorlevel 1 (
    echo [ERROR] Failed to install Flask. Try manually:
    echo   python -m pip install flask
    pause
    exit /b 1
)
echo Done!

:: Launch
echo.
echo [2/2] Starting game...
echo.
echo Game URL: http://127.0.0.1:5555
echo Browser will open automatically.
echo Close this window to stop the game.
echo.

python main.py

echo.
echo Game stopped.
pause
