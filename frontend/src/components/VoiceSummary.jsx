/**
 * VoiceSummary Component
 * Text-to-speech playback of the emergency response plan summary
 */

import React, { useState, useEffect, useRef } from "react";
import { Volume2, VolumeX, Play, Square, RefreshCw } from "lucide-react";

export default function VoiceSummary({ summary, isVisible }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const utteranceRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
      clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isVisible || !summary) return;
    // Auto-play when new summary arrives
    // handlePlay();
  }, [summary, isVisible]);

  const handlePlay = () => {
    if (!summary) return;
    if (!("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in your browser.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(summary);
    utterance.rate = 0.95;
    utterance.pitch = 0.9;
    utterance.volume = isMuted ? 0 : 1;

    // Try to use a clear English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        v.lang === "en-US" &&
        (v.name.includes("Google") || v.name.includes("Microsoft"))
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onstart = () => {
      setIsPlaying(true);
      setProgress(0);
    };
    utterance.onend = () => {
      setIsPlaying(false);
      setProgress(100);
      clearInterval(intervalRef.current);
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      clearInterval(intervalRef.current);
    };

    // Simulate progress (SpeechSynthesis doesn't provide real progress)
    const estimatedDuration = (summary.length / 15) * 1000; // ~15 chars/sec
    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / estimatedDuration) * 100, 95);
      setProgress(pct);
    }, 200);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setProgress(0);
    clearInterval(intervalRef.current);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (utteranceRef.current) {
      utteranceRef.current.volume = !isMuted ? 0 : 1;
    }
  };

  if (!isVisible || !summary) return null;

  return (
    <div className="nova-panel p-4 border border-nova-border animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isPlaying ? "bg-nova-success animate-pulse" : "bg-nova-muted"}`} />
          <span className="text-xs font-semibold uppercase tracking-widest text-nova-muted">
            Voice Summary — Amazon Nova Sonic
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="p-1.5 rounded hover:bg-nova-border transition-colors"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX size={14} className="text-nova-muted" />
            ) : (
              <Volume2 size={14} className="text-nova-muted" />
            )}
          </button>
        </div>
      </div>

      {/* Summary text */}
      <div className="bg-nova-bg rounded-lg p-3 border border-nova-border mb-3 max-h-24 overflow-y-auto">
        <p className="text-xs text-nova-muted leading-relaxed font-mono">{summary}</p>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-nova-border rounded-full mb-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-nova-accent to-nova-success rounded-full transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {isPlaying ? (
          <button
            onClick={handleStop}
            className="flex items-center gap-2 text-xs font-semibold text-nova-danger bg-nova-danger/10 border border-nova-danger/30 px-3 py-1.5 rounded-md hover:bg-nova-danger/20 transition-colors"
          >
            <Square size={12} fill="currentColor" />
            Stop
          </button>
        ) : (
          <button
            onClick={handlePlay}
            className="flex items-center gap-2 text-xs font-semibold text-nova-success bg-nova-success/10 border border-nova-success/30 px-3 py-1.5 rounded-md hover:bg-nova-success/20 transition-colors"
          >
            <Play size={12} fill="currentColor" />
            Play Summary
          </button>
        )}
        {progress > 0 && !isPlaying && (
          <button
            onClick={handlePlay}
            className="flex items-center gap-1.5 text-xs text-nova-muted hover:text-nova-text"
          >
            <RefreshCw size={11} />
            Replay
          </button>
        )}
        <span className="text-xs text-nova-muted ml-auto">
          {isPlaying ? "▶ Playing..." : "Ready to play"}
        </span>
      </div>
    </div>
  );
}
