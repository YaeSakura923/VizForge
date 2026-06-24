/**
 * 文件加载器 — 支持多种 VTK 数据格式
 */

import type { DataFile } from '../rendering/types';

export type FileLoadCallback = (progress: number) => void;

export class FileLoader {
  async load(url: string, onProgress?: FileLoadCallback): Promise<ArrayBuffer> {
    const response = await fetch(url);
    const total = parseInt(response.headers.get('content-length') || '0');
    const reader = response.body?.getReader();
    const chunks: Uint8Array[] = [];
    let loaded = 0;

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        if (total && onProgress) onProgress(loaded / total);
      }
    } else {
      const buffer = await response.arrayBuffer();
      return buffer;
    }

    const allChunks = new Uint8Array(loaded);
    let pos = 0;
    for (const chunk of chunks) {
      allChunks.set(chunk, pos);
      pos += chunk.length;
    }
    return allChunks.buffer;
  }

  getTypeFromExtension(filename: string): DataFile['type'] {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const validTypes: DataFile['type'][] = ['vtp', 'vti', 'vtk', 'obj', 'stl', 'ply'];
    return validTypes.includes(ext as DataFile['type'])
      ? (ext as DataFile['type'])
      : 'vtk';
  }
}

export const fileLoader = new FileLoader();
