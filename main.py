from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio

app = FastAPI(title="NovaRescue AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "NovaRescue backend running"}


@app.post("/api/analyze-disaster")
async def analyze(data: dict):
    description = data.get("description")
    location = data.get("location")

    await asyncio.sleep(1)

    return {
        "disaster_type": "Flood",
        "severity": "Critical",
        "location": location,
        "summary": f"Major flooding detected: {description}",
        "response_plan": {
            "ambulances": 10,
            "evacuation_zones": ["Zone A", "Zone B"],
            "alert": "Evacuate low-lying areas immediately",
        },
    }
