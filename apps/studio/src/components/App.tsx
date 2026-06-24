import React, { useState, useCallback, useRef, useEffect } from 'react';
import gsap from 'gsap';
import Toolbar from './Toolbar';
import Sidebar from './Sidebar';
import VtkViewer from './VtkViewer';
import PipelineEditor from './PipelineEditor';
import type { RenderingConfig, ViewportLayout, SidebarTab, DataFileInfo, PipelineState, AnimationClip } from '../types';
import { lodManager } from '../utils/lodManager';
import { runFullBenchmark } from '../utils/wasmBridge';
import type { WasmBenchResult } from '../types';
import { createDefaultClip } from '../utils/animationUtils';

export default function App() {
  const appRef = useRef<HTMLDivElement>(null);

  /* 全局入场 GSAP Timeline */
  useEffect(() => {
    if (appRef.current) {
      gsap.fromTo(
        appRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power1.out' },
      );
    }
  }, []);
  const [activeTab, setActiveTab] = useState<SidebarTab>('data');
  const [layout, setLayout] = useState<ViewportLayout>('single');
  const [fps, setFps] = useState(60);
  const [loadedFile, setLoadedFile] = useState<DataFileInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [wasmResults, setWasmResults] = useState<WasmBenchResult[]>([]);
  const [wasmRunning, setWasmRunning] = useState(false);

  const [renderConfig, setRenderConfig] = useState<RenderingConfig>({
    mode: 'surface',
    opacity: 1.0,
    colorMap: 'Cool to Warm',
    lodLevel: 1,
    clipping: {
      enabled: false,
      planeOrigin: [0, 0, 0],
      planeNormal: [0, 0, 1],
    },
  });

  /* Pipeline Editor */
  const [showPipelineEditor, setShowPipelineEditor] = useState(false);
  const [pipelineState, setPipelineState] = useState<PipelineState | null>(null);

  /* Shader Editor */
  const [activeShader, setActiveShader] = useState<{ code: string; name: string } | null>(null);

  /* Animation Timeline — GSAP powered */
  const [animationClip, setAnimationClip] = useState<AnimationClip>(createDefaultClip());
  const [isPlaying, setIsPlaying] = useState(false);
  const [animCurrentTime, setAnimCurrentTime] = useState(0);
  const gsapTweenRef = useRef<gsap.core.Tween | null>(null);
  const animProxyRef = useRef({ time: 0 });

  const viewerRef = useRef<{ resetCamera: () => void; screenshot: () => string }>(null);

  /* GSAP cleanup on unmount */
  useEffect(() => {
    return () => {
      if (gsapTweenRef.current) gsapTweenRef.current.kill();
    };
  }, []);

  const handleFpsUpdate = useCallback((newFps: number) => {
    setFps(newFps);
    lodManager.recordFrame(100000);
    if (lodManager.getState().auto) {
      lodManager.update();
    }
  }, []);

  const handleFileSelect = useCallback(async (file: DataFileInfo) => {
    setLoading(true);
    setLoadedFile(file);
    await new Promise((r) => setTimeout(r, 500));
    setLoading(false);
  }, []);

  const handleRunWasmBenchmark = useCallback(async () => {
    setWasmRunning(true);
    try {
      const results = await runFullBenchmark();
      setWasmResults(results);
    } finally {
      setWasmRunning(false);
    }
  }, []);

  const handleScreenshot = useCallback(() => {
    if (viewerRef.current) {
      const dataUrl = viewerRef.current.screenshot();
      const link = document.createElement('a');
      link.download = `vtk-screenshot-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    }
  }, []);

  const handleResetCamera = useCallback(() => {
    viewerRef.current?.resetCamera();
  }, []);

  /* Pipeline: Apply pipeline from editor */
  const handleApplyPipeline = useCallback((state: PipelineState) => {
    setPipelineState(state);
    const hasVolumeNode = state.nodes.some(
      (n) => n.type === 'renderer' && n.config.mode === 'volume',
    );
    setRenderConfig((prev) => ({
      ...prev,
      mode: hasVolumeNode ? 'volume' : 'surface',
      lodLevel: state.nodes.some((n) => n.type === 'renderer')
        ? (state.nodes.find((n) => n.type === 'renderer')?.config.lodLevel as number) ?? prev.lodLevel
        : prev.lodLevel,
    }));
  }, []);

  /* Shader: Apply shader */
  const handleApplyShader = useCallback((code: string, name: string) => {
    setActiveShader({ code, name });
    setActiveTab('rendering');
  }, []);

  /* Animation: GSAP-powered playback */
  const handleTogglePlay = useCallback(() => {
    if (isPlaying) {
      gsapTweenRef.current?.kill();
      gsapTweenRef.current = null;
      setIsPlaying(false);
    } else {
      const duration = animationClip.duration;
      const startTime = animCurrentTime;

      animProxyRef.current.time = startTime;

      gsapTweenRef.current = gsap.to(animProxyRef.current, {
        time: duration,
        duration: duration - startTime,
        ease: 'none',
        overwrite: true,
        onUpdate: () => {
          setAnimCurrentTime(animProxyRef.current.time);
        },
        onComplete: () => {
          if (animationClip.loop) {
            setAnimCurrentTime(0);
            animProxyRef.current.time = 0;
            gsapTweenRef.current = gsap.to(animProxyRef.current, {
              time: duration,
              duration,
              ease: 'none',
              onUpdate: () => setAnimCurrentTime(animProxyRef.current.time),
              onComplete: () => {
                setIsPlaying(false);
              },
            });
          } else {
            setIsPlaying(false);
          }
        },
      });
      setIsPlaying(true);
    }
  }, [isPlaying, animCurrentTime, animationClip.duration, animationClip.loop]);

  const handleAnimSeek = useCallback((time: number) => {
    if (gsapTweenRef.current) {
      gsapTweenRef.current.kill();
      gsapTweenRef.current = null;
      setIsPlaying(false);
    }
    setAnimCurrentTime(time);
    animProxyRef.current.time = time;
  }, []);

  return (
    <div className="app-layout" ref={appRef}>
      <Toolbar
        fps={fps}
        layout={layout}
        onLayoutChange={setLayout}
        onResetCamera={handleResetCamera}
        onScreenshot={handleScreenshot}
        showPipelineEditor={showPipelineEditor}
        onTogglePipelineEditor={() => setShowPipelineEditor((v) => !v)}
      />

      {showPipelineEditor ? (
        <PipelineEditor
          onApplyPipeline={handleApplyPipeline}
          onClose={() => setShowPipelineEditor(false)}
        />
      ) : (
        <>
          <Sidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            renderConfig={renderConfig}
            onRenderConfigChange={setRenderConfig}
            wasmResults={wasmResults}
            wasmRunning={wasmRunning}
            onRunWasmBenchmark={handleRunWasmBenchmark}
            loadedFile={loadedFile}
            onFileSelect={handleFileSelect}
            loading={loading}
            onApplyShader={handleApplyShader}
            animationClip={animationClip}
            onAnimationClipChange={setAnimationClip}
            isPlaying={isPlaying}
            animCurrentTime={animCurrentTime}
            onAnimSeek={handleAnimSeek}
            onTogglePlay={handleTogglePlay}
          />

          <VtkViewer
            ref={viewerRef}
            layout={layout}
            renderConfig={renderConfig}
            loadedFile={loadedFile}
            onFpsUpdate={handleFpsUpdate}
          />
        </>
      )}
    </div>
  );
}
