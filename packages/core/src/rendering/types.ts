/** 渲染管线核心类型定义 */

export type RenderMode = 'surface' | 'volume' | 'both';

export type ColorMapName =
  | 'cool-to-warm'
  | 'rainbow'
  | 'viridis'
  | 'inferno'
  | 'grayscale'
  | 'thermal'
  | 'blues'
  | 'red-green';

export interface ViewportConfig {
  id: string;
  label: string;
  backgroundColor: [number, number, number];
  camera?: CameraConfig;
}

export interface CameraConfig {
  position: [number, number, number];
  viewUp: [number, number, number];
  focalPoint: [number, number, number];
}

export interface RenderingConfig {
  mode: RenderMode;
  opacity: number;
  colorMap: ColorMapName;
  lodLevel: number;
  clipping: {
    enabled: boolean;
    origin: [number, number, number];
    normal: [number, number, number];
  };
}

export interface LODConfig {
  level: number;
  triangleBudget: number;
  pixelRatio: number;
  label: string;
  auto: boolean;
}

export interface DataFile {
  name: string;
  url: string;
  size: number;
  type: 'vtp' | 'vti' | 'vtk' | 'obj' | 'stl' | 'ply';
}

export interface PipelineNode {
  id: string;
  type: 'source' | 'filter' | 'mapper' | 'actor' | 'renderer';
  label: string;
  inputs: string[];
  outputs: string[];
  config: Record<string, unknown>;
  position: { x: number; y: number };
}

export type ViewportLayout = 'single' | 'dual' | 'quad';
export type SidebarTab = 'data' | 'rendering' | 'clipping' | 'pipeline' | 'shader' | 'timeline' | 'wasm' | 'info';
