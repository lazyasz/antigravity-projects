"""
Member 3: Dhruv (Lead) - FastAPI REST Routing & Contracts
Module: api.py
Description: Asynchronous FastAPI REST routing, Pydantic v2 schemas, and dependency injection.
"""

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
from typing import List, Optional

app = FastAPI(
    title="DebtScope Decision Intelligence API",
    description="5-Dimensional Technical Debt Prioritization & ROI Decision Engine",
    version="2.0.0"
)

class PriorityResponse(BaseModel):
    file_id: str
    file_path: str
    module_name: str
    tr_comp: float = Field(..., description="Composite Technical Risk (0-100)")
    bi_comp: float = Field(..., description="Composite Business Impact (0-100)")
    u_comp: float = Field(..., description="Composite Release Urgency (0-100)")
    ps_base: float = Field(..., description="Baseline 5D Priority Score (0-100)")
    ps_final: float = Field(..., description="Effort-Adjusted Final Priority Score (0-100)")
    roi_score: float = Field(..., description="Return on Investment Index")
    quadrant: str = Field(..., description="ROI Action Quadrant")
    action_recommendation: str

@app.get("/api/v1/health")
async def health_check():
    return {"status": "healthy", "engine": "DebtScope 5D Decision Platform", "version": "2.0.0"}

@app.get("/api/v1/priorities", response_model=List[PriorityResponse])
async def get_priorities(
    tier: Optional[str] = Query(None, description="Filter by tier: CRITICAL, HIGH, MEDIUM, LOW"),
    quadrant: Optional[str] = Query(None, description="Filter by quadrant: QUICK_WIN, STRATEGIC_REFACTOR, etc.")
):
    """Returns ranked technical debt items with 5D dimensional decomposition and ROI quadrant tags."""
    # Simulated endpoint response
    sample = [
        PriorityResponse(
            file_id="f-pay-01",
            file_path="services/payment_orchestrator.py",
            module_name="Payments",
            tr_comp=88.5,
            bi_comp=92.0,
            u_comp=85.0,
            ps_base=87.4,
            ps_final=88.2,
            roi_score=349.6,
            quadrant="QUICK_WIN",
            action_recommendation="Immediate Sprint Allocation (Top Priority ROI)"
        )
    ]
    return sample

if __name__ == "__main__":
    import uvicorn
    print("FastAPI Decision Intelligence Server initialized.")
