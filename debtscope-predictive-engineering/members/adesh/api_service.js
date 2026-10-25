/**
 * Member 4: Adesh - Frontend API Service & Resilience Layer
 * Module: api_service.js
 * Description: Axios client with automatic graceful fallback to mock data when backend is offline.
 */

import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 4000,
  headers: { 'Content-Type': 'application/json' }
});

// Resilient Fallback Mock Telemetry
const MOCK_DATA = {
  healthScore: 84.5,
  totalDebtHours: 142,
  criticalHotspots: 7,
  predictedDefects: 3.8,
  priorities: [
    { file_id: 'f-1', file_path: 'services/payment_orchestrator.py', ps_final: 88.2, quadrant: 'QUICK_WIN', effort: 25, value: 88 },
    { file_id: 'f-2', file_path: 'services/auth_middleware.py', ps_final: 81.0, quadrant: 'STRATEGIC_REFACTOR', effort: 70, value: 85 }
  ]
};

export const fetchPriorities = async () => {
  try {
    const response = await apiClient.get('/priorities');
    return response.data;
  } catch (error) {
    console.warn('FastAPI backend offline or unreachable. Engaging graceful mock fallback.', error.message);
    return MOCK_DATA.priorities;
  }
};

export const fetchProjectMetrics = async () => {
  try {
    const response = await apiClient.get('/metrics');
    return response.data;
  } catch (error) {
    console.warn('FastAPI backend offline. Serving cached project metrics.', error.message);
    return {
      healthScore: MOCK_DATA.healthScore,
      totalDebtHours: MOCK_DATA.totalDebtHours,
      criticalHotspots: MOCK_DATA.criticalHotspots,
      predictedDefects: MOCK_DATA.predictedDefects
    };
  }
};

export default {
  fetchPriorities,
  fetchProjectMetrics
};
