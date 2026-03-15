const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const randomBetween = (min, max) => Math.round(Math.random() * (max - min) + min);

export async function buildDemoAnalysis({ mode, description, location, simulationMode }) {
  // Small artificial delay so pipeline animation still feels intentional.
  await delay(1800);

  const incidentId = `SIM-${Date.now().toString().slice(-8)}`;
  const now = new Date().toISOString();

  return {
    incident_id: incidentId,
    timestamp: now,
    input_type: mode,
    simulation_mode: simulationMode ?? true,
    disaster_analysis: {
      disaster_type: "Flood",
      severity_level: "high",
      confidence_score: randomBetween(83, 96),
      risk_score: randomBetween(74, 92),
      affected_area_km2: 42.7,
      estimated_affected_population: randomBetween(11000, 17000),
      geo_risk_assessment:
        "River-side zones are under active overflow pressure. Critical roads are partially submerged.",
      infrastructure_damage_estimate:
        "Localized bridge stress and grid downtime in multiple neighborhoods; water pumps overloaded.",
      casualty_probability:
        "Highest casualty risk in low-lying settlements, elderly dense blocks, and night-time transit corridors.",
    },
    medical_plan: {
      required_ambulances: randomBetween(20, 42),
      required_doctors: randomBetween(32, 55),
      required_nurses: randomBetween(58, 90),
      emergency_units: randomBetween(8, 16),
      blood_units_needed: randomBetween(120, 220),
      hospital_distribution: [
        { hospital: "City Civil Hospital", beds_allocated: 120, trauma_units: 24 },
        { hospital: "Riverbank Medical Center", beds_allocated: 75, trauma_units: 16 },
      ],
      triage_zones: ["North School Ground", "Metro Junction", "Community Hall Sector-7"],
      medical_priority: "Critical cases and water-borne risk patients first",
    },
    logistics_plan: {
      evacuation_zones: [
        { name: "Zone A - Riverside", population: 5200, priority: "critical" },
        { name: "Zone B - Old Market", population: 3100, priority: "high" },
        { name: "Zone C - Bus Depot", population: 1800, priority: "immediate" },
      ],
      rescue_priority_map: [
        { area: "Riverside", priority: 1, rationale: "Rising water in dense housing" },
        { area: "Old Market", priority: 2, rationale: "Blocked roads and crowd concentration" },
      ],
      supply_distribution_plan: [
        { item: "Rescue Boats", priority: "critical" },
        { item: "Water Purification Kits", priority: "critical" },
        { item: "Emergency Medical Kits", priority: "immediate" },
        { item: "Temporary Shelter Tents", priority: "high" },
      ],
      required_vehicles: randomBetween(25, 48),
      required_personnel: randomBetween(160, 240),
      estimated_evacuation_time_hours: 6.5,
      safe_zones: ["Stadium Ground", "District Polytechnic", "Sector-4 Shelter Hub"],
    },
    communication_plan: {
      authority_alert_message: `URGENT: Multi-zone flooding escalation in ${location || "target region"}. Activate emergency protocol Alpha and deploy mobile units now.`,
      public_warning_message:
        "Move to nearest marked shelter, avoid underpasses, carry basic medication, and keep emergency numbers reachable.",
      sms_broadcast_content:
        "NovaRescue Alert: Flood emergency in your area. Evacuate to nearest safe zone and follow local authority guidance.",
      emergency_contacts: [
        { department: "Disaster Control Room", number: "1070" },
        { department: "Medical Helpline", number: "108" },
      ],
      media_statement:
        "Response teams are active across all affected sectors. Citizens are requested to remain calm and cooperate with evacuation marshals.",
      alert_level: "red",
    },
    agent_results: [
      { agent_name: "Disaster Analysis Agent", status: "completed", execution_time_ms: 960 },
      { agent_name: "Medical Resource Agent", status: "completed", execution_time_ms: 1015 },
      { agent_name: "Logistics & Evacuation Agent", status: "completed", execution_time_ms: 1090 },
      { agent_name: "Communication Alert Agent", status: "completed", execution_time_ms: 910 },
    ],
    voice_summary: `Emergency update for ${location || "the affected region"}: ${description || "Flood impact detected"}. Multi-agent response plan generated and ready for operations.`,
    total_execution_time_ms: 3975,
    status: "completed",
  };
}
