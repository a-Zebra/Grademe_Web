"use client";

import { useEffect, useState } from "react";
import PropTypes from "prop-types";

export function PenaltyToggle() {
  const [penaltiesEnabled, setPenaltiesEnabled] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("penalties_enabled");
    if (stored !== null) {
      setPenaltiesEnabled(stored === "true");
    }
  }, []);

  function togglePenalties() {
    const newValue = !penaltiesEnabled;
    setPenaltiesEnabled(newValue);
    localStorage.setItem("penalties_enabled", newValue.toString());
  }

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg">
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-neutral-100">Penalties</h3>
        <p className="text-xs text-neutral-400 mt-1">
          Failed submissions add time penalty (5 min per failure)
        </p>
      </div>
      <button
        onClick={togglePenalties}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          penaltiesEnabled ? "bg-emerald-600" : "bg-neutral-600"
        }`}
        role="switch"
        aria-checked={penaltiesEnabled}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            penaltiesEnabled ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}
