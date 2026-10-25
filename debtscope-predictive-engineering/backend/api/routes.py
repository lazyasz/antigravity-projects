"""
Main API Router: Aggregates all modular endpoint routers into the primary API v1 router.
"""

from fastapi import APIRouter
from backend.api.repositories_routes import router as repositories_router
from backend.api.metrics_routes import router as metrics_router
from backend.api.predictions_routes import router as predictions_router
from backend.api.business_routes import router as business_router
from backend.api.priority_routes import router as priority_router
from backend.api.auth_routes import router as auth_router
from backend.api.unified_integrations_routes import router as integrations_router
from backend.api.lakehouse_routes import router as lakehouse_router
from backend.api.simulator_routes import router as simulator_router
from backend.api.copilot_routes import router as copilot_router

api_router = APIRouter()

# Include Sub-Routers
api_router.include_router(repositories_router)
api_router.include_router(metrics_router)
api_router.include_router(predictions_router)
api_router.include_router(business_router)
api_router.include_router(priority_router)
api_router.include_router(auth_router)
api_router.include_router(integrations_router)
api_router.include_router(lakehouse_router)
api_router.include_router(simulator_router)
api_router.include_router(copilot_router)



