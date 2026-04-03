@echo off
chcp 65001 >nul 2>&1
title 精灵宝贝 - 启动器

echo ============================================
echo     精灵宝贝 - Pet Adventure
echo ============================================
echo.

:: Check Python (try python first, then python3, then py launcher)
set "PYTHON_CMD="

python --version >nul 2>&1
if not errorlevel 1 (
    set "PYTHON_CMD=python"
    goto :found_python
)

python3 --version >nul 2>&1
if not errorlevel 1 (
    set "PYTHON_CMD=python3"
    goto :found_python
)

py -3 --version >nul 2>&1
if not errorlevel 1 (
    set "PYTHON_CMD=py -3"
    goto :found_python
)

echo [错误] 未找到 Python！
echo 请安装 Python 3.8+: https://www.python.org/downloads/
echo 安装时勾选 "Add Python to PATH"
echo.
echo 如果已安装但仍提示此错误，请尝试以下方法：
echo   1. 检查是否安装了 Microsoft Store 版 Python（可能需要卸载后重装官网版）
echo   2. 手动将 Python 添加到系统环境变量 PATH 中
pause
exit /b 1

:found_python
%PYTHON_CMD% --version
echo Python 路径已确认

:: Check if port 5555 is in use
echo.
echo [0/2] 检查端口...
netstat -ano | findstr ":5555" >nul 2>&1
if not errorlevel 1 (
    echo [警告] 端口 5555 已被占用，尝试继续启动...
)

:: Install dependencies
echo.
echo [1/2] 安装依赖...
%PYTHON_CMD% -m pip install flask openpyxl --quiet --disable-pip-version-check 2>nul
if errorlevel 1 (
    echo 首次安装失败，重试中（使用用户模式）...
    %PYTHON_CMD% -m pip install flask openpyxl --user --quiet --disable-pip-version-check 2>nul
    if errorlevel 1 (
        echo [错误] 依赖安装失败！
        echo 请手动运行: %PYTHON_CMD% -m pip install flask openpyxl
        echo 然后重新运行此启动器。
        echo.
        pause
        exit /b 1
    )
)
echo 依赖安装完成！

:: Launch
echo.
echo [2/2] 启动游戏...
echo.
echo 游戏地址: http://127.0.0.1:5555
echo 浏览器将自动打开
echo 关闭此窗口即可停止游戏
echo.

%PYTHON_CMD% main.py

:: If main.py exits (crash or normal), keep window open
if errorlevel 1 (
    echo.
    echo [错误] 游戏异常退出，错误代码: %errorlevel%
    echo 请检查上方错误信息，或联系开发者反馈。
)

echo.
echo 游戏已停止。
pause
