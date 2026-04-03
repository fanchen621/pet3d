@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion
title 精灵宝贝 - 启动器

echo ============================================
echo     精灵宝贝 - Pet Adventure
echo ============================================
echo.

:: ---- Step 1: Find Python ----
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

echo [错误] 未找到 Python！
echo.
echo 请安装 Python 3.8+ 并勾选 "Add Python to PATH"
echo 下载地址: https://www.python.org/downloads/
echo.
pause
exit /b 1

:found_python
echo [OK] 找到 Python:
%PYTHON_CMD% --version
echo.

:: ---- Step 2: Install dependencies ----
echo [1/2] 安装依赖包 (flask, openpyxl)...
echo.

%PYTHON_CMD% -m pip install flask openpyxl
if errorlevel 1 (
    echo.
    echo ---- pip install 失败，尝试 --user 模式 ----
    echo.
    %PYTHON_CMD% -m pip install flask openpyxl --user
    if errorlevel 1 (
        echo.
        echo ========================================
        echo  [错误] 依赖安装失败！
        echo  请手动运行以下命令安装:
        echo    %PYTHON_CMD% -m pip install flask openpyxl
        echo ========================================
        echo.
        pause
        exit /b 1
    )
)

echo.
echo [OK] 依赖安装完成！
echo.

:: ---- Step 3: Launch ----
echo [2/2] 启动游戏服务器...
echo.
echo   游戏地址: http://127.0.0.1:5555
echo   浏览器将自动打开
echo   关闭此窗口即可停止游戏
echo.
echo ============================================
echo.

%PYTHON_CMD% main.py
set "EXIT_CODE=%errorlevel%"

echo.
echo ============================================
if not "%EXIT_CODE%"=="0" (
    echo  [错误] 游戏异常退出 (错误代码: %EXIT_CODE%)
    echo  请查看上方的错误信息
) else (
    echo  游戏已正常停止
)
echo ============================================
echo.
pause
