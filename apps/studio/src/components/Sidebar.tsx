import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import type { SidebarTab, RenderingConfig, DataFileInfo, WasmBenchResult, AnimationClip } from '../types';
import DataPanel from './panels/DataPanel';
import RenderingPanel from './panels/RenderingPanel';
import ClippingPanel from './panels/ClippingPanel';
import LODPanel from './panels/LODPanel';
import WasmPanel from './panels/WasmPanel';
import ShaderEditor from './ShaderEditor';
import AnimationTimeline from './AnimationTimeline';

interface SidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  renderConfig: RenderingConfig;
  onRenderConfigChange: (config: RenderingConfig) => void;
  wasmResults: WasmBenchResult[];
  wasmRunning: boolean;
  onRunWasmBenchmark: () => void;
  loadedFile: DataFileInfo | null;
  onFileSelect: (file: DataFileInfo) => void;
  loading: boolean;
  onApplyShader: (code: string, name: string) => void;
  animationClip: AnimationClip;
  onAnimationClipChange: (clip: AnimationClip) => void;
  isPlaying: boolean;
  animCurrentTime: number;
  onAnimSeek: (time: number) => void;
  onTogglePlay: () => void;
}

const TABS: { id: SidebarTab; label: string; icon: React.ReactNode }[] = [
  {
    id: 'data',
    label: 'Data',
    icon: <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 1C4.5 1 1 2.5 1 4v8c0 1.5 3.5 3 7 3s7-1.5 7-3V4c0-1.5-3.5-3-7-3zm0 2c3.5 0 5.5 1.2 5.5 1.5S11.5 6 8 6 2.5 4.8 2.5 4.5 4.5 3 8 3zm0 11c-3.5 0-5.5-1.2-5.5-1.5V9.2c1 .6 3 1.3 5.5 1.3s4.5-.7 5.5-1.3v3.3c0 .3-2 1.5-5.5 1.5z"/></svg>,
  },
  {
    id: 'rendering',
    label: 'Render',
    icon: <svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 3a5 5 0 100 10A5 5 0 008 3zm0 8.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z"/><path d="M8 0a1 1 0 011 1v1.5a1 1 0 01-2 0V1a1 1 0 011-1zm0 12.5a1 1 0 011 1V15a1 1 0 01-2 0v-1.5a1 1 0 011-1zM15 7a1 1 0 010 2h-1.5a1 1 0 010-2H15zM2.5 7a1 1 0 010 2H1a1 1 0 010-2h1.5z" opacity="0.5"/></svg>,
  },
  {
    id: 'clipping',
    label: 'Clip',
    icon: <svg viewBox="0 0 16 16" fill="currentColor"><path d="M1 2h14v2H1V2zm0 5h14v2H1V7zm0 5h14v2H1v-2z" opacity="0.6"/><path d="M4 3v10M8 3v10M12 3v10" stroke="currentColor" strokeWidth="0.5"/></svg>,
  },
  {
    id: 'lod',
    label: 'LOD',
    icon: <svg viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="11" width="4" height="4" rx="1" opacity="0.4"/><rect x="6" y="7" width="4" height="8" rx="1" opacity="0.6"/><rect x="11" y="3" width="4" height="12" rx="1"/></svg>,
  },
  {
    id: 'wasm',
    label: 'WASM',
    icon: <svg viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h12v12H2V2zm2 2v8h2V8l1 4h2l1-4v4h2V4h-2l-1 4-1-4H6l-1 4-1-4H4z"/></svg>,
  },
  {
    id: 'shader',
    label: 'Shader',
    icon: <svg viewBox="0 0 16 16" fill="currentColor"><path d="M5 2l-4 6 4 6h2l-4-6 4-6H5zm6 0l4 6-4 6h-2l4-6-4-6h2z"/></svg>,
  },
  {
    id: 'timeline',
    label: 'Timeline',
    icon: <svg viewBox="0 0 16 16" fill="currentColor"><path d="M1 3h14v2H1V3zm0 4h14v2H1V7zm0 4h10v2H1v-2z"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>,
  },
];

export default function Sidebar({
  activeTab,
  onTabChange,
  renderConfig,
  onRenderConfigChange,
  wasmResults,
  wasmRunning,
  onRunWasmBenchmark,
  loadedFile,
  onFileSelect,
  loading,
  onApplyShader,
  animationClip,
  onAnimationClipChange,
  isPlaying,
  animCurrentTime,
  onAnimSeek,
  onTogglePlay,
}: SidebarProps) {
  const prevTabRef = useRef(activeTab);
  const contentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  /* Sidebar 入场滑入 */
  useEffect(() => {
    if (sidebarRef.current) {
      gsap.fromTo(
        sidebarRef.current,
        { x: -40, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.35, ease: 'power2.out', delay: 0.1 },
      );
    }
  }, []);

  /* 面板切换动画 */
  useEffect(() => {
    const direction = TABS.findIndex((t) => t.id === activeTab) >
      TABS.findIndex((t) => t.id === prevTabRef.current)
      ? 'left' : 'right';
    prevTabRef.current = activeTab;

    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, x: direction === 'right' ? 12 : -12 },
        {
          opacity: 1,
          x: 0,
          duration: 0.2,
          ease: 'power2.out',
          clearProps: 'x',
        },
      );
    }
  }, [activeTab]);

  return (
    <aside className="sidebar" ref={sidebarRef}>
      <nav className="sidebar-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            title={tab.label}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-content" ref={contentRef}>
        <div className={`panel ${activeTab === 'data' ? 'active' : ''}`}>
          <DataPanel
            loadedFile={loadedFile}
            onFileSelect={onFileSelect}
            loading={loading}
          />
        </div>

        <div className={`panel ${activeTab === 'rendering' ? 'active' : ''}`}>
          <RenderingPanel
            config={renderConfig}
            onChange={onRenderConfigChange}
          />
        </div>

        <div className={`panel ${activeTab === 'clipping' ? 'active' : ''}`}>
          <ClippingPanel
            config={renderConfig.clipping}
            onChange={(clipping) =>
              onRenderConfigChange({ ...renderConfig, clipping })
            }
          />
        </div>

        <div className={`panel ${activeTab === 'lod' ? 'active' : ''}`}>
          <LODPanel
            level={renderConfig.lodLevel}
            onChange={(lodLevel) =>
              onRenderConfigChange({ ...renderConfig, lodLevel })
            }
          />
        </div>

        <div className={`panel ${activeTab === 'wasm' ? 'active' : ''}`}>
          <WasmPanel
            results={wasmResults}
            running={wasmRunning}
            onRun={onRunWasmBenchmark}
          />
        </div>

        <div className={`panel ${activeTab === 'shader' ? 'active' : ''}`}>
          <ShaderEditor onApplyShader={onApplyShader} />
        </div>

        <div className={`panel ${activeTab === 'timeline' ? 'active' : ''}`}>
          <AnimationTimeline
            clip={animationClip}
            onClipChange={onAnimationClipChange}
            isPlaying={isPlaying}
            currentTime={animCurrentTime}
            onSeek={onAnimSeek}
            onTogglePlay={onTogglePlay}
          />
        </div>
      </div>
    </aside>
  );
}
