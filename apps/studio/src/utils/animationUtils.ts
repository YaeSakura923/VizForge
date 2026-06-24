import type { Keyframe, AnimationClip } from '../types';

/** Easing functions that map t in [0,1] to eased value */
export const EASING_FUNCTIONS: Record<Keyframe['easing'], (t: number) => number> = {
  linear: (t) => t,
  cubic: (t) => t * t * (3 - 2 * t),
  'ease-in': (t) => t * t * t,
  'ease-out': (t) => 1 - Math.pow(1 - t, 3),
  bounce: (t) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) return n1 * t * t;
    if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
    if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
    return n1 * (t -= 2.625 / d1) * t + 0.984375;
  },
};

/** Interpolate between two keyframes at a given time */
export function interpolateKeyframes(
  kf1: Keyframe,
  kf2: Keyframe,
  currentTime: number,
): number {
  const duration = kf2.time - kf1.time;
  if (duration <= 0) return kf2.value;
  const t = Math.max(0, Math.min(1, (currentTime - kf1.time) / duration));
  const eased = EASING_FUNCTIONS[kf1.easing](t);
  return kf1.value + (kf2.value - kf1.value) * eased;
}

/** Get interpolated value at a given time from a track's keyframes */
export function getTrackValueAtTime(
  keyframes: Keyframe[],
  time: number,
): number {
  if (keyframes.length === 0) return 0;
  if (keyframes.length === 1) return keyframes[0].value;

  const sorted = [...keyframes].sort((a, b) => a.time - b.time);

  if (time <= sorted[0].time) return sorted[0].value;
  if (time >= sorted[sorted.length - 1].time) return sorted[sorted.length - 1].value;

  for (let i = 0; i < sorted.length - 1; i++) {
    if (time >= sorted[i].time && time <= sorted[i + 1].time) {
      return interpolateKeyframes(sorted[i], sorted[i + 1], time);
    }
  }

  return sorted[sorted.length - 1].value;
}

/** Snap time to grid interval */
export function snapToGrid(time: number, gridSize: number): number {
  return Math.round(time / gridSize) * gridSize;
}

/** Format time as mm:ss.ms */
export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

let clipId = 1;
export function createDefaultClip(): AnimationClip {
  const id = `clip-${clipId++}`;
  return {
    id,
    name: 'New Animation',
    duration: 5,
    tracks: [],
    loop: false,
  };
}

export function createDefaultTrack(name: string, property: string, color: string) {
  return {
    id: `track-${clipId++}`,
    name,
    property,
    keyframes: [
      { id: 'kf-default-1', time: 0, value: 0, easing: 'linear' as const },
      { id: 'kf-default-2', time: 5, value: 1, easing: 'linear' as const },
    ],
    color,
  };
}
