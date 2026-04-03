"""
Pet Adventure - Entry Point
Launches the Flask server and opens the browser.

也可以直接运行 app.py 启动（从PyCharm或命令行）。
"""

import os
import sys
import time
import threading
import traceback
import webbrowser


def main():
    # Ensure we're in the right directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

    try:
        from app import app, db
    except Exception as e:
        print(f'\n[错误] 导入模块失败: {e}')
        traceback.print_exc()
        input('\n按回车键退出...')
        sys.exit(1)

    try:
        db.init_db()
        db.create_player()
    except Exception as e:
        print(f'\n[错误] 数据库初始化失败: {e}')
        traceback.print_exc()
        input('\n按回车键退出...')
        sys.exit(1)

    PORT = 5555
    URL = f'http://127.0.0.1:{PORT}'

    def open_browser():
        time.sleep(1.5)
        webbrowser.open(URL)

    # Open browser in background
    threading.Thread(target=open_browser, daemon=True).start()

    print('')
    print('============================================')
    print('  Pet Adventure - Running')
    print('  URL: http://127.0.0.1:5555')
    print('  Press Ctrl+C to stop')
    print('============================================')
    print('')

    try:
        app.run(host='127.0.0.1', port=PORT, debug=False, threaded=True)
    except OSError as e:
        if 'Address already in use' in str(e) or '10048' in str(e):
            print(f'\n[错误] 端口 {PORT} 已被占用！')
            print('请关闭占用该端口的程序，或修改 main.py 中的 PORT 变量。')
        else:
            print(f'\n[错误] 网络错误: {e}')
        input('\n按回车键退出...')
    except KeyboardInterrupt:
        print('Goodbye!')


if __name__ == '__main__':
    main()
