"""
Convenience CLI Runner for the Predictive Engineering Intelligence Platform backend.
Usage:
    py run_server.py
"""

import os
import sys
import uvicorn

# Ensure project root is in sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

if __name__ == "__main__":
    print("==========================================================================")
    print(" 🚀 Launching Predictive Engineering Intelligence Platform Backend API")
    print(" 📖 Interactive Swagger API Docs: http://localhost:8000/docs")
    print(" 📖 ReDoc Documentation:        http://localhost:8000/redoc")
    print(" 🔍 System Health Endpoint:      http://localhost:8000/health")
    print(" 🎯 Business Differentiation Demo: http://localhost:8000/api/v1/comparison/demo")
    print("==========================================================================")
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
