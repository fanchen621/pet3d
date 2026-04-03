# 🐾 精灵宝贝 - Pet Adventure

班级优化大师伴侣应用 | 3D虚拟宠物养成 + 对战

## 功能

- 🐉 12种3D宠物（龙宝宝、冰晶狐、雷霆熊、花灵兔、暗影猫、光明天使、凤凰雏鸟、水灵海马、雷纹虎、木灵小妖、暗月狼、星光独角兽）
- ⚔️ 回合制3D战斗（技能冷却、道具使用、宠物捕捉、连击系统、元素反应）
- 🧚 精灵助手引导系统（星光精灵对话介绍玩法）
- 🐱 汤姆猫式宠物互动（语音气泡、鼠标追踪、拖拽抚摸）
- 🔮 进化系统（Lv20进化 → Lv50超进化）
- 👔 皮肤时装 + 技能卷轴 + 进化石
- 🏆 战力排行榜
- ⭐ 积分导入（对接班级优化大师Excel）
- 🌙 昼夜背景切换

## 快速开始

```bash
pip install flask openpyxl
python main.py
```

浏览器自动打开 http://127.0.0.1:5555

### Windows 用户

直接双击 `start.bat` 启动（自动安装依赖）。

### PyCharm 用户

直接运行 `app.py` 或 `main.py` 均可。

## 技术栈

- 后端: Flask + SQLite
- 前端: Three.js r128 (3D渲染) + 原生JS
- 无需编译，开箱即用

## 文件结构

```
pet3d/
├── app.py              # Flask后端（可直接运行）
├── main.py             # 入口文件（自动打开浏览器）
├── models.py           # 宠物数据模型
├── database.py         # SQLite数据库层
├── start.bat           # Windows启动脚本
├── requirements.txt    # Python依赖
├── CHANGELOG.md        # 更新日志
├── static/
│   ├── css/style.css   # 全部样式
│   └── js/
│       ├── app.js      # 主应用（精灵引导、宠物互动）
│       ├── battle.js   # 战斗系统
│       ├── effects.js  # 粒子特效
│       ├── pets.js     # 3D宠物建模
│       ├── shop.js     # 商店+背包
│       ├── classroom.js# 班级管理
│       └── ranking.js  # 排行榜
└── templates/
    └── index.html      # 主页面
```
