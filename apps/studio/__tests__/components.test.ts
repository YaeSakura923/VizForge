import { describe, it, expect } from 'vitest';

describe('App Component', () => {
  it('should import App component', async () => {
    const mod = await import('../src/components/App');
    expect(mod.default).toBeDefined();
  });
});

describe('Toolbar', () => {
  it('should import Toolbar component', async () => {
    const mod = await import('../src/components/Toolbar');
    expect(mod.default).toBeDefined();
  });
});

describe('Sidebar', () => {
  it('should import Sidebar component', async () => {
    const mod = await import('../src/components/Sidebar');
    expect(mod.default).toBeDefined();
  });
});

describe('Panels', () => {
  it('should import all panel components', async () => {
    const dataPanel = await import('../src/components/panels/DataPanel');
    const renderingPanel = await import('../src/components/panels/RenderingPanel');
    const clippingPanel = await import('../src/components/panels/ClippingPanel');
    const lodPanel = await import('../src/components/panels/LODPanel');
    const wasmPanel = await import('../src/components/panels/WasmPanel');
    expect(dataPanel.default).toBeDefined();
    expect(renderingPanel.default).toBeDefined();
    expect(clippingPanel.default).toBeDefined();
    expect(lodPanel.default).toBeDefined();
    expect(wasmPanel.default).toBeDefined();
  });
});

describe('New Components', () => {
  it('should import PipelineEditor', async () => {
    const mod = await import('../src/components/PipelineEditor');
    expect(mod.default).toBeDefined();
  });

  it('should import ShaderEditor', async () => {
    const mod = await import('../src/components/ShaderEditor');
    expect(mod.default).toBeDefined();
  });

  it('should import AnimationTimeline', async () => {
    const mod = await import('../src/components/AnimationTimeline');
    expect(mod.default).toBeDefined();
  });

  it('should import utility modules', async () => {
    const pipeline = await import('../src/utils/pipelineTemplates');
    const shader = await import('../src/utils/shaderPresets');
    const anim = await import('../src/utils/animationUtils');
    expect(pipeline.NODE_TYPES).toBeDefined();
    expect(shader.SHADER_PRESETS).toBeDefined();
    expect(anim.formatTime).toBeDefined();
  });
});
