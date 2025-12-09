"use client";

import { useCallback, useRef, useState } from "react";

import { useReactFlow } from "@xyflow/react";

type FrameOverlayProps = {
  onFrameComplete: (position: { x: number; y: number }, size: { width: number; height: number }) => void;
  onCancel: () => void;
};

/**
 * Overlay component for creating frames by clicking and dragging.
 * Similar to FreehandOverlay but for rectangular frame selection.
 */
export function FrameOverlay({ onFrameComplete, onCancel }: FrameOverlayProps) {
  const { screenToFlowPosition } = useReactFlow();
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLDivElement).setPointerCapture(e.pointerId);
    const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    setStartPos(flowPos);
    setCurrentPos(flowPos);
    isDraggingRef.current = true;
  }, [screenToFlowPosition]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || !startPos) return;
    if (e.buttons !== 1) return;
    const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
    setCurrentPos(flowPos);
  }, [startPos, screenToFlowPosition]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    (e.target as HTMLDivElement).releasePointerCapture(e.pointerId);
    
    if (!isDraggingRef.current || !startPos || !currentPos) {
      isDraggingRef.current = false;
      setStartPos(null);
      setCurrentPos(null);
      return;
    }

    // Calculate frame dimensions
    const width = Math.abs(currentPos.x - startPos.x);
    const height = Math.abs(currentPos.y - startPos.y);

    // Only create frame if it's large enough
    if (width > 50 && height > 50) {
      const x = Math.min(startPos.x, currentPos.x);
      const y = Math.min(startPos.y, currentPos.y);
      
      onFrameComplete(
        { x, y },
        { width, height }
      );
    }

    isDraggingRef.current = false;
    setStartPos(null);
    setCurrentPos(null);
  }, [startPos, currentPos, onFrameComplete]);

  const handlePointerCancel = useCallback(() => {
    isDraggingRef.current = false;
    setStartPos(null);
    setCurrentPos(null);
    onCancel();
  }, [onCancel]);

  // Calculate preview rectangle
  const previewRect = startPos && currentPos ? {
    x: Math.min(startPos.x, currentPos.x),
    y: Math.min(startPos.y, currentPos.y),
    width: Math.abs(currentPos.x - startPos.x),
    height: Math.abs(currentPos.y - startPos.y),
  } : null;

  return (
    <div
      className="frame-overlay"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 4,
        cursor: "crosshair",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={isDraggingRef.current ? handlePointerMove : undefined}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onContextMenu={(e) => {
        e.preventDefault();
        onCancel();
      }}
    >
      {/* Preview rectangle */}
      {previewRect && previewRect.width > 0 && previewRect.height > 0 && (
        <div
          style={{
            position: "absolute",
            left: `${previewRect.x}px`,
            top: `${previewRect.y}px`,
            width: `${previewRect.width}px`,
            height: `${previewRect.height}px`,
            border: "2px dashed hsl(var(--primary))",
            backgroundColor: "hsl(var(--primary) / 0.1)",
            borderRadius: "0.5rem",
            pointerEvents: "none",
          }}
        />
      )}
      
      {/* Instructions */}
      <div
        style={{
          position: "absolute",
          top: "1rem",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "hsl(var(--background) / 0.9)",
          backdropFilter: "blur(4px)",
          border: "1px solid hsl(var(--border))",
          borderRadius: "0.5rem",
          padding: "0.5rem 1rem",
          fontSize: "0.875rem",
          color: "hsl(var(--muted-foreground))",
          pointerEvents: "none",
        }}
      >
        Click and drag to create a frame • Right-click to cancel
      </div>
    </div>
  );
}

