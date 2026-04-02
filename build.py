"""
宠物大冒险 - PyInstaller Build Script
Run: python build.py
"""

import PyInstaller.__main__
import os
import shutil

APP_NAME = 'PetAdventure'
DIR = os.path.dirname(os.path.abspath(__file__))

PyInstaller.__main__.run([
    os.path.join(DIR, 'main.py'),
    '--name', APP_NAME,
    '--onefile',
    '--noconsole',
    '--add-data', f'{os.path.join(DIR, "static")}{os.pathsep}static',
    '--add-data', f'{os.path.join(DIR, "templates")}{os.pathsep}templates',
    '--add-data', f'{os.path.join(DIR, "data")}{os.pathsep}data',
    '--hidden-import', 'flask',
    '--hidden-import', 'sqlite3',
    '--distpath', os.path.join(DIR, 'dist'),
    '--workpath', os.path.join(DIR, 'build'),
    '--specpath', DIR,
])

print(f'\n✅ Build complete! EXE at: dist/{APP_NAME}.exe')
