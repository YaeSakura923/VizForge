import React, { useEffect, useRef, useImperativeHandle, forwardRef, useCallback, useState } from 'react';
import gsap from 'gsap';
import type { ViewportLayout, RenderingConfig, DataFileInfo } from '../types';

interface VtkViewerProps {
  layout: ViewportLayout;
  renderConfig: RenderingConfig;
  loadedFile: DataFileInfo | null;
  onFpsUpdate: (fps: number) => void;
}

export interface VtkViewerHandle {
  resetCamera: () => void;
  screenshot: () => string;
}

const VtkViewer = forwardRef<VtkViewerHandle, VtkViewerProps>(
  ({ layout, renderConfig, loadedFile, onFpsUpdate }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const [ready, setReady] = useState(false);
    const animFrameRef = useRef<number>(0);
    const lastFpsUpdate = useRef(0);
    const frameCount = useRef(0);
    const cellsAnimated = useRef(false);

    useImperativeHandle(ref, () => ({
      resetCamera: () => {
        console.log('[VTK] Camera reset');
      },
      screenshot: () => {
        if (!canvasRef.current) return '';
        return canvasRef.current.toDataURL('image/png');
      },
    }));

    // Initialize VTK.js rendering
    useEffect(() => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      setReady(true);

      // FPS counter loop
      let running = true;
      const fpsLoop = () => {
        if (!running) return;
        frameCount.current++;
        const now = performance.now();
        if (now - lastFpsUpdate.current > 1000) {
          onFpsUpdate(frameCount.current);
          frameCount.current = 0;
          lastFpsUpdate.current = now;
        }
        animFrameRef.current = requestAnimationFrame(fpsLoop);
      };
      animFrameRef.current = requestAnimationFrame(fpsLoop);

      return () => {
        running = false;
        cancelAnimationFrame(animFrameRef.current);
      };
    }, []);

    // Viewport cell entrance animation
    useEffect(() => {
      if (!ready || cellsAnimated.current) return;
      cellsAnimated.current = true;

      const cells = containerRef.current?.querySelectorAll('.viewport-cell');
      if (cells) {
        gsap.fromTo(
          cells,
          { opacity: 0, scale: 0.92 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            stagger: 0.08,
            ease: 'power2.out',
          },
        );
      }

      // Overlay fade-in
      if (overlayRef.current) {
        gsap.fromTo(
          overlayRef.current,
          { opacity: 0, y: 8 },
          { opacity: 1, y: 0, duration: 0.3, delay: 0.3, ease: 'power2.out' },
        );
      }
    }, [ready]);

    // Layout change animation
    useEffect(() => {
      if (!ready) return;

      const cells = containerRef.current?.querySelectorAll('.viewport-cell');
      if (cells) {
        gsap.fromTo(
          cells,
          { opacity: 0, scale: 0.95 },
          {
            opacity: 1,
            scale: 1,
            duration: 0.25,
            stagger: 0.05,
            ease: 'power1.out',
          },
        );
      }
    }, [layout, ready]);

    // Loading file animation
    useEffect(() => {
      if (!ready || !loadedFile) return;
      console.log('[VTK] Loading file:', loadedFile.name);
    }, [loadedFile, ready]);

    const gridClass =
      layout === 'single'
        ? ''
        : layout === 'dual'
          ? 'viewport-grid-2'
          : 'viewport-grid-4';

    const viewportCount = layout === 'single' ? 1 : layout === 'dual' ? 2 : 4;
    const viewportLabels = layout === 'single'
        ? ['Main']
        : layout === 'dual'
          ? ['Surface', 'Volume']
          : ['Surface', 'Volume', 'X-Slice', 'Y-Slice'];

    return (
      <div className="viewport-container">
        {!ready && (
          <div className="viewport-loading">
            <div className="spinner" />
            <p>Initializing WebGL rendering...</p>
          </div>
        )}

        <div
          ref={containerRef}
          className={`viewport-grid ${gridClass}`}
          style={{ width: '100%', height: '100%' }}
        >
          {Array.from({ length: viewportCount }).map((_, i) => (
            <div key={i} className="viewport-cell">
              <span className="viewport-cell-label">{viewportLabels[i]}</span>
              {i === 0 && (
                <canvas
                  ref={canvasRef}
                  className="viewport-canvas"
                  style={{ width: '100%', height: '100%' }}
                />
              )}
              {i !== 0 && (
                <canvas
                  className="viewport-canvas"
                  style={{ width: '100%', height: '100%' }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="viewport-overlay" ref={overlayRef}>
          <div className="viewport-info">
            {loadedFile ? loadedFile.name : 'No data loaded'}
          </div>
          <div className="viewport-info">
            Mode: {renderConfig.mode.toUpperCase()} | LOD: Level {renderConfig.lodLevel}
          </div>
        </div>
      </div>
    );
  }
);

VtkViewer.displayName = 'VtkViewer';
export default VtkViewer;
