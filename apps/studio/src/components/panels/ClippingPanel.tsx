import React from 'react';
import type { ClippingConfig } from '../../types';

interface ClippingPanelProps {
  config: ClippingConfig;
  onChange: (config: ClippingConfig) => void;
}

const AXES = [
  { label: 'X-Axis', normal: [1, 0, 0] as [number, number, number] },
  { label: 'Y-Axis', normal: [0, 1, 0] as [number, number, number] },
  { label: 'Z-Axis', normal: [0, 0, 1] as [number, number, number] },
];

export default function ClippingPanel({ config, onChange }: ClippingPanelProps) {
  return (
    <div>
      <div className="panel-section">
        <div className="panel-title">Clipping Planes</div>
        <div className="control-group">
          <label className="control-label">
            <span>Enable Clipping</span>
            <input
              type="checkbox"
              checked={config.enabled}
              onChange={(e) =>
                onChange({ ...config, enabled: e.target.checked })
              }
              style={{ accentColor: 'var(--accent-blue)' }}
            />
          </label>
        </div>

        {config.enabled && (
          <>
            <div className="control-group">
              <div className="panel-title" style={{ marginTop: 12 }}>Plane Orientation</div>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {AXES.map((axis) => (
                  <button
                    key={axis.label}
                    className={`tb-btn ${config.planeNormal.every((v, i) => v === axis.normal[i]) ? 'active' : ''}`}
                    onClick={() => onChange({ ...config, planeNormal: axis.normal })}
                    style={{ flex: 1, minWidth: 60, justifyContent: 'center' }}
                  >
                    {axis.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="control-group">
              <div className="control-label">
                <span>Plane Offset</span>
                <span className="control-value">{config.planeOrigin[2].toFixed(2)}</span>
              </div>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.01"
                value={config.planeOrigin[2]}
                onChange={(e) =>
                  onChange({
                    ...config,
                    planeOrigin: [0, 0, parseFloat(e.target.value)],
                  })
                }
              />
            </div>
          </>
        )}
      </div>

      <div className="panel-section">
        <div className="panel-title">Interactive Controls</div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
          Use <strong>left mouse</strong> to rotate<br />
          Use <strong>scroll wheel</strong> to zoom<br />
          Use <strong>right mouse</strong> to pan<br />
          Hold <strong>Shift</strong> + drag to adjust clipping plane
        </p>
      </div>
    </div>
  );
}
