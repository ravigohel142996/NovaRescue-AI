# NovaRescue AI 🚨

**Multi-Agent Emergency Disaster Response System powered by Amazon Nova on AWS**

NovaRescue AI is a production-ready, enterprise-grade emergency coordination platform that uses multiple AI agents to analyze disasters, plan medical resources, coordinate logistics, and generate public alerts — all in real time.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                      NovaRescue AI                              │
│                                                                 │
│  ┌──────────────┐    ┌──────────────────────────────────────┐  │
│  │   Frontend   │    │            Backend (FastAPI)         │  │
│  │  React +     │───▶│                                      │  │
│  │  Tailwind    │    │  ┌─────────────────────────────────┐ │  │
│  │  Dashboard   │◀───│  │      Agent Orchestrator         │ │  │
│  └──────────────┘    │  │                                 │ │  │
│                      │  │  Disaster │ Medical │ Logistics │ │  │
│                      │  │  Agent    │ Agent   │ Agent     │ │  │
│                      │  │           │         │           │ │  │
│                      │  │           │ Communication Agent │ │  │
│                      │  └─────────────────────────────────┘ │  │
│                      │  Nova Wrapper (Bedrock) | S3 Service │  │
│                      └──────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                    Amazon Bedrock | AWS S3
```

---

## Project Structure

```
NovaRescue-AI/
├── backend/
│   ├── main.py                    # FastAPI entry point
│   ├── requirements.txt
│   ├── agents/
│   │   ├── disaster_agent.py      # Disaster Analysis Agent
│   │   ├── medical_agent.py       # Medical Resource Planning Agent
│   │   ├── logistics_agent.py     # Logistics & Evacuation Agent
│   │   ├── communication_agent.py # Communication & Alert Agent
│   │   └── orchestrator.py        # Multi-agent orchestrator
│   ├── routes/
│   │   ├── analysis.py            # Disaster analysis endpoints
│   │   └── health.py              # Health check endpoints
│   ├── services/
│   │   ├── nova_wrapper.py        # Amazon Nova API wrapper
│   │   └── s3_service.py          # AWS S3 file service
│   ├── models/
│   │   ├── request_models.py      # Pydantic request schemas
│   │   └── response_models.py     # Pydantic response schemas
│   └── utils/
│       ├── logger.py              # Structured logging
│       ├── helpers.py             # Utility functions
│       └── pdf_generator.py       # PDF report generator
├── frontend/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── public/index.html
│   └── src/
│       ├── App.jsx
│       ├── index.js
│       ├── components/
│       │   ├── Dashboard.jsx      # Main dashboard layout
│       │   ├── InputPanel.jsx     # Text/Image/Voice input
│       │   ├── AgentStatus.jsx    # Agent execution visualization
│       │   ├── ResponsePlan.jsx   # Response plan display
│       │   ├── ResourceCharts.jsx # Analytics charts
│       │   └── VoiceSummary.jsx   # TTS voice summary
│       ├── services/api.js        # API client
│       └── styles/index.css       # Global styles + Tailwind
├── .env.example
├── .gitignore
└── README.md
```

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- AWS account (optional — simulation mode works without credentials)

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/macOS
pip install -r requirements.txt
cp ../.env.example .env
# Edit .env — set SIMULATION_MODE=true for demo
python main.py
# API docs: http://localhost:8000/api/docs
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm start
# Opens at http://localhost:3000
```

---

## Configuration

Copy `.env.example` to `backend/.env`:

| Variable | Description | Default |
|----------|-------------|---------|
| `AWS_ACCESS_KEY_ID` | AWS credentials | — |
| `AWS_SECRET_ACCESS_KEY` | AWS credentials | — |
| `BEDROCK_REGION` | AWS region for Bedrock | `us-east-1` |
| `NOVA_LITE_MODEL_ID` | Nova model ID | `amazon.nova-lite-v1:0` |
| `S3_BUCKET_NAME` | S3 bucket for uploads | `novarescue-uploads` |
| `SIMULATION_MODE` | Demo without AWS | `true` |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Basic health check |
| GET | `/api/health/detailed` | Detailed system status |
| POST | `/api/analyze/text` | Analyze from text description |
| POST | `/api/analyze/image` | Analyze from image upload |
| POST | `/api/analyze/voice` | Analyze from voice recording |
| POST | `/api/report/download` | Download PDF incident report |

---

## AI Agents

| Agent | Responsibility | Output |
|-------|---------------|--------|
| **Disaster Analysis** | Type, severity, risk score | `disaster_type`, `severity_level`, `risk_score` |
| **Medical Resource** | Ambulances, doctors, hospitals | `required_ambulances`, `hospital_distribution` |
| **Logistics & Evacuation** | Routes, rescue zones, supplies | `evacuation_zones`, `rescue_priority_map` |
| **Communication & Alert** | Authority/public alerts | `authority_alert_message`, `sms_broadcast_content` |

---

## Simulation Mode

Run without AWS credentials for demos:

```env
SIMULATION_MODE=true
```

All agents return realistic pre-defined data. Full UI functionality preserved.

---

## Demo Script (3-Minute Hackathon)

1. **[0:00-0:20]** Introduce NovaRescue AI and its 4 agents
2. **[0:20-0:50]** Type disaster description, click "Deploy Response"
3. **[0:50-1:30]** Watch agents execute in real-time on the dashboard
4. **[1:30-2:10]** Review the complete response plan (medical, logistics, alerts)
5. **[2:10-2:40]** Show resource analytics charts, download PDF report
6. **[2:40-3:00]** Play voice summary, closing statement

---

## Technologies

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Tailwind CSS, Recharts |
| Backend | Python FastAPI, Uvicorn |
| AI Models | Amazon Nova Lite/Pro (Bedrock) |
| Storage | AWS S3 |
| PDF Reports | ReportLab |

---

## License

MIT License — Built for AWS Hackathon using Amazon Nova Foundation Models.
