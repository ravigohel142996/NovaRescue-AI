"""
PDF Report Generator for NovaRescue AI.

Generates formatted incident response reports as PDF files.
"""

from io import BytesIO
from typing import Any, Dict

from utils.logger import setup_logger

logger = setup_logger(__name__)


def generate_incident_pdf(analysis_data: Dict[str, Any]) -> bytes:
    """
    Generate a PDF incident report from analysis data.

    Args:
        analysis_data: Full analysis result dict

    Returns:
        PDF content as bytes
    """
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import letter
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.platypus import (
            SimpleDocTemplate,
            Paragraph,
            Spacer,
            Table,
            TableStyle,
            HRFlowable,
        )
    except ImportError:
        logger.error("reportlab not installed. Install with: pip install reportlab")
        raise

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch,
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        "NovaTitle",
        parent=styles["Title"],
        fontSize=20,
        textColor=colors.HexColor("#CC0000"),
        spaceAfter=6,
    )
    heading_style = ParagraphStyle(
        "NovaHeading",
        parent=styles["Heading2"],
        fontSize=13,
        textColor=colors.HexColor("#1A1A2E"),
        spaceBefore=12,
        spaceAfter=4,
    )
    normal_style = styles["Normal"]
    normal_style.fontSize = 10

    story = []

    # --- Header ---
    story.append(Paragraph("🚨 NovaRescue AI — Incident Response Report", title_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#CC0000")))
    story.append(Spacer(1, 0.1 * inch))

    incident_id = analysis_data.get("incident_id", "N/A")
    timestamp = analysis_data.get("timestamp", "N/A")
    input_type = analysis_data.get("input_type", "N/A").capitalize()
    sim_mode = "Yes" if analysis_data.get("simulation_mode") else "No"

    meta_data = [
        ["Incident ID", incident_id, "Timestamp", timestamp],
        ["Input Type", input_type, "Simulation Mode", sim_mode],
    ]
    meta_table = Table(meta_data, colWidths=[1.2 * inch, 2.5 * inch, 1.2 * inch, 2.5 * inch])
    meta_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#F5F5F5")),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
                ("PADDING", (0, 0), (-1, -1), 4),
            ]
        )
    )
    story.append(meta_table)
    story.append(Spacer(1, 0.2 * inch))

    # --- Disaster Analysis ---
    disaster = analysis_data.get("disaster_analysis", {})
    if disaster:
        story.append(Paragraph("1. Disaster Analysis", heading_style))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CCCCCC")))

        d_data = [
            ["Disaster Type", disaster.get("disaster_type", "N/A")],
            ["Severity Level", disaster.get("severity_level", "N/A").upper()],
            ["Risk Score", f"{disaster.get('risk_score', 0):.1f} / 100"],
            ["Confidence Score", f"{disaster.get('confidence_score', 0):.1f}%"],
            ["Affected Population", f"{disaster.get('estimated_affected_population', 0):,}"],
            ["Affected Area", f"{disaster.get('affected_area_km2', 0):.1f} km²"],
        ]
        d_table = Table(d_data, colWidths=[2.2 * inch, 5.3 * inch])
        d_table.setStyle(
            TableStyle(
                [
                    ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#F9F9F9")]),
                    ("PADDING", (0, 0), (-1, -1), 5),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                ]
            )
        )
        story.append(d_table)

        geo = disaster.get("geo_risk_assessment", "")
        if geo:
            story.append(Spacer(1, 0.05 * inch))
            story.append(Paragraph(f"<b>Geo Risk Assessment:</b> {geo}", normal_style))

        casualty = disaster.get("casualty_probability", "")
        if casualty:
            story.append(Spacer(1, 0.05 * inch))
            story.append(Paragraph(f"<b>Casualty Probability:</b> {casualty}", normal_style))

        story.append(Spacer(1, 0.15 * inch))

    # --- Medical Plan ---
    medical = analysis_data.get("medical_plan", {})
    if medical:
        story.append(Paragraph("2. Medical Resource Plan", heading_style))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CCCCCC")))

        m_data = [
            ["Ambulances Required", str(medical.get("required_ambulances", 0))],
            ["Doctors Required", str(medical.get("required_doctors", 0))],
            ["Nurses Required", str(medical.get("required_nurses", 0))],
            ["Emergency Units", str(medical.get("emergency_units", 0))],
            ["Blood Units Needed", str(medical.get("blood_units_needed", 0))],
        ]
        m_table = Table(m_data, colWidths=[2.2 * inch, 5.3 * inch])
        m_table.setStyle(
            TableStyle(
                [
                    ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#F9F9F9")]),
                    ("PADDING", (0, 0), (-1, -1), 5),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                ]
            )
        )
        story.append(m_table)
        story.append(Spacer(1, 0.15 * inch))

    # --- Logistics Plan ---
    logistics = analysis_data.get("logistics_plan", {})
    if logistics:
        story.append(Paragraph("3. Logistics & Evacuation Plan", heading_style))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CCCCCC")))

        l_data = [
            ["Required Vehicles", str(logistics.get("required_vehicles", 0))],
            ["Required Personnel", str(logistics.get("required_personnel", 0))],
            ["Evacuation Time", f"{logistics.get('estimated_evacuation_time_hours', 0):.1f} hours"],
        ]
        l_table = Table(l_data, colWidths=[2.2 * inch, 5.3 * inch])
        l_table.setStyle(
            TableStyle(
                [
                    ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
                    ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                    ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, colors.HexColor("#F9F9F9")]),
                    ("PADDING", (0, 0), (-1, -1), 5),
                    ("FONTSIZE", (0, 0), (-1, -1), 9),
                ]
            )
        )
        story.append(l_table)
        story.append(Spacer(1, 0.15 * inch))

    # --- Communication Plan ---
    comm = analysis_data.get("communication_plan", {})
    if comm:
        story.append(Paragraph("4. Communications & Alerts", heading_style))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CCCCCC")))

        alert_level = comm.get("alert_level", "N/A").upper()
        story.append(Paragraph(f"<b>Alert Level:</b> {alert_level}", normal_style))
        story.append(Spacer(1, 0.05 * inch))

        public_msg = comm.get("public_warning_message", "")
        if public_msg:
            story.append(Paragraph(f"<b>Public Warning:</b> {public_msg}", normal_style))
            story.append(Spacer(1, 0.05 * inch))

        sms = comm.get("sms_broadcast_content", "")
        if sms:
            story.append(Paragraph(f"<b>SMS Broadcast:</b> {sms}", normal_style))

        story.append(Spacer(1, 0.15 * inch))

    # --- Footer ---
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CC0000")))
    story.append(Spacer(1, 0.05 * inch))
    story.append(
        Paragraph(
            "Generated by NovaRescue AI | Powered by Amazon Nova on AWS Bedrock | "
            "This report is auto-generated for emergency response coordination.",
            ParagraphStyle("Footer", parent=normal_style, fontSize=8, textColor=colors.grey),
        )
    )

    doc.build(story)
    return buffer.getvalue()
