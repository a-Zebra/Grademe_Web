"use client";

import { useEffect, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import Editor from "@monaco-editor/react";

export function SolutionModal({ isOpen, onClose, solution, filename }) {
  const modalRef = useRef(null);

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === "Escape") onClose();
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Detect language from filename
  const language = useMemo(() => {
    if (!filename) return "c";
    if (filename.endsWith(".cpp") || filename.endsWith(".hpp")) return "cpp";
    if (filename.endsWith(".c") || filename.endsWith(".h")) return "c";
    if (filename.endsWith(".sh")) return "shell";
    return "plaintext";
  }, [filename]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="relative w-full max-w-4xl h-[80vh] m-4 bg-neutral-900 border border-neutral-700 rounded-lg shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
          <div>
            <h2 className="text-lg font-semibold text-neutral-100">Solution</h2>
            <p className="text-sm text-neutral-400 mt-0.5">{filename}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 p-6">
          <div className="h-full rounded-lg border border-neutral-800 overflow-hidden">
            {solution ? (
              <Editor
                height="100%"
                defaultLanguage={language}
                language={language}
                theme="vs-dark"
                value={solution}
                options={{
                  fontFamily: "Consolas, 'Courier New', monospace",
                  fontSize: 13,
                  minimap: { enabled: false },
                  lineNumbers: "on",
                  glyphMargin: false,
                  folding: true,
                  tabSize: 4,
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  renderWhitespace: "selection",
                  bracketPairColorization: { enabled: true },
                  padding: { top: 12, bottom: 8 },
                  renderLineHighlight: "all",
                  readOnly: true,
                  domReadOnly: true,
                  contextmenu: false,
                }}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-neutral-400">
                Loading solution...
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-800 flex justify-end flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

SolutionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  solution: PropTypes.string,
  filename: PropTypes.string,
};
