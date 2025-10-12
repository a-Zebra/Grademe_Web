"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PropTypes from "prop-types";

export function ExamTimer({ examId, examNum, startTime, duration = 180 }) {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const remaining = duration * 60 - elapsed;

      if (remaining <= 0) {
        clearInterval(interval);
        setTimeLeft(0);
        // Time's up - redirect to home
        alert("⏰ Time is up! Exam session has ended.");
        router.push("/");
      } else {
        setTimeLeft(remaining);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, duration, router]);

  if (!startTime || timeLeft === 0) return null;

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const isWarning = timeLeft <= 600; // Last 10 minutes
  const isCritical = timeLeft <= 300; // Last 5 minutes

  return (
    <div
      className={`fixed top-4 right-20 px-4 py-2 rounded-lg shadow-lg z-40 border ${
        isCritical
          ? "bg-red-900/90 border-red-700 text-red-100"
          : isWarning
          ? "bg-orange-900/90 border-orange-700 text-orange-100"
          : "bg-neutral-800/90 border-neutral-700 text-neutral-100"
      }`}
    >
      <div className="flex items-center gap-2">
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
        <span className="font-mono text-sm font-semibold">
          {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:
          {String(seconds).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

ExamTimer.propTypes = {
  examId: PropTypes.string.isRequired,
  examNum: PropTypes.string.isRequired,
  startTime: PropTypes.number,
  duration: PropTypes.number,
};
