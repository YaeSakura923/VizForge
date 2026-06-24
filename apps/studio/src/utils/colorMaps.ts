import type { ColorMapPreset } from '../types';

/**
 * Color map presets for scalar field visualization.
 * Each preset defines a gradient for mapping scalar values to colors.
 */
export const COLOR_MAP_PRESETS: ColorMapPreset[] = [
  {
    name: 'Cool to Warm',
    colors: ['#3b4cc0', '#7b8de8', '#ffffff', '#e87b4c', '#c03b2a'],
    type: 'diverging',
  },
  {
    name: 'Rainbow',
    colors: ['#0000ff', '#00ffff', '#00ff00', '#ffff00', '#ff0000'],
    type: 'sequential',
  },
  {
    name: 'Viridis',
    colors: ['#440154', '#3b528b', '#21918c', '#5ec962', '#fde725'],
    type: 'sequential',
  },
  {
    name: 'Inferno',
    colors: ['#000004', '#420a68', '#932667', '#dd513a', '#fca50a'],
    type: 'sequential',
  },
  {
    name: 'Grayscale',
    colors: ['#000000', '#333333', '#666666', '#999999', '#ffffff'],
    type: 'sequential',
  },
  {
    name: 'Thermal',
    colors: ['#0d0887', '#6a00a8', '#b12a90', '#e16462', '#fca636'],
    type: 'sequential',
  },
  {
    name: 'Blues',
    colors: ['#f7fbff', '#c6dbef', '#6baed6', '#2171b5', '#08306b'],
    type: 'sequential',
  },
  {
    name: 'Red-Green',
    colors: ['#d73027', '#fc8d59', '#fee08b', '#91cf60', '#1a9850'],
    type: 'diverging',
  },
];

export function getColorMapCSS(name: string): string {
  const preset = COLOR_MAP_PRESETS.find((p) => p.name === name);
  if (!preset) return getColorMapCSS('Cool to Warm');
  const stops = preset.colors.map((c, i) => {
    const pos = (i / (preset.colors.length - 1)) * 100;
    return `${c} ${pos}%`;
  });
  return `linear-gradient(to right, ${stops.join(', ')})`;
}

export function getColorMapFunction(
  name: string
): (t: number) => [number, number, number] {
  const preset = COLOR_MAP_PRESETS.find((p) => p.name === name) ?? COLOR_MAP_PRESETS[0];
  return (t: number): [number, number, number] => {
    const clamped = Math.max(0, Math.min(1, t));
    const idx = clamped * (preset.colors.length - 1);
    const lo = Math.floor(idx);
    const hi = Math.min(lo + 1, preset.colors.length - 1);
    const frac = idx - lo;

    const parseHex = (hex: string) => [
      parseInt(hex.slice(1, 3), 16) / 255,
      parseInt(hex.slice(3, 5), 16) / 255,
      parseInt(hex.slice(5, 7), 16) / 255,
    ];

    const cLo = parseHex(preset.colors[lo]);
    const cHi = parseHex(preset.colors[hi]);

    return [
      cLo[0] + (cHi[0] - cLo[0]) * frac,
      cLo[1] + (cHi[1] - cLo[1]) * frac,
      cLo[2] + (cHi[2] - cLo[2]) * frac,
    ];
  };
}
