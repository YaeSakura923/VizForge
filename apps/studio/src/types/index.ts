/** Core VTK.js type definitions for the application */

export interface ViewportConfig {
  id: string;
  label: string;
  backgroundColor: [number, number, number];
  cameraPosition?: [number, number, number];
  cameraViewUp?: [number, number, number];
}

export interface RenderingConfig {
  mode: 'surface' | 'volume' | 'both';
  opacity: number;
  colorMap: string;
  lodLevel: number;
  clipping: ClippingConfig;
}

export interface ClippingConfig {
  enabled: boolean;
  planeOrigin: [number, number, number];
  planeNormal: [number, number, number];
}

export interface ColorMapPreset {
  name: string;
  colors: string[];
  type: 'sequential' | 'diverging' | 'qualitative';
}

export interface LODLevel {
  level: number;
  triangleTarget: number;
  pixelRatio: number;
  label: string;
}

export interface WasmBenchResult {
  label: string;
  executionTimeMs: number;
  dataSize: number;
  algorithm: string;
}

export interface DataFileInfo {
  name: string;
  path: string;
  size: number;
  type: 'vtp' | 'vti' | 'vtk' | 'obj' | 'stl' | 'ply';
  description?: string;
}

export type ViewportLayout = 'single' | 'dual' | 'quad';

export type SidebarTab = 'data' | 'rendering' | 'clipping' | 'lod' | 'wasm' | 'shader' | 'timeline';

/* ===== Pipeline Node Editor Types ===== */

export type PipelineNodeType =
  | 'data-source'
  | 'filter'
  | 'mapper'
  | 'actor'
  | 'renderer'
  | 'output';

export interface PipelinePort {
  id: string;
  label: string;
  type: 'input' | 'output';
  dataType: 'geometry' | 'volume' | 'image' | 'transform';
}

export interface PipelineNode {
  id: string;
  type: PipelineNodeType;
  label: string;
  x: number;
  y: number;
  inputs: PipelinePort[];
  outputs: PipelinePort[];
  config: Record<string, unknown>;
  color: string;
}

export interface PipelineConnection {
  id: string;
  sourceNodeId: string;
  sourcePortId: string;
  targetNodeId: string;
  targetPortId: string;
}

export interface PipelineState {
  nodes: PipelineNode[];
  connections: PipelineConnection[];
  selectedNodeId: string | null;
}

/* ===== Shader Editor Types ===== */

export interface ShaderPreset {
  name: string;
  type: 'vertex' | 'fragment' | 'custom';
  code: string;
  description: string;
}

export interface ShaderCompileResult {
  success: boolean;
  error: string | null;
}

/* ===== Animation Timeline Types ===== */

export interface Keyframe {
  id: string;
  time: number; // seconds
  value: number;
  easing: 'linear' | 'cubic' | 'ease-in' | 'ease-out' | 'bounce';
}

export interface AnimationTrack {
  id: string;
  name: string;
  property: string;
  keyframes: Keyframe[];
  color: string;
}

export interface AnimationClip {
  id: string;
  name: string;
  duration: number;
  tracks: AnimationTrack[];
  loop: boolean;
}

/* ===== Pipeline Template Presets ===== */

export interface PipelineTemplate {
  name: string;
  description: string;
  nodes: Omit<PipelineNode, 'id' | 'x' | 'y'>[];
  connections: Omit<PipelineConnection, 'id'>[];
}
