"use client";

import { useState } from "react";

export function CleanupButton() {
  const [isCleaningUp, setIsCleaningUp] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  async function handleCleanup() {
    setIsCleaningUp(true);
    try {
      const res = await fetch("/api/cleanup", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        alert("✅ All temporary data cleared!");
        setShowConfirm(false);
      } else {
        alert("❌ Cleanup failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("❌ Cleanup failed: " + err.message);
    } finally {
      setIsCleaningUp(false);
    }
  }

  if (showConfirm) {
    return (
      <div className="fixed bottom-6 right-6 bg-neutral-800 border border-neutral-700 rounded-lg p-4 shadow-xl z-50">
        <p className="text-sm text-neutral-100 mb-3">
          Clear all submission data?
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleCleanup}
            disabled={isCleaningUp}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-sm text-white rounded"
          >
            {isCleaningUp ? "Clearing..." : "Yes, Clear"}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="px-3 py-1.5 bg-neutral-700 hover:bg-neutral-600 text-sm text-white rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="fixed bottom-6 right-6 p-3 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-full shadow-lg z-50 transition-colors"
      title="Clear all submission data"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-neutral-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </button>
  );
}
