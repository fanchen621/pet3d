"""
Pet Adventure - Entry Point
Launches the Flask server and opens the browser.

也可以直接运行 app.py 启动（从PyCharm或命令行）。
"""

import os
import sys
import time
import threading
import webbrowser


def main():
    # Ensure we're in the right directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

    from app import app, db

    # Database is already initialized in app.py, but ensure it's done
    db.init_db()
    db.create_player()

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
    except KeyboardInterrupt:
        print('Goodbye!')


if __name__ == '__main__':
    main()
