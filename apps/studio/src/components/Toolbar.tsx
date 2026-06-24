import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { ViewportLayout } from '../types';

interface ToolbarProps {
  fps: number;
  layout: ViewportLayout;
  onLayoutChange: (layout: ViewportLayout) => void;
  onResetCamera: () => void;
  onScreenshot: () => void;
  showPipelineEditor: boolean;
  onTogglePipelineEditor: () => void;
}

export default function Toolbar({
  fps,
  layout,
  onLayoutChange,
  onResetCamera,
  onScreenshot,
  showPipelineEditor,
  onTogglePipelineEditor,
}: ToolbarProps) {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const fpsRef = useRef<HTMLDivElement>(null);

  /* 入场动画 */
  useEffect(() => {
    if (toolbarRef.current) {
      gsap.fromTo(
        toolbarRef.current,
        { y: -48, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' },
      );
    }
  }, []);

  /* FPS 变化脉冲 */
  useEffect(() => {
    if (fpsRef.current) {
      gsap.fromTo(
        fpsRef.current,
        { scale: 1.15, color: '#4fc3f7' },
        { scale: 1, color: '#66bb6a', duration: 0.3, ease: 'power1.out' },
      );
    }
  }, [fps]);

  const handleBtnClick = (e: React.MouseEvent) => {
    const btn = e.currentTarget as HTMLElement;
    gsap.fromTo(btn, { scale: 0.9 }, { scale: 1, duration: 0.2, ease: 'back.out(2)' });
  };

  return (
    <header className="toolbar" ref={toolbarRef}>
      <div className="toolbar-brand">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        <span>VizForge Studio</span>
      </div>

      <div className="toolbar-actions">
        <div className="toolbar-group">
          <button
            className={`tb-btn ${showPipelineEditor ? 'active' : ''}`}
            onClick={(e) => { handleBtnClick(e); onTogglePipelineEditor(); }}
            title="Pipeline Node Editor"
          >
            <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
              <rect x="1" y="1" width="6" height="6" rx="1" />
              <rect x="9" y="1" width="6" height="6" rx="1" />
              <rect x="5" y="9" width="6" height="6" rx="1" />
              <path d="M7 4h2M8 7v2M4 7v-1h3M12 4v2h-2" strokeWidth="0.5" />
            </svg>
            Pipeline
          </button>
        </div>

        <div className="toolbar-group">
          {(['single', 'dual', 'quad'] as ViewportLayout[]).map((l) => (
            <button
              key={l}
              className={`tb-btn tb-btn-icon ${layout === l ? 'active' : ''}`}
              onClick={(e) => { handleBtnClick(e); onLayoutChange(l); }}
              title={`${l.charAt(0).toUpperCase() + l.slice(1)} Viewport`}
            >
              <svg viewBox="0 0 16 16" fill="currentColor">
                {l === 'single' && <rect x="1" y="1" width="14" height="14" rx="1" />}
                {l === 'dual' && <><rect x="1" y="1" width="6.5" height="14" rx="1" /><rect x="8.5" y="1" width="6.5" height="14" rx="1" /></>}
                {l === 'quad' && <><rect x="1" y="1" width="6.5" height="6.5" rx="1" /><rect x="8.5" y="1" width="6.5" height="6.5" rx="1" /><rect x="1" y="8.5" width="6.5" height="6.5" rx="1" /><rect x="8.5" y="8.5" width="6.5" height="6.5" rx="1" /></>}
              </svg>
            </button>
          ))}
        </div>

        <div className="toolbar-group">
          <button className="tb-btn" onClick={(e) => { handleBtnClick(e); onResetCamera(); }} title="Reset Camera">
            <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 3a5 5 0 00-5 5h2l-2.5 3L0 8h2a7 7 0 0113.23-2.59l-1.47.6A5 5 0 008 3zm5 5h-2l2.5-3L16 8h-2a7 7 0 01-13.23 2.59l1.47-.6A5 5 0 0013 8z" /></svg>
            Reset
          </button>
          <button className="tb-btn" onClick={(e) => { handleBtnClick(e); onScreenshot(); }} title="Take Screenshot">
            <svg viewBox="0 0 16 16" fill="currentColor"><path d="M11 8a3 3 0 11-6 0 3 3 0 016 0z" /><path fillRule="evenodd" d="M2 3a2 2 0 00-2 2v7a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2h-1.586l-.707-.707A1 1 0 0010.586 2H5.414a1 1 0 00-.707.293L4 3H2zm3 5a3 3 0 116 0 3 3 0 01-6 0z" clipRule="evenodd" /></svg>
          </button>
        </div>

        <div className="fps-counter" ref={fpsRef} title="Frames Per Second">
          {fps} FPS
        </div>
      </div>
    </header>
  );
}
