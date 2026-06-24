import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { AnimationClip, AnimationTrack, Keyframe } from '../types';
import {
  getTrackValueAtTime,
  formatTime,
  snapToGrid,
  createDefaultClip,
  createDefaultTrack,
} from '../utils/animationUtils';

interface AnimationTimelineProps {
  clip: AnimationClip;
  onClipChange: (clip: AnimationClip) => void;
  isPlaying: boolean;
  currentTime: number;
  onSeek: (time: number) => void;
  onTogglePlay: () => void;
}

const TRACK_COLORS = ['#4fc3f7', '#66bb6a', '#ffa726', '#7c4dff', '#ef5350', '#00e5ff'];
const GRID_SIZE = 0.25; // seconds
const PIXELS_PER_SECOND = 60;

export default function AnimationTimeline({
  clip,
  onClipChange,
  isPlaying,
  currentTime,
  onSeek,
  onTogglePlay,
}: AnimationTimelineProps) {
  const [draggingKf, setDraggingKf] = useState<string | null>(null);
  const [selectedKfId, setSelectedKfId] = useState<string | null>(null);
  const [addTrackName, setAddTrackName] = useState('');
  const timelineRef = useRef<HTMLDivElement>(null);

  const totalWidth = clip.duration * PIXELS_PER_SECOND;
  const rulerTicks = [];
  for (let t = 0; t <= clip.duration; t += 1) {
    rulerTicks.push(t);
  }

  const handleTimelineClick = useCallback(
    (e: React.MouseEvent) => {
      if (draggingKf) return;
      const rect = timelineRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const time = snapToGrid(x / PIXELS_PER_SECOND, GRID_SIZE);
      onSeek(Math.max(0, Math.min(time, clip.duration)));
    },
    [clip.duration, draggingKf, onSeek],
  );

  const handleKeyframeMouseDown = useCallback(
    (kfId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedKfId(kfId);
      setDraggingKf(kfId);
    },
    [],
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!draggingKf) return;
      const rect = timelineRef.current?.getBoundingClientRect();
      if (!rect) return;
      const x = e.clientX - rect.left;
      const time = snapToGrid(Math.max(0, Math.min(x / PIXELS_PER_SECOND, clip.duration)), GRID_SIZE);

      onClipChange({
        ...clip,
        tracks: clip.tracks.map((track) => ({
          ...track,
          keyframes: track.keyframes.map((kf) =>
            kf.id === draggingKf ? { ...kf, time } : kf,
          ),
        })),
      });
    },
    [draggingKf, clip, onClipChange],
  );

  const handleMouseUp = useCallback(() => {
    setDraggingKf(null);
  }, []);

  const handleAddTrack = useCallback(() => {
    if (!addTrackName.trim()) return;
    const color = TRACK_COLORS[clip.tracks.length % TRACK_COLORS.length];
    const newTrack = createDefaultTrack(addTrackName.trim(), addTrackName.trim(), color);
    onClipChange({
      ...clip,
      duration: Math.max(clip.duration, 5),
      tracks: [...clip.tracks, newTrack],
    });
    setAddTrackName('');
  }, [addTrackName, clip, onClipChange]);

  const handleAddKeyframe = useCallback(
    (trackId: string) => {
      const track = clip.tracks.find((t) => t.id === trackId);
      if (!track) return;
      const existing = track.keyframes.find(
        (kf) => Math.abs(kf.time - currentTime) < 0.1,
      );
      if (existing) return;

      const value = track.keyframes.length > 0
        ? getTrackValueAtTime(track.keyframes, currentTime)
        : 0.5;

      const newKf: Keyframe = {
        id: `kf-${Date.now()}`,
        time: currentTime,
        value,
        easing: 'linear',
      };

      onClipChange({
        ...clip,
        tracks: clip.tracks.map((t) =>
          t.id === trackId ? { ...t, keyframes: [...t.keyframes, newKf] } : t,
        ),
      });
    },
    [clip, currentTime, onClipChange],
  );

  const handleDeleteKeyframe = useCallback(() => {
    if (!selectedKfId) return;
    onClipChange({
      ...clip,
      tracks: clip.tracks.map((track) => ({
        ...track,
        keyframes: track.keyframes.filter((kf) => kf.id !== selectedKfId),
      })),
    });
    setSelectedKfId(null);
  }, [clip, selectedKfId, onClipChange]);

  const handleEasingChange = useCallback(
    (kfId: string, easing: Keyframe['easing']) => {
      onClipChange({
        ...clip,
        tracks: clip.tracks.map((track) => ({
          ...track,
          keyframes: track.keyframes.map((kf) =>
            kf.id === kfId ? { ...kf, easing } : kf,
          ),
        })),
      });
    },
    [clip, onClipChange],
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedKfId) {
        handleDeleteKeyframe();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedKfId, handleDeleteKeyframe]);

  const selectedKf = clip.tracks
    .flatMap((t) => t.keyframes)
    .find((kf) => kf.id === selectedKfId);

  return (
    <div className="animation-timeline" onMouseUp={handleMouseUp} onMouseMove={handleMouseMove}>
      {/* Controls */}
      <div className="timeline-controls">
        <div className="timeline-transport">
          <button className="tb-btn tb-btn-icon" onClick={onTogglePlay} title={isPlaying ? 'Pause' : 'Play'}>
            {isPlaying ? (
              <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
                <rect x="3" y="2" width="4" height="12" rx="1" />
                <rect x="9" y="2" width="4" height="12" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
                <path d="M4 2l10 6-10 6V2z" />
              </svg>
            )}
          </button>
          <button className="tb-btn tb-btn-icon" onClick={() => onSeek(0)} title="Go to Start">
            <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
              <path d="M2 2h2v12H2V2zm4 6l8-6v12L6 8z" />
            </svg>
          </button>
          <span className="timeline-time">{formatTime(currentTime)} / {formatTime(clip.duration)}</span>
        </div>

        <div className="timeline-property-controls">
          <input
            type="text"
            className="timeline-input"
            placeholder="Track name..."
            value={addTrackName}
            onChange={(e) => setAddTrackName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddTrack()}
          />
          <button className="tb-btn" onClick={handleAddTrack} disabled={!addTrackName.trim()}>
            + Track
          </button>
          <span
            className={`tb-btn ${clip.loop ? 'active' : ''}`}
            onClick={() => onClipChange({ ...clip, loop: !clip.loop })}
            style={{ cursor: 'pointer', padding: '4px 8px', fontSize: 11 }}
          >
            Loop
          </span>
        </div>
      </div>

      {/* Ruler */}
      <div className="timeline-ruler" style={{ width: totalWidth }}>
        {rulerTicks.map((t) => (
          <div key={t} className="timeline-ruler-tick" style={{ left: t * PIXELS_PER_SECOND }}>
            <span className="timeline-ruler-label">{formatTime(t)}</span>
          </div>
        ))}
      </div>

      {/* Tracks */}
      <div className="timeline-tracks" ref={timelineRef} onClick={handleTimelineClick}>
        {clip.tracks.length === 0 && (
          <div className="timeline-empty">
            <p>No animation tracks yet. Add a track to get started.</p>
          </div>
        )}

        {clip.tracks.map((track) => (
          <div key={track.id} className="timeline-track-row" onDoubleClick={() => handleAddKeyframe(track.id)}>
            <div className="timeline-track-label">
              <span className="track-color-dot" style={{ background: track.color }} />
              <span className="track-name">{track.name}</span>
              <button
                className="track-add-kf"
                onClick={() => handleAddKeyframe(track.id)}
                title="Add keyframe"
              >
                +
              </button>
            </div>
            <div className="timeline-track-lane" style={{ width: totalWidth }}>
              {/* Value curve */}
              {track.keyframes.length > 1 && (
                <svg className="timeline-curve" width={totalWidth} height="100%">
                  {track.keyframes
                    .sort((a, b) => a.time - b.time)
                    .map((kf, i, arr) => {
                      if (i === arr.length - 1) return null;
                      const next = arr[i + 1];
                      const x1 = kf.time * PIXELS_PER_SECOND;
                      const y1 = 30 - kf.value * 24;
                      const x2 = next.time * PIXELS_PER_SECOND;
                      const y2 = 30 - next.value * 24;
                      return (
                        <line
                          key={kf.id}
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={track.color}
                          strokeWidth={1.5}
                          opacity={0.5}
                        />
                      );
                    })}
                </svg>
              )}

              {/* Keyframe handles */}
              {track.keyframes.map((kf) => (
                <div
                  key={kf.id}
                  className={`timeline-keyframe ${selectedKfId === kf.id ? 'selected' : ''} ${draggingKf === kf.id ? 'dragging' : ''}`}
                  style={{
                    left: kf.time * PIXELS_PER_SECOND - 6,
                    top: 30 - kf.value * 24 - 6,
                  }}
                  onMouseDown={(e) => handleKeyframeMouseDown(kf.id, e)}
                  title={`t=${kf.time.toFixed(2)}s, v=${kf.value.toFixed(2)}, ease=${kf.easing}`}
                >
                  <div className="kf-dot" style={{ background: track.color }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Playhead */}
      <div
        className="timeline-playhead"
        style={{
          left: currentTime * PIXELS_PER_SECOND,
          height: `${36 + clip.tracks.length * 48}px`,
        }}
      />

      {/* Selected keyframe properties */}
      {selectedKf && (
        <div className="timeline-properties">
          <div className="panel-title">Keyframe Properties</div>
          <div className="control-group">
            <label className="control-label">Time: {selectedKf.time.toFixed(2)}s</label>
          </div>
          <div className="control-group">
            <label className="control-label">Value: {selectedKf.value.toFixed(3)}</label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={selectedKf.value}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onClipChange({
                  ...clip,
                  tracks: clip.tracks.map((t) => ({
                    ...t,
                    keyframes: t.keyframes.map((k) =>
                      k.id === selectedKf.id ? { ...k, value: val } : k,
                    ),
                  })),
                });
              }}
            />
          </div>
          <div className="control-group">
            <label className="control-label">Easing</label>
            <select
              value={selectedKf.easing}
              onChange={(e) =>
                handleEasingChange(selectedKf.id, e.target.value as Keyframe['easing'])
              }
            >
              <option value="linear">Linear</option>
              <option value="cubic">Cubic</option>
              <option value="ease-in">Ease In</option>
              <option value="ease-out">Ease Out</option>
              <option value="bounce">Bounce</option>
            </select>
          </div>
          <button className="tb-btn" onClick={handleDeleteKeyframe} style={{ color: 'var(--text-danger)' }}>
            Delete Keyframe
          </button>
        </div>
      )}
    </div>
  );
}
