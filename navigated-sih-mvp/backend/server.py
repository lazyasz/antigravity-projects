"""
FastAPI Server & Real-time WebSocket Streaming Engine for NAVIGATED (SIH26028 MVP)
"""

import os
import json
import asyncio
from typing import Dict, List, Any, Optional
from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from .data import CORRIDORS, TRAINS, DISRUPTION_PRESETS
from .ml_engine import ml_engine

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"

app = FastAPI(
    title="NAVIGATED - Dynamic Coaching Train ETA Engine API",
    description="AI-driven section-wise dynamic ETA forecasting engine with uncertainty bands for Indian Railways (SIH 2026 - Problem Statement SIH26028).",
    version="2.4.1"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory runtime state of trains (allows real-time telemetry animation)
runtime_trains = [dict(t) for t in TRAINS]
simulation_speed_multiplier = 1.0
simulation_paused = False

class DisruptionInjectRequest(BaseModel):
    section_id: str
    title: str
    type: str
    severity: str
    description: str
    impact_factor: float = 1.5
    speed_cap_kmh: Optional[float] = 50.0

class FeedbackRecordRequest(BaseModel):
    train_no: str
    station: str
    predicted_delay: float
    actual_delay: float

class SimulationControlRequest(BaseModel):
    action: str # "play", "pause", "speed", "reset", "advance_step"
    multiplier: Optional[float] = 1.0

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()

# Background simulation loop
async def simulation_background_worker():
    global runtime_trains, simulation_speed_multiplier, simulation_paused
    while True:
        try:
            if not simulation_paused:
                for train in runtime_trains:
                    st = train["current_status"]
                    corridor_id = train["corridor_id"]
                    corridor = CORRIDORS.get(corridor_id)
                    if not corridor:
                        continue
                    
                    # Section lookups
                    sec_id = st["current_section_id"]
                    sections = corridor["sections"]
                    sec = next((s for s in sections if s["id"] == sec_id), sections[0])
                    
                    # Adjust speed based on section and active disruption
                    sec_pred = ml_engine.compute_section_running_time(sec, train, st["scheduled_delay_min"], 1)
                    speed_kmh = sec_pred["effective_speed_kmh"]
                    st["current_speed_kmh"] = speed_kmh
                    
                    # Update progress
                    km_increment = (speed_kmh / 3600.0) * (2.0 * simulation_speed_multiplier)
                    st["current_km"] = round(st["current_km"] + km_increment, 2)
                    
                    # Progress inside section
                    sec_len = sec["length_km"]
                    progress = min(100.0, st["progress_percent_in_section"] + (km_increment / sec_len) * 100.0)
                    
                    if progress >= 100.0:
                        # Move to next section
                        sec_idx = sections.index(sec)
                        if sec_idx + 1 < len(sections):
                            next_sec = sections[sec_idx + 1]
                            st["current_section_id"] = next_sec["id"]
                            st["progress_percent_in_section"] = 0.0
                            
                            # Random signal aspect cycling
                            st["signal_aspect"] = "GREEN" if sec_idx % 2 == 0 else "DOUBLE_YELLOW"
                            st["signaling_block_id"] = f"BLK-NCR-{int(st['current_km'])}"
                            
                            # Log simulated arrival feedback occasionally
                            ml_engine.record_feedback(
                                train["train_no"],
                                sec["to"],
                                st["scheduled_delay_min"],
                                round(st["scheduled_delay_min"] + (0.5 if sec_pred["disruption_active"] else -0.2), 1)
                            )
                        else:
                            st["progress_percent_in_section"] = 100.0
                    else:
                        st["progress_percent_in_section"] = round(progress, 1)

                    st["last_ping_seconds_ago"] = 1

                # Broadcast live state to all open WebSockets
                if manager.active_connections:
                    payload = {
                        "type": "TELEMETRY_UPDATE",
                        "timestamp": ml_engine.last_retrained_at,
                        "disruptions_active_count": len(ml_engine.active_disruptions),
                        "trains": runtime_trains
                    }
                    await manager.broadcast(payload)

        except Exception as e:
            print(f"Simulation worker error: {e}")

        await asyncio.sleep(2.0)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(simulation_background_worker())

# ----------------- REST API ENDPOINTS -----------------

@app.get("/api/v1/health")
def get_health():
    return {
        "status": "HEALTHY",
        "service": "NAVIGATED Dynamic ETA Engine",
        "version": ml_engine.model_version,
        "active_trains": len(runtime_trains),
        "active_disruptions": len(ml_engine.active_disruptions)
    }

@app.get("/api/v1/corridors")
def list_corridors():
    return list(CORRIDORS.values())

@app.get("/api/v1/trains")
def list_trains(corridor_id: Optional[str] = None):
    if corridor_id:
        return [t for t in runtime_trains if t["corridor_id"] == corridor_id]
    return runtime_trains

@app.get("/api/v1/trains/{train_no}")
def get_train_details(train_no: str):
    train = next((t for t in runtime_trains if t["train_no"] == train_no), None)
    if not train:
        raise HTTPException(status_code=404, detail="Train not found")
    return train

@app.get("/api/v1/trains/{train_no}/eta")
def get_train_dynamic_eta(train_no: str):
    train = next((t for t in runtime_trains if t["train_no"] == train_no), None)
    if not train:
        raise HTTPException(status_code=404, detail="Train not found")
    
    corridor = CORRIDORS.get(train["corridor_id"])
    if not corridor:
        raise HTTPException(status_code=500, detail="Corridor data missing")

    forecast = ml_engine.predict_train_full_journey(train, corridor)
    return forecast

@app.get("/api/v1/sections/status")
def get_corridor_sections(corridor_id: str = "NDLS-HWH"):
    corridor = CORRIDORS.get(corridor_id)
    if not corridor:
        raise HTTPException(status_code=404, detail="Corridor not found")

    sections_with_status = []
    for s in corridor["sections"]:
        sec_copy = dict(s)
        sec_id = s["id"]
        # Check active trains in this section
        trains_in_sec = [t["train_no"] for t in runtime_trains if t["current_status"]["current_section_id"] == sec_id]
        disruption = ml_engine.active_disruptions.get(sec_id)
        
        sec_copy["occupancy_count"] = len(trains_in_sec)
        sec_copy["active_trains"] = trains_in_sec
        sec_copy["disruption"] = disruption
        sec_copy["status"] = "DISRUPTED" if disruption else ("CONGESTED" if len(trains_in_sec) > 1 else "NORMAL")
        sections_with_status.append(sec_copy)

    return {
        "corridor_id": corridor_id,
        "corridor_name": corridor["name"],
        "sections": sections_with_status
    }

@app.get("/api/v1/disruptions/presets")
def get_disruption_presets():
    return DISRUPTION_PRESETS

@app.get("/api/v1/disruptions/active")
def get_active_disruptions():
    return ml_engine.active_disruptions

@app.post("/api/v1/disruptions/inject")
def inject_disruption(payload: DisruptionInjectRequest):
    ml_engine.inject_disruption(payload.dict())
    return {
        "status": "DISRUPTION_INJECTED",
        "section_id": payload.section_id,
        "active_disruptions": ml_engine.active_disruptions
    }

@app.post("/api/v1/disruptions/clear")
def clear_all_disruptions():
    ml_engine.clear_disruptions()
    return {
        "status": "ALL_DISRUPTIONS_CLEARED",
        "active_disruptions_count": 0
    }

@app.post("/api/v1/feedback/record")
def record_feedback(payload: FeedbackRecordRequest):
    res = ml_engine.record_feedback(
        train_no=payload.train_no,
        station=payload.station,
        predicted_delay=payload.predicted_delay,
        actual_delay=payload.actual_delay
    )
    return {
        "status": "FEEDBACK_LOGGED",
        "entry": res
    }

@app.post("/api/v1/retrain")
def trigger_retrain():
    res = ml_engine.trigger_model_retrain()
    return res

@app.get("/api/v1/metrics")
def get_metrics():
    return ml_engine.get_system_metrics()

@app.post("/api/v1/simulation/control")
def control_simulation(payload: SimulationControlRequest):
    global simulation_speed_multiplier, simulation_paused, runtime_trains
    if payload.action == "pause":
        simulation_paused = True
    elif payload.action == "play":
        simulation_paused = False
    elif payload.action == "speed":
        if payload.multiplier:
            simulation_speed_multiplier = float(payload.multiplier)
    elif payload.action == "reset":
        runtime_trains = [dict(t) for t in TRAINS]
        ml_engine.clear_disruptions()
    
    return {
        "action": payload.action,
        "paused": simulation_paused,
        "speed_multiplier": simulation_speed_multiplier
    }

# WebSocket Endpoint
@app.websocket("/ws/live")
async def websocket_live_stream(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send initial state immediately
        await websocket.send_json({
            "type": "INITIAL_STATE",
            "model_version": ml_engine.model_version,
            "trains": runtime_trains,
            "disruptions": ml_engine.active_disruptions
        })
        while True:
            # Keep alive and listen for client commands
            data = await websocket.receive_text()
            # Respond to client ping or message
            try:
                msg = json.loads(data)
                if msg.get("action") == "PING":
                    await websocket.send_json({"type": "PONG"})
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)

# ----------------- STATIC ASSETS & SINGLE PAGE APP -----------------

if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")

@app.get("/{full_path:path}")
def serve_spa(full_path: str):
    # Check if a specific file is requested in frontend dir
    file_path = FRONTEND_DIR / full_path
    if file_path.is_file():
        return FileResponse(file_path)
    # Default to index.html
    index_file = FRONTEND_DIR / "index.html"
    if index_file.is_file():
        return FileResponse(index_file)
    return JSONResponse(status_code=404, content={"message": "Frontend index.html not found"})
