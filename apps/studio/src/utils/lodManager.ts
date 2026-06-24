import type { LODLevel } from '../types';

/**
 * LOD (Level of Detail) Manager — controls rendering quality
 * based on camera distance and performance budgets.
 */
export const LOD_LEVELS: LODLevel[] = [
  { level: 0, triangleTarget: 50000, pixelRatio: 0.5, label: 'Low' },
  { level: 1, triangleTarget: 100000, pixelRatio: 0.75, label: 'Medium' },
  { level: 2, triangleTarget: 250000, pixelRatio: 1.0, label: 'High' },
  { level: 3, triangleTarget: 500000, pixelRatio: 1.5, label: 'Ultra' },
];

export interface LODState {
  currentLevel: number;
  fps: number;
  triangleCount: number;
  auto: boolean;
}

export class LODManager {
  private state: LODState = {
    currentLevel: 1,
    fps: 60,
    triangleCount: 0,
    auto: true,
  };
  private frameTimes: number[] = [];
  private readonly fpsWindow = 30;

  getState(): LODState {
    return { ...this.state };
  }

  setLevel(level: number): void {
    this.state.currentLevel = Math.max(0, Math.min(LOD_LEVELS.length - 1, level));
  }

  setAuto(auto: boolean): void {
    this.state.auto = auto;
  }

  recordFrame(triangleCount: number): void {
    this.state.triangleCount = triangleCount;
    const now = performance.now();
    this.frameTimes.push(now);
    if (this.frameTimes.length > this.fpsWindow) {
      this.frameTimes.shift();
    }
    if (this.frameTimes.length > 1) {
      const elapsed = now - this.frameTimes[0];
      this.state.fps = Math.round(
        ((this.frameTimes.length - 1) / elapsed) * 1000
      );
    }
  }

  update(): LODLevel {
    if (this.state.auto) {
      const fps = this.state.fps;
      if (fps < 20) {
        this.state.currentLevel = 0;
      } else if (fps < 40) {
        this.state.currentLevel = 1;
      } else if (fps < 55) {
        this.state.currentLevel = 2;
      } else {
        this.state.currentLevel = Math.min(3, this.state.currentLevel + 1);
      }
    }
    return LOD_LEVELS[this.state.currentLevel];
  }

  getCurrentLevel(): LODLevel {
    return LOD_LEVELS[this.state.currentLevel];
  }
}

export const lodManager = new LODManager();
