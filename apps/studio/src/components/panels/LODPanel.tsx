import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { LOD_LEVELS } from '../../utils/lodManager';

interface LODPanelProps {
  level: number;
  onChange: (level: number) => void;
}

export default function LODPanel({ level, onChange }: LODPanelProps) {
  const barRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);
  const current = LOD_LEVELS[level] ?? LOD_LEVELS[1];
  const budgetPercent = ((current.level + 1) / LOD_LEVELS.length) * 100;

  /* 进度条填充动画 */
  useEffect(() => {
    if (barRef.current) {
      gsap.to(barRef.current, {
        width: `${budgetPercent}%`,
        duration: 0.5,
        ease: 'power2.out',
      });
    }
  }, [budgetPercent]);

  /* 数值脉冲 */
  useEffect(() => {
    if (valueRef.current) {
      gsap.fromTo(
        valueRef.current,
        { scale: 1.2, color: '#4fc3f7' },
        { scale: 1, color: '#e0e0e0', duration: 0.35, ease: 'power1.out' },
      );
    }
  }, [level]);

  return (
    <div>
      <div className="panel-section">
        <div className="panel-title">Level of Detail</div>
        <div className="control-group">
          <div className="control-label">
            <span>Quality</span>
            <span className="control-value" ref={valueRef}>{current.label}</span>
          </div>
          <input
            type="range"
            min="0"
            max={LOD_LEVELS.length - 1}
            step="1"
            value={level}
            onChange={(e) => onChange(parseInt(e.target.value))}
          />
        </div>

        <div className="lod-indicator">
          <span style={{ color: 'var(--text-muted)', fontSize: 11 }}>Budget</span>
          <div className="lod-bar">
            <div
              className="lod-bar-fill"
              ref={barRef}
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-accent)' }}>
            {(current.triangleTarget / 1000).toFixed(0)}K
          </span>
        </div>
      </div>

      <div className="panel-section">
        <div className="panel-title">LOD Levels</div>
        {LOD_LEVELS.map((lod) => (
          <div
            key={lod.level}
            className={`file-item ${level === lod.level ? 'active' : ''}`}
            onClick={() => onChange(lod.level)}
            style={{ cursor: 'pointer' }}
          >
            <span className="name">
              <span>{lod.label}</span>
            </span>
            <span className="size">
              {(lod.triangleTarget / 1000).toFixed(0)}K tris
            </span>
          </div>
        ))}
      </div>

      <div className="panel-section">
        <div className="panel-title">Performance Notes</div>
        <ul style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8, paddingLeft: 16 }}>
          <li>Auto LOD adjusts quality based on FPS</li>
          <li>Lower quality reduces GPU memory usage</li>
          <li>Ultra quality recommended for final renders</li>
          <li>Medium is optimal for interactive exploration</li>
        </ul>
      </div>
    </div>
  );
}
