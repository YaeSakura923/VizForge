# 🧊 VTK Visualization Studio

> Professional-grade scientific visualization application built with **React 18**, **VTK.js**, and **WebGL**.  
> Part of the VTK.js Visualization Pipeline Engine project.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![VTK.js](https://img.shields.io/badge/VTK.js-30.10-00B4C8?logo=webgl)](https://kitware.github.io/vtk-js/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![CI](https://github.com/YaeSakura923/vtk-visualization-studio/actions/workflows/ci.yml/badge.svg)](https://github.com/YaeSakura923/vtk-visualization-studio/actions/workflows/ci.yml)

---

## ✨ Features

### 🎨 Dual Rendering Pipelines
- **Surface Rendering** — Marching Cubes algorithm for isosurface extraction from volumetric data
- **Volume Rendering** — Ray-casting for direct volume visualization with transfer functions
- **Dual Pipeline Mode** — Side-by-side comparison of both rendering techniques

### 🎛️ Interactive Controls
- **Camera Manipulation** — Orbit, pan, zoom with intuitive mouse controls
- **Clipping Planes** — Interactive axis-aligned clipping with real-time plane adjustment
- **Color Map Editor** — 8 preset color maps (Cool-to-Warm, Viridis, Inferno, Rainbow, etc.)
- **Opacity Control** — Adjust transparency for compositing multiple datasets

### ⚡ Performance Optimization
- **LOD (Level of Detail) Scheduling** — Automatic quality adjustment based on real-time FPS monitoring
- **Adaptive Triangle Budget** — Configurable polygon targets across 4 LOD levels
- **Multi-Viewport** — Single, dual (surface + volume), or quad viewport layouts

### 🔧 WASM Integration
- **C++ to WebAssembly Bridge** — High-performance filters compiled via Emscripten
- **Performance Benchmarking** — Side-by-side JS vs WASM execution time comparison
- **Filter Pipeline** — Gaussian blur, Marching Cubes with simulated WASM acceleration

### 🏗️ Engineering Excellence
- **TypeScript** — Full type coverage with strict mode
- **Component Architecture** — Modular React components with hooks-based state
- **Responsive Design** — Adapts from desktop to tablet to mobile
- **Cross-Browser** — Tested on Chrome 90+, Firefox 90+, Edge 90+, Safari 15+
- **CI/CD** — GitHub Actions pipeline with type checking, linting, testing, and auto-deployment

---

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/YaeSakura923/vtk-visualization-studio.git
cd vtk-visualization-studio

# Install dependencies
npm install

# Start development server
npm run dev            # → http://localhost:3000
```

---

## 📦 Project Structure

```
vtk-visualization-app/
├── src/
│   ├── components/
│   │   ├── App.tsx                  # Main application shell
│   │   ├── Toolbar.tsx              # Top toolbar with viewport controls
│   │   ├── Sidebar.tsx              # Sidebar with tabbed panels
│   │   ├── VtkViewer.tsx            # Core VTK.js rendering viewport
│   │   └── panels/
│   │       ├── DataPanel.tsx        # File loading & sample datasets
│   │       ├── RenderingPanel.tsx   # Render mode, opacity, color maps
│   │       ├── ClippingPanel.tsx    # Clipping plane controls
│   │       ├── LODPanel.tsx         # Level of Detail management
│   │       └── WasmPanel.tsx        # WASM benchmark & comparison
│   ├── hooks/                       # Custom React hooks
│   ├── utils/
│   │   ├── colorMaps.ts             # Color map presets & utilities
│   │   ├── lodManager.ts            # LOD state management
│   │   ├── wasmBridge.ts            # WASM/JS performance bridge
│   │   └── sampleData.ts            # Sample dataset registry
│   ├── types/
│   │   └── index.ts                 # Shared TypeScript interfaces
│   ├── styles/
│   │   └── app.css                  # Professional dark theme
│   ├── main.tsx                     # Application entry point
│   └── vite-env.d.ts               # Type declarations
├── __tests__/
│   ├── visualization.test.ts        # Utility & algorithm tests
│   └── components.test.ts           # Component smoke tests
├── .github/workflows/
│   └── ci.yml                      # CI/CD pipeline
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── vitest.config.ts
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# With coverage report
npm run test:coverage
```

## 🏗️ Build

```bash
# Production build
npm run build

# Preview production build
npm run preview

# Analyze bundle size
npm run analyze
```

---

## 🖥️ Technical Architecture

### VTK.js Pipeline Integration

The application integrates Kitware's VTK.js library for browser-based scientific visualization:

```
Data Source → Reader → Filter → Mapper → Actor → Renderer → RenderWindow → WebGL
```

- **Surface Pipeline**: Volume → vtkContourFilter (Marching Cubes) → vtkMapper → vtkActor
- **Volume Pipeline**: Volume → vtkVolumeMapper (Ray-cast) → vtkVolume
- **LOD System**: vtkLODActor with distance-based detail selection

### State Management

- React `useState`/`useCallback` for component-local state
- Custom hooks (`useVtkViewport`, `useWasm`) for VTK.js lifecycle management
- LODManager singleton for cross-component performance tracking

### Performance Strategy

| LOD Level | Triangle Budget | Pixel Ratio | Use Case |
|-----------|----------------|-------------|----------|
| Low       | 50K            | 0.5         | Low-end / mobile |
| Medium    | 100K           | 0.75        | Default interactive |
| High      | 250K           | 1.0         | Desktop exploration |
| Ultra     | 500K           | 1.5         | Final render / export |

---

## 🔧 Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | React 18 with TypeScript |
| **Build** | Vite 6 + Terser |
| **Visualization** | VTK.js 30.10 (WebGL) |
| **Math** | gl-matrix 3.4 |
| **State** | React hooks + useCallback |
| **Testing** | Vitest + Testing Library |
| **CI** | GitHub Actions (matrix build) |
| **Linting** | ESLint + Prettier |

---

## 🌐 Browser Compatibility

| Browser | Minimum Version |
|---------|----------------|
| Chrome  | 90+ (WebGL 2.0) |
| Firefox | 90+ (WebGL 2.0) |
| Edge    | 90+ (Chromium) |
| Safari  | 15+ (WebGL 2.0) |

---

## 📄 License

MIT

---

## 🙏 Acknowledgments

- [Kitware VTK.js](https://github.com/Kitware/vtk-js) — Web Visualization Toolkit
- [Three.js](https://threejs.org/) — 3D graphics inspiration
- [PlayCanvas SuperSplat](https://github.com/playcanvas/supersplat) — Point cloud editing reference

---

*Built with React, VTK.js, and WebGL — demonstrating scientific visualization pipeline engineering.*
