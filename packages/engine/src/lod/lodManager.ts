/**
 * LOD Manager — 自适应细节层次调度
 */

export const LOD_LEVELS = [
  { level: 0, triangleBudget: 50000, pixelRatio: 0.5, label: '低' },
  { level: 1, triangleBudget: 100000, pixelRatio: 0.75, label: '中' },
  { level: 2, triangleBudget: 250000, pixelRatio: 1.0, label: '高' },
  { level: 3, triangleBudget: 500000, pixelRatio: 1.5, label: '极佳' },
] as const;

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
  private readonly WINDOW = 30;

  getState(): LODState {
    return { ...this.state };
  }

  setLevel(level: number): void {
    this.state.currentLevel = Math.max(0, Math.min(LOD_LEVELS.length - 1, level));
  }

  setAuto(auto: boolean): void {
    this.state.auto = auto;
  }

  recordFrame(triangles: number): void {
    this.state.triangleCount = triangles;
    const now = performance.now();
    this.frameTimes.push(now);
    if (this.frameTimes.length > this.WINDOW) this.frameTimes.shift();
    if (this.frameTimes.length > 1) {
      const elapsed = now - this.frameTimes[0];
      this.state.fps = Math.round(((this.frameTimes.length - 1) / elapsed) * 1000);
    }
  }

  update(): void {
    if (!this.state.auto) return;
    const fps = this.state.fps;
    if (fps < 20) this.state.currentLevel = 0;
    else if (fps < 40) this.state.currentLevel = 1;
    else if (fps < 55) this.state.currentLevel = 2;
    else this.state.currentLevel = Math.min(3, this.state.currentLevel + 1);
  }
}

export const lodManager = new LODManager();
