import type { DataFileInfo } from '../types';

/**
 * Sample VTK data files available for loading.
 * In production, users can upload their own files.
 */
export const SAMPLE_DATA: DataFileInfo[] = [
  {
    name: 'Head CT Scan',
    path: 'https://data.kitware.com/api/v1/file/5bd7f6248d777f2e6225e0e0/download',
    size: 4_200_000,
    type: 'vti',
    description: 'CT scan of a human head (volume dataset)',
  },
  {
    name: 'Bunny',
    path: 'https://data.kitware.com/api/v1/file/5bd7f4f58d777f2e6225d908/download',
    size: 840_000,
    type: 'vtp',
    description: 'Stanford Bunny — classic surface mesh',
  },
  {
    name: 'Camel',
    path: 'https://data.kitware.com/api/v1/file/5bd7f4f68d777f2e6225d90a/download',
    size: 320_000,
    type: 'vtp',
    description: 'Camel surface mesh',
  },
  {
    name: 'Tooth',
    path: 'https://data.kitware.com/api/v1/file/5bd7f5008d777f2e6225d918/download',
    size: 560_000,
    type: 'vti',
    description: 'Tooth CT scan (volume dataset)',
  },
  {
    name: 'Skull',
    path: 'https://data.kitware.com/api/v1/file/5bd7f4e08d777f2e6225d8f2/download',
    size: 2_100_000,
    type: 'vti',
    description: 'Skull CT surface reconstruction',
  },
  {
    name: 'Particle System',
    path: '',
    size: 0,
    type: 'ply',
    description: 'Synthetic particle point cloud for LOD demo',
  },
];

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function getFileIcon(type: DataFileInfo['type']): string {
  const icons: Record<string, string> = {
    vtp: '📐',
    vti: '🧊',
    vtk: '📦',
    obj: '🎯',
    stl: '🔧',
    ply: '💠',
  };
  return icons[type] ?? '📄';
}
