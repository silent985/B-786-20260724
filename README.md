# 3D 迷宫探险 (3D Maze Adventure)

一个基于 Three.js 构建的 3D 迷宫探索网页游戏。穿过程序随机生成的绿色迷宫，寻找终点的城堡！

## 🎮 游戏特色

- **3D 第一人称视角**：沉浸式的探索体验，流畅的鼠标视角控制。
- **随机生成**：每次开始/重玩都会生成全新的迷宫布局，永远不会重复。
- **小地图系统**：左上角实时显示卫星俯视图（小地图），帮助你确认方位。
- **卡通风格**：明亮友好的视觉效果，拥有鲜艳的绿色墙壁和风格化的终点城堡。
- **碰撞检测**：平滑的墙壁碰撞处理，带来顺滑的移动手感（你不穿墙！）。

## 🚀 如何运行

> ⚠️ **必须通过本地 HTTP 服务器运行**：项目使用 ES 模块（`<script type="module">`）
> 并通过 import map 从 CDN 加载 Three.js。直接用 `file://` 协议双击打开 `index.html` 会被浏览器的
> 同源策略拦截，导致脚本无法加载（控制台报 CORS / module 加载错误）。

在当前文件夹打开终端（Terminal/PowerShell/CMD），启动任意一种本地静态服务器即可：

```bash
# 方法 A：Python 3（推荐，无需额外安装）
python -m http.server 8080

# 方法 B：Node.js（使用 npx，无需全局安装）
npx http-server . -p 8080

# 方法 C：已安装 VS Code 的 Live Server 插件
# 右键 index.html → "Open with Live Server"
```

服务器启动后，在浏览器中访问终端提示的地址（通常是 `http://localhost:8080`）。

## 🕹️ 操作说明

| 按键 | 动作 |
| :--- | :--- |
| **W / 方向键上** | 前进 |
| **S / 方向键下** | 后退 |
| **A / 方向键左** | 向左移动 |
| **D / 方向键右** | 向右移动 |
| **鼠标移动** | 调整视角 |
| **ESC** | 暂停 / 释放鼠标 |

## 📂 项目结构

代码按职责拆分为独立的 ES 模块。纯逻辑模块（不依赖 Three.js）可在 Node.js 中直接测试。

```
.
├── index.html            # 页面骨架：DOM、import map、挂载主脚本
├── styles.css            # 全部样式（UI 覆盖层、按钮、小地图标签等）
├── package.json          # 测试脚本配置（使用 Node 内置 test runner）
├── js/
│   ├── config.js         # 游戏常量配置与派生常量（如 HALF_WORLD_SIZE）
│   ├── coords.js         # 纯函数：网格坐标 ↔ 世界坐标转换、墙体 AABB
│   ├── maze.js           # 纯函数：DFS 迷宫生成、Fisher-Yates 洗牌、连通性检测
│   ├── collision.js      # 纯函数：基于网格的 AABB 碰撞检测（不依赖 THREE）
│   ├── renderer.js       # SceneRenderer 类：Three.js 场景/光照/迷宫几何/小地图
│   ├── player.js         # PlayerController 类：键盘输入、移动、滑动碰撞
│   ├── ui.js             # GameUI 类：开始/胜利界面、游戏状态管理
│   └── main.js           # 入口：装配各模块并驱动渲染循环与胜利判定
└── tests/
    ├── coords.test.js    # 坐标转换单元测试
    ├── maze.test.js      # 迷宫生成与连通性单元测试
    └── collision.test.js # 碰撞检测单元测试
```

### 模块依赖关系

```
main.js ──┬─→ renderer.js ──→ coords.js ──→ config.js
           ├─→ player.js   ──→ collision.js ──→ (config 由调用方传入)
           ├─→ ui.js
           ├─→ maze.js
           └─→ coords.js
```

`coords.js`、`maze.js`、`collision.js` 为纯逻辑模块，**完全不依赖 Three.js**，
因此可以在 Node 环境中直接进行单元测试，无需浏览器或 DOM 模拟。

## 🧪 测试

测试使用 Node.js 内置的测试运行器（`node:test`）与断言库（`node:assert/strict`），
无需任何第三方依赖。运行：

```bash
npm test
```

测试覆盖：

- **迷宫生成** (`tests/maze.test.js`)：尺寸正确、外边界为墙、起点/终点开放、多种子下完全连通、
  多种奇数尺寸连通、确定性（同种子同结果）、洗牌算法保持元素多重集。
- **连通性** (`tests/maze.test.js`)：从起点出发可到达所有开放格，且开放格总数与可达格数相等。
- **坐标转换** (`tests/coords.test.js`)：`gridToWorld` 角点定位、`worldToGrid` 可逆性、
  单元内任意点归位、`wallAABB` 尺寸与中心。
- **碰撞判断** (`tests/collision.test.js`)：墙心碰撞、开放格不碰撞、越界碰撞、
  玩家半径影响、起点/终点无碰撞、对称性。

## 🛠️ 技术栈

- **HTML5 / CSS3**
- **JavaScript (ES6+ Modules)**
- **[Three.js](https://threejs.org/)** - 3D 渲染引擎（通过 import map 加载）
- **Node.js `node:test`** - 内置单元测试框架

## 📝 许可
本项目开源，可自由使用和学习。
