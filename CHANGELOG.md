# 更新日志 (Changelog)

每次对话修改都会记录在此，方便下次更新时快速了解当前状态和历史改动。

---

## v2.0.0 — 2026-04-03 大改造

### 本次对话需求
用户上传了4张游戏截图，提出以下改进需求：
1. 解决导入问题
2. 修复战斗初始化的问题
3. 修复开始页面（改成精灵助手介绍游戏玩法，不是直接选宠物）
4. 让游戏玩法更多样，战斗/捕抓野宠更丰富
5. 宠物互动页面太简单，要重新设计（参考汤姆猫）
6. 战斗页面参考小冰冰传奇设计（技能/道具/精美特效）

### 修改的文件（8个，+1697行）

#### Python 后端
- **`app.py`** (+271行)
  - `openpyxl` 导入加了 try/except 容错，缺失时提示安装
  - 战斗状态从 `app.config` 改为 `BATTLE_STATES` 字典 + session 隔离
  - 新增 `BATTLE_ITEMS` 道具定义（治疗药水、复活药水、宠物球）
  - 新增 `ELEMENTAL_REACTIONS` 元素反应系统（火+冰=蒸汽等6种组合）
  - `api_start_battle` 确保野宠技能正确初始化
  - `api_battle_action` 新增：技能冷却、连击加成、道具使用、捕获机制
  - 新增 `/api/battle_items` 接口返回可用战斗道具
  - 新增 `/api/battle_items` 路由

- **`requirements.txt`** (+1行)
  - 添加 `openpyxl>=3.1.0`

#### JavaScript 前端
- **`static/js/app.js`** (+414/-重构)
  - 新增 `showSpiritIntro()` — 星光精灵引导对话，打字机效果
  - 新增 `spiritAskName()` — 对话结束后输入名字
  - 新增 `showSpiritPetSelect()` — 精灵引导选宠物
  - 宠物互动页：鼠标追踪头部旋转 (`mousePos`, `animatePetScene`)
  - 新增语音气泡系统 (`petPhrases`, `showPetSpeech`, `startPetSpeech`)
  - 新增拖拽抚摸交互 (`mousedown/mousemove` 事件)
  - 昼夜背景色切换（根据 `new Date().getHours()`）
  - 移除旧的 `showPetSelect`，统一走精灵引导流程

- **`static/js/battle.js`** (+217/-重构)
  - 新增 `battleSpeed` 战斗加速（1x/2x）
  - 新增 `skillCooldowns` 技能冷却跟踪
  - 新增 `comboCount` 连击计数
  - `bindBattleEvents()` — 速度按钮、道具按钮、捕获按钮
  - `playerAction()` 支持 `use_item` 动作类型
  - `showItemSelect()` — 战斗中选择道具弹窗
  - `showBattleResult()` 支持显示捕获的宠物
  - `showSkillSelect()` 显示技能冷却状态
  - 事件委托替代直接绑定（避免重复绑定问题）

- **`static/js/effects.js`** (+438/-大幅扩展)
  - 新增 `showCombo(count)` — 连击计数器显示
  - 新增 `criticalHitFlash()` — 暴击全屏闪光
  - 新增 `showReactionEffect(name)` — 元素反应提示
  - 新增 `createElementEffect(scene, pos, element, isUltimate)` — 6种元素特效
  - 新增 `createSpiritParticles(canvasId)` — 精灵引导页粒子背景

- **`static/js/ranking.js`** (+4行)
  - `petEmojis` 对象补充全部12种宠物图标

#### HTML 模板
- **`templates/index.html`** (+76行)
  - 加载动画改为星光精灵风格（`.loading-orb`）
  - 新增 `#spirit-intro-screen` — 精灵引导屏幕（粒子背景 + 精灵球体 + 对话框）
  - 新增 `#spirit-pet-select` — 精灵引导选宠屏幕
  - 新增 `#combo-display` — 连击计数器
  - `#pet-home` 新增语音气泡 `.pet-speech-bubble`
  - `#pet-home` 新增 `.stat-value-text` 数值显示
  - `#battle-screen` 新增速度控制 `.battle-speed-control`
  - `#battle-screen` 新增道具按钮和捕获按钮
  - `#battle-screen` 新增敌方血量百分比
  - `#battle-result` 新增捕获宠物显示区域

#### CSS 样式
- **`static/css/style.css`** (+538行)
  - 加载动画 orb 样式
  - 精灵引导页全套样式（球体、光环、对话框、名字输入）
  - 精灵选宠页样式
  - 语音气泡样式 + 进出动画
  - 连击计数器样式
  - 战斗速度控制样式
  - 道具/捕获按钮样式
  - 战斗日志颜色编码（玩家红/敌人紫/治疗绿/胜利金）
  - 元素特效爆发样式（6种颜色）
  - 暴击闪光样式
  - 元素反应弹出样式
  - 屏幕过渡动画

---

## v1.0.0 — 初始版本

### 功能清单
- Flask + SQLite 后端
- Three.js 3D 宠物建模（6种：龙/狐/熊/兔/猫/天使）
- 基础战斗系统（攻击/防御/特技/逃跑）
- 商店系统（食物/装扮/技能/进化/特殊）
- 宠物图鉴和切换
- 排行榜
- 班级管理 + Excel导入
- 基础粒子特效和屏幕震动

---

## 下次更新备忘

### 已知可优化
- [ ] 战斗中道具使用后没有从背包扣除的视觉反馈
- [ ] 捕获成功后应该刷新宠物列表
- [ ] 精灵引导页在移动端可能需要调整布局
- [ ] 语音气泡可以加入宠物心情影响（心情低时说不开心的话）
- [ ] 元素反应的后端 bonus_damage 还比较保守，可以调高

### 用户可能下次要改的
- 参考截图中的具体问题（如有遗漏）
- 商城/背包/排行榜的进一步美化
- 班级管理的更多功能
- 多人对战 (PvP)
- 更多种类的野宠和副本
