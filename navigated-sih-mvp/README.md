# NAVIGATED — Dynamic Forecast of Expected Time of Arrival (ETA) for Coaching Trains

**Smart India Hackathon 2026**  
**Problem Statement ID:** `SIH26028`  
**Theme:** Smart Automation | **Category:** Software  
**Team Name:** NAVIGATED  

---

## 🌟 Executive Summary

Conventional Indian Railway coaching train tracking (NTES) relies on static timetable logic or coarse linear extrapolation between sporadic station checkpoints. It fails to account for section-level dynamics, seasonal winter fog along river basins, signal interlocking priorities, and headway train bunching.

**NAVIGATED** is an AI-driven dynamic forecasting engine that:
1. **Decomposes journeys** into high-resolution inter-station physical blocks.
2. **Fuses multi-source telemetry** (GPS/RFID, signal interlocking, weather index, track caution orders, gradient/curvature).
3. **Employs a Hybrid ML Ensemble** (Gradient Boosted Trees + Bi-LSTM Delay Propagation).
4. **Calculates continuous dynamic ETAs with uncertainty bands** (e.g. `9:08 AM ± 4 min`, High/Medium confidence).
5. **Continuous Self-Learning Loop**: Compares predicted vs. actual arrivals to retrain and improve accuracy over time.

---

## 🚀 Key Modules & UI Features

- 🚆 **Passenger Live Portal**:
  - Live Coaching Train selector (12301 Howrah Rajdhani, 22436 Vande Bharat, 12004 Shatabdi, 12802 Purushottam Exp).
  - Continuous dynamic ETA with $\pm$ confidence bands.
  - Section-level weather & fog advisory alerts.
  - Connecting cab & feeder protection status.
- 🎛️ **Railway Traffic Control Room (Section Controller Desk)**:
  - Interactive SVG schematic corridor visualizer with automatic block signaling lamps.
  - Train bunching radar & headway clash prevention.
  - Top corridor delay hotspot bars.
- ⚡ **Disruption & What-If Sandbox**:
  - 1-click incident injections: Dense Winter Fog in Yamuna basin, Track Renewal caution order at Mirzapur, Freight loop blockage, Signal aspect failures.
  - Simulation time accelerator ($1\times, 5\times, 15\times$).
- 🧠 **AI/ML Engine & Feedback Calibration**:
  - Real-time MAE error reduction tracking ($15.6 \text{ min} \rightarrow 1.8 \text{ min}$).
  - Feature importance radar chart.
  - Error residual distribution histogram.
  - 1-click automated closed-loop retraining trigger.
- 🔌 **Dynamic ETA Open API Hub**:
  - REST & WebSocket endpoints ready for plug-and-play integration with NTES and Rail Madad.

---

## 🛠️ How to Run

### Prerequisites
- Python 3.10+ (Python 3.14 recommended)
- Standard packages: `fastapi`, `uvicorn`, `websockets` (already installed)

### Quick Start
Run from PowerShell or Command Prompt:

```powershell
# Navigate to project directory
cd C:\Users\dhruv\.gemini\antigravity-ide\scratch\navigated-sih-mvp

# Run with Python
py run_app.py
```
Or double click `start.bat` / run `./start.ps1`.

The application will start on `http://127.0.0.1:8000` and automatically open your default browser.

---

## 📡 Key REST API Endpoints

- `GET /api/v1/trains` — Active coaching train fleet status
- `GET /api/v1/trains/{train_no}/eta` — Section-level dynamic ETA forecast & confidence interval
- `GET /api/v1/sections/status` — Real-time block occupancy and active caution orders
- `POST /api/v1/disruptions/inject` — Inject What-If scenario (fog, maintenance, signal failure)
- `POST /api/v1/retrain` — Execute closed-loop automated retraining
- `WS /ws/live` — Real-time telemetry streaming socket
