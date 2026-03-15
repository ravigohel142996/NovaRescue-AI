/**
 * InputPanel Component
 * Handles text, image, and voice disaster report input
 */

import React, { useState, useCallback, useRef } from "react";
import { useDropzone } from "react-dropzone";
import {
  FileText,
  Image,
  Mic,
  MicOff,
  Upload,
  Send,
  AlertTriangle,
  X,
} from "lucide-react";

const INPUT_MODES = [
  { id: "text", label: "Text Report", icon: FileText },
  { id: "image", label: "Image Upload", icon: Image },
  { id: "voice", label: "Voice Input", icon: Mic },
];

export default function InputPanel({ onSubmit, isLoading }) {
  const [mode, setMode] = useState("text");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [simulationMode, setSimulationMode] = useState(true);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const chunksRef = useRef([]);

  // Dropzone config
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"] },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    disabled: isLoading,
  });

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime((t) => t + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access denied:", err);
      alert("Microphone access is required for voice input.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleSubmit = () => {
    if (mode === "text" && description.trim().length < 10) {
      alert("Please provide a description of at least 10 characters.");
      return;
    }
    if (mode === "image" && !uploadedFile) {
      alert("Please upload a disaster scene image.");
      return;
    }
    if (mode === "voice" && !audioBlob) {
      alert("Please record a voice message first.");
      return;
    }

    onSubmit({
      mode,
      description: description.trim(),
      location: location.trim() || "Unknown",
      simulationMode,
      file: mode === "image" ? uploadedFile : mode === "voice" ? audioBlob : null,
    });
  };

  return (
    <div className="nova-panel p-5 flex flex-col gap-5 h-full">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-nova-border pb-4">
        <div className="w-2 h-2 rounded-full bg-nova-accent animate-pulse" />
        <h2 className="font-semibold text-sm uppercase tracking-widest text-nova-muted">
          Disaster Input Module
        </h2>
      </div>

      {/* Mode Selector */}
      <div className="grid grid-cols-3 gap-2">
        {INPUT_MODES.map(({ id, label, icon: Icon }) => (
          <button
            type="button"
            key={id}
            onClick={() => setMode(id)}
            disabled={isLoading}
            className={`flex flex-col items-center gap-2 py-3 px-2 rounded-md border transition-all duration-200 text-xs font-medium
              ${
                mode === id
                  ? "border-nova-accent bg-nova-accent/10 text-nova-accent"
                  : "border-nova-border text-nova-muted hover:border-nova-accent/50 hover:text-nova-text"
              }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </div>

      {/* Text Input Mode */}
      {mode === "text" && (
        <div className="flex flex-col gap-3 flex-1">
          <div>
            <label className="nova-label">Emergency Description *</label>
            <textarea
              className="nova-input resize-none h-36"
              placeholder="Describe the disaster situation in detail... (e.g., Major flooding in downtown area, water levels rising rapidly, multiple buildings submerged...)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
            <div className="text-right text-xs text-nova-muted mt-1">
              {description.length} / 5000
            </div>
          </div>
        </div>
      )}

      {/* Image Upload Mode */}
      {mode === "image" && (
        <div className="flex flex-col gap-3 flex-1">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
              ${
                isDragActive
                  ? "border-nova-accent bg-nova-accent/5"
                  : "border-nova-border hover:border-nova-accent/50"
              }
              ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <input {...getInputProps()} />
            {uploadedFile ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-nova-success/20 flex items-center justify-center">
                  <Image size={24} className="text-nova-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-nova-text">
                    {uploadedFile.name}
                  </p>
                  <p className="text-xs text-nova-muted">
                    {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploadedFile(null);
                  }}
                  className="text-nova-danger text-xs hover:underline flex items-center gap-1"
                >
                  <X size={12} /> Remove
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Upload size={32} className="text-nova-muted" />
                <div>
                  <p className="text-sm text-nova-text">
                    {isDragActive
                      ? "Drop image here..."
                      : "Drag & drop disaster image"}
                  </p>
                  <p className="text-xs text-nova-muted mt-1">
                    PNG, JPG, WEBP · Max 10MB
                  </p>
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="nova-label">Additional Description (optional)</label>
            <textarea
              className="nova-input resize-none h-20"
              placeholder="Add context about the image..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      {/* Voice Input Mode */}
      {mode === "voice" && (
        <div className="flex flex-col gap-4 flex-1 items-center justify-center">
          <button
            type="button"
            className={`w-24 h-24 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200
              ${
                isRecording
                  ? "bg-nova-danger/20 border-2 border-nova-danger shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse"
                  : "bg-nova-accent/10 border-2 border-nova-accent hover:shadow-nova-glow"
              }
              ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isLoading}
            aria-label={isRecording ? "Stop recording" : "Start recording"}
          >
            {isRecording ? (
              <MicOff size={36} className="text-nova-danger" />
            ) : (
              <Mic size={36} className="text-nova-accent" />
            )}
          </button>

          {isRecording && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-nova-danger animate-blink" />
              <span className="font-mono text-nova-danger text-sm">
                RECORDING {formatTime(recordingTime)}
              </span>
            </div>
          )}

          {audioBlob && !isRecording && (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 text-nova-success text-sm">
                <div className="w-2 h-2 rounded-full bg-nova-success" />
                Voice recorded ({formatTime(recordingTime)})
              </div>
              <button
                type="button"
                onClick={() => {
                  setAudioBlob(null);
                  setRecordingTime(0);
                }}
                className="text-nova-muted text-xs hover:text-nova-danger"
              >
                Re-record
              </button>
            </div>
          )}

          {!isRecording && !audioBlob && (
            <p className="text-nova-muted text-sm text-center">
              Click the microphone to start recording your emergency report
            </p>
          )}
        </div>
      )}

      {/* Location */}
      <div>
        <label className="nova-label">Affected Location</label>
        <input
          type="text"
          className="nova-input"
          placeholder="e.g., Downtown District, River Valley, Zone 3..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Simulation Mode Toggle */}
      <div className="flex items-center justify-between py-2 px-3 bg-nova-bg rounded-md border border-nova-border">
        <div>
          <span className="text-sm font-medium text-nova-text">
            Simulation Mode
          </span>
          <p className="text-xs text-nova-muted">Demo without AWS credentials</p>
        </div>
        <button
          type="button"
          onClick={() => setSimulationMode(!simulationMode)}
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
            simulationMode ? "bg-nova-accent" : "bg-nova-border"
          }`}
          disabled={isLoading}
        >
          <div
            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${
              simulationMode ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isLoading}
        className={`nova-btn-primary w-full justify-center py-3 ${
          isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <AlertTriangle size={16} />
            <Send size={16} />
            Deploy Response
          </>
        )}
      </button>
    </div>
  );
}
