import type { PipelineNode, PipelineTemplate, PipelinePort } from '../types';

let nextId = 1;
export function generateId(prefix = 'n'): string {
  return `${prefix}-${nextId++}`;
}

function makePort(
  id: string,
  label: string,
  type: 'input' | 'output',
  dataType: PipelinePort['dataType'],
): PipelinePort {
  return { id, label, type, dataType };
}

export const NODE_TYPES: {
  type: PipelineNode['type'];
  label: string;
  color: string;
  inputs: { label: string; dataType: PipelinePort['dataType'] }[];
  outputs: { label: string; dataType: PipelinePort['dataType'] }[];
  defaultConfig: Record<string, unknown>;
}[] = [
  {
    type: 'data-source',
    label: 'Data Source',
    color: '#4fc3f7',
    inputs: [],
    outputs: [
      { label: 'Geometry', dataType: 'geometry' },
      { label: 'Volume', dataType: 'volume' },
    ],
    defaultConfig: { filePath: '', fileType: 'vtp' },
  },
  {
    type: 'filter',
    label: 'Filter',
    color: '#66bb6a',
    inputs: [{ label: 'Input', dataType: 'geometry' }],
    outputs: [{ label: 'Output', dataType: 'geometry' }],
    defaultConfig: { type: 'contour', isoValue: 0.5 },
  },
  {
    type: 'mapper',
    label: 'Mapper',
    color: '#ffa726',
    inputs: [{ label: 'Input', dataType: 'geometry' }],
    outputs: [{ label: 'Output', dataType: 'image' }],
    defaultConfig: { colorMap: 'Cool to Warm', opacity: 1.0 },
  },
  {
    type: 'actor',
    label: 'Actor',
    color: '#7c4dff',
    inputs: [{ label: 'Input', dataType: 'image' }],
    outputs: [{ label: 'Output', dataType: 'image' }],
    defaultConfig: { visibility: true, position: [0, 0, 0] },
  },
  {
    type: 'renderer',
    label: 'Renderer',
    color: '#ef5350',
    inputs: [{ label: 'Input', dataType: 'image' }],
    outputs: [{ label: 'Output', dataType: 'image' }],
    defaultConfig: { mode: 'surface', backgroundColor: '#0f0f1a' },
  },
];

export function createDefaultNode(
  type: PipelineNode['type'],
  x: number,
  y: number,
): PipelineNode {
  const def = NODE_TYPES.find((n) => n.type === type)!;
  const id = generateId('node');
  return {
    id,
    type,
    label: def.label,
    x,
    y,
    color: def.color,
    config: { ...def.defaultConfig },
    inputs: def.inputs.map((inp, i) =>
      makePort(`${id}-in-${i}`, inp.label, 'input', inp.dataType),
    ),
    outputs: def.outputs.map((out, i) =>
      makePort(`${id}-out-${i}`, out.label, 'output', out.dataType),
    ),
  };
}

export const PIPELINE_TEMPLATES: PipelineTemplate[] = [
  {
    name: 'Surface Rendering',
    description: 'Marching Cubes isosurface extraction pipeline',
    nodes: [
      {
        type: 'data-source', label: 'Volume Data',
        inputs: [], outputs: [{ id: '', label: 'Volume', type: 'output', dataType: 'volume' }],
        config: { filePath: '', fileType: 'vti' }, color: '#4fc3f7',
      },
      {
        type: 'filter', label: 'Contour Filter',
        inputs: [{ id: '', label: 'Input', type: 'input', dataType: 'geometry' }],
        outputs: [{ id: '', label: 'Output', type: 'output', dataType: 'geometry' }],
        config: { type: 'contour', isoValue: 0.5 }, color: '#66bb6a',
      },
      {
        type: 'mapper', label: 'Surface Mapper',
        inputs: [{ id: '', label: 'Input', type: 'input', dataType: 'geometry' }],
        outputs: [{ id: '', label: 'Output', type: 'output', dataType: 'image' }],
        config: { colorMap: 'Cool to Warm', opacity: 1.0 }, color: '#ffa726',
      },
      {
        type: 'renderer', label: 'Viewport',
        inputs: [{ id: '', label: 'Input', type: 'input', dataType: 'image' }],
        outputs: [{ id: '', label: 'Output', type: 'output', dataType: 'image' }],
        config: { mode: 'surface', backgroundColor: '#0f0f1a' }, color: '#ef5350',
      },
    ],
    connections: [
      { sourceNodeId: '', sourcePortId: '', targetNodeId: '', targetPortId: '' },
    ],
  },
  {
    name: 'Volume Rendering',
    description: 'Direct volume ray-casting pipeline',
    nodes: [
      {
        type: 'data-source', label: 'Volume Data',
        inputs: [], outputs: [{ id: '', label: 'Volume', type: 'output', dataType: 'volume' }],
        config: { filePath: '', fileType: 'vti' }, color: '#4fc3f7',
      },
      {
        type: 'filter', label: 'Transfer Function',
        inputs: [{ id: '', label: 'Input', type: 'input', dataType: 'geometry' }],
        outputs: [{ id: '', label: 'Output', type: 'output', dataType: 'geometry' }],
        config: { type: 'transfer-function', colorMap: 'Viridis' }, color: '#66bb6a',
      },
      {
        type: 'renderer', label: 'Volume Renderer',
        inputs: [{ id: '', label: 'Input', type: 'input', dataType: 'image' }],
        outputs: [{ id: '', label: 'Output', type: 'output', dataType: 'image' }],
        config: { mode: 'volume', backgroundColor: '#0f0f1a' }, color: '#ef5350',
      },
    ],
    connections: [],
  },
];
