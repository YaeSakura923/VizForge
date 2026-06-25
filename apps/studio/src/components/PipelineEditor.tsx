import React, { useState, useCallback, useRef, useEffect } from 'react';
import gsap from 'gsap';
import type { PipelineNode, PipelineConnection, PipelineState, PipelineNodeType } from '../types';
import { generateId, createDefaultNode, NODE_TYPES, PIPELINE_TEMPLATES } from '../utils/pipelineTemplates';

interface PipelineEditorProps {
  onApplyPipeline: (state: PipelineState) => void;
  onClose: () => void;
}

export default function PipelineEditor({ onApplyPipeline, onClose }: PipelineEditorProps) {
  const [state, setState] = useState<PipelineState>({
    nodes: [],
    connections: [],
    selectedNodeId: null,
  });
  const [dragNodeId, setDragNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [connectingFrom, setConnectingFrom] = useState<{
    nodeId: string;
    portId: string;
  } | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  const handleMouseDown = useCallback(
    (nodeId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setDragNodeId(nodeId);
      const node = state.nodes.find((n) => n.id === nodeId);
      if (node) {
        setDragOffset({ x: e.clientX - node.x, y: e.clientY - node.y });
      }
      setState((s) => ({ ...s, selectedNodeId: nodeId }));
    },
    [state.nodes],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (dragNodeId) {
        setState((s) => ({
          ...s,
          nodes: s.nodes.map((n) =>
            n.id === dragNodeId
              ? { ...n, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y }
              : n,
          ),
        }));
      }
    },
    [dragNodeId, dragOffset],
  );

  const handleMouseUp = useCallback(() => {
    setDragNodeId(null);
  }, []);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest('.pipeline-node')) return;
      setState((s) => ({ ...s, selectedNodeId: null }));
      if (connectingFrom) {
        setConnectingFrom(null);
      }
    },
    [connectingFrom],
  );

  const handleCanvasContext = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPos({ x: e.clientX, y: e.clientY });
    setShowMenu(true);
  }, []);

  const addNode = useCallback((type: PipelineNodeType) => {
    const rect = document.querySelector('.pipeline-editor')?.getBoundingClientRect();
    const x = menuPos.x - (rect?.left || 0) - 75;
    const y = menuPos.y - (rect?.top || 0) - 20;
    const node = createDefaultNode(type, x, y);
    setState((s) => ({ ...s, nodes: [...s.nodes, node] }));
    setShowMenu(false);

    // GSAP drop-in animation
    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-node-id="${node.id}"]`);
      if (el) {
        gsap.fromTo(
          el,
          { scale: 0.6, opacity: 0, y: y + 20 },
          { scale: 1, opacity: 1, y, duration: 0.35, ease: 'back.out(1.7)' },
        );
      }
    });
  }, [menuPos]);

  const deleteSelected = useCallback(() => {
    if (!state.selectedNodeId) return;
    setState((s) => ({
      ...s,
      nodes: s.nodes.filter((n) => n.id !== s.selectedNodeId),
      connections: s.connections.filter(
        (c) => c.sourceNodeId !== s.selectedNodeId && c.targetNodeId !== s.selectedNodeId,
      ),
      selectedNodeId: null,
    }));
  }, [state.selectedNodeId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') deleteSelected();
      if (e.key === 'Escape') { setShowMenu(false); setConnectingFrom(null); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [deleteSelected]);

  const startConnection = useCallback(
    (nodeId: string, portId: string) => {
      setConnectingFrom({ nodeId, portId });
    },
    [],
  );

  const finishConnection = useCallback(
    (nodeId: string, portId: string) => {
      if (!connectingFrom) return;
      if (connectingFrom.nodeId === nodeId) {
        setConnectingFrom(null);
        return;
      }
      const exists = state.connections.some(
        (c) =>
          c.sourceNodeId === connectingFrom.nodeId &&
          c.sourcePortId === connectingFrom.portId &&
          c.targetNodeId === nodeId &&
          c.targetPortId === portId,
      );
      if (!exists) {
        const conn: PipelineConnection = {
          id: generateId('conn'),
          sourceNodeId: connectingFrom.nodeId,
          sourcePortId: connectingFrom.portId,
          targetNodeId: nodeId,
          targetPortId: portId,
        };
        setState((s) => ({ ...s, connections: [...s.connections, conn] }));
      }
      setConnectingFrom(null);
    },
    [connectingFrom, state.connections],
  );

  const loadTemplate = useCallback((index: number) => {
    const tpl = PIPELINE_TEMPLATES[index];
    const offset = 50;
    const nodeMap = new Map<string, string>();
    const nodes = tpl.nodes.map((n, i) => {
      const node = createDefaultNode(n.type, 100 + i * 220, 120 + offset);
      nodeMap.set(`tpl-${i}`, node.id);
      return node;
    });
    setState({ nodes, connections: [], selectedNodeId: null });
  }, []);

  const portPositions = useCallback(
    (nodeId: string) => {
      const node = state.nodes.find((n) => n.id === nodeId);
      if (!node) return { inputs: [], outputs: [] };

      const el = document.querySelector(`[data-node-id="${nodeId}"]`);
      if (!el) return { inputs: [], outputs: [] };

      const editorRect = document
        .querySelector('.pipeline-editor')
        ?.getBoundingClientRect();
      const rect = el.getBoundingClientRect();

      const inputPorts = node.inputs.map((port, i) => ({
        port,
        x: rect.left - (editorRect?.left || 0),
        y: rect.top + 40 + i * 28 - (editorRect?.top || 0),
      }));

      const outputPorts = node.outputs.map((port, i) => ({
        port,
        x: rect.right - (editorRect?.left || 0),
        y: rect.top + 40 + i * 28 - (editorRect?.top || 0),
      }));

      return { inputs: inputPorts, outputs: outputPorts };
    },
    [state.nodes],
  );

  const selectedNode = state.nodes.find((n) => n.id === state.selectedNodeId);

  return (
    <div className="pipeline-editor" onContextMenu={handleCanvasContext}>
      {/* Toolbar */}
      <div className="pipeline-toolbar">
        <span className="pipeline-title">Pipeline Node Editor</span>
        <div className="pipeline-toolbar-actions">
          {PIPELINE_TEMPLATES.map((tpl, i) => (
            <button key={tpl.name} className="tb-btn" onClick={() => loadTemplate(i)}>
              {tpl.name}
            </button>
          ))}
          <button
            className="tb-btn"
            onClick={() => setState({ nodes: [], connections: [], selectedNodeId: null })}
          >
            Clear
          </button>
          <button
            className="tb-btn tb-btn-primary"
            onClick={() => { onApplyPipeline(state); onClose(); }}
          >
            Apply Pipeline
          </button>
          <button className="tb-btn tb-btn-close" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {/* Right-click context menu */}
      {showMenu && (
        <div
          className="pipeline-context-menu"
          style={{ left: menuPos.x, top: menuPos.y }}
        >
          <div className="context-menu-title">Add Node</div>
          {NODE_TYPES.map((nt) => (
            <button
              key={nt.type}
              className="context-menu-item"
              onClick={() => addNode(nt.type)}
            >
              <span className="context-dot" style={{ background: nt.color }} />
              {nt.label}
            </button>
          ))}
          <div className="context-menu-divider" />
          <button className="context-menu-item" onClick={() => setShowMenu(false)}>
            Cancel
          </button>
        </div>
      )}

      {/* SVG connections layer */}
      <svg className="pipeline-svg" ref={svgRef}>
        <defs>
          <linearGradient id="connection-gradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4fc3f7" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#7c4dff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#4fc3f7" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {state.connections.map((conn) => {
          const sourceNode = state.nodes.find((n) => n.id === conn.sourceNodeId);
          const targetNode = state.nodes.find((n) => n.id === conn.targetNodeId);
          if (!sourceNode || !targetNode) return null;

          const sp = portPositions(sourceNode.id);
          const tp = portPositions(targetNode.id);
          const src = sp.outputs[0];
          const tgt = tp.inputs[0];
          if (!src || !tgt) return null;

          const midX = (src.x + tgt.x) / 2;
          return (
            <path
              key={conn.id}
              d={`M ${src.x} ${src.y} C ${midX} ${src.y}, ${midX} ${tgt.y}, ${tgt.x} ${tgt.y}`}
              className="pipeline-connection"
              strokeWidth={2}
              fill="none"
            />
          );
        })}

        {/* In-progress connection line */}
        {connectingFrom && (() => {
          const node = state.nodes.find((n) => n.id === connectingFrom.nodeId);
          if (!node) return null;
          const pp = portPositions(node.id);
          const allPorts = [...pp.inputs, ...pp.outputs];
          const portPos = allPorts.find((p) => p.port.id === connectingFrom.portId);
          if (!portPos) return null;
          return (
            <line
              x1={portPos.x}
              y1={portPos.y}
              x2={portPos.x + 100}
              y2={portPos.y}
              className="pipeline-connection-dragging"
              strokeWidth={2}
              strokeDasharray="6 3"
            />
          );
        })()}
      </svg>

      {/* Nodes */}
      <div className="pipeline-nodes" onMouseUp={handleMouseUp}>
        {state.nodes.map((node) => {
          const pp = portPositions(node.id);
          return (
            <div
              key={node.id}
              data-node-id={node.id}
              className={`pipeline-node ${state.selectedNodeId === node.id ? 'selected' : ''}`}
              style={{ left: node.x, top: node.y }}
              onMouseDown={(e) => handleMouseDown(node.id, e)}
            >
              <div className="pipeline-node-header" style={{ background: node.color }}>
                <span className="pipeline-node-type">{node.label}</span>
              </div>
              <div className="pipeline-node-body">
                {node.inputs.map((port) => (
                  <div
                    key={port.id}
                    className={`pipeline-port pipeline-port-input ${connectingFrom ? 'connectable' : ''}`}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      if (connectingFrom) finishConnection(node.id, port.id);
                    }}
                  >
                    <span className="port-dot" />
                    <span className="port-label">{port.label}</span>
                  </div>
                ))}
                {node.outputs.map((port) => (
                  <div
                    key={port.id}
                    className="pipeline-port pipeline-port-output"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      startConnection(node.id, port.id);
                    }}
                  >
                    <span className="port-label">{port.label}</span>
                    <span className="port-dot" />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Properties panel */}
      {selectedNode && (
        <div className="pipeline-properties">
          <div className="panel-title">Node Properties</div>
          <div className="control-group">
            <label className="control-label">Type</label>
            <div className="control-value">{selectedNode.type}</div>
          </div>
          <div className="control-group">
            <label className="control-label">
              Config
              <button
                className="tb-btn"
                style={{ padding: '2px 8px', fontSize: 11 }}
                onClick={deleteSelected}
              >
                Delete
              </button>
            </label>
            <pre className="pipeline-json">
              {JSON.stringify(selectedNode.config, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {state.nodes.length === 0 && (
        <div className="pipeline-empty">
          <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="1.2">
            {/* Background grid dots */}
            <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="0.5" opacity="0.3" />
            </pattern>
            <rect width="80" height="80" fill="url(#grid)" opacity="0.3" />

            {/* Pipeline nodes */}
            <rect x="8" y="18" width="20" height="14" rx="4" strokeWidth="1.5" opacity="0.5" />
            <rect x="52" y="18" width="20" height="14" rx="4" strokeWidth="1.5" opacity="0.5" />
            <rect x="30" y="48" width="20" height="14" rx="4" strokeWidth="1.5" opacity="0.7" />

            {/* Connections */}
            <path d="M28 25h24" strokeDasharray="4 3" opacity="0.4" />
            <path d="M30 48c0-5 10-8 10-16" strokeDasharray="4 3" opacity="0.4" />
            <path d="M50 48c0-5-10-8-10-16" strokeDasharray="4 3" opacity="0.4" />

            {/* Port dots */}
            <circle cx="18" cy="25" r="2" fill="currentColor" opacity="0.4" />
            <circle cx="62" cy="25" r="2" fill="currentColor" opacity="0.4" />
            <circle cx="40" cy="55" r="2.5" fill="currentColor" opacity="0.6" />
          </svg>
          <h3>Pipeline Node Editor</h3>
          <p>Right-click on the canvas to add nodes, then connect them to build your visualization pipeline.</p>
          <div className="pipeline-templates">
            {PIPELINE_TEMPLATES.map((tpl, i) => (
              <button key={tpl.name} className="tb-btn" onClick={() => loadTemplate(i)}>
                {tpl.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
