/**
 * ResponsePlan Component
 * Displays the complete emergency response plan from all agents
 */

import React, { useState } from "react";
import {
  AlertTriangle,
  Shield,
  Users,
  MapPin,
  MessageSquare,
  ChevronDown,
  ChevronRight,
  Download,
} from "lucide-react";
import { analysisApi } from "../services/api";

function SeverityBadge({ level }) {
  const classes = {
    low: "severity-low",
    medium: "severity-medium",
    high: "severity-high",
    critical: "severity-critical",
  };
  return (
    <span className={`severity-badge ${classes[level?.toLowerCase()] || "severity-medium"}`}>
      {level || "unknown"}
    </span>
  );
}

function AlertLevelBadge({ level }) {
  const classes = {
    red: "alert-red border",
    orange: "alert-orange border",
    yellow: "alert-yellow border",
    green: "alert-green border",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
        classes[level?.toLowerCase()] || "border border-nova-border text-nova-muted"
      }`}
    >
      ALERT {level?.toUpperCase() || "UNKNOWN"}
    </span>
  );
}

function CollapsibleSection({ title, icon: Icon, iconClass, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-nova-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 bg-nova-bg hover:bg-nova-panel/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon size={15} className={iconClass} />
          <span className="text-sm font-semibold text-nova-text">{title}</span>
        </div>
        {open ? (
          <ChevronDown size={14} className="text-nova-muted" />
        ) : (
          <ChevronRight size={14} className="text-nova-muted" />
        )}
      </button>
      {open && <div className="px-4 py-3 border-t border-nova-border">{children}</div>}
    </div>
  );
}

function MetricRow({ label, value, highlight }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-nova-border/50 last:border-0">
      <span className="text-xs text-nova-muted">{label}</span>
      <span className={`text-xs font-semibold font-mono ${highlight ? "text-nova-accent" : "text-nova-text"}`}>
        {value}
      </span>
    </div>
  );
}

export default function ResponsePlan({ analysisData, onDownload }) {
  const [downloading, setDownloading] = useState(false);

  if (!analysisData) {
    return (
      <div className="nova-panel p-5 flex flex-col items-center justify-center h-full gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-nova-border/50 flex items-center justify-center">
          <Shield size={32} className="text-nova-muted" />
        </div>
        <div>
          <h3 className="text-nova-text font-semibold">Awaiting Analysis</h3>
          <p className="text-nova-muted text-xs mt-1">
            Submit a disaster report to generate the response plan
          </p>
        </div>
      </div>
    );
  }

  const {
    incident_id,
    timestamp,
    input_type,
    simulation_mode,
    disaster_analysis: disaster,
    medical_plan: medical,
    logistics_plan: logistics,
    communication_plan: comm,
  } = analysisData;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await analysisApi.downloadReport(analysisData);
    } catch (err) {
      console.error("Download failed:", err);
      alert("Failed to generate PDF report. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="nova-panel p-5 flex flex-col gap-4 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-nova-border pb-4">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-nova-success" />
          <h2 className="font-semibold text-sm uppercase tracking-widest text-nova-muted">
            Response Plan
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {simulation_mode && (
            <span className="text-xs bg-blue-900/40 text-blue-400 border border-blue-700 px-2 py-0.5 rounded-full">
              SIMULATION
            </span>
          )}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="nova-btn-secondary text-xs py-1.5 px-3"
          >
            {downloading ? (
              <div className="w-3 h-3 border border-nova-muted/30 border-t-nova-muted rounded-full animate-spin" />
            ) : (
              <Download size={13} />
            )}
            PDF Report
          </button>
        </div>
      </div>

      {/* Incident Header */}
      <div className="bg-nova-bg rounded-lg p-3 border border-nova-border">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-nova-muted">Incident ID</span>
            <p className="font-mono font-bold text-nova-accent">{incident_id}</p>
          </div>
          <div>
            <span className="text-nova-muted">Input Type</span>
            <p className="font-semibold text-nova-text capitalize">{input_type}</p>
          </div>
          <div className="col-span-2">
            <span className="text-nova-muted">Timestamp</span>
            <p className="font-mono text-nova-text">{new Date(timestamp).toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Disaster Analysis */}
      {disaster && (
        <CollapsibleSection
          title="Disaster Analysis"
          icon={AlertTriangle}
          iconClass="text-nova-accent"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <span className="text-lg font-bold text-nova-text">
                {disaster.disaster_type}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <SeverityBadge level={disaster.severity_level} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Risk Score */}
            <div className="bg-nova-bg rounded p-3 text-center border border-nova-border">
              <div className="text-2xl font-bold text-nova-accent">
                {disaster.risk_score?.toFixed(0)}
              </div>
              <div className="text-xs text-nova-muted mt-0.5">Risk Score / 100</div>
            </div>
            {/* Confidence */}
            <div className="bg-nova-bg rounded p-3 text-center border border-nova-border">
              <div className="text-2xl font-bold text-nova-success">
                {disaster.confidence_score?.toFixed(0)}%
              </div>
              <div className="text-xs text-nova-muted mt-0.5">Confidence</div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <MetricRow
              label="Affected Population"
              value={disaster.estimated_affected_population?.toLocaleString() || "N/A"}
              highlight
            />
            <MetricRow
              label="Affected Area"
              value={`${disaster.affected_area_km2?.toFixed(1) || "N/A"} km²`}
            />
          </div>

          {disaster.geo_risk_assessment && (
            <p className="text-xs text-nova-muted mt-3 leading-relaxed border-t border-nova-border pt-2">
              {disaster.geo_risk_assessment}
            </p>
          )}
        </CollapsibleSection>
      )}

      {/* Medical Plan */}
      {medical && (
        <CollapsibleSection
          title="Medical Resources"
          icon={Users}
          iconClass="text-pink-400"
        >
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-nova-bg rounded p-2.5 text-center border border-nova-border">
              <div className="text-xl font-bold text-pink-400">
                {medical.required_ambulances}
              </div>
              <div className="text-xs text-nova-muted">Ambulances</div>
            </div>
            <div className="bg-nova-bg rounded p-2.5 text-center border border-nova-border">
              <div className="text-xl font-bold text-pink-400">
                {medical.required_doctors}
              </div>
              <div className="text-xs text-nova-muted">Doctors</div>
            </div>
            <div className="bg-nova-bg rounded p-2.5 text-center border border-nova-border">
              <div className="text-xl font-bold text-pink-400">
                {medical.required_nurses}
              </div>
              <div className="text-xs text-nova-muted">Nurses</div>
            </div>
          </div>
          <MetricRow label="Emergency Units" value={medical.emergency_units} />
          <MetricRow label="Blood Units" value={medical.blood_units_needed} />

          {medical.triage_zones?.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-semibold text-nova-muted mb-2 uppercase tracking-wider">
                Triage Zones
              </p>
              <div className="flex flex-col gap-1">
                {medical.triage_zones.map((zone, i) => (
                  <div
                    key={i}
                    className="text-xs text-nova-muted bg-nova-bg rounded px-2.5 py-1.5 border border-nova-border"
                  >
                    {zone}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CollapsibleSection>
      )}

      {/* Logistics Plan */}
      {logistics && (
        <CollapsibleSection
          title="Logistics & Evacuation"
          icon={MapPin}
          iconClass="text-blue-400"
        >
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-nova-bg rounded p-2.5 text-center border border-nova-border">
              <div className="text-xl font-bold text-blue-400">
                {logistics.required_vehicles}
              </div>
              <div className="text-xs text-nova-muted">Vehicles</div>
            </div>
            <div className="bg-nova-bg rounded p-2.5 text-center border border-nova-border">
              <div className="text-xl font-bold text-blue-400">
                {logistics.required_personnel}
              </div>
              <div className="text-xs text-nova-muted">Personnel</div>
            </div>
            <div className="bg-nova-bg rounded p-2.5 text-center border border-nova-border">
              <div className="text-xl font-bold text-blue-400">
                {logistics.estimated_evacuation_time_hours?.toFixed(1)}h
              </div>
              <div className="text-xs text-nova-muted">Evac Time</div>
            </div>
          </div>

          {logistics.evacuation_zones?.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-semibold text-nova-muted mb-2 uppercase tracking-wider">
                Evacuation Zones ({logistics.evacuation_zones.length})
              </p>
              <div className="flex flex-col gap-1.5">
                {logistics.evacuation_zones.slice(0, 3).map((zone, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-xs bg-nova-bg rounded px-2.5 py-2 border border-nova-border"
                  >
                    <MapPin size={11} className="text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-medium text-nova-text">{zone.name}</span>
                      <p className="text-nova-muted">
                        Pop: {zone.population?.toLocaleString()} · Priority:{" "}
                        <span className="text-nova-warning capitalize">{zone.priority}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CollapsibleSection>
      )}

      {/* Communication Plan */}
      {comm && (
        <CollapsibleSection
          title="Communications & Alerts"
          icon={MessageSquare}
          iconClass="text-yellow-400"
        >
          <div className="flex items-center gap-2 mb-3">
            <AlertLevelBadge level={comm.alert_level} />
          </div>

          {comm.public_warning_message && (
            <div className="bg-nova-bg rounded p-3 border border-nova-border mb-3">
              <p className="text-xs font-semibold text-nova-warning mb-1 uppercase tracking-wider">
                Public Warning
              </p>
              <p className="text-xs text-nova-text leading-relaxed">
                {comm.public_warning_message}
              </p>
            </div>
          )}

          {comm.sms_broadcast_content && (
            <div className="bg-nova-bg rounded p-3 border border-nova-border">
              <p className="text-xs font-semibold text-nova-info mb-1 uppercase tracking-wider">
                SMS Broadcast
              </p>
              <p className="text-xs font-mono text-nova-text leading-relaxed">
                {comm.sms_broadcast_content}
              </p>
            </div>
          )}
        </CollapsibleSection>
      )}
    </div>
  );
}
