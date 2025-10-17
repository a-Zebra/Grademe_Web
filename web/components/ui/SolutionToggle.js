"use client";

import { useEffect, useState } from "react";

export function SolutionToggle() {
  const [solutionEnabled, setSolutionEnabled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("solution_enabled");
    if (stored !== null) {
      setSolutionEnabled(stored === "true");
    }
  }, []);

  function toggleSolution() {
    const newValue = !solutionEnabled;
    setSolutionEnabled(newValue);
    localStorage.setItem("solution_enabled", newValue.toString());
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg">
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-neutral-100">
          Show Solutions
        </h3>
        <p className="text-xs text-neutral-400 mt-1">
          Display solution button in the exercise editor
        </p>
      </div>
      <button
        onClick={toggleSolution}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          solutionEnabled ? "bg-emerald-600" : "bg-neutral-600"
        }`}
        role="switch"
        aria-checked={solutionEnabled}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            solutionEnabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
