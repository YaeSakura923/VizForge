import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { WasmBenchResult } from '../../types';

interface WasmPanelProps {
  results: WasmBenchResult[];
  running: boolean;
  onRun: () => void;
}

function ResultCard({ result, index }: { result: WasmBenchResult; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isWasm = result.label.startsWith('WASM');

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 12, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.3,
          delay: index * 0.08,
          ease: 'power2.out',
        },
      );
    }
  }, [index]);

  return (
    <div ref={cardRef} className={`wasm-card ${isWasm ? 'wasm' : 'js'}`}>
      <div className="label">{result.algorithm}</div>
      <div className="time">{result.executionTimeMs.toFixed(1)}</div>
      <div className="unit">ms ({isWasm ? 'WASM' : 'JS'})</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
        {result.dataSize.toLocaleString()} samples
      </div>
    </div>
  );
}

export default function WasmPanel({ results, running, onRun }: WasmPanelProps) {
  const btnRef = useRef<HTMLButtonElement>(null);

  /* 按钮点击反馈 */
  const handleRun = () => {
    if (btnRef.current) {
      gsap.fromTo(
        btnRef.current,
        { scale: 0.95 },
        { scale: 1, duration: 0.2, ease: 'back.out(2)' },
      );
    }
    onRun();
  };

  const grouped = results.reduce<Record<string, WasmBenchResult[]>>((acc, r) => {
    const key = r.algorithm;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  const speedups: { algorithm: string; ratio: number }[] = [];
  for (const [algo, items] of Object.entries(grouped)) {
    if (items.length >= 2) {
      const jsTime = items.find((i) => i.label.includes('JS'))?.executionTimeMs ?? 0;
      const wasmTime = items.find((i) => i.label.includes('WASM'))?.executionTimeMs ?? 0;
      if (wasmTime > 0) {
        speedups.push({ algorithm: algo, ratio: Math.round((jsTime / wasmTime) * 10) / 10 });
      }
    }
  }

  return (
    <div>
      <div className="panel-section">
        <div className="panel-title">WASM Performance Benchmark</div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.6 }}>
          Compare pure JavaScript vs. WebAssembly performance for common visualization algorithms.
          WASM modules are compiled from C++ via Emscripten.
        </p>
        <button
          ref={btnRef}
          className="tb-btn"
          onClick={handleRun}
          disabled={running}
          style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
        >
          {running ? (
            <>
              <div className="spinner" style={{ width: 14, height: 14, margin: 0 }} />
              Running Benchmark...
            </>
          ) : (
            <>Run Full Benchmark</>
          )}
        </button>
      </div>

      {speedups.length > 0 && (
        <div className="panel-section">
          <div className="panel-title">Results Summary</div>
          {speedups.map((s) => (
            <div key={s.algorithm} className="lod-indicator" style={{ marginBottom: 8 }}>
              <span style={{ flex: 1 }}>{s.algorithm}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-success)' }}>
                {s.ratio}x faster
              </span>
            </div>
          ))}
        </div>
      )}

      {Object.entries(grouped).map(([algo, items]) => (
        <div key={algo} className="panel-section">
          <div className="panel-title">{algo}</div>
          <div className="wasm-comparison">
            {items.map((item, i) => (
              <ResultCard key={i} result={item} index={i} />
            ))}
          </div>
        </div>
      ))}

      <div className="panel-section">
        <div className="panel-title">How It Works</div>
        <ul style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.8, paddingLeft: 16 }}>
          <li>C++ filters compiled to WASM via Emscripten</li>
          <li>JS bridge transfers data via shared memory</li>
          <li>WASM excels at CPU-intensive math operations</li>
          <li>Marching Cubes benefits from SIMD instructions</li>
          <li>Gaussian blur shows linear algebra speedup</li>
        </ul>
      </div>
    </div>
  );
}
