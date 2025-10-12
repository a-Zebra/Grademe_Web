"use client";

import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import Editor from "@monaco-editor/react";

export function CodeEditor({ value, onChange, language = "c" }) {
  const [code, setCode] = useState(value || "");

  useEffect(() => {
    setCode(value || "");
  }, [value]);

  function handleChange(next) {
    const text = typeof next === "string" ? next : code;
    setCode(text);
    if (onChange) onChange(text);
  }

  const editorLanguage = useMemo(() => {
    // map our language hints to monaco ones
    if (language === "c") return "c";
    if (language === "cpp") return "cpp";
    if (language === "shell") return "shell";
    return "plaintext";
  }, [language]);

  return (
    <Editor
      height="100%"
      defaultLanguage={editorLanguage}
      language={editorLanguage}
      theme="vs-dark"
      value={code}
      onChange={handleChange}
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
        cursorBlinking: "blink",
        renderWhitespace: "selection",
        bracketPairColorization: { enabled: true },
        padding: { top: 12, bottom: 8 },
        renderLineHighlight: "all",
      }}
    />
  );
}

CodeEditor.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  language: PropTypes.string,
};
