# VizForge

> **VTK.js 可视化管线引擎** — 高性能 Web 科学可视化平台  
> 基于 React 18 + TypeScript + VTK.js + WebGL 构建

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![VTK.js](https://img.shields.io/badge/VTK.js-30.10-00B4C8?logo=webgl)](https://kitware.github.io/vtk-js/)
[![Monorepo](https://img.shields.io/badge/Monorepo-NPM_Workspaces-000?logo=npm)](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📦 项目结构

```
vizforge/
├── apps/
│   └── studio/              # 主应用 — VTK Visualization Studio
├── packages/
│   ├── core/                # VTK.js 核心封装与类型定义
│   ├── engine/              # 渲染管线引擎 (Surface/Volume/LOD)
│   └── ui/                  # React UI 组件库
├── services/
│   └── bridge/              # Python FastAPI 后端服务
├── vendor/
│   └── vtk-js/              # Kitware VTK.js 源码引用
├── docker-compose.yml       # 一键部署
└── package.json             # Monorepo 根配置
```

## ✨ 核心特性

- **双渲染管线** — Marching Cubes 面绘制 + Ray-casting 体绘制
- **Pipeline 节点编辑器** — 可视化拖拽构建渲染管线
- **Shader 编辑器** — 实时 GLSL 编辑与预览
- **动画时间轴** — 关键帧插值与相机路径动画
- **LOD 自适应调度** — 4 级精度根据 FPS 自动调整
- **WASM 桥接** — C++ 滤波器编译至 WebAssembly，JS/WASM 性能对比
- **多视口联动** — 单/双/四视口布局
- **Python 后端** — FastAPI 格式转换与批处理
- **Docker 部署** — 一键 docker-compose up

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发模式
npm run dev

# 生产构建
npm run build

# 运行测试
npm test
```

## 🧪 技术栈

| 层 | 技术 |
|----------|---------|
| **前端框架** | React 18 + TypeScript |
| **可视化** | VTK.js 30.10 (WebGL 2.0) |
| **动画引擎** | GSAP 3.15 (GreenSock) |
| **构建** | Vite 6 + Terser |
| **测试** | Vitest 2 + Testing Library |
| **后端** | Python 3.11 + FastAPI |
| **容器** | Docker + docker-compose |
| **CI/CD** | GitHub Actions |

## 🔧 系统要求

- Node.js >= 18
- Python >= 3.10 (后端)
- Docker + docker-compose (部署)
- 浏览器: Chrome 90+ / Firefox 90+ / Edge 90+ / Safari 15+

## 📄 License

MIT © 2024 王浩博
