---
title: VizForge
---

# VizForge

> **VTK.js 可视化管线引擎** — 高性能 Web 科学可视化平台

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发模式
npm run dev

# 生产构建
npm run build
```

## 核心特性

- **双渲染管线** — Marching Cubes 面绘制 + Ray-casting 体绘制
- **Pipeline 节点编辑器** — 可视化拖拽构建渲染管线
- **Shader 编辑器** — 实时 GLSL 编辑与预览
- **动画时间轴** — 关键帧插值与相机路径动画
- **LOD 自适应调度** — 4 级精度根据 FPS 自动调整
- **WASM 桥接** — C++ 滤波器编译至 WebAssembly
- **多视口联动** — 单/双/四视口布局
