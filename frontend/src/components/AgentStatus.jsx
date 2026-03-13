/**
 * AgentStatus Component
 * Real-time visualization of agent execution pipeline
 */

import React from "react";
import {
  Brain,
  Heart,
  Truck,
  Radio,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
} from "lucide-react";

const AGENT_CONFIG = [
  {
    key: "disaster",
    name: "Disaster Analysis Agent",
    description: "Analyzing disaster type, severity & risk",
    icon: Brain,
    color: "text-red-400",
    bgColor: "bg-red-900/20",
    borderColor: "border-red-800",
  },
  {
    key: "medical",
    name: "Medical Resource Agent",
    description: "Calculating medical requirements",
    icon: Heart,
    color: "text-pink-400",
    bgColor: "bg-pink-900/20",
    borderColor: "border-pink-800",
  },
  {
    key: "logistics",
    name: "Logistics & Evacuation Agent",
    description: "Planning evacuation routes & supplies",
    icon: Truck,
    color: "text-blue-400",
    bgColor: "bg-blue-900/20",
    borderColor: "border-blue-800",
  },
  {
    key: "communication",
    name: "Communication Alert Agent",
    description: "Generating authority & public alerts",
    icon: Radio,
    color: "text-yellow-400",
    bgColor: "bg-yellow-900/20",
    borderColor: "border-yellow-800",
  },
];

function AgentCard({ config, result, index, isOrchestrating }) {
  const Icon = config.icon;

  const getStatus = () => {
    if (!result && !isOrchestrating) return "idle";
    if (!result && isOrchestrating) {
      return index === 0 ? "running" : "pending";
    }
    return result.status || "completed";
  };

  const status = getStatus();

  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircle2 size={14} className="text-nova-success" />;
      case "failed":
        return <XCircle size={14} className="text-nova-danger" />;
      case "running":
        return (
          <div className="w-3.5 h-3.5 border-2 border-nova-warning/30 border-t-nova-warning rounded-full animate-spin" />
        );
      case "pending":
        return <Clock size={14} className="text-nova-muted" />;
      default:
        return <div className="w-3.5 h-3.5 rounded-full bg-nova-border" />;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case "completed":
        return { text: "COMPLETED", class: "text-nova-success" };
      case "failed":
        return { text: "FAILED", class: "text-nova-danger" };
      case "running":
        return { text: "RUNNING", class: "text-nova-warning animate-pulse" };
      case "pending":
        return { text: "PENDING", class: "text-nova-muted" };
      default:
        return { text: "IDLE", class: "text-nova-muted" };
    }
  };

  const statusLabel = getStatusLabel();

  return (
    <div
      className={`nova-panel p-4 border transition-all duration-500 animate-fade-in
        ${
          status === "running"
            ? "border-nova-warning/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]"
            : status === "completed"
            ? `${config.borderColor} ${config.bgColor}`
            : "border-nova-border"
        }`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
            ${status === "completed" || status === "running" ? config.bgColor : "bg-nova-bg"}`}
        >
          <Icon
            size={20}
            className={
              status === "completed" || status === "running"
                ? config.color
                : "text-nova-muted"
            }
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3
              className={`text-sm font-semibold truncate ${
                status === "idle" ? "text-nova-muted" : "text-nova-text"
              }`}
            >
              {config.name}
            </h3>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {getStatusIcon()}
              <span className={`text-xs font-mono font-bold ${statusLabel.class}`}>
                {statusLabel.text}
              </span>
            </div>
          </div>

          <p className="text-xs text-nova-muted mt-0.5">{config.description}</p>

          {/* Execution time */}
          {result?.execution_time_ms && (
            <div className="flex items-center gap-1 mt-2">
              <Zap size={10} className="text-nova-muted" />
              <span className="text-xs font-mono text-nova-muted">
                {result.execution_time_ms}ms
              </span>
            </div>
          )}

          {/* Running progress bar */}
          {status === "running" && (
            <div className="mt-2 h-0.5 bg-nova-border rounded-full overflow-hidden">
              <div className="h-full bg-nova-warning rounded-full animate-[scan_1.5s_ease-in-out_infinite]" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AgentStatus({ agentResults, isOrchestrating, totalTime }) {
  // Build result map by agent name
  const resultMap = {};
  if (agentResults) {
    agentResults.forEach((r) => {
      if (r.agent_name.toLowerCase().includes("disaster")) resultMap.disaster = r;
      else if (r.agent_name.toLowerCase().includes("medical")) resultMap.medical = r;
      else if (r.agent_name.toLowerCase().includes("logistics")) resultMap.logistics = r;
      else if (r.agent_name.toLowerCase().includes("communication")) resultMap.communication = r;
    });
  }

  const completedCount = agentResults?.filter((r) => r.status === "completed").length || 0;
  const totalAgents = AGENT_CONFIG.length;

  return (
    <div className="nova-panel p-5 flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-nova-border pb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-2 h-2 rounded-full ${
              isOrchestrating
                ? "bg-nova-warning animate-pulse"
                : agentResults
                ? "bg-nova-success"
                : "bg-nova-muted"
            }`}
          />
          <h2 className="font-semibold text-sm uppercase tracking-widest text-nova-muted">
            Agent Execution Pipeline
          </h2>
        </div>

        {/* Progress indicator */}
        {(isOrchestrating || agentResults) && (
          <span className="text-xs font-mono text-nova-muted">
            {completedCount}/{totalAgents} agents
          </span>
        )}
      </div>

      {/* Progress bar */}
      {(isOrchestrating || agentResults) && (
        <div className="flex flex-col gap-1.5">
          <div className="h-1.5 bg-nova-border rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-nova-accent to-nova-warning rounded-full transition-all duration-500"
              style={{ width: `${(completedCount / totalAgents) * 100}%` }}
            />
          </div>
          {totalTime && (
            <div className="flex items-center gap-1 text-xs text-nova-muted">
              <Zap size={10} />
              <span className="font-mono">Total: {totalTime}ms</span>
            </div>
          )}
        </div>
      )}

      {/* Agent Cards */}
      <div className="flex flex-col gap-3 flex-1">
        {AGENT_CONFIG.map((config, index) => (
          <AgentCard
            key={config.key}
            config={config}
            result={resultMap[config.key]}
            index={index}
            isOrchestrating={isOrchestrating}
          />
        ))}
      </div>

      {/* Idle state */}
      {!isOrchestrating && !agentResults && (
        <div className="text-center py-4">
          <p className="text-xs text-nova-muted">
            Submit a disaster report to activate agents
          </p>
        </div>
      )}
    </div>
  );
}
