/**
 * NAVIGATED Enterprise Railway Operations & Passenger Suite.
 * Coordinates Time-Distance Marey Diagram, Platform Occupancy Gantt,
 * Real-time Ingestion, and Hybrid AI Forecasting.
 */

class NavigatedApp {
  constructor() {
    this.currentTab = 'passenger';
    this.selectedTrainNo = '12301';
    this.selectedCorridorId = 'NDLS-HWH';
    this.corridors = [];
    this.trains = [];
    this.allForecasts = {};
    this.activeETAData = null;
    this.disruptionPresets = [];
    this.activeDisruptions = {};
    this.metrics = {};
    
    // Visualization instances
    this.corridorMap = null;
    this.stringlineDiagram = null;
    this.platformGantt = null;
    
    this.simSpeed = 1.0;
  }

  async init() {
    this.setupEventListeners();
    await this.loadInitialData();
    this.initVisualizers();
    await this.selectTrain(this.selectedTrainNo);
    await this.refreshMetrics();
    this.renderDisruptionPresets();

    // Setup live WebSocket
    window.navigatedAPI.onTelemetryUpdate = (data) => this.handleTelemetryStream(data);
    window.navigatedAPI.initWebSocket();

    // Background polling fallback every 3s
    setInterval(() => this.backgroundPoll(), 3000);
  }

  setupEventListeners() {
    // Sidebar Navigation Buttons
    document.querySelectorAll('.sidebar-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabKey = btn.getAttribute('data-tab');
        this.switchTab(tabKey);
        window.soundEngine.playClick();
      });
    });

    // Sound Toggle
    const soundBtn = document.getElementById('btnToggleSound');
    if (soundBtn) {
      soundBtn.addEventListener('click', () => {
        const isEnabled = window.soundEngine.toggle();
        soundBtn.innerHTML = isEnabled ? '🔔 Sound ON' : '🔕 Sound OFF';
        soundBtn.style.opacity = isEnabled ? '1' : '0.6';
      });
    }

    // Platform Switcher
    document.querySelectorAll('.btn-gantt-stn').forEach(btn => {
      btn.addEventListener('click', () => {
        const stn = btn.getAttribute('data-stn');
        document.querySelectorAll('.btn-gantt-stn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        if (this.platformGantt) {
          this.platformGantt.setStation(stn);
        }
        window.soundEngine.playClick();
      });
    });

    // Simulation Speed Multipliers
    document.querySelectorAll('.btn-sim-speed').forEach(btn => {
      btn.addEventListener('click', () => {
        const spd = parseFloat(btn.getAttribute('data-speed') || '1.0');
        this.setSimulationSpeed(spd);
        document.querySelectorAll('.btn-sim-speed').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        window.soundEngine.playClick();
      });
    });

    // Retrain Trigger
    const retrainBtn = document.getElementById('btnTriggerRetrain');
    if (retrainBtn) {
      retrainBtn.addEventListener('click', () => this.handleRetrainTrigger());
    }

    // Clear Disruptions
    const clearDisruptionsBtn = document.getElementById('btnClearDisruptions');
    if (clearDisruptionsBtn) {
      clearDisruptionsBtn.addEventListener('click', () => this.clearAllDisruptions());
    }

    // Reset Simulation
    const resetSimBtn = document.getElementById('btnResetSim');
    if (resetSimBtn) {
      resetSimBtn.addEventListener('click', () => this.resetSimulation());
    }

    // Quick Search Input
    const searchInput = document.getElementById('globalTrainSearch');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query) {
          const match = this.trains.find(t => t.train_no.includes(query) || t.train_name.toLowerCase().includes(query));
          if (match) {
            this.selectTrain(match.train_no);
          }
        }
      });
    }
  }

  switchTab(tabKey) {
    this.currentTab = tabKey;
    document.querySelectorAll('.sidebar-nav-btn').forEach(b => b.classList.remove('active'));
    const targetBtn = document.querySelector(`.sidebar-nav-btn[data-tab="${tabKey}"]`);
    if (targetBtn) targetBtn.classList.add('active');

    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    const targetPane = document.getElementById(`tab-${tabKey}`);
    if (targetPane) targetPane.classList.add('active');

    // Trigger visualizer re-renders on tab entry
    setTimeout(() => {
      if (tabKey === 'stringline' && this.stringlineDiagram) {
        this.stringlineDiagram.render();
      } else if (tabKey === 'platform-gantt' && this.platformGantt) {
        this.platformGantt.render();
      } else if (tabKey === 'control-room' && this.corridorMap) {
        this.corridorMap.render();
      } else if (tabKey === 'aiml') {
        window.navigatedCharts.renderFeatureImportanceRadar('featureRadarCanvas', this.metrics.feature_weights);
        window.navigatedCharts.renderResidualDistributionChart('residualChartCanvas', this.metrics.recent_feedback_logs);
      } else if (tabKey === 'passenger' && this.activeETAData) {
        window.navigatedCharts.renderUncertaintyChart('uncertaintyChartCanvas', this.activeETAData);
      }
    }, 80);
  }

  async loadInitialData() {
    this.corridors = await window.navigatedAPI.getCorridors() || [];
    this.trains = await window.navigatedAPI.getTrains() || [];
    this.disruptionPresets = await window.navigatedAPI.getDisruptionPresets() || [];
    
    // Pre-fetch forecasts for all coaching trains
    for (const t of this.trains) {
      const forecast = await window.navigatedAPI.getTrainETA(t.train_no);
      if (forecast) {
        this.allForecasts[t.train_no] = forecast;
      }
    }

    this.renderTrainSelectorList();
    this.renderDispatchTable();
  }

  initVisualizers() {
    const currCorridor = this.corridors.find(c => c.id === this.selectedCorridorId);
    if (!currCorridor) return;

    // 1. Time-Distance Stringline Diagram
    if (document.getElementById('stringlineSvgCanvas')) {
      this.stringlineDiagram = new window.StringlineDiagram('stringlineSvgCanvas');
      window.stringlineDiagram = this.stringlineDiagram;
      this.stringlineDiagram.init(currCorridor, this.trains, this.allForecasts, this.activeDisruptions);
      this.stringlineDiagram.onTrainSelect = (trainNo) => this.selectTrain(trainNo);
    }

    // 2. Station Platform Gantt
    if (document.getElementById('platformGanttCanvas')) {
      this.platformGantt = new window.PlatformGantt('platformGanttCanvas');
      window.platformGantt = this.platformGantt;
      this.platformGantt.render();
    }

    // 3. Corridor Schematic Block Map
    if (document.getElementById('corridorSvgCanvas')) {
      this.corridorMap = new window.CorridorMap('corridorSvgCanvas');
      window.corridorMapInstance = this.corridorMap;
      this.corridorMap.init(currCorridor, this.trains, this.activeDisruptions);
      this.corridorMap.onSectionSelect = (secId) => this.handleSectionInspect(secId);
    }
  }

  renderTrainSelectorList() {
    const listEl = document.getElementById('trainSelectorList');
    if (!listEl) return;

    listEl.innerHTML = this.trains.map(t => {
      const isSelected = t.train_no === this.selectedTrainNo;
      const st = t.current_status || {};
      const delay = st.scheduled_delay_min || 0;
      const delayClass = delay === 0 ? 'delay-ontime' : (delay < 20 ? 'delay-minor' : 'delay-major');
      const delayText = delay === 0 ? 'ON TIME' : `+${delay}m Delay`;

      return `
        <div class="train-card-item ${isSelected ? 'selected' : ''}" onclick="window.app.selectTrain('${t.train_no}')">
          <div class="train-header-row">
            <span class="train-no-badge">#${t.train_no}</span>
            <span class="train-type-tag">${t.type.split('/')[0]}</span>
          </div>
          <div class="train-name-text">${t.train_name}</div>
          <div class="train-sub-info">
            <span>Sec: ${st.current_section_id ? st.current_section_id.replace('SEC-', '') : 'Main'}</span>
            <span class="delay-badge ${delayClass}">${delayText}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  renderDispatchTable() {
    const tableBody = document.getElementById('dispatchTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = this.trains.map(t => {
      const st = t.current_status || {};
      const forecast = this.allForecasts[t.train_no];
      const nextStn = forecast ? (forecast.journey_forecasts || []).find(s => s.status === 'NEXT' || s.status === 'UPCOMING') : null;
      const delay = st.scheduled_delay_min || 0;
      const isDisrupted = !!this.activeDisruptions[st.current_section_id];

      return `
        <tr>
          <td>
            <strong style="color: #00f2fe; font-family: var(--font-mono);">#${t.train_no}</strong>
            <div style="font-size: 11px; color: #fff;">${t.train_name}</div>
          </td>
          <td>
            <span style="font-size: 11px; color: var(--text-muted);">${t.type.split('/')[0]} (${t.rake_type})</span>
          </td>
          <td>
            <span style="font-family: var(--font-mono); font-size: 11.5px; color: #38bdf8;">${st.current_section_id || 'SEC-TDL-ETW'}</span>
            <div style="font-size: 10.5px; color: #64748b;">Block: ${st.signaling_block_id || 'BLK-266'}</div>
          </td>
          <td style="font-family: var(--font-mono); font-weight: 700; color: #fff;">
            ${st.current_speed_kmh || 110} km/h
          </td>
          <td>
            <div style="color: #94a3b8; text-decoration: line-through; font-size: 11px;">
              ${nextStn ? nextStn.sch_arr : '---'}
            </div>
            <strong style="color: #00f2fe; font-family: var(--font-mono); font-size: 13px;">
              ${nextStn ? nextStn.dynamic_eta : '---'}
            </strong>
          </td>
          <td>
            <span class="confidence-band-tag">± ${nextStn ? nextStn.confidence_band_min : 3}m</span>
          </td>
          <td>
            <span class="confidence-chip ${delay > 25 ? 'conf-low' : (delay > 10 ? 'conf-medium' : 'conf-high')}">
              ${delay > 0 ? `+${delay}m` : 'ON TIME'}
            </span>
          </td>
          <td>
            <span style="font-weight: 800; font-size: 11px; color: ${st.signal_aspect === 'GREEN' ? '#10b981' : (st.signal_aspect === 'RED' ? '#ef4444' : '#f59e0b')};">
              ● ${st.signal_aspect || 'GREEN'}
            </span>
          </td>
          <td>
            <button class="btn-secondary" style="padding: 4px 8px; font-size: 11px;" onclick="window.app.selectTrain('${t.train_no}'); window.app.switchTab('passenger');">
              Inspect ➔
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  async selectTrain(trainNo) {
    this.selectedTrainNo = trainNo;
    this.renderTrainSelectorList();

    // Fetch dynamic ETA
    const etaData = await window.navigatedAPI.getTrainETA(trainNo);
    if (etaData) {
      this.activeETAData = etaData;
      this.allForecasts[trainNo] = etaData;
      this.renderPassengerHero(etaData);
      this.renderJourneyTimeline(etaData);
      window.navigatedCharts.renderUncertaintyChart('uncertaintyChartCanvas', etaData);
    }

    if (this.stringlineDiagram) {
      this.stringlineDiagram.updateData(this.trains, this.allForecasts, this.activeDisruptions);
      this.stringlineDiagram.selectTrain(trainNo);
    }

    if (this.corridorMap) {
      this.corridorMap.updateState(this.trains, this.activeDisruptions);
    }
  }

  renderPassengerHero(data) {
    const heroTitle = document.getElementById('heroTrainTitle');
    const heroNo = document.getElementById('heroTrainNo');
    const heroType = document.getElementById('heroTrainType');
    const heroSpeed = document.getElementById('heroSpeed');
    const heroDelay = document.getElementById('heroDelay');
    const heroConfidence = document.getElementById('heroConfidence');
    const heroNextStop = document.getElementById('heroNextStop');

    if (heroTitle) heroTitle.innerText = data.train_name;
    if (heroNo) heroNo.innerText = `#${data.train_no}`;
    if (heroType) heroType.innerText = `${data.type} • ${data.rake_type}`;

    const st = data.current_status || {};
    if (heroSpeed) heroSpeed.innerText = `${st.current_speed_kmh || 110} km/h`;

    const nextStn = (data.journey_forecasts || []).find(s => s.status === 'NEXT' || s.status === 'UPCOMING');
    if (nextStn) {
      if (heroNextStop) heroNextStop.innerText = `${nextStn.station_code} (${nextStn.dynamic_eta} ± ${nextStn.confidence_band_min}m)`;
      if (heroDelay) {
        heroDelay.innerText = nextStn.dynamic_delay_min > 0 ? `+${nextStn.dynamic_delay_min} min` : 'ON TIME';
        heroDelay.className = `metric-value ${nextStn.dynamic_delay_min > 25 ? 'highlight-gold' : 'highlight-emerald'}`;
      }
      if (heroConfidence) {
        heroConfidence.innerText = `${nextStn.confidence_grade} (${nextStn.confidence_pct}%)`;
        heroConfidence.className = `confidence-chip conf-${nextStn.confidence_grade.toLowerCase()}`;
      }
    }
  }

  renderJourneyTimeline(data) {
    const listEl = document.getElementById('timelineList');
    if (!listEl) return;

    const forecasts = data.journey_forecasts || [];
    listEl.innerHTML = forecasts.map(stn => {
      const statusClass = stn.status.toLowerCase();
      const hasDisruption = stn.disruptions_enroute && stn.disruptions_enroute.length > 0;

      return `
        <div class="timeline-node ${statusClass}">
          <div class="timeline-node-marker"></div>
          <div class="station-row">
            <div>
              <div class="station-title">
                ${stn.station_name} (${stn.station_code})
                <span class="station-km">${stn.dist_km} km</span>
              </div>
              ${hasDisruption ? `
                <div class="disruption-pill-small">
                  ⚠ Weather/Disruption en-route: ${stn.disruptions_enroute[0]}
                </div>
              ` : ''}
            </div>

            <div class="eta-comparison-box">
              <div class="eta-col">
                <div class="eta-col-label">Scheduled</div>
                <div class="eta-col-val">${stn.sch_arr !== '---' ? stn.sch_arr : stn.sch_dep}</div>
              </div>

              ${stn.status !== 'PASSED' ? `
                <div class="eta-col">
                  <div class="eta-col-label">Static NTES</div>
                  <div class="eta-col-val static">${stn.static_eta} (+${stn.static_delay_min}m)</div>
                </div>

                <div class="eta-col">
                  <div class="eta-col-label">NAVIGATED Dynamic ETA</div>
                  <div class="eta-col-val dynamic">${stn.dynamic_eta}</div>
                </div>

                <div class="confidence-band-tag">
                  ± ${stn.confidence_band_min}m
                </div>
              ` : `
                <div class="confidence-chip conf-high">ARRIVED / PASSED</div>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderDisruptionPresets() {
    const container = document.getElementById('disruptionPresetsContainer');
    if (!container) return;

    container.innerHTML = this.disruptionPresets.map(preset => {
      const isActive = !!this.activeDisruptions[preset.section_id];
      const sevClass = preset.severity.toLowerCase() === 'high' ? 'severity-high' : 'severity-medium';

      return `
        <div class="preset-scenario-card ${isActive ? 'active' : ''}" onclick="window.app.injectPresetDisruption('${preset.id}')">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px;">
            <span style="font-weight: 700; color: #f8fafc; font-size: 13px;">${preset.title}</span>
            <span class="scenario-severity-tag ${sevClass}">${preset.severity}</span>
          </div>
          <p style="font-size: 11.5px; color: #94a3b8; line-height: 1.4; margin-bottom: 8px;">
            ${preset.description}
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b;">
            <span>Target Section: <strong style="color: #38bdf8;">${preset.section_id}</strong></span>
            <span style="color: ${isActive ? '#ef4444' : '#10b981'}; font-weight: 700;">
              ${isActive ? '● INJECTED & PROPAGATING' : '+ Click to Inject'}
            </span>
          </div>
        </div>
      `;
    }).join('');
  }

  async injectPresetDisruption(presetId) {
    const preset = this.disruptionPresets.find(p => p.id === presetId);
    if (!preset) return;

    window.soundEngine.playAlert();
    const res = await window.navigatedAPI.injectDisruption(preset);
    if (res) {
      this.activeDisruptions[preset.section_id] = preset;
      this.renderDisruptionPresets();
      this.refreshActiveViews();
    }
  }

  async clearAllDisruptions() {
    window.soundEngine.playClick();
    await window.navigatedAPI.clearDisruptions();
    this.activeDisruptions = {};
    this.renderDisruptionPresets();
    this.refreshActiveViews();
  }

  async handleRetrainTrigger() {
    const btn = document.getElementById('btnTriggerRetrain');
    if (btn) btn.innerHTML = '🔄 Retraining Model in Real-Time...';

    const res = await window.navigatedAPI.triggerRetrain();
    if (res) {
      window.soundEngine.playRetrainSuccess();
      await this.refreshMetrics();
      if (btn) btn.innerHTML = '⚡ Trigger Automated Closed-Loop Retraining';

      const badge = document.getElementById('activeModelVersionBadge');
      if (badge) badge.innerText = res.new_model_version;

      const toast = document.getElementById('retrainToast');
      if (toast) {
        toast.style.display = 'block';
        toast.innerHTML = `✅ Model retrained to <strong>${res.new_model_version}</strong>! Mean Absolute Error reduced to <strong>${res.active_metrics.mae_minutes} min</strong> (${res.active_metrics.improvement_pct}% gain over static baseline).`;
        setTimeout(() => toast.style.display = 'none', 6000);
      }
    }
  }

  async refreshMetrics() {
    const m = await window.navigatedAPI.getMetrics();
    if (m) {
      this.metrics = m;
      const elMae = document.getElementById('metricMaeVal');
      const elSamples = document.getElementById('metricSamplesVal');
      const elAccuracy = document.getElementById('metricAccuracyVal');
      const elVer = document.getElementById('activeModelVersionBadge');

      if (elMae) elMae.innerText = `${m.mae_minutes} min`;
      if (elSamples) elSamples.innerText = Number(m.total_samples).toLocaleString();
      if (elAccuracy) elAccuracy.innerText = `${m.high_confidence_pct}%`;
      if (elVer) elVer.innerText = m.model_version;

      if (this.currentTab === 'aiml') {
        window.navigatedCharts.renderFeatureImportanceRadar('featureRadarCanvas', m.feature_weights);
        window.navigatedCharts.renderResidualDistributionChart('residualChartCanvas', m.recent_feedback_logs);
      }
    }
  }

  async setSimulationSpeed(spd) {
    this.simSpeed = spd;
    await window.navigatedAPI.controlSimulation('speed', spd);
  }

  async resetSimulation() {
    window.soundEngine.playClick();
    await window.navigatedAPI.controlSimulation('reset');
    await this.loadInitialData();
    await this.selectTrain(this.selectedTrainNo);
  }

  handleSectionInspect(secId) {
    const inspectBox = document.getElementById('sectionInspectDetails');
    if (!inspectBox) return;

    const currCorridor = this.corridors.find(c => c.id === this.selectedCorridorId);
    if (!currCorridor) return;

    const sec = currCorridor.sections.find(s => s.id === secId);
    if (!sec) return;

    const disruption = this.activeDisruptions[secId];
    inspectBox.innerHTML = `
      <div style="font-size: 14.5px; font-weight: 700; color: #00f2fe; margin-bottom: 6px;">
        Block Section: ${sec.id} (${sec.from} ➔ ${sec.to})
      </div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; color: #94a3b8;">
        <div>Length: <strong style="color:#fff;">${sec.length_km} km</strong></div>
        <div>Max Permissible Speed: <strong style="color:#fff;">${sec.max_speed_kmh} km/h</strong></div>
        <div>Track Count: <strong style="color:#fff;">${sec.tracks} Lines</strong></div>
        <div>Gradient / Curvature: <strong style="color:#fff;">${sec.gradient_idx} / ${sec.curvature_idx}</strong></div>
      </div>
      ${disruption ? `
        <div style="margin-top: 10px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239,68,68,0.4); padding: 8px 12px; border-radius: 6px;">
          <strong style="color: #ef4444;">⚠ Active Disruption: ${disruption.title}</strong>
          <p style="font-size: 11px; color: #fca5a5; margin-top: 2px;">${disruption.description}</p>
        </div>
      ` : `
        <div style="margin-top: 10px; font-size: 11px; color: #10b981;">
          ✓ Section Clear • Automatic Block Signaling Active
        </div>
      `}
    `;
  }

  handleTelemetryStream(data) {
    if (data.trains) {
      this.trains = data.trains;
      this.renderTrainSelectorList();
      this.renderDispatchTable();
      if (this.corridorMap) this.corridorMap.updateState(this.trains, this.activeDisruptions);
      if (this.stringlineDiagram) this.stringlineDiagram.updateData(this.trains, this.allForecasts, this.activeDisruptions);
    }
  }

  async backgroundPoll() {
    const updatedTrains = await window.navigatedAPI.getTrains();
    if (updatedTrains) {
      this.trains = updatedTrains;
      if (this.corridorMap) this.corridorMap.updateState(this.trains, this.activeDisruptions);
      if (this.stringlineDiagram) this.stringlineDiagram.updateData(this.trains, this.allForecasts, this.activeDisruptions);
    }
  }

  async refreshActiveViews() {
    await this.loadInitialData();
    await this.selectTrain(this.selectedTrainNo);
    await this.refreshMetrics();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.app = new NavigatedApp();
  window.app.init();
});
