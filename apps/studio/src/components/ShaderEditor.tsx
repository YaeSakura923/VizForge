import React, { useState, useCallback } from 'react';
import type { ShaderPreset, ShaderCompileResult } from '../types';
import { SHADER_PRESETS } from '../utils/shaderPresets';

interface ShaderEditorProps {
  onApplyShader: (code: string, name: string) => void;
}

export default function ShaderEditor({ onApplyShader }: ShaderEditorProps) {
  const [code, setCode] = useState(SHADER_PRESETS[0].code);
  const [activePreset, setActivePreset] = useState(0);
  const [compileResult, setCompileResult] = useState<ShaderCompileResult | null>(null);
  const [shaderName, setShaderName] = useState('Custom Shader');

  const handlePresetSelect = useCallback((index: number) => {
    const preset = SHADER_PRESETS[index];
    setActivePreset(index);
    setCode(preset.code);
    setShaderName(preset.name);
    setCompileResult(null);
  }, []);

  const handleCompile = useCallback(() => {
    // Client-side validation: check basic GLSL syntax
    const hasMain = code.includes('void main');
    const hasGlFragColor = code.includes('gl_FragColor');
    const lines = code.split('\n').filter((l) => l.trim().length > 0);

    if (!hasMain) {
      setCompileResult({ success: false, error: 'Error: missing void main() function' });
      return;
    }
    if (code.includes('fragment') && !hasGlFragColor) {
      setCompileResult({
        success: false,
        error: 'Warning: fragment shader should set gl_FragColor',
      });
      return;
    }

    setCompileResult({ success: true, error: null });
    onApplyShader(code, shaderName);
  }, [code, shaderName, onApplyShader]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Tab inserts spaces
      if (e.key === 'Tab') {
        e.preventDefault();
        const ta = e.currentTarget as HTMLTextAreaElement;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const newCode = code.substring(0, start) + '    ' + code.substring(end);
        setCode(newCode);
        setTimeout(() => {
          ta.selectionStart = ta.selectionEnd = start + 4;
        }, 0);
      }
    },
    [code],
  );

  return (
    <div className="shader-editor">
      {/* Preset selector */}
      <div className="panel-section">
        <div className="panel-title">Shader Presets</div>
        <div className="shader-preset-list">
          {SHADER_PRESETS.map((preset, i) => (
            <button
              key={preset.name}
              className={`shader-preset-btn ${i === activePreset ? 'active' : ''}`}
              onClick={() => handlePresetSelect(i)}
              title={preset.description}
            >
              <span className="shader-preset-name">{preset.name}</span>
              <span className={`shader-preset-badge ${preset.type}`}>{preset.type}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Code editor */}
      <div className="panel-section">
        <div className="panel-title">GLSL Code</div>
        <div className="shader-editor-container">
          <div className="shader-lines">
            {code.split('\n').map((_, i) => (
              <div key={i} className="shader-line-num">{i + 1}</div>
            ))}
          </div>
          <textarea
            className="shader-textarea"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setCompileResult(null);
            }}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            wrap="off"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="panel-section">
        <div className="shader-actions">
          <button
            className={`tb-btn shader-btn-apply ${compileResult?.success ? 'applied' : ''}`}
            onClick={handleCompile}
          >
            {compileResult?.success ? 'Applied' : 'Compile & Apply'}
          </button>
          <button className="tb-btn" onClick={() => setCode(SHADER_PRESETS[activePreset].code)}>
            Reset
          </button>
        </div>

        {/* Compile result */}
        {compileResult && (
          <div className={`shader-result ${compileResult.success ? 'success' : 'error'}`}>
            {compileResult.success ? 'Shader compiled successfully' : compileResult.error}
          </div>
        )}
      </div>
    </div>
  );
}
