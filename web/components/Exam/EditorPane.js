"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import PropTypes from "prop-types";
import { CodeEditor } from "../Editor/CodeEditor";

export function EditorPane({
  examId,
  subjectId,
  examNum,
  currentLevel,
  currentExercise,
}) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [output, setOutput] = useState("");
  const [passed, setPassed] = useState(false);
  const [split, setSplit] = useState(0.7);
  const containerRef = useRef(null);
  const isDraggingRef = useRef(false);

  const canSubmit = useMemo(
    () => !isSubmitting && code.trim().length > 0,
    [isSubmitting, code]
  );

  const onSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    setOutput("Running grader...");
    setPassed(false);
    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examId, subjectId, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Grading failed");
      setOutput(data.output || "No output");
      setPassed(data.passed || false);
    } catch (err) {
      setOutput(String(err.message || err));
      setPassed(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, code, examId, subjectId]);

  const handleNext = useCallback(async () => {
    // Fetch next exercise
    try {
      const res = await fetch(
        `/api/exams/${examId}/${examNum}/next?level=${currentLevel}&exercise=${currentExercise}`
      );
      const data = await res.json();

      if (data.nextExercise) {
        // Navigate to next exercise
        router.push(
          `/exam/${examId}/${examNum}/${data.nextExercise.level}/${data.nextExercise.name}`
        );
      } else {
        // No more exercises, go to home
        router.push("/");
      }
    } catch (err) {
      console.error("Failed to get next exercise:", err);
      router.push("/");
    }
  }, [examId, examNum, currentLevel, currentExercise, router]);

  const onDragStart = useCallback((e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  }, []);

  const onDragMove = useCallback((e) => {
    if (!isDraggingRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const relative = (clientY - rect.top) / rect.height;
    const clamped = Math.min(0.9, Math.max(0.2, relative));
    setSplit(clamped);
  }, []);

  const onDragEnd = useCallback(() => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  }, []);

  useEffect(() => {
    const move = (e) => onDragMove(e);
    const up = () => onDragEnd();
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
  }, [onDragMove, onDragEnd]);

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-neutral-400">Subject: {subjectId}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            className="px-3 py-1.5 bg-emerald-600 rounded hover:bg-emerald-500 disabled:opacity-50 text-sm"
          >
            {isSubmitting ? "Grading…" : "Submit"}
          </button>
          {passed && (
            <button
              type="button"
              onClick={handleNext}
              className="px-3 py-1.5 bg-blue-600 rounded hover:bg-blue-500 text-sm"
            >
              Next Exercise →
            </button>
          )}
        </div>
      </div>
      <div
        ref={containerRef}
        className="flex-1 min-h-0 mt-3 rounded border border-[#2d2d30] bg-[#1e1e1e] overflow-hidden flex flex-col"
      >
        <div style={{ height: `${split * 100}%` }} className="min-h-[120px]">
          <CodeEditor value={code} onChange={setCode} />
        </div>
        <div
          onMouseDown={onDragStart}
          onTouchStart={onDragStart}
          className="h-2 cursor-row-resize bg-[#2d2d30] hover:bg-[#3e3e42]"
          title="Drag to resize"
        />
        <div
          style={{ height: `${(1 - split) * 100}%` }}
          className="min-h-[80px] overflow-auto bg-[#0c0c0c] p-3 text-xs text-[#cccccc] whitespace-pre-wrap font-mono"
        >
          {output || "Grader output will appear here."}
        </div>
      </div>
    </div>
  );
}

EditorPane.propTypes = {
  examId: PropTypes.string.isRequired,
  subjectId: PropTypes.string.isRequired,
  examNum: PropTypes.string.isRequired,
  currentLevel: PropTypes.string.isRequired,
  currentExercise: PropTypes.string.isRequired,
};
