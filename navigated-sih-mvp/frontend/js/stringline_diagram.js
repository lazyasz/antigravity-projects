/**
 * SISCOG-Inspired Time-Distance (Stringline / Marey) Diagram Engine.
 * Essential tool for railway traffic controllers to visualize corridor capacity,
 * overtaking maneuvers, headway separation, and dynamic delay propagation.
 */

class StringlineDiagram {
  constructor(canvasContainerId) {
    this.container = document.getElementById(canvasContainerId);
    this.corridor = null;
    this.trains = [];
    this.forecasts = {};
    this.selectedTrainNo = null;
    this.activeDisruptions = {};
    this.timeStartHour = 16; // 16:00
    this.timeDurationHours = 14; // 14 hours window (16:00 to 06:00 next day)
    this.hoverTimeMin = null;
    this.onTrainSelect = null;
  }

  init(corridor, trains, forecasts, disruptions) {
    this.corridor = corridor;
    this.trains = trains || [];
    this.forecasts = forecasts || {};
    this.disruptions = disruptions || {};
    this.render();
    this.setupInteractions();
  }

  updateData(trains, forecasts, disruptions) {
    this.trains = trains || this.trains;
    this.forecasts = forecasts || this.forecasts;
    this.disruptions = disruptions || this.disruptions;
    this.render();
  }

  // Parse time "HH:MM" to total minutes from timeStartHour
  parseTimeToMinutes(timeStr) {
    if (!timeStr || timeStr === "---") return null;
    const parts = timeStr.split(":");
    if (parts.length < 2) return null;
    let h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    
    // Handle overnight wrap (e.g. 01:00 is next day after 16:00)
    if (h < this.timeStartHour) {
      h += 24;
    }
    return (h - this.timeStartHour) * 60 + m;
  }

  formatMinutesToTime(totalMins) {
    let absMins = (this.timeStartHour * 60 + Math.round(totalMins)) % (24 * 60);
    const h = Math.floor(absMins / 60);
    const m = absMins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  render() {
    if (!this.container || !this.corridor) return;

    const width = Math.max(1100, this.container.clientWidth || 1100);
    const height = 540;
    const paddingLeft = 140; // Station labels width
    const paddingRight = 40;
    const paddingTop = 40;
    const paddingBottom = 40;

    const plotWidth = width - paddingLeft - paddingRight;
    const plotHeight = height - paddingTop - paddingBottom;

    const stations = this.corridor.stations || [];
    const totalKm = this.corridor.length_km || 1447;
    const totalTimeMins = this.timeDurationHours * 60;

    const scaleX = (mins) => paddingLeft + (mins / totalTimeMins) * plotWidth;
    const scaleY = (km) => paddingTop + (km / totalKm) * plotHeight;

    let svg = `
      <svg viewBox="0 0 ${width} ${height}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="user-select: none; font-family: 'Inter', sans-serif;">
        <defs>
          <linearGradient id="stringlineBg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#040812" />
            <stop offset="100%" stop-color="#091224" />
          </linearGradient>

          <filter id="stringGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- Diagram Background -->
        <rect x="0" y="0" width="${width}" height="${height}" fill="url(#stringlineBg)" rx="8" />

        <!-- Time Grid Columns & Hour Headers -->
        <g class="time-grid">
    `;

    // Draw hourly vertical grid lines
    for (let h = 0; h <= this.timeDurationHours; h++) {
      const mins = h * 60;
      const x = scaleX(mins);
      const timeLabel = this.formatMinutesToTime(mins);
      const isMajorHour = h % 2 === 0;

      svg += `
        <line x1="${x}" y1="${paddingTop}" x2="${x}" y2="${height - paddingBottom}" 
              stroke="${isMajorHour ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255, 255, 255, 0.04)'}" 
              stroke-width="${isMajorHour ? 1.5 : 1}" 
              stroke-dasharray="${isMajorHour ? 'none' : '3,3'}" />
        
        <!-- Top Hour Header -->
        <text x="${x}" y="${paddingTop - 12}" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="${isMajorHour ? '700' : '500'}" fill="${isMajorHour ? '#38bdf8' : '#64748b'}" text-anchor="middle">
          ${timeLabel}
        </text>

        <!-- Bottom Hour Header -->
        <text x="${x}" y="${height - paddingBottom + 18}" font-family="'JetBrains Mono', monospace" font-size="10" fill="#64748b" text-anchor="middle">
          ${timeLabel}
        </text>
      `;
    }

    svg += `</g>`;

    // Draw Station Distance Horizontal Grid Lines & Station Names on Y-axis
    svg += `<g class="station-grid">`;
    stations.forEach(stn => {
      const y = scaleY(stn.km);
      const isMajor = ["NDLS", "CNB", "PRYJ", "DDU", "PNBE", "HWH", "MMCT", "ADI"].includes(stn.code);

      svg += `
        <line x1="${paddingLeft}" y1="${y}" x2="${width - paddingRight}" y2="${y}" 
              stroke="${isMajor ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)'}" 
              stroke-width="${isMajor ? 1.5 : 0.8}" />
        
        <!-- Station Label Left Axis -->
        <text x="${paddingLeft - 14}" y="${y + 4}" font-size="${isMajor ? '11.5' : '9.5'}" font-weight="${isMajor ? '800' : '500'}" fill="${isMajor ? '#f8fafc' : '#94a3b8'}" text-anchor="end">
          ${stn.name} (${stn.code})
        </text>
        
        <!-- Station KM Label -->
        <text x="${paddingLeft - 95}" y="${y + 4}" font-family="'JetBrains Mono', monospace" font-size="8.5" fill="#475569" text-anchor="end">
          ${stn.km} km
        </text>
      `;
    });
    svg += `</g>`;

    // Highlight Disrupted Corridor Sections
    if (this.corridor.sections) {
      const stnMap = {};
      stations.forEach(s => stnMap[s.code] = s);

      this.corridor.sections.forEach(sec => {
        if (this.disruptions[sec.id]) {
          const s1 = stnMap[sec.from];
          const s2 = stnMap[sec.to];
          if (s1 && s2) {
            const y1 = scaleY(s1.km);
            const y2 = scaleY(s2.km);
            const h = Math.abs(y2 - y1);
            const topY = Math.min(y1, y2);

            svg += `
              <rect x="${paddingLeft}" y="${topY}" width="${plotWidth}" height="${h}" 
                    fill="rgba(239, 68, 68, 0.08)" stroke="rgba(239, 68, 68, 0.3)" stroke-width="1" stroke-dasharray="4,4" />
              <text x="${width - paddingRight - 10}" y="${topY + 14}" font-size="9" font-weight="700" fill="#f87171" text-anchor="end">
                ⚠ ${this.disruptions[sec.id].title || 'Active Disruption Zone'}
              </text>
            `;
          }
        }
      });
    }

    // Color palette for trains
    const trainColors = {
      "12301": "#00f2fe", // Rajdhani Cyan
      "22436": "#10b981", // Vande Bharat Emerald
      "12004": "#f59e0b", // Shatabdi Amber
      "12802": "#a855f7", // Purushottam Purple
      "12952": "#38bdf8"
    };

    // Draw Train Stringlines (Scheduled vs Dynamic AI Forecast)
    svg += `<g class="train-stringlines">`;

    this.trains.forEach(train => {
      const trainNo = train.train_no;
      const isSelected = this.selectedTrainNo === trainNo;
      const color = trainColors[trainNo] || "#38bdf8";
      const schedule = train.schedule || [];
      const forecast = this.forecasts[trainNo];
      const journeyForecasts = forecast ? forecast.journey_forecasts : [];

      // 1. Draw Nominal Timetable Trajectory (Dashed subtle line)
      let schPoints = [];
      schedule.forEach(s => {
        const timeStr = s.sch_arr !== "---" ? s.sch_arr : s.sch_dep;
        const mins = this.parseTimeToMinutes(timeStr);
        if (mins !== null) {
          schPoints.push({ x: scaleX(mins), y: scaleY(s.dist_km), label: s.station, time: timeStr });
        }
      });

      if (schPoints.length > 1) {
        let schPathD = `M ${schPoints[0].x} ${schPoints[0].y}`;
        for (let i = 1; i < schPoints.length; i++) {
          schPathD += ` L ${schPoints[i].x} ${schPoints[i].y}`;
        }

        svg += `
          <path d="${schPathD}" fill="none" stroke="${color}" stroke-width="1.5" stroke-dasharray="4,4" opacity="${isSelected ? '0.6' : '0.3'}" />
        `;
      }

      // 2. Draw Dynamic AI Forecast Trajectory (Solid line with confidence bands)
      let dynPoints = [];
      if (journeyForecasts && journeyForecasts.length > 0) {
        journeyForecasts.forEach(stn => {
          const timeStr = stn.dynamic_eta || stn.sch_arr || stn.sch_dep;
          const mins = this.parseTimeToMinutes(timeStr);
          if (mins !== null) {
            dynPoints.push({
              x: scaleX(mins),
              y: scaleY(stn.dist_km),
              label: stn.station_code,
              time: timeStr,
              band: stn.confidence_band_min || 2,
              status: stn.status
            });
          }
        });
      } else {
        dynPoints = schPoints;
      }

      if (dynPoints.length > 1) {
        let dynPathD = `M ${dynPoints[0].x} ${dynPoints[0].y}`;
        for (let i = 1; i < dynPoints.length; i++) {
          dynPathD += ` L ${dynPoints[i].x} ${dynPoints[i].y}`;
        }

        // Draw stringline
        svg += `
          <!-- Train Stringline Path -->
          <g class="stringline-track" onclick="window.stringlineDiagram.selectTrain('${trainNo}')" style="cursor: pointer;">
            <!-- Fat hit area for mouse interaction -->
            <path d="${dynPathD}" fill="none" stroke="transparent" stroke-width="16" />
            
            <!-- Glowing line -->
            <path d="${dynPathD}" fill="none" stroke="${color}" stroke-width="${isSelected ? '3.5' : '2.2'}" 
                  filter="${isSelected ? 'url(#stringGlow)' : 'none'}" opacity="${isSelected ? '1' : '0.85'}" />
            
            <!-- Train Number Floating Badge along trajectory midpoint -->
            ${dynPoints.length > 2 ? `
              <g transform="translate(${dynPoints[Math.floor(dynPoints.length / 2)].x + 8}, ${dynPoints[Math.floor(dynPoints.length / 2)].y - 8})">
                <rect x="0" y="0" width="58" height="18" rx="4" fill="rgba(5, 11, 23, 0.9)" stroke="${color}" stroke-width="1" />
                <text x="29" y="12" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="800" fill="${color}" text-anchor="middle">
                  #${trainNo}
                </text>
              </g>
            ` : ''}

            <!-- Station Arrival Nodes -->
            ${dynPoints.map(p => `
              <circle cx="${p.x}" cy="${p.y}" r="${isSelected ? '4.5' : '3'}" fill="${p.status === 'PASSED' ? '#10b981' : color}" stroke="#030814" stroke-width="1.5" />
            `).join('')}
          </g>
        `;
      }
    });

    svg += `</g>`;

    // Render Current Time Scrubber Line
    if (this.hoverTimeMin !== null) {
      const hx = scaleX(this.hoverTimeMin);
      const hoverTimeStr = this.formatMinutesToTime(this.hoverTimeMin);

      svg += `
        <g class="scrubber-line" pointer-events="none">
          <line x1="${hx}" y1="${paddingTop}" x2="${hx}" y2="${height - paddingBottom}" stroke="#00f2fe" stroke-width="1.5" stroke-dasharray="2,2" filter="url(#stringGlow)" />
          <rect x="${hx - 30}" y="${paddingTop - 26}" width="60" height="20" rx="4" fill="#00f2fe" />
          <text x="${hx}" y="${paddingTop - 12}" font-family="'JetBrains Mono', monospace" font-size="10" font-weight="900" fill="#030814" text-anchor="middle">
            ${hoverTimeStr}
          </text>
        </g>
      `;
    }

    svg += `</svg>`;
    this.container.innerHTML = svg;
  }

  setupInteractions() {
    if (!this.container) return;

    this.container.addEventListener('mousemove', (e) => {
      const rect = this.container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const width = this.container.clientWidth || 1100;
      const paddingLeft = 140;
      const paddingRight = 40;
      const plotWidth = width - paddingLeft - paddingRight;

      if (mouseX >= paddingLeft && mouseX <= width - paddingRight) {
        const ratio = (mouseX - paddingLeft) / plotWidth;
        this.hoverTimeMin = ratio * (this.timeDurationHours * 60);
        this.render();
      }
    });

    this.container.addEventListener('mouseleave', () => {
      this.hoverTimeMin = null;
      this.render();
    });
  }

  selectTrain(trainNo) {
    this.selectedTrainNo = trainNo;
    this.render();
    if (this.onTrainSelect) {
      this.onTrainSelect(trainNo);
    }
  }
}

window.StringlineDiagram = StringlineDiagram;
