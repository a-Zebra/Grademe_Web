"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import PropTypes from "prop-types";
import { CodeEditor } from "../Editor/CodeEditor";
import { SolutionModal } from "../ui/SolutionModal";

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
  const [showTimer, setShowTimer] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [showSolution, setShowSolution] = useState(false);
  const [solutionData, setSolutionData] = useState(null);
  const [loadingSolution, setLoadingSolution] = useState(false);
  const [solutionEnabled, setSolutionEnabled] = useState(false);
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

      // Apply penalty if failed and penalties are enabled
      if (!data.passed) {
        const penaltiesEnabled =
          localStorage.getItem("penalties_enabled") !== "false";
        if (penaltiesEnabled && startTime) {
          // Add 5 minutes penalty
          const penaltyKey = `exam_${examId}_${examNum}_penalty`;
          const currentPenalty = parseInt(
            sessionStorage.getItem(penaltyKey) || "0",
            10
          );
          const newPenalty = currentPenalty + 300; // 5 minutes in seconds
          sessionStorage.setItem(penaltyKey, newPenalty.toString());

          setOutput(
            (prev) => prev + "\n\n⚠️ Penalty: +5 minutes added to exam time."
          );
        }
      }
    } catch (err) {
      setOutput(String(err.message || err));
      setPassed(false);
    } finally {
      setIsSubmitting(false);
    }
  }, [canSubmit, code, examId, subjectId, startTime, examNum]);

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

  // Get exam duration based on exam type and number
  const getExamDuration = useCallback(() => {
    if (examId === "PISCINE_PART") {
      if (examNum === "exam_04") {
        return 480; // 8 hours
      }
      return 240; // 4 hours
    }
    return 180; // 3 hours (STUD_PART default)
  }, [examId, examNum]);

  // Timer logic
  useEffect(() => {
    const storedStartTime = sessionStorage.getItem(
      `exam_${examId}_${examNum}_start`
    );
    if (storedStartTime) {
      const start = parseInt(storedStartTime, 10);
      setStartTime(start);
    }
  }, [examId, examNum]);

  useEffect(() => {
    if (!startTime) return;

    const duration = getExamDuration();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);

      // Get accumulated penalties
      const penaltyKey = `exam_${examId}_${examNum}_penalty`;
      const penalty = parseInt(sessionStorage.getItem(penaltyKey) || "0", 10);

      const remaining = duration * 60 - elapsed - penalty;

      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        alert("⏰ Time is up! Exam session has ended.");
        router.push("/");
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, router, getExamDuration, examId, examNum]);

  const formatTime = useCallback(() => {
    const hours = Math.floor(timeLeft / 3600);
    const minutes = Math.floor((timeLeft % 3600) / 60);
    const seconds = timeLeft % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(2, "0")}`;
  }, [timeLeft]);

  const isWarning = timeLeft <= 600;
  const isCritical = timeLeft <= 300;

  // Check if solution is enabled
  useEffect(() => {
    const stored = localStorage.getItem("solution_enabled");
    setSolutionEnabled(stored === "true");
  }, []);

  // Fetch solution
  const handleShowSolution = useCallback(async () => {
    if (loadingSolution || solutionData) {
      setShowSolution(true);
      return;
    }

    setLoadingSolution(true);
    try {
      const res = await fetch(
        `/api/exams/${examId}/${examNum}/${currentLevel}/${currentExercise}/solution`
      );
      if (res.ok) {
        const data = await res.json();
        setSolutionData(data);
        setShowSolution(true);
      } else {
        alert("Solution not found");
      }
    } catch (err) {
      console.error("Failed to load solution:", err);
      alert("Failed to load solution");
    } finally {
      setLoadingSolution(false);
    }
  }, [
    loadingSolution,
    solutionData,
    examId,
    examNum,
    currentLevel,
    currentExercise,
  ]);

  const handleExitExam = useCallback(() => {
    if (
      confirm(
        "Are you sure you want to exit the exam? The progress will not be saved."
      )
    ) {
      router.push("/");
    }
  }, [router]);

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleExitExam}
            className="p-2 rounded transition-colors bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
            title="Exit exam"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </button>
          <p className="text-sm text-neutral-400">Subject: {subjectId}</p>
        </div>
        <div className="flex items-center gap-2">
          {startTime && (
            <div className="flex items-center gap-2">
              {showTimer && (
                <div
                  className={`px-3 py-1.5 rounded font-mono text-sm transition-colors ${
                    isCritical
                      ? "bg-red-900/90 text-red-100"
                      : isWarning
                      ? "bg-orange-900/90 text-orange-100"
                      : "bg-neutral-800 text-neutral-100"
                  }`}
                >
                  {formatTime()}
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowTimer(!showTimer)}
                className={`p-2 rounded transition-colors ${
                  isCritical
                    ? "bg-red-900/90 hover:bg-red-800 text-red-100"
                    : isWarning
                    ? "bg-orange-900/90 hover:bg-orange-800 text-orange-100"
                    : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
                }`}
                title="Toggle timer"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            </div>
          )}
          {solutionEnabled && (
            <button
              type="button"
              onClick={handleShowSolution}
              disabled={loadingSolution}
              className="p-2 rounded transition-colors bg-blue-900/90 hover:bg-blue-800 text-blue-100 disabled:opacity-50"
              title="View solution"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
            </button>
          )}
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
      <SolutionModal
        isOpen={showSolution}
        onClose={() => setShowSolution(false)}
        solution={solutionData?.content}
        filename={solutionData?.filename}
      />
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
