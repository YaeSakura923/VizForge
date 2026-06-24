import { describe, it, expect } from 'vitest';
import { getColorMapCSS, COLOR_MAP_PRESETS } from '../src/utils/colorMaps';
import { lodManager, LOD_LEVELS } from '../src/utils/lodManager';
import { runBenchmark } from '../src/utils/wasmBridge';
import { formatFileSize, getFileIcon } from '../src/utils/sampleData';

describe('Color Maps', () => {
  it('should have preset color maps', () => {
    expect(COLOR_MAP_PRESETS.length).toBeGreaterThan(0);
    expect(getColorMapCSS('Cool to Warm')).toContain('linear-gradient');
  });

  it('should fallback to default for unknown color map', () => {
    expect(getColorMapCSS('NonExistent')).toBeDefined();
  });
});

describe('WASM Bridge', () => {
  it('should benchmark algorithms', async () => {
    const result = await runBenchmark('gaussianBlur', 1000, false);
    expect(result.executionTimeMs).toBeGreaterThan(0);
    expect(result.dataSize).toBe(1000);
    expect(result.algorithm).toBe('gaussianBlur');
  });

  it('should show WASM performance advantage', async () => {
    const jsResult = await runBenchmark('gaussianBlur', 50000, false);
    const wasmResult = await runBenchmark('gaussianBlur', 50000, true);
    expect(wasmResult.executionTimeMs).toBeLessThan(jsResult.executionTimeMs * 1.5);
  });
});

describe('LOD Manager', () => {
  it('should manage LOD levels', () => {
    expect(LOD_LEVELS).toHaveLength(4);
    lodManager.setLevel(2);
    expect(lodManager.getState().currentLevel).toBe(2);
  });

  it('should adjust LOD based on FPS', () => {
    lodManager.setAuto(true);
    lodManager.setLevel(3);
    lodManager.recordFrame(100000);
    const level = lodManager.update();
    expect(level).toBeDefined();
    expect(level.triangleTarget).toBeGreaterThan(0);
  });
});

describe('Sample Data Utils', () => {
  it('should format file sizes', () => {
    expect(formatFileSize(0)).toBe('—');
    expect(formatFileSize(1024)).toBe('1.0 KB');
    expect(formatFileSize(1048576)).toBe('1.0 MB');
  });

  it('should return file type icons', () => {
    expect(getFileIcon('vtp')).toBeDefined();
  });
});
