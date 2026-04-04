@echo off
chcp 936 >nul 2>&1
setlocal enabledelayedexpansion
title Pet Adventure

echo ============================================
echo     Pet Adventure - Launcher
echo ============================================
echo.

set "PYTHON_CMD="

where python >nul 2>&1
if not errorlevel 1 (
    set "PYTHON_CMD=python"
    goto :found_python
)

where python3 >nul 2>&1
if not errorlevel 1 (
    set "PYTHON_CMD=python3"
    goto :found_python
)

where py >nul 2>&1
if not errorlevel 1 (
    set "PYTHON_CMD=py -3"
    goto :found_python
)

echo [ERROR] Python not found!
echo Please install Python 3.8+ and check "Add Python to PATH"
echo Download: https://www.python.org/downloads/
echo.
pause
exit /b 1

:found_python
echo [OK] Python found:
%PYTHON_CMD% --version
echo.

echo [1/2] Installing dependencies (flask, openpyxl)...
echo.

%PYTHON_CMD% -m pip install flask openpyxl
if errorlevel 1 (
    echo.
    echo Trying --user mode...
    echo.
    %PYTHON_CMD% -m pip install flask openpyxl --user
    if errorlevel 1 (
        echo.
        echo ========================================
        echo  [ERROR] Failed to install dependencies!
        echo  Please run manually:
        echo    %PYTHON_CMD% -m pip install flask openpyxl
        echo ========================================
        echo.
        pause
        exit /b 1
    )
)

echo.
echo [OK] Dependencies installed!
echo.

echo [2/2] Starting game server...
echo.
echo   Game URL: http://127.0.0.1:5555
echo   Browser will open automatically
echo   Close this window to stop the game
echo.
echo ============================================
echo.

%PYTHON_CMD% main.py
set "EXIT_CODE=%errorlevel%"

echo.
echo ============================================
if not "%EXIT_CODE%"=="0" (
    echo  [ERROR] Game exited abnormally (code: %EXIT_CODE%)
    echo  Check error messages above
) else (
    echo  Game stopped normally
)
echo ============================================
echo.
pause
