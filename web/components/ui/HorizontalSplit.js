"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

export function HorizontalSplit({
  children,
  initial = 0.5,
  min = 0.2,
  max = 0.8,
}) {
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);
  const [ratio, setRatio] = useState(initial);

  const onDown = useCallback((e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  const onMove = useCallback(
    (e) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const relative = (clientX - rect.left) / rect.width;
      const clamped = Math.min(max, Math.max(min, relative));
      setRatio(clamped);
    },
    [min, max]
  );

  const onUp = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    const move = (e) => onMove(e);
    const up = () => onUp();
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move);
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, [onMove, onUp]);

  const leftChild = Array.isArray(children) ? children[0] : children;
  const rightChild = Array.isArray(children) ? children[1] : null;

  return (
    <div ref={containerRef} className="h-full w-full flex">
      <div
        style={{ flexBasis: `${ratio * 100}%` }}
        className="min-w-[240px] max-w-[90%] overflow-auto border-r border-neutral-800"
      >
        {leftChild}
      </div>
      <div
        onMouseDown={onDown}
        onTouchStart={onDown}
        className="w-1.5 cursor-col-resize bg-neutral-800 hover:bg-neutral-700"
        title="Drag to resize"
      />
      <div className="flex-1 min-w-[240px] overflow-hidden">{rightChild}</div>
    </div>
  );
}

HorizontalSplit.propTypes = {
  children: PropTypes.node,
  initial: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
};
