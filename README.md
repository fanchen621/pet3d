# 🐾 宠物大冒险 - Pet Adventure

班级优化大师伴侣应用 | 3D虚拟宠物养成 + 对战

## 功能

- 🐉 6种3D宠物（龙宝宝、冰晶狐、雷霆熊、花灵兔、暗影猫、光明天使）
- ⚔️ 回合制3D战斗（PvE野宠 + PvP对战）
- 🔮 进化系统（Lv20进化 → Lv50超进化）
- 👔 皮肤时装 + 技能卷轴
- 🏆 战力排行榜
- ⭐ 积分导入（对接班级优化大师）

## 快速开始

```bash
pip install flask
python main.py
```

浏览器自动打开 http://127.0.0.1:5555

## 打包EXE

```bash
pip install pyinstaller
python build.py
```

生成 `dist/PetAdventure.exe`

## 技术栈

- 后端: Flask + SQLite
- 前端: Three.js (3D渲染)
- 打包: PyInstaller
