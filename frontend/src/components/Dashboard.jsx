/**
 * Dashboard Component
 * Main layout: Input Panel | Agent Status | Response Plan
 * Bottom: Resource Charts
 */

import React, { useState, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Shield,
  Activity,
  Wifi,
  WifiOff,
  Clock,
  AlertCircle,
} from "lucide-react";

import InputPanel from "./InputPanel";
import AgentStatus from "./AgentStatus";
import ResponsePlan from "./ResponsePlan";
import ResourceCharts from "./ResourceCharts";
import VoiceSummary from "./VoiceSummary";
import { analysisApi } from "../services/api";

function StatusBar({ isOnline, lastUpdated, incidentId }) {
  return (
    <div className="flex items-center justify-between px-5 py-2 bg-nova-panel border-b border-nova-border text-xs font-mono">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          {isOnline ? (
            <Wifi size={11} className="text-nova-success" />
          ) : (
            <WifiOff size={11} className="text-nova-danger" />
          )}
          <span className={isOnline ? "text-nova-success" : "text-nova-danger"}>
            {isOnline ? "SYSTEM ONLINE" : "OFFLINE MODE"}
          </span>
        </div>
        {incidentId && (
          <div className="flex items-center gap-1.5 text-nova-muted">
            <AlertCircle size={11} />
            <span>INC: {incidentId}</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-4 text-nova-muted">
        {lastUpdated && (
          <div className="flex items-center gap-1.5">
            <Clock size={11} />
            <span>Updated: {lastUpdated}</span>
          </div>
        )}
        <span>NovaRescue AI v1.0</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [analysisData, setAnalysisData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  // Tracks which agent (0–3) is currently RUNNING during sequential execution
  const [runningAgentIndex, setRunningAgentIndex] = useState(-1);

  // Advance the running-agent indicator every 1.5 s while a request is in flight
  useEffect(() => {
    if (!isLoading) {
      setRunningAgentIndex(-1);
      return;
    }
    setRunningAgentIndex(0);
    const interval = setInterval(() => {
      setRunningAgentIndex((prev) => (prev < 3 ? prev + 1 : prev));
    }, 1300);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = useCallback(
    async ({ mode, description, location, simulationMode, file }) => {
      setIsLoading(true);
      setAnalysisData(null);

      try {
        let response;

        if (mode === "text") {
          const res = await analysisApi.analyzeDisaster({
            description,
            location,
          });
          response = res.data;
        } else if (mode === "image" && file) {
          const formData = new FormData();
          formData.append("image", file);
          formData.append("description", description);
          formData.append("location", location);
          formData.append("simulation_mode", String(simulationMode));
          const res = await analysisApi.analyzeImage(formData);
          response = res.data;
        } else if (mode === "voice" && file) {
          const formData = new FormData();
          formData.append("audio", file, "recording.webm");
          formData.append("location", location);
          formData.append("simulation_mode", String(simulationMode));
          const res = await analysisApi.analyzeVoice(formData);
          response = res.data;
        }

        if (response) {
          setAnalysisData(response);
          setLastUpdated(new Date().toLocaleTimeString());
          setIsOnline(true);
          toast.success(
            `Analysis complete — Incident ${response.incident_id}`,
            { autoClose: 5000 }
          );
        }
      } catch (err) {
        console.error("Analysis failed:", err);
        setIsOnline(false);
        toast.error(
          `Analysis failed: ${err.message || "Backend unavailable"}`,
          { autoClose: 8000 }
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return (
    <div className="min-h-screen bg-nova-bg flex flex-col">
      {/* Header */}
      <header className="bg-nova-panel border-b border-nova-border px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-nova-accent flex items-center justify-center shadow-nova-glow">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                NovaRescue{" "}
                <span className="text-nova-accent">AI</span>
              </h1>
              <p className="text-xs text-nova-muted">
                Multi-Agent Emergency Disaster Response System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-mono text-nova-muted">
            <div className="flex items-center gap-1.5">
              <Activity size={12} className="text-nova-success" />
              <span>4 AGENTS READY</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-nova-accent animate-pulse" />
              <span>AMAZON NOVA</span>
            </div>
            <div className="hidden md:flex items-center gap-1.5">
              <span className="text-nova-border">|</span>
              <span>POWERED BY AWS BEDROCK</span>
            </div>
          </div>
        </div>
      </header>

      {/* Status Bar */}
      <StatusBar
        isOnline={isOnline}
        lastUpdated={lastUpdated}
        incidentId={analysisData?.incident_id}
      />

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-hidden">
        {/* Top Row: 3 panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-4 h-[calc(100vh-260px)] min-h-[480px]">
          {/* Input Panel - 3 cols */}
          <div className="lg:col-span-3 overflow-hidden">
            <InputPanel onSubmit={handleSubmit} isLoading={isLoading} />
          </div>

          {/* Agent Status - 4 cols */}
          <div className="lg:col-span-4 overflow-hidden">
            <AgentStatus
              agentResults={analysisData?.agent_results}
              isOrchestrating={isLoading}
              totalTime={analysisData?.total_execution_time_ms}
              runningAgentIndex={runningAgentIndex}
            />
          </div>

          {/* Response Plan - 5 cols */}
          <div className="lg:col-span-5 overflow-y-auto">
            <ResponsePlan analysisData={analysisData} />
          </div>
        </div>

        {/* Voice Summary */}
        <VoiceSummary
          summary={analysisData?.voice_summary}
          isVisible={!!analysisData?.voice_summary}
        />

        {/* Bottom: Resource Charts */}
        {analysisData && (
          <div className="mt-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-1.5 h-4 bg-nova-accent rounded-full" />
              <h2 className="text-xs font-semibold uppercase tracking-widest text-nova-muted">
                Resource Analytics
              </h2>
            </div>
            <ResourceCharts analysisData={analysisData} />
          </div>
        )}
      </main>
    </div>
  );
}
