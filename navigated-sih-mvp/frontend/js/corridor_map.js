/**
 * NAVIGATED Interactive SVG Corridor Visualizer.
 * Renders real-time multi-track block signaling, moving trains, and bottleneck sections.
 */

class CorridorMap {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.corridorData = null;
    this.trainsData = [];
    this.disruptions = {};
    this.selectedSectionId = null;
    this.onSectionSelect = null;
  }

  init(corridor, trains, disruptions) {
    this.corridorData = corridor;
    this.trainsData = trains || [];
    this.disruptions = disruptions || {};
    this.render();
  }

  updateState(trains, disruptions) {
    this.trainsData = trains || this.trainsData;
    this.disruptions = disruptions || this.disruptions;
    this.render();
  }

  render() {
    if (!this.container || !this.corridorData) return;

    const stations = this.corridorData.stations || [];
    const sections = this.corridorData.sections || [];
    const totalKm = this.corridorData.length_km || 1447;

    const width = Math.max(1200, this.container.clientWidth || 1200);
    const height = 320;
    const paddingX = 70;
    const trackY1 = 130; // UP line
    const trackY2 = 190; // DOWN line

    const scaleKm = (km) => paddingX + (km / totalKm) * (width - paddingX * 2);

    let svg = `
      <svg viewBox="0 0 ${width} ${height}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="user-select: none;">
        <defs>
          <linearGradient id="trackGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#0284c7" />
            <stop offset="50%" stop-color="#38bdf8" />
            <stop offset="100%" stop-color="#0284c7" />
          </linearGradient>

          <pattern id="hazardStripe" width="20" height="20" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="20" stroke="rgba(239, 68, 68, 0.4)" stroke-width="8" />
          </pattern>

          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- Grid Background Lines -->
        <g stroke="rgba(255,255,255,0.03)" stroke-width="1">
          ${Array.from({ length: 14 }).map((_, i) => `<line x1="${paddingX + (i * (width - paddingX*2)/13)}" y1="30" x2="${paddingX + (i * (width - paddingX*2)/13)}" y2="${height - 30}" />`).join('')}
        </g>

        <!-- Main Railway Tracks (UP and DOWN Lines) -->
        <!-- Track ballast base -->
        <rect x="${paddingX - 10}" y="${trackY1 - 12}" width="${width - paddingX * 2 + 20}" height="24" rx="4" fill="rgba(15, 23, 42, 0.7)" />
        <rect x="${paddingX - 10}" y="${trackY2 - 12}" width="${width - paddingX * 2 + 20}" height="24" rx="4" fill="rgba(15, 23, 42, 0.7)" />

        <!-- Continuous Steel Rails -->
        <line x1="${paddingX}" y1="${trackY1 - 5}" x2="${width - paddingX}" y2="${trackY1 - 5}" stroke="#475569" stroke-width="3" />
        <line x1="${paddingX}" y1="${trackY1 + 5}" x2="${width - paddingX}" y2="${trackY1 + 5}" stroke="#475569" stroke-width="3" />
        <line x1="${paddingX}" y1="${trackY2 - 5}" x2="${width - paddingX}" y2="${trackY2 - 5}" stroke="#475569" stroke-width="3" />
        <line x1="${paddingX}" y1="${trackY2 + 5}" x2="${width - paddingX}" y2="${trackY2 + 5}" stroke="#475569" stroke-width="3" />

        <!-- Sleepers -->
        ${Array.from({ length: 120 }).map((_, i) => {
          const sx = paddingX + (i * (width - paddingX * 2) / 119);
          return `
            <line x1="${sx}" y1="${trackY1 - 8}" x2="${sx}" y2="${trackY1 + 8}" stroke="#334155" stroke-width="2" />
            <line x1="${sx}" y1="${trackY2 - 8}" x2="${sx}" y2="${trackY2 + 8}" stroke="#334155" stroke-width="2" />
          `;
        }).join('')}

        <!-- Line Direction Labels -->
        <text x="18" y="${trackY1 + 4}" font-family="monospace" font-size="10" font-weight="700" fill="#38bdf8">DN ▼</text>
        <text x="18" y="${trackY2 + 4}" font-family="monospace" font-size="10" font-weight="700" fill="#38bdf8">UP ▲</text>
    `;

    // Render Section Blocks and Disruption overlays
    const stnMap = {};
    stations.forEach(s => stnMap[s.code] = s);

    sections.forEach(sec => {
      const fromStn = stnMap[sec.from];
      const toStn = stnMap[sec.to];
      if (!fromStn || !toStn) return;

      const x1 = scaleKm(fromStn.km);
      const x2 = scaleKm(toStn.km);
      const secWidth = Math.max(10, x2 - x1);
      const isDisrupted = !!this.disruptions[sec.id];
      const isSelected = this.selectedSectionId === sec.id;

      // Section Block boundary rect
      const fillColor = isDisrupted 
        ? "url(#hazardStripe)" 
        : (isSelected ? "rgba(0, 242, 254, 0.12)" : "rgba(30, 41, 59, 0.15)");
      const strokeColor = isDisrupted 
        ? "#ef4444" 
        : (isSelected ? "#00f2fe" : "rgba(56, 189, 248, 0.2)");

      svg += `
        <g class="section-group" onclick="window.corridorMapInstance.selectSection('${sec.id}')" style="cursor: pointer;">
          <rect x="${x1}" y="${trackY1 - 25}" width="${secWidth}" height="110" rx="6" 
                fill="${fillColor}" stroke="${strokeColor}" stroke-width="${isSelected || isDisrupted ? 2 : 1}" 
                class="section-block-rect" />
          
          ${isDisrupted ? `
            <!-- Disruption Warning Pulsing Beacon -->
            <circle cx="${x1 + secWidth / 2}" cy="${trackY1 - 35}" r="7" fill="#ef4444" filter="url(#neonGlow)">
              <animate attributeName="r" values="6;9;6" dur="1.2s" repeatCount="indefinite" />
            </circle>
            <text x="${x1 + secWidth / 2}" y="${trackY1 - 46}" font-family="'Inter', sans-serif" font-size="9" font-weight="800" fill="#f87171" text-anchor="middle">
              ⚠ ${this.disruptions[sec.id].title || 'DISRUPTION'}
            </text>
          ` : ''}

          <!-- Automatic Block Signal Aspects along section -->
          <g transform="translate(${x1 + secWidth * 0.3}, ${trackY1 - 18})">
            <circle cx="0" cy="0" r="3.5" fill="${isDisrupted ? '#ef4444' : '#22c55e'}" filter="url(#neonGlow)" />
            <line x1="0" y1="0" x2="0" y2="10" stroke="#64748b" stroke-width="1.5" />
          </g>
          <g transform="translate(${x1 + secWidth * 0.7}, ${trackY2 + 18})">
            <circle cx="0" cy="0" r="3.5" fill="${isDisrupted ? '#eab308' : '#22c55e'}" filter="url(#neonGlow)" />
            <line x1="0" y1="0" x2="0" y2="-10" stroke="#64748b" stroke-width="1.5" />
          </g>
        </g>
      `;
    });

    // Render Station Waypoints
    stations.forEach((stn, idx) => {
      const cx = scaleKm(stn.km);
      const isMajor = ["NDLS", "CNB", "PRYJ", "DDU", "PNBE", "HWH", "MMCT", "ADI"].includes(stn.code);
      const isOdd = idx % 2 === 0;

      svg += `
        <g class="station-marker">
          <!-- Station center milestone line -->
          <line x1="${cx}" y1="${trackY1 - 22}" x2="${cx}" y2="${trackY2 + 22}" stroke="${isMajor ? '#38bdf8' : 'rgba(255,255,255,0.2)'}" stroke-width="${isMajor ? 2 : 1}" stroke-dasharray="${isMajor ? 'none' : '2,2'}" />
          
          <!-- Station nodes on tracks -->
          <circle cx="${cx}" cy="${trackY1}" r="${isMajor ? 5 : 3.5}" fill="${isMajor ? '#00f2fe' : '#94a3b8'}" stroke="#0b1e42" stroke-width="2" />
          <circle cx="${cx}" cy="${trackY2}" r="${isMajor ? 5 : 3.5}" fill="${isMajor ? '#00f2fe' : '#94a3b8'}" stroke="#0b1e42" stroke-width="2" />

          <!-- Station Text Label -->
          <text x="${cx}" y="${isOdd ? trackY1 - 32 : trackY2 + 42}" font-family="'Outfit', sans-serif" font-size="${isMajor ? 12 : 9.5}" font-weight="${isMajor ? 800 : 600}" fill="${isMajor ? '#ffffff' : '#94a3b8'}" text-anchor="middle">
            ${stn.code}
          </text>
          <text x="${cx}" y="${isOdd ? trackY1 - 44 : trackY2 + 54}" font-family="monospace" font-size="8" fill="#64748b" text-anchor="middle">
            ${stn.km} km
          </text>
        </g>
      `;
    });

    // Render Animated Moving Trains
    this.trainsData.forEach((train, tIdx) => {
      const st = train.current_status || {};
      const trainKm = st.current_km || 0;
      const tx = Math.min(width - paddingX, Math.max(paddingX, scaleKm(trainKm)));
      const isUp = tIdx % 2 === 1;
      const ty = isUp ? trackY2 : trackY1;
      const speed = st.current_speed_kmh || 100;
      const delay = st.scheduled_delay_min || 0;

      const badgeColor = delay > 30 ? "#ef4444" : (delay > 10 ? "#f59e0b" : "#10b981");

      svg += `
        <g class="moving-train" transform="translate(${tx}, ${ty})" style="transition: transform 1.5s linear; cursor: pointer;" onclick="window.app.selectTrain('${train.train_no}')">
          <!-- Train Headlamp Glow -->
          <circle cx="${isUp ? -14 : 14}" cy="0" r="14" fill="${badgeColor}" opacity="0.25" filter="url(#neonGlow)" />
          
          <!-- Train Body Shell -->
          <rect x="-24" y="-9" width="48" height="18" rx="5" fill="#0f172a" stroke="${badgeColor}" stroke-width="2" />
          
          <!-- Locomotive Cab Window -->
          <rect x="${isUp ? -20 : 10}" y="-6" width="10" height="12" rx="2" fill="#38bdf8" />
          
          <!-- Train No Label -->
          <text x="0" y="3.5" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="900" fill="#ffffff" text-anchor="middle">
            ${train.train_no}
          </text>

          <!-- Speed & Delay Bubble -->
          <g transform="translate(0, ${isUp ? 22 : -22})">
            <rect x="-35" y="-9" width="70" height="18" rx="4" fill="rgba(5, 11, 23, 0.9)" stroke="${badgeColor}" stroke-width="1" />
            <text x="0" y="3" font-family="monospace" font-size="8.5" font-weight="700" fill="#ffffff" text-anchor="middle">
              ${speed} km/h | +${delay}m
            </text>
          </g>
        </g>
      `;
    });

    svg += `</svg>`;
    this.container.innerHTML = svg;
  }

  selectSection(secId) {
    this.selectedSectionId = secId;
    this.render();
    if (this.onSectionSelect) {
      this.onSectionSelect(secId);
    }
  }
}

window.CorridorMap = CorridorMap;
