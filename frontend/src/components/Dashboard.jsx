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
  ChevronDown,
} from "lucide-react";

import InputPanel from "./InputPanel";
import AgentStatus from "./AgentStatus";
import ResponsePlan from "./ResponsePlan";
import ResourceCharts from "./ResourceCharts";
import VoiceSummary from "./VoiceSummary";
import SystemLog from "./SystemLog";
import { analysisApi } from "../services/api";
import { buildDemoAnalysis } from "../services/demoResponse";

function StatusBar({ isOnline, lastUpdated, incidentId }) {
  return (
    <div className="sticky top-[72px] z-20 border-y border-nova-border bg-nova-panel/80 px-5 py-2 text-xs font-mono backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
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
  // System log entries: { time: "HH:MM:SS", message: string, level?: string }
  const [logs, setLogs] = useState([]);

  const addLog = useCallback((message, level = "info") => {
    const now = new Date();
    const time = now.toTimeString().split(" ")[0]; // HH:MM:SS
    setLogs((prev) => [...prev, { time, message, level }]);
  }, []); // setLogs is stable, no other dependencies

  // Advance the running-agent indicator every 1.5 s while a request is in flight
  useEffect(() => {
    if (!isLoading) {
      setRunningAgentIndex(-1);
      return;
    }
    setRunningAgentIndex(0);
    const agentLogMessages = [
      "DisasterAnalysisAgent running",
      "MedicalResourceAgent running",
      "LogisticsAgent planning evacuation",
      "CommunicationAgent generating alerts",
    ];
    addLog(agentLogMessages[0]);
    const interval = setInterval(() => {
      setRunningAgentIndex((prev) => {
        const next = prev < 3 ? prev + 1 : prev;
        if (next !== prev && agentLogMessages[next]) {
          addLog(agentLogMessages[next]);
        }
        return next;
      });
    }, 1300);
    return () => clearInterval(interval);
  }, [isLoading, addLog]);

  const handleSubmit = useCallback(
    async ({ mode, description, location, simulationMode, file }) => {
      setIsLoading(true);
      setAnalysisData(null);
      setLogs([]);
      addLog("Disaster report received");

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
          const severity = response.disaster_analysis?.severity_level?.toUpperCase();
          if (severity) addLog(`Severity level ${severity}`, severity === "CRITICAL" || severity === "HIGH" ? "warn" : "info");
          addLog("Response plan generated", "success");
          setAnalysisData(response);
          setLastUpdated(new Date().toLocaleTimeString());
          setIsOnline(true);
          toast.success(`Analysis complete — Incident ${response.incident_id}`, {
            autoClose: 5000,
          });
        }
      } catch (err) {
        console.error("Analysis failed:", err);
        addLog(`Error: ${err.message || "Backend unavailable"}`, "error");

        const networkIssue = (err?.message || "").toLowerCase().includes("network error");
        const backendRouteUnavailableStatuses = new Set([401, 403, 404, 405, 500, 502, 503, 504]);
        const routeUnavailable = backendRouteUnavailableStatuses.has(err?.status);

        if (networkIssue || routeUnavailable) {
          addLog("Switching to built-in demo engine", "warn");
          const fallback = await buildDemoAnalysis({
            mode,
            description,
            location,
            simulationMode,
          });
          const severity = fallback.disaster_analysis?.severity_level?.toUpperCase();
          if (severity) addLog(`Severity level ${severity}`, severity === "CRITICAL" || severity === "HIGH" ? "warn" : "info");
          addLog("Demo response plan generated", "success");
          setAnalysisData(fallback);
          setLastUpdated(new Date().toLocaleTimeString());
          setIsOnline(true);
          toast.warning(
            routeUnavailable
              ? "Backend route is unavailable in this deployment. Switched to built-in demo engine so the dashboard stays usable."
              : "Backend unreachable. Switched to built-in demo engine so all modules remain interactive.",
            { autoClose: 7000 }
          );
        } else {
          setIsOnline(false);
          toast.error(`Analysis failed: ${err.message || "Backend unavailable"}`, {
            autoClose: 8000,
          });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [addLog]
  );

  return (
    <div className="dashboard-shell min-h-screen bg-nova-bg text-nova-text">
      <header className="sticky top-0 z-30 border-b border-nova-border bg-nova-panel/85 px-5 py-4 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="nova-glow-ring flex h-10 w-10 items-center justify-center rounded-xl bg-nova-accent shadow-nova-glow">
              <Shield size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">
                NovaRescue <span className="text-nova-accent">AI</span>
              </h1>
              <p className="text-xs text-nova-muted">
                Multi-Agent Emergency Disaster Response System
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-6 text-xs font-mono text-nova-muted md:flex">
            <div className="flex items-center gap-1.5">
              <Activity size={12} className="text-nova-success" />
              <span>4 AGENTS READY</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-nova-accent" />
              <span>AMAZON NOVA</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-nova-border">|</span>
              <span>POWERED BY AWS BEDROCK</span>
            </div>
          </div>
        </div>
      </header>

      <StatusBar
        isOnline={isOnline}
        lastUpdated={lastUpdated}
        incidentId={analysisData?.incident_id}
      />

      <main className="dashboard-scroll-area mx-auto flex w-full max-w-[1400px] flex-col gap-5 px-4 py-5">
        <section className="scroll-card">
          <div className="mb-4 flex items-center justify-between gap-2 border-b border-nova-border pb-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-nova-muted">
                Mission Control
              </p>
              <h2 className="text-base font-semibold text-white">
                Live Incident Command Deck
              </h2>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-nova-border bg-nova-panel px-3 py-1.5 text-[11px] text-nova-muted sm:flex">
              <ChevronDown size={14} className="text-nova-accent" />
              Scroll for analytics
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-3">
              <InputPanel onSubmit={handleSubmit} isLoading={isLoading} />
            </div>
            <div className="lg:col-span-4 flex flex-col gap-4">
              <AgentStatus
                agentResults={analysisData?.agent_results}
                isOrchestrating={isLoading}
                totalTime={analysisData?.total_execution_time_ms}
                runningAgentIndex={runningAgentIndex}
              />
              <SystemLog logs={logs} />
            </div>
            <div className="lg:col-span-5 max-h-[65vh] overflow-y-auto pr-1">
              <ResponsePlan analysisData={analysisData} />
            </div>
          </div>
        </section>

        <section className="scroll-card">
          <div className="mb-3 flex items-center gap-3">
            <div className="h-4 w-1.5 rounded-full bg-nova-accent" />
            <h2 className="text-xs font-semibold uppercase tracking-widest text-nova-muted">
              Voice Intel Feed
            </h2>
          </div>
          <VoiceSummary
            summary={analysisData?.voice_summary}
            isVisible={!!analysisData?.voice_summary}
          />
        </section>

        {analysisData && (
          <section className="scroll-card animate-fade-in">
            <div className="mb-3 flex items-center gap-3">
              <div className="h-4 w-1.5 rounded-full bg-nova-accent" />
              <h2 className="text-xs font-semibold uppercase tracking-widest text-nova-muted">
                Resource Analytics
              </h2>
            </div>
            <ResourceCharts analysisData={analysisData} />
          </section>
        )}
      </main>
    </div>
  );
}
