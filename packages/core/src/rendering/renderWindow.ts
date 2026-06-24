/**
 * RenderWindow 管理器 — 封装 VTK.js 渲染窗口生命周期
 */

import type { ViewportConfig, CameraConfig } from './types';

export class RenderWindowManager {
  private containers: Map<string, HTMLElement> = new Map();

  createViewport(id: string, container: HTMLElement, config: ViewportConfig): void {
    this.containers.set(id, container);
    // VTK.js renderWindow creation would happen here
    console.log(`[RenderWindow] Created viewport: ${id}`, config);
  }

  destroyViewport(id: string): void {
    this.containers.delete(id);
    console.log(`[RenderWindow] Destroyed viewport: ${id}`);
  }

  setCamera(id: string, config: CameraConfig): void {
    console.log(`[RenderWindow] Camera set for ${id}:`, config);
  }

  resetCamera(id: string): void {
    console.log(`[RenderWindow] Camera reset for ${id}`);
  }

  destroy(): void {
    this.containers.clear();
  }
}

export const renderWindowManager = new RenderWindowManager();
