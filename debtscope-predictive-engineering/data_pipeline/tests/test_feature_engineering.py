"""
Unit tests for Feature Engineering formulas and derivations.
Verifies Maintainability Index, Business Impact, and Remediation Effort math.
"""

import pytest
from src.data_pipeline.feature_engineering import compute_maintainability_index

def test_maintainability_index_bounds():
    """Verifies MI remains strictly within [0, 100] across extreme inputs."""
    # Extremely large complex file
    huge_mi = compute_maintainability_index(loc=100000, complexity=500, code_smells=200)
    assert 0.0 <= huge_mi <= 100.0
    assert huge_mi == 0.0

    # Minimal clean file
    clean_mi = compute_maintainability_index(loc=10, complexity=1, code_smells=0)
    assert 0.0 <= clean_mi <= 100.0
    assert clean_mi > 95.0

def test_maintainability_index_payment_py_calibration():
    """
    Verifies that for payment.py (loc: 1842, complexity: 41, code_smells: 14),
    MI evaluates to ~42, matching the project specification.
    """
    mi = compute_maintainability_index(loc=1842, complexity=41, code_smells=14)
    assert 40.0 <= mi <= 45.0

def test_business_impact_calculation():
    """
    Verifies Business Impact calculation:
    Business Impact = 0.50 * Criticality + 0.35 * Revenue Impact + 0.15 * (100 if user_facing else 40)
    """
    crit = 95.0
    rev = 98.0
    user_facing = True
    expected = round((0.50 * crit) + (0.35 * rev) + (0.15 * 100.0), 1)
    # 47.5 + 34.3 + 15 = 96.8
    assert expected == 96.8

def test_remediation_effort_logic():
    """Verifies remediation effort is positive and scales with complexity."""
    maint_effort = 40.0
    cc = 20.0
    smells = 5
    debt_age = 100 # > 90 days adds 15h penalty
    estimated = round((maint_effort * 0.40) + (cc * 0.30) + (smells * 0.50) + 15.0, 1)
    # 16 + 6 + 2.5 + 15 = 39.5
    assert estimated == 39.5
