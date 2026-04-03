@echo off
chcp 65001 >nul 2>&1
title 精灵宝贝 - 启动器

echo ============================================
echo     精灵宝贝 - Pet Adventure
echo ============================================
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到Python！
    echo 请安装 Python 3.8+: https://www.python.org/downloads/
    echo 安装时勾选 "Add Python to PATH"
    pause
    exit /b 1
)

python --version

:: Install dependencies
echo.
echo [1/2] 安装依赖...
python -m pip install flask openpyxl --quiet --disable-pip-version-check
if errorlevel 1 (
    echo 重试中...
    python -m pip install flask openpyxl --user --quiet --disable-pip-version-check
)
echo 完成！

:: Launch
echo.
echo [2/2] 启动游戏...
echo.
echo 游戏地址: http://127.0.0.1:5555
echo 浏览器将自动打开
echo 关闭此窗口即可停止游戏
echo.

python main.py

echo.
echo 游戏已停止。
pause
