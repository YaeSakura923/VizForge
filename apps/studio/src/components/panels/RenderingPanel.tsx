import React from 'react';
import type { RenderingConfig } from '../../types';
import { COLOR_MAP_PRESETS, getColorMapCSS } from '../../utils/colorMaps';

interface RenderingPanelProps {
  config: RenderingConfig;
  onChange: (config: RenderingConfig) => void;
}

export default function RenderingPanel({ config, onChange }: RenderingPanelProps) {
  return (
    <div>
      <div className="panel-section">
        <div className="panel-title">Render Mode</div>
        <div className="control-group">
          <select
            value={config.mode}
            onChange={(e) =>
              onChange({ ...config, mode: e.target.value as RenderingConfig['mode'] })
            }
          >
            <option value="surface">Surface Rendering (Marching Cubes)</option>
            <option value="volume">Volume Rendering (Ray-casting)</option>
            <option value="both">Dual Pipeline (Surface + Volume)</option>
          </select>
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-title">Opacity</div>
        <div className="control-group">
          <div className="control-label">
            <span>Transparency</span>
            <span className="control-value">{Math.round(config.opacity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={config.opacity}
            onChange={(e) => onChange({ ...config, opacity: parseFloat(e.target.value) })}
          />
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-title">Color Map</div>
        <div
          className="color-map-bar"
          style={{ background: getColorMapCSS(config.colorMap) }}
        />
        <div className="color-map-presets">
          {COLOR_MAP_PRESETS.map((preset) => (
            <button
              key={preset.name}
              className={`color-map-preset ${config.colorMap === preset.name ? 'active' : ''}`}
              style={{
                background: getColorMapCSS(preset.name),
              }}
              onClick={() => onChange({ ...config, colorMap: preset.name })}
              title={preset.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
