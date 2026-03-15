/**
 * SystemLog Component
 * Scrolling terminal-style log panel that displays real-time agent events
 */

import React, { useEffect, useRef } from "react";
import { Terminal } from "lucide-react";

export default function SystemLog({ logs }) {
  const bottomRef = useRef(null);

  // Auto-scroll to the latest log entry whenever logs change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  if (!logs || logs.length === 0) {
    return (
      <div className="nova-panel p-5 flex flex-col gap-3 h-full">
        <div className="flex items-center gap-3 border-b border-nova-border pb-3">
          <Terminal size={14} className="text-nova-accent" />
          <h2 className="font-semibold text-sm uppercase tracking-widest text-nova-muted">
            System Log
          </h2>
        </div>
        <div className="flex-1 bg-nova-bg rounded-md border border-nova-border p-4 font-mono text-xs text-nova-muted flex items-center justify-center">
          <span>Awaiting system events…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="nova-panel p-5 flex flex-col gap-3 h-full">
      <div className="flex items-center justify-between border-b border-nova-border pb-3">
        <div className="flex items-center gap-3">
          <Terminal size={14} className="text-nova-accent" />
          <h2 className="font-semibold text-sm uppercase tracking-widest text-nova-muted">
            System Log
          </h2>
        </div>
        <span className="text-xs font-mono text-nova-muted">{logs.length} events</span>
      </div>

      <div className="flex-1 bg-nova-bg rounded-md border border-nova-border p-3 font-mono text-xs overflow-y-auto max-h-48 space-y-1">
        {logs.map((entry, i) => (
          <div key={i} className="flex gap-2 leading-relaxed">
            <span className="text-nova-muted flex-shrink-0">[{entry.time}]</span>
            <span
              className={
                entry.level === "warn"
                  ? "text-nova-warning"
                  : entry.level === "error"
                  ? "text-nova-danger"
                  : entry.level === "success"
                  ? "text-nova-success"
                  : "text-nova-text"
              }
            >
              {entry.message}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
