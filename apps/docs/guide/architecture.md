---
title: Architecture
---

# Architecture

## Monorepo Structure

```
vizforge/
├── apps/
│   ├── studio/        # Main application (React + Vite)
│   └── docs/          # Documentation site (VitePress)
├── packages/
│   ├── core/          # VTK.js wrappers & type definitions
│   ├── engine/        # Rendering pipeline engine
│   └── ui/            # Shared React UI components
├── services/
│   └── bridge/        # Python FastAPI backend
├── vendor/
│   └── vtk-js/        # Original Kitware VTK.js source
└── docker-compose.yml
```

## Dual Pipeline Architecture

The engine supports two rendering pipelines:

1. **Surface Rendering** — Marching Cubes algorithm for isosurface extraction
2. **Volume Rendering** — Direct volume ray-casting with transfer functions

Both pipelines share the LOD (Level of Detail) scheduling system for adaptive quality.
