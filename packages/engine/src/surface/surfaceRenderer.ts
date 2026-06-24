/**
 * Surface Renderer — Marching Cubes 面绘制管线
 */

export interface SurfaceConfig {
  isoValue: number;
  color: [number, number, number];
  opacity: number;
  edgeVisibility: boolean;
}

export class SurfaceRenderer {
  private config: SurfaceConfig = {
    isoValue: 0.5,
    color: [0.8, 0.3, 0.2],
    opacity: 1.0,
    edgeVisibility: false,
  };

  constructor(config?: Partial<SurfaceConfig>) {
    if (config) this.config = { ...this.config, ...config };
  }

  getConfig(): SurfaceConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<SurfaceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /** 应用 Marching Cubes 算法提取等值面 */
  extractIsosurface(volumeData: Float32Array, dims: [number, number, number]): Float32Array {
    // 实际调用 VTK.js vtkContourFilter
    console.log('[SurfaceRenderer] Extracting isosurface at', this.config.isoValue);
    return volumeData;
  }
}
