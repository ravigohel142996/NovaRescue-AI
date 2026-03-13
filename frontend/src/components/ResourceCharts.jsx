/**
 * ResourceCharts Component
 * Visualizes medical resources, evacuation data, and risk metrics
 */

import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const CHART_COLORS = {
  accent: "#CC0000",
  success: "#10B981",
  warning: "#F59E0B",
  info: "#3B82F6",
  pink: "#EC4899",
  purple: "#8B5CF6",
};

function ChartCard({ title, children }) {
  return (
    <div className="nova-panel p-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-nova-muted mb-4">
        {title}
      </h3>
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-nova-panel border border-nova-border rounded-lg p-2.5 shadow-nova-panel">
        {label && <p className="text-xs text-nova-muted mb-1">{label}</p>}
        {payload.map((entry, i) => (
          <p key={i} className="text-xs font-mono font-semibold" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
}

export default function ResourceCharts({ analysisData }) {
  if (!analysisData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {["Medical Resources", "Evacuation Zones", "Risk Assessment"].map((title) => (
          <ChartCard key={title} title={title}>
            <div className="h-40 flex items-center justify-center">
              <p className="text-xs text-nova-muted">No data available</p>
            </div>
          </ChartCard>
        ))}
      </div>
    );
  }

  const { disaster_analysis: disaster, medical_plan: medical, logistics_plan: logistics } = analysisData;

  // Medical resource bar chart data
  const medicalData = medical
    ? [
        { name: "Ambulances", value: medical.required_ambulances, fill: CHART_COLORS.accent },
        { name: "Doctors", value: medical.required_doctors, fill: CHART_COLORS.pink },
        { name: "Nurses", value: medical.required_nurses, fill: CHART_COLORS.purple },
        { name: "Emerg. Units", value: medical.emergency_units, fill: CHART_COLORS.warning },
      ]
    : [];

  // Evacuation zones pie chart
  const evacData = logistics?.evacuation_zones?.map((z) => ({
    name: z.name.length > 18 ? z.name.substring(0, 18) + "..." : z.name,
    value: z.population || 0,
    priority: z.priority,
  })) || [];

  const PIE_COLORS = [
    CHART_COLORS.accent,
    CHART_COLORS.warning,
    CHART_COLORS.info,
    CHART_COLORS.success,
    CHART_COLORS.purple,
  ];

  // Risk score gauge data
  const riskScore = disaster?.risk_score || 0;
  const confidenceScore = disaster?.confidence_score || 0;
  const gaugeData = [
    { name: "Risk", value: riskScore, fill: CHART_COLORS.accent },
    { name: "Confidence", value: confidenceScore, fill: CHART_COLORS.success },
  ];

  // Supply distribution
  const supplyData = logistics?.supply_distribution_plan?.slice(0, 5).map((s) => ({
    name: s.item.length > 16 ? s.item.substring(0, 16) + "..." : s.item,
    priority: s.priority === "critical" ? 4 : s.priority === "immediate" ? 3 : s.priority === "high" ? 2 : 1,
    fill:
      s.priority === "critical"
        ? CHART_COLORS.accent
        : s.priority === "immediate"
        ? CHART_COLORS.warning
        : CHART_COLORS.info,
  })) || [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Medical Resources Chart */}
      <ChartCard title="Medical Resources">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={medicalData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E2030" />
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#94A3B8" }} />
            <YAxis tick={{ fontSize: 9, fill: "#94A3B8" }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" name="Required">
              {medicalData.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Affected Population by Zone */}
      <ChartCard title="Population by Evacuation Zone">
        {evacData.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={evacData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {evacData.map((_, index) => (
                  <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => (
                  <span style={{ color: "#94A3B8", fontSize: "9px" }}>{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-40 flex items-center justify-center">
            <p className="text-xs text-nova-muted">No zone data</p>
          </div>
        )}
      </ChartCard>

      {/* Risk Assessment Gauge */}
      <ChartCard title="Risk & Confidence Scores">
        <ResponsiveContainer width="100%" height={180}>
          <RadialBarChart
            cx="50%"
            cy="60%"
            innerRadius="30%"
            outerRadius="80%"
            data={gaugeData}
            startAngle={180}
            endAngle={0}
          >
            <RadialBar
              minAngle={15}
              dataKey="value"
              cornerRadius={4}
            />
            <Tooltip
              content={<CustomTooltip />}
              formatter={(value) => [`${value.toFixed(1)}`, ""]}
            />
            <Legend
              iconSize={8}
              formatter={(value) => (
                <span style={{ color: "#94A3B8", fontSize: "10px" }}>{value}</span>
              )}
            />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="grid grid-cols-2 gap-2 mt-2">
          <div className="text-center">
            <div className="text-xl font-bold text-nova-accent">{riskScore.toFixed(0)}</div>
            <div className="text-xs text-nova-muted">Risk Score</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-nova-success">{confidenceScore.toFixed(0)}%</div>
            <div className="text-xs text-nova-muted">Confidence</div>
          </div>
        </div>
      </ChartCard>

      {/* Supply Priority Chart */}
      <ChartCard title="Supply Priority Distribution">
        {supplyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={supplyData}
              layout="vertical"
              margin={{ top: 5, right: 5, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1E2030" horizontal={false} />
              <XAxis
                type="number"
                domain={[0, 4]}
                tick={{ fontSize: 9, fill: "#94A3B8" }}
                tickFormatter={(v) => ["", "Low", "High", "Immed", "Crit"][v] || v}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 9, fill: "#94A3B8" }}
                width={70}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="priority" name="Priority Level">
                {supplyData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-40 flex items-center justify-center">
            <p className="text-xs text-nova-muted">No supply data</p>
          </div>
        )}
      </ChartCard>
    </div>
  );
}
