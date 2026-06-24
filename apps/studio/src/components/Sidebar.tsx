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

const TABS: { id: SidebarTab; label: string }[] = [
  { id: 'data', label: 'Data' },
  { id: 'rendering', label: 'Render' },
  { id: 'clipping', label: 'Clip' },
  { id: 'lod', label: 'LOD' },
  { id: 'wasm', label: 'WASM' },
  { id: 'shader', label: 'Shader' },
  { id: 'timeline', label: 'Timeline' },
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
          >
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
