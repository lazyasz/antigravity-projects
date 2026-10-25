"""
NAVIGATED SIH26028 Application Launcher.
Starts FastAPI backend server using Uvicorn and opens the browser.
"""

import sys
import os
import webbrowser
import time
from pathlib import Path

# Add current directory to path
current_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(current_dir))

import uvicorn

def main():
    port = 8000
    host = "127.0.0.1"
    url = f"http://{host}:{port}"
    
    print("=" * 70)
    print("  NAVIGATED - Dynamic Forecast of ETA for Coaching Trains")
    print("  Smart India Hackathon 2026 | Problem Statement ID: SIH26028")
    print("=" * 70)
    print(f"\n[+] Starting FastAPI server at {url}")
    print("[+] Model Version: NAVIGATED-ENSEMBLE-v2.4.1")
    print("[+] Telemetry Streaming: Active via WebSocket /ws/live")
    print(f"[+] Web Application URL: {url}\n")

    # Open browser automatically after a short delay
    def open_browser():
        time.sleep(1.2)
        try:
            webbrowser.open(url)
        except Exception:
            pass

    import threading
    threading.Thread(target=open_browser, daemon=True).start()

    # Run Uvicorn server
    uvicorn.run("backend.server:app", host=host, port=port, log_level="info")

if __name__ == "__main__":
    main()
