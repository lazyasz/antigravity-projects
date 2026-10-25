/**
 * Chart.js Visualizations for NAVIGATED (SIH 2026).
 * Handles Uncertainty Bands, Feature Importance Radar, and Residual Accuracy Distributions.
 */

class NavigatedCharts {
  constructor() {
    this.uncertaintyChart = null;
    this.featureRadarChart = null;
    this.residualChart = null;
    this.corridorTrendChart = null;
  }

  renderUncertaintyChart(canvasId, forecast) {
    const ctx = document.getElementById(canvasId);
    if (!ctx || !window.Chart) return;

    if (this.uncertaintyChart) {
      this.uncertaintyChart.destroy();
    }

    const stations = forecast.journey_forecasts || [];
    const labels = stations.map(s => `${s.station_code} (${s.dist_km}k)`);
    
    // Series data
    const dynamicDelays = stations.map(s => s.dynamic_delay_min);
    const staticDelays = stations.map(s => s.static_delay_min);
    const upperBounds = stations.map(s => s.dynamic_delay_min + (s.confidence_band_min || 2));
    const lowerBounds = stations.map(s => Math.max(0, s.dynamic_delay_min - (s.confidence_band_min || 2)));

    this.uncertaintyChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'NAVIGATED Dynamic AI Forecast (Delay min)',
            data: dynamicDelays,
            borderColor: '#00f2fe',
            backgroundColor: 'rgba(0, 242, 254, 0.15)',
            borderWidth: 3,
            tension: 0.3,
            pointRadius: 5,
            pointBackgroundColor: '#00f2fe',
            pointHoverRadius: 8,
            fill: false,
            zIndex: 10
          },
          {
            label: 'Dynamic Upper Confidence Band (+σ)',
            data: upperBounds,
            borderColor: 'rgba(56, 189, 248, 0.4)',
            borderWidth: 1,
            borderDash: [4, 4],
            pointRadius: 0,
            fill: '+1',
            backgroundColor: 'rgba(0, 242, 254, 0.12)'
          },
          {
            label: 'Dynamic Lower Confidence Band (-σ)',
            data: lowerBounds,
            borderColor: 'rgba(56, 189, 248, 0.4)',
            borderWidth: 1,
            borderDash: [4, 4],
            pointRadius: 0,
            fill: false
          },
          {
            label: 'Legacy Static Extrapolation (NTES Baseline)',
            data: staticDelays,
            borderColor: '#f59e0b',
            borderWidth: 2,
            borderDash: [6, 6],
            pointRadius: 3,
            pointBackgroundColor: '#f59e0b',
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            labels: {
              color: '#94a3b8',
              font: { family: 'Inter', size: 11 }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(6, 14, 30, 0.95)',
            titleColor: '#00f2fe',
            bodyColor: '#f8fafc',
            borderColor: 'rgba(56, 189, 248, 0.3)',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              afterBody: function(items) {
                const idx = items[0].dataIndex;
                const stn = stations[idx];
                return [
                  `Scheduled: ${stn.sch_arr || stn.sch_dep}`,
                  `Dynamic ETA: ${stn.dynamic_eta} ± ${stn.confidence_band_min || 2}m`,
                  `Confidence: ${stn.confidence_grade} (${stn.confidence_pct}%)`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8', font: { family: 'Inter', size: 10 } }
          },
          y: {
            title: { display: true, text: 'Delay in Minutes', color: '#94a3b8' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8', font: { family: 'JetBrains Mono', size: 10 } }
          }
        }
      }
    });
  }

  renderFeatureImportanceRadar(canvasId, weights) {
    const ctx = document.getElementById(canvasId);
    if (!ctx || !window.Chart) return;

    if (this.featureRadarChart) {
      this.featureRadarChart.destroy();
    }

    const defaultWeights = weights || {
      "historical_section_baseline": 0.28,
      "signaling_aspect_state": 0.24,
      "weather_visibility_fog": 0.18,
      "downstream_bunching_density": 0.14,
      "track_caution_restrictions": 0.10,
      "gradient_curvature_profile": 0.06
    };

    const labelMap = {
      "historical_section_baseline": "Historical Section Dynamics",
      "signaling_aspect_state": "Signal Interlocking State",
      "weather_visibility_fog": "Weather / Fog Visibility",
      "downstream_bunching_density": "Downstream Bunching Index",
      "track_caution_restrictions": "Track Caution Orders",
      "gradient_curvature_profile": "Gradient & Curvature Profile"
    };

    const labels = Object.keys(defaultWeights).map(k => labelMap[k] || k);
    const dataVals = Object.values(defaultWeights).map(v => Math.round(v * 100));

    this.featureRadarChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Feature Weight in Ensemble (%)',
          data: dataVals,
          backgroundColor: 'rgba(0, 242, 254, 0.25)',
          borderColor: '#00f2fe',
          borderWidth: 2,
          pointBackgroundColor: '#38bdf8',
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          r: {
            angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
            grid: { color: 'rgba(255, 255, 255, 0.08)' },
            pointLabels: {
              color: '#94a3b8',
              font: { family: 'Inter', size: 10, weight: 600 }
            },
            ticks: { display: false, maxTicksLimit: 5 }
          }
        }
      }
    });
  }

  renderResidualDistributionChart(canvasId, logs) {
    const ctx = document.getElementById(canvasId);
    if (!ctx || !window.Chart) return;

    if (this.residualChart) {
      this.residualChart.destroy();
    }

    const defaultLogs = logs || [
      { residual: 0.4 }, { residual: 0.8 }, { residual: 1.2 }, { residual: 1.8 },
      { residual: 2.1 }, { residual: 2.4 }, { residual: 2.9 }, { residual: 3.4 },
      { residual: 4.1 }, { residual: 5.2 }
    ];

    // Bin residuals: 0-1 min, 1-2 min, 2-3 min, 3-5 min, >5 min
    const bins = { "< 1 min": 0, "1 - 2 min": 0, "2 - 3 min": 0, "3 - 5 min": 0, "> 5 min": 0 };
    defaultLogs.forEach(l => {
      const r = l.residual;
      if (r < 1) bins["< 1 min"]++;
      else if (r < 2) bins["1 - 2 min"]++;
      else if (r < 3) bins["2 - 3 min"]++;
      else if (r < 5) bins["3 - 5 min"]++;
      else bins["> 5 min"]++;
    });

    this.residualChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(bins),
        datasets: [{
          label: 'Prediction Error Count (Arrival Residuals)',
          data: Object.values(bins),
          backgroundColor: [
            '#10b981',
            '#38bdf8',
            '#0284c7',
            '#f59e0b',
            '#ef4444'
          ],
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: '#94a3b8', font: { family: 'Inter', size: 10 } }
          },
          y: {
            title: { display: true, text: 'Logged Ground Truth Arrivals', color: '#94a3b8' },
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#94a3b8', stepSize: 1 }
          }
        }
      }
    });
  }
}

window.navigatedCharts = new NavigatedCharts();
