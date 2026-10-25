/**
 * TEMPORARY MOCK API RESPONSES
 *
 * These functions simulate backend API responses for frontend development.
 * Replace with real FastAPI calls via api.js when the backend is ready.
 *
 * IMPORTANT: All risk_score, predicted_risk, business_impact, remediation_effort,
 * priority_score, and other analytics values are mock data only.
 * The frontend does NOT calculate these — they will come from FastAPI.
 */

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ---------- Dashboard KPI Metrics ---------- */
export async function getMetrics() {
  await delay(400);
  return {
    technical_debt_health: {
      score: 68,
      trend: -2.3,
      status: 'warning',
      label: 'Technical Debt Health',
    },
    critical_items: {
      count: 12,
      trend: 3,
      status: 'critical',
      label: 'Critical Items',
    },
    high_risk_items: {
      count: 28,
      trend: -5,
      status: 'warning',
      label: 'High Risk Items',
    },
    predicted_hotspots: {
      count: 8,
      trend: 1,
      status: 'attention',
      label: 'Predicted Hotspots',
    },
    business_critical_items: {
      count: 5,
      trend: 0,
      status: 'critical',
      label: 'Business Critical Items',
    },
    risk_distribution: [
      { name: 'Critical', value: 12, color: '#ef4444' },
      { name: 'High', value: 28, color: '#f97316' },
      { name: 'Medium', value: 45, color: '#eab308' },
      { name: 'Low', value: 67, color: '#22c55e' },
    ],
    risk_trend: [
      { period: 'Sprint 18', risk_score: 72, predicted_risk: 74 },
      { period: 'Sprint 19', risk_score: 70, predicted_risk: 71 },
      { period: 'Sprint 20', risk_score: 74, predicted_risk: 73 },
      { period: 'Sprint 21', risk_score: 69, predicted_risk: 70 },
      { period: 'Sprint 22', risk_score: 71, predicted_risk: 72 },
      { period: 'Sprint 23', risk_score: 68, predicted_risk: 69 },
      { period: 'Sprint 24', risk_score: 65, predicted_risk: 67 },
      { period: 'Sprint 25', risk_score: 68, predicted_risk: 66 },
    ],
    recent_high_priority: [
      { id: 'td-001', file: 'src/services/PaymentProcessor.java', risk_score: 87, priority_level: 'critical', category: 'Code Smell' },
      { id: 'td-003', file: 'src/core/AuthenticationManager.java', risk_score: 82, priority_level: 'critical', category: 'Security Debt' },
      { id: 'td-005', file: 'src/data/QueryBuilder.java', risk_score: 78, priority_level: 'high', category: 'Architecture Debt' },
      { id: 'td-008', file: 'src/middleware/RateLimiter.java', risk_score: 71, priority_level: 'high', category: 'Architecture Debt' },
    ],
  };
}

/* ---------- Technical Debt Items ---------- */
export async function getTechnicalDebt() {
  await delay(500);
  return [
    {
      id: 'td-001',
      file: 'src/services/PaymentProcessor.java',
      category: 'Code Smell',
      severity: 'critical',
      risk_score: 87,
      predicted_risk: 92,
      business_impact: 9.2,
      remediation_effort: 4.5,
      priority_score: 94,
      priority_level: 'critical',
      complexity: 45,
      churn: 23,
      defects: 8,
      debt_age: 180,
      risk_factors: ['High complexity', 'Frequent changes', 'Payment critical path'],
      description: 'Complex payment processing logic with high cyclomatic complexity',
      created_at: '2026-03-15',
    },
    {
      id: 'td-002',
      file: 'src/utils/DataTransformer.java',
      category: 'Design Debt',
      severity: 'high',
      risk_score: 74,
      predicted_risk: 79,
      business_impact: 6.8,
      remediation_effort: 3.2,
      priority_score: 76,
      priority_level: 'high',
      complexity: 32,
      churn: 18,
      defects: 5,
      debt_age: 120,
      risk_factors: ['God class pattern', 'Low test coverage'],
      description: 'Monolithic data transformation class violating SRP',
      created_at: '2026-04-02',
    },
    {
      id: 'td-003',
      file: 'src/core/AuthenticationManager.java',
      category: 'Security Debt',
      severity: 'critical',
      risk_score: 82,
      predicted_risk: 88,
      business_impact: 9.5,
      remediation_effort: 5.0,
      priority_score: 91,
      priority_level: 'critical',
      complexity: 38,
      churn: 12,
      defects: 3,
      debt_age: 240,
      risk_factors: ['Deprecated crypto', 'Authentication bypass risk', 'Compliance'],
      description: 'Authentication module using deprecated cryptographic methods',
      created_at: '2026-01-20',
    },
    {
      id: 'td-004',
      file: 'src/api/RestController.java',
      category: 'Code Smell',
      severity: 'medium',
      risk_score: 56,
      predicted_risk: 61,
      business_impact: 4.2,
      remediation_effort: 2.0,
      priority_score: 52,
      priority_level: 'medium',
      complexity: 22,
      churn: 30,
      defects: 2,
      debt_age: 90,
      risk_factors: ['High churn rate', 'Inconsistent error handling'],
      description: 'REST controller with inconsistent error handling patterns',
      created_at: '2026-06-10',
    },
    {
      id: 'td-005',
      file: 'src/data/QueryBuilder.java',
      category: 'Architecture Debt',
      severity: 'high',
      risk_score: 78,
      predicted_risk: 84,
      business_impact: 7.5,
      remediation_effort: 6.0,
      priority_score: 80,
      priority_level: 'high',
      complexity: 52,
      churn: 8,
      defects: 6,
      debt_age: 300,
      risk_factors: ['SQL injection risk', 'No parameterization', 'Legacy pattern'],
      description: 'Query builder using string concatenation instead of parameterized queries',
      created_at: '2025-11-05',
    },
    {
      id: 'td-006',
      file: 'src/services/NotificationService.java',
      category: 'Design Debt',
      severity: 'medium',
      risk_score: 48,
      predicted_risk: 53,
      business_impact: 3.8,
      remediation_effort: 2.5,
      priority_score: 45,
      priority_level: 'medium',
      complexity: 18,
      churn: 15,
      defects: 1,
      debt_age: 60,
      risk_factors: ['Tight coupling', 'No retry mechanism'],
      description: 'Tightly coupled notification service without retry or circuit breaker',
      created_at: '2026-07-01',
    },
    {
      id: 'td-007',
      file: 'src/config/AppConfig.java',
      category: 'Configuration Debt',
      severity: 'low',
      risk_score: 32,
      predicted_risk: 35,
      business_impact: 2.0,
      remediation_effort: 1.0,
      priority_score: 28,
      priority_level: 'low',
      complexity: 8,
      churn: 5,
      defects: 0,
      debt_age: 45,
      risk_factors: ['Hardcoded values', 'Missing environment separation'],
      description: 'Application configuration with hardcoded environment values',
      created_at: '2026-07-20',
    },
    {
      id: 'td-008',
      file: 'src/middleware/RateLimiter.java',
      category: 'Architecture Debt',
      severity: 'high',
      risk_score: 71,
      predicted_risk: 76,
      business_impact: 7.0,
      remediation_effort: 3.8,
      priority_score: 73,
      priority_level: 'high',
      complexity: 28,
      churn: 10,
      defects: 4,
      debt_age: 150,
      risk_factors: ['Race condition risk', 'No distributed support', 'Memory leak potential'],
      description: 'Rate limiter with potential race conditions in concurrent environments',
      created_at: '2026-04-15',
    },
  ];
}

/* ---------- Predictions ---------- */
export async function getPredictions() {
  await delay(450);
  return {
    risk_trend: [
      { period: 'Sprint 18', risk_score: 72, predicted_risk: 74 },
      { period: 'Sprint 19', risk_score: 70, predicted_risk: 71 },
      { period: 'Sprint 20', risk_score: 74, predicted_risk: 73 },
      { period: 'Sprint 21', risk_score: 69, predicted_risk: 70 },
      { period: 'Sprint 22', risk_score: 71, predicted_risk: 72 },
      { period: 'Sprint 23', risk_score: 68, predicted_risk: 69 },
      { period: 'Sprint 24', risk_score: 65, predicted_risk: 67 },
      { period: 'Sprint 25', risk_score: null, predicted_risk: 66 },
      { period: 'Sprint 26', risk_score: null, predicted_risk: 64 },
      { period: 'Sprint 27', risk_score: null, predicted_risk: 63 },
    ],
    at_risk_files: [
      { id: 'pred-001', file: 'src/services/PaymentProcessor.java', current_risk: 87, predicted_risk: 92, risk_delta: 5, confidence: 0.89, risk_factors: ['Increasing complexity', 'High churn', 'Defect correlation'] },
      { id: 'pred-002', file: 'src/core/AuthenticationManager.java', current_risk: 82, predicted_risk: 88, risk_delta: 6, confidence: 0.85, risk_factors: ['Aging dependency', 'Security vulnerability trend'] },
      { id: 'pred-003', file: 'src/data/QueryBuilder.java', current_risk: 78, predicted_risk: 84, risk_delta: 6, confidence: 0.82, risk_factors: ['Legacy pattern growth', 'Increasing defect density'] },
      { id: 'pred-004', file: 'src/middleware/RateLimiter.java', current_risk: 71, predicted_risk: 76, risk_delta: 5, confidence: 0.78, risk_factors: ['Concurrency issues', 'Scaling pressure'] },
      { id: 'pred-005', file: 'src/utils/DataTransformer.java', current_risk: 74, predicted_risk: 79, risk_delta: 5, confidence: 0.81, risk_factors: ['Class size growth', 'Responsibility creep'] },
    ],
  };
}

/* ---------- Hotspots ---------- */
export async function getHotspots() {
  await delay(400);
  return [
    { id: 'hs-001', file: 'src/services/PaymentProcessor.java', complexity: 45, churn: 23, defects: 8, risk_score: 87, predicted_risk: 92, business_impact: 9.2, contributors: 5, last_modified: '2026-08-28' },
    { id: 'hs-002', file: 'src/core/AuthenticationManager.java', complexity: 38, churn: 12, defects: 3, risk_score: 82, predicted_risk: 88, business_impact: 9.5, contributors: 3, last_modified: '2026-08-20' },
    { id: 'hs-003', file: 'src/data/QueryBuilder.java', complexity: 52, churn: 8, defects: 6, risk_score: 78, predicted_risk: 84, business_impact: 7.5, contributors: 2, last_modified: '2026-07-15' },
    { id: 'hs-004', file: 'src/utils/DataTransformer.java', complexity: 32, churn: 18, defects: 5, risk_score: 74, predicted_risk: 79, business_impact: 6.8, contributors: 4, last_modified: '2026-08-25' },
    { id: 'hs-005', file: 'src/middleware/RateLimiter.java', complexity: 28, churn: 10, defects: 4, risk_score: 71, predicted_risk: 76, business_impact: 7.0, contributors: 2, last_modified: '2026-08-10' },
    { id: 'hs-006', file: 'src/api/RestController.java', complexity: 22, churn: 30, defects: 2, risk_score: 56, predicted_risk: 61, business_impact: 4.2, contributors: 6, last_modified: '2026-08-30' },
  ];
}

/* ---------- Priorities ---------- */
export async function getPriorities() {
  await delay(450);
  return [
    { id: 'pri-001', file: 'src/services/PaymentProcessor.java', priority_score: 94, priority_level: 'critical', risk_score: 87, predicted_risk: 92, business_impact: 9.2, remediation_effort: 4.5, category: 'Code Smell', recommendation: 'Refactor payment processing into smaller, testable components' },
    { id: 'pri-002', file: 'src/core/AuthenticationManager.java', priority_score: 91, priority_level: 'critical', risk_score: 82, predicted_risk: 88, business_impact: 9.5, remediation_effort: 5.0, category: 'Security Debt', recommendation: 'Migrate to modern cryptographic standards and implement key rotation' },
    { id: 'pri-003', file: 'src/data/QueryBuilder.java', priority_score: 80, priority_level: 'high', risk_score: 78, predicted_risk: 84, business_impact: 7.5, remediation_effort: 6.0, category: 'Architecture Debt', recommendation: 'Replace string concatenation with parameterized query builder' },
    { id: 'pri-004', file: 'src/utils/DataTransformer.java', priority_score: 76, priority_level: 'high', risk_score: 74, predicted_risk: 79, business_impact: 6.8, remediation_effort: 3.2, category: 'Design Debt', recommendation: 'Decompose into single-responsibility transformation classes' },
    { id: 'pri-005', file: 'src/middleware/RateLimiter.java', priority_score: 73, priority_level: 'high', risk_score: 71, predicted_risk: 76, business_impact: 7.0, remediation_effort: 3.8, category: 'Architecture Debt', recommendation: 'Implement distributed rate limiting with Redis backend' },
    { id: 'pri-006', file: 'src/api/RestController.java', priority_score: 52, priority_level: 'medium', risk_score: 56, predicted_risk: 61, business_impact: 4.2, remediation_effort: 2.0, category: 'Code Smell', recommendation: 'Standardize error handling with global exception handler' },
  ];
}

/* ---------- Recommendations ---------- */
export async function getRecommendations() {
  await delay(350);
  return [
    { id: 'rec-001', title: 'Refactor PaymentProcessor', description: 'Break down the monolithic payment processor into smaller services following the strategy pattern.', impact: 'high', effort: 'medium', affected_files: ['src/services/PaymentProcessor.java'], estimated_risk_reduction: 15 },
    { id: 'rec-002', title: 'Update Authentication Cryptography', description: 'Migrate from deprecated SHA-1 to SHA-256 and implement proper key management.', impact: 'critical', effort: 'high', affected_files: ['src/core/AuthenticationManager.java'], estimated_risk_reduction: 20 },
    { id: 'rec-003', title: 'Parameterize Query Builder', description: 'Replace all string concatenation queries with parameterized queries to eliminate SQL injection risks.', impact: 'high', effort: 'medium', affected_files: ['src/data/QueryBuilder.java'], estimated_risk_reduction: 18 },
  ];
}

/* ---------- File Intelligence Detail ---------- */
export async function getFile(id) {
  await delay(400);
  const files = {
    'td-001': {
      id: 'td-001',
      file: 'src/services/PaymentProcessor.java',
      category: 'Code Smell',
      severity: 'critical',
      risk_score: 87,
      predicted_risk: 92,
      business_impact: 9.2,
      remediation_effort: 4.5,
      priority_score: 94,
      priority_level: 'critical',
      complexity: 45,
      churn: 23,
      defects: 8,
      debt_age: 180,
      risk_factors: ['High complexity', 'Frequent changes', 'Payment critical path'],
      description: 'Complex payment processing logic with high cyclomatic complexity',
      created_at: '2026-03-15',
      lines_of_code: 1247,
      test_coverage: 34.2,
      last_modified: '2026-08-28',
      contributors: ['dev-a', 'dev-b', 'dev-c', 'dev-d', 'dev-e'],
      risk_history: [
        { date: '2026-03', risk_score: 65 },
        { date: '2026-04', risk_score: 70 },
        { date: '2026-05', risk_score: 74 },
        { date: '2026-06', risk_score: 79 },
        { date: '2026-07', risk_score: 83 },
        { date: '2026-08', risk_score: 87 },
      ],
      recommendations: [
        'Break into smaller service classes (Strategy Pattern)',
        'Increase test coverage to minimum 80%',
        'Extract validation logic into separate validator',
        'Add circuit breaker for external payment gateway calls',
      ],
    },
  };

  const file = files[id];
  if (file) return file;

  // Fallback for any unrecognized ID
  return {
    id,
    file: `src/unknown/${id}.java`,
    category: 'Unknown',
    severity: 'medium',
    risk_score: 50,
    predicted_risk: 55,
    business_impact: 5.0,
    remediation_effort: 3.0,
    priority_score: 50,
    priority_level: 'medium',
    complexity: 20,
    churn: 10,
    defects: 2,
    debt_age: 90,
    risk_factors: ['Insufficient data'],
    description: 'File details not available in mock data',
    created_at: '2026-06-01',
    lines_of_code: 500,
    test_coverage: 50.0,
    last_modified: '2026-08-01',
    contributors: ['dev-a'],
    risk_history: [
      { date: '2026-06', risk_score: 45 },
      { date: '2026-07', risk_score: 48 },
      { date: '2026-08', risk_score: 50 },
    ],
    recommendations: ['Perform detailed analysis'],
  };
}
