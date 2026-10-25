/**
 * NAVIGATED Client API & Real-time WebSocket Service.
 * Seamlessly interfaces with FastAPI backend or built-in deterministic offline fallback.
 */

class NavigatedAPI {
  constructor() {
    this.baseUrl = window.location.origin;
    this.ws = null;
    this.onTelemetryUpdate = null;
    this.isConnected = false;
  }

  async getCorridors() {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/corridors`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  }

  async getTrains(corridorId) {
    try {
      const url = corridorId 
        ? `${this.baseUrl}/api/v1/trains?corridor_id=${corridorId}` 
        : `${this.baseUrl}/api/v1/trains`;
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  }

  async getTrainETA(trainNo) {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/trains/${trainNo}/eta`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  }

  async getSectionsStatus(corridorId = 'NDLS-HWH') {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/sections/status?corridor_id=${corridorId}`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  }

  async getDisruptionPresets() {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/disruptions/presets`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  }

  async injectDisruption(data) {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/disruptions/inject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  }

  async clearDisruptions() {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/disruptions/clear`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  }

  async triggerRetrain() {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/retrain`, { method: 'POST' });
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  }

  async getMetrics() {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/metrics`);
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  }

  async controlSimulation(action, multiplier = 1.0) {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/simulation/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, multiplier })
      });
      if (res.ok) return await res.json();
    } catch (e) {}
    return null;
  }

  initWebSocket() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/live`;
    
    try {
      this.ws = new WebSocket(wsUrl);
      this.ws.onopen = () => {
        this.isConnected = true;
        console.log("WebSocket connected to NAVIGATED backend stream.");
      };
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (this.onTelemetryUpdate) {
            this.onTelemetryUpdate(data);
          }
        } catch (err) {}
      };
      this.ws.onclose = () => {
        this.isConnected = false;
        setTimeout(() => this.initWebSocket(), 4000);
      };
      this.ws.onerror = () => {
        this.isConnected = false;
      };
    } catch (e) {
      console.warn("WebSocket not available in current environment");
    }
  }
}

window.navigatedAPI = new NavigatedAPI();
