import React, { useCallback, useRef } from 'react';
import type { DataFileInfo } from '../../types';
import { SAMPLE_DATA, formatFileSize, getFileIcon } from '../../utils/sampleData';

interface DataPanelProps {
  loadedFile: DataFileInfo | null;
  onFileSelect: (file: DataFileInfo) => void;
  loading: boolean;
}

export default function DataPanel({ loadedFile, onFileSelect, loading }: DataPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        const file = files[0];
        const ext = file.name.split('.').pop()?.toLowerCase() as DataFileInfo['type'];
        onFileSelect({
          name: file.name,
          path: URL.createObjectURL(file),
          size: file.size,
          type: ext || 'vtk',
        });
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const ext = file.name.split('.').pop()?.toLowerCase() as DataFileInfo['type'];
        onFileSelect({
          name: file.name,
          path: URL.createObjectURL(file),
          size: file.size,
          type: ext || 'vtk',
        });
      }
    },
    [onFileSelect]
  );

  return (
    <div>
      <div className="panel-section">
        <div className="panel-title">Load Data</div>
        <div
          className={`upload-zone ${dragging ? 'dragging' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <p>Drop VTK files here or click to browse</p>
          <span className="hint">Supports: .vtp .vti .vtk .obj .stl .ply</span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".vtp,.vti,.vtk,.obj,.stl,.ply"
          style={{ display: 'none' }}
          onChange={handleFileInput}
        />
      </div>

      <div className="panel-section">
        <div className="panel-title">Sample Datasets</div>
        {loading && (
          <div style={{ textAlign: 'center', padding: '12px' }}>
            <div className="spinner" />
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Loading...</p>
          </div>
        )}
        <ul className="file-list">
          {SAMPLE_DATA.map((file) => (
            <li
              key={file.name}
              className={`file-item ${loadedFile?.name === file.name ? 'active' : ''}`}
              onClick={() => onFileSelect(file)}
            >
              <span className="name">
                <span>{getFileIcon(file.type)}</span>
                <span>{file.name}</span>
              </span>
              <span className="size">{formatFileSize(file.size)}</span>
            </li>
          ))}
        </ul>
      </div>

      {loadedFile && (
        <div className="panel-section">
          <div className="panel-title">Active File</div>
          <div
            className="file-item active"
            style={{ cursor: 'default', background: 'rgba(79,195,247,0.08)' }}
          >
            <span className="name">
              <span>{getFileIcon(loadedFile.type)}</span>
              <span>{loadedFile.name}</span>
            </span>
            <span className="size">{formatFileSize(loadedFile.size)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
