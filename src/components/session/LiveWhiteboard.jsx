import React, { useRef, useEffect, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import {
  Pen, Eraser, Trash2, RotateCcw, Palette, Check, Radio
} from 'lucide-react';

const COLORS = [
  { label: 'Dark', value: '#0f172a' },
  { label: 'Teal', value: '#0d9488' },
  { label: 'Blue', value: '#2563eb' },
  { label: 'Purple', value: '#9333ea' },
  { label: 'Rose', value: '#e11d48' },
  { label: 'Amber', value: '#d97706' },
];

const STROKE_WIDTHS = [
  { label: 'Fine', value: 2 },
  { label: 'Medium', value: 4 },
  { label: 'Thick', value: 8 },
];

export const LiveWhiteboard = forwardRef(({
  initialStrokes = [],
  onSendStroke,
  onClearBoard,
  currentUserId,
  disabled = false,
  peerName = 'Peer'
}, ref) => {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);

  const [tool, setTool] = useState('pen'); // 'pen' | 'eraser'
  const [color, setColor] = useState('#0d9488');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('synced'); // 'synced' | 'syncing' | 'error'

  const isDrawingRef = useRef(false);
  const strokesRef = useRef([]);
  const currentStrokeRef = useRef(null);
  const knownStrokeIdsRef = useRef(new Set());
  const canvasDimensionsRef = useRef({ width: 800, height: 450 });

  // Render a single stroke incrementally onto the canvas
  const drawSingleStroke = useCallback((ctx, stroke, canvasWidth, canvasHeight) => {
    if (!stroke || !stroke.points || stroke.points.length < 2) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const scale = canvasWidth / 800;
    ctx.lineWidth = Math.max(1, (stroke.width || 2) * scale);

    if (stroke.tool === 'eraser') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(6, (stroke.width || 4) * scale * 2.5);
    } else {
      ctx.strokeStyle = stroke.color || '#0f172a';
    }

    ctx.beginPath();
    const firstPoint = stroke.points[0];
    ctx.moveTo(firstPoint.x * canvasWidth, firstPoint.y * canvasHeight);

    for (let i = 1; i < stroke.points.length; i++) {
      const pt = stroke.points[i];
      ctx.lineTo(pt.x * canvasWidth, pt.y * canvasHeight);
    }
    ctx.stroke();
    ctx.restore();
  }, []);

  // Redraw all stored strokes (used after resize or initial load)
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvasDimensionsRef.current;

    // Fill clean white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Subtle grid dots for comfortable whiteboard graphing/writing
    ctx.fillStyle = '#f1f5f9';
    const dotSpacing = 24;
    for (let x = dotSpacing; x < width; x += dotSpacing) {
      for (let y = dotSpacing; y < height; y += dotSpacing) {
        ctx.fillRect(x, y, 1.5, 1.5);
      }
    }

    // Draw all completed strokes
    for (const stroke of strokesRef.current) {
      drawSingleStroke(ctx, stroke, width, height);
    }

    // Draw current active stroke if in progress
    if (currentStrokeRef.current) {
      drawSingleStroke(ctx, currentStrokeRef.current, width, height);
    }
  }, [drawSingleStroke]);

  // Adjust canvas resolution for DPR and container dimensions
  const updateCanvasDimensions = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height) || 380;

    if (width <= 0 || height <= 0) return;

    canvasDimensionsRef.current = { width, height };

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }

    redrawCanvas();
  }, [redrawCanvas]);

  // Initialize and handle window/container resizing
  useEffect(() => {
    updateCanvasDimensions();

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasDimensions();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateCanvasDimensions);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateCanvasDimensions);
    };
  }, [updateCanvasDimensions]);

  // Load initial strokes when joining
  useEffect(() => {
    if (Array.isArray(initialStrokes) && initialStrokes.length > 0) {
      strokesRef.current = [];
      knownStrokeIdsRef.current.clear();
      for (const s of initialStrokes) {
        if (s && s.strokeId) {
          knownStrokeIdsRef.current.add(s.strokeId);
          strokesRef.current.push(s);
        }
      }
      redrawCanvas();
    }
  }, [initialStrokes, redrawCanvas]);

  // Exposed methods for parent component to push remote changes
  useImperativeHandle(ref, () => ({
    addRemoteStroke: (stroke) => {
      if (!stroke || !stroke.strokeId) return;
      if (knownStrokeIdsRef.current.has(stroke.strokeId)) return; // Prevent duplicate strokes

      knownStrokeIdsRef.current.add(stroke.strokeId);
      strokesRef.current.push(stroke);

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const { width, height } = canvasDimensionsRef.current;
          drawSingleStroke(ctx, stroke, width, height);
        }
      }
    },

    clearCanvas: () => {
      strokesRef.current = [];
      knownStrokeIdsRef.current.clear();
      currentStrokeRef.current = null;
      redrawCanvas();
    },

    setSyncStatus: (status) => {
      setSyncStatus(status);
    }
  }), [drawSingleStroke, redrawCanvas]);

  // Normalize pointer coordinates to 0.0 - 1.0 ratio
  const getNormalizedPoint = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
    return { x, y };
  };

  const handlePointerDown = (e) => {
    if (disabled) return;
    try {
      e.target.setPointerCapture(e.pointerId);
    } catch (_err) {
      // Non-fatal
    }

    const pt = getNormalizedPoint(e);
    const strokeId = `${currentUserId || 'usr'}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newStroke = {
      strokeId,
      userId: currentUserId,
      tool,
      color: tool === 'eraser' ? '#ffffff' : color,
      width: strokeWidth,
      points: [pt]
    };

    currentStrokeRef.current = newStroke;
    isDrawingRef.current = true;
    setIsDrawing(true);

    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const { width, height } = canvasDimensionsRef.current;
        drawSingleStroke(ctx, newStroke, width, height);
      }
    }
  };

  const handlePointerMove = (e) => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return;
    const pt = getNormalizedPoint(e);
    const pts = currentStrokeRef.current.points;
    const lastPt = pts[pts.length - 1];

    // Minimal distance filter to optimize points array and performance
    const dx = pt.x - lastPt.x;
    const dy = pt.y - lastPt.y;
    if (dx * dx + dy * dy < 0.000005) return;

    pts.push(pt);

    // Incremental draw of latest segment
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const { width, height } = canvasDimensionsRef.current;
        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        const scale = width / 800;
        ctx.lineWidth = Math.max(1, (currentStrokeRef.current.width || 2) * scale);

        if (currentStrokeRef.current.tool === 'eraser') {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = Math.max(6, (currentStrokeRef.current.width || 4) * scale * 2.5);
        } else {
          ctx.strokeStyle = currentStrokeRef.current.color;
        }

        ctx.beginPath();
        ctx.moveTo(lastPt.x * width, lastPt.y * height);
        ctx.lineTo(pt.x * width, pt.y * height);
        ctx.stroke();
        ctx.restore();
      }
    }
  };

  const handlePointerUp = (e) => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return;
    isDrawingRef.current = false;
    setIsDrawing(false);

    try {
      e.target.releasePointerCapture(e.pointerId);
    } catch (_err) {
      // Non-fatal
    }

    const finishedStroke = currentStrokeRef.current;
    currentStrokeRef.current = null;

    if (finishedStroke.points.length === 1) {
      // Clicked a single point: duplicate with tiny offset to make a visible dot
      finishedStroke.points.push({
        x: finishedStroke.points[0].x + 0.0005,
        y: finishedStroke.points[0].y + 0.0005
      });
    }

    if (finishedStroke.points.length > 1) {
      knownStrokeIdsRef.current.add(finishedStroke.strokeId);
      strokesRef.current.push(finishedStroke);

      // Notify parent to propagate incrementally via WebRTC DataChannel & Server API
      if (onSendStroke) {
        onSendStroke(finishedStroke);
      }
    }
  };

  const handleClear = () => {
    if (disabled) return;
    if (strokesRef.current.length === 0) return;

    if (window.confirm('Clear whiteboard for both participants?')) {
      strokesRef.current = [];
      knownStrokeIdsRef.current.clear();
      currentStrokeRef.current = null;
      redrawCanvas();
      if (onClearBoard) {
        onClearBoard();
      }
    }
  };

  const handleUndo = () => {
    if (disabled) return;
    // Find last stroke created by current user
    let lastIdx = -1;
    for (let i = strokesRef.current.length - 1; i >= 0; i--) {
      if (strokesRef.current[i].userId === currentUserId) {
        lastIdx = i;
        break;
      }
    }
    if (lastIdx !== -1) {
      const removed = strokesRef.current.splice(lastIdx, 1)[0];
      knownStrokeIdsRef.current.delete(removed.strokeId);
      redrawCanvas();
      // Notify parent if needed
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-soft overflow-hidden">
      {/* Top Whiteboard Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 px-3 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Tool Selector */}
          <div className="flex items-center bg-white dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
            <button
              type="button"
              onClick={() => setTool('pen')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                tool === 'pen'
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Pen className="w-3.5 h-3.5" />
              <span>Pen</span>
            </button>
            <button
              type="button"
              onClick={() => setTool('eraser')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                tool === 'eraser'
                  ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Eraser className="w-3.5 h-3.5" />
              <span>Eraser</span>
            </button>
          </div>

          {/* Color Palette (only active when pen is selected) */}
          {tool === 'pen' && (
            <div className="flex items-center gap-1 px-1.5 py-1 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={`w-5 h-5 rounded-full transition-transform flex items-center justify-center ${
                    color === c.value ? 'scale-110 ring-2 ring-teal-500 ring-offset-1' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c.value }}
                  title={c.label}
                >
                  {color === c.value && <Check className="w-2.5 h-2.5 text-white" />}
                </button>
              ))}
            </div>
          )}

          {/* Line Thickness */}
          <div className="flex items-center bg-white dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs">
            {STROKE_WIDTHS.map((sw) => (
              <button
                key={sw.value}
                type="button"
                onClick={() => setStrokeWidth(sw.value)}
                className={`px-2 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                  strokeWidth === sw.value
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
                }`}
              >
                {sw.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right Toolbar Actions & Live Indicator */}
        <div className="flex items-center gap-1.5">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Real-time Sync Active</span>
          </div>

          <button
            type="button"
            onClick={handleUndo}
            disabled={disabled || strokesRef.current.length === 0}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
            title="Undo your last stroke"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handleClear}
            disabled={disabled || strokesRef.current.length === 0}
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 text-xs font-semibold hover:bg-rose-100/60 disabled:opacity-40 transition-colors"
            title="Clear whiteboard"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Interactive Drawing Canvas */}
      <div
        ref={containerRef}
        className="relative flex-1 min-h-[380px] w-full bg-white cursor-crosshair overflow-hidden touch-none select-none"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="absolute inset-0 block w-full h-full"
        />

        {/* Small watermark banner */}
        <div className="absolute bottom-2 right-3 pointer-events-none text-[10px] text-slate-400/80 font-medium">
          Collaborative Canvas with {peerName}
        </div>
      </div>
    </div>
  );
});

LiveWhiteboard.displayName = 'LiveWhiteboard';
export default LiveWhiteboard;
