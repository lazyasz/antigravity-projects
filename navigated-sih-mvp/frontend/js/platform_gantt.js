/**
 * SISCOG-Inspired Station Platform Track Occupancy Gantt Chart.
 * Visualizes platform allocation, train dwell times, and detects platform headway conflicts.
 */

class PlatformGantt {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.selectedStation = "CNB"; // Kanpur Central default
    this.timeStartHour = 18; // 18:00
    this.timeHours = 8; // 8 hours window (18:00 to 02:00)
    this.stationPlatforms = {
      "CNB": { name: "Kanpur Central", count: 10, code: "CNB" },
      "NDLS": { name: "New Delhi", count: 16, code: "NDLS" },
      "PRYJ": { name: "Prayagraj Jn", count: 10, code: "PRYJ" },
      "DDU": { name: "Pt. Deen Dayal Upadhyaya", count: 8, code: "DDU" }
    };
    
    // Platform assignments and dwell times
    this.platformBookings = [
      { train_no: "12301", name: "Howrah Rajdhani", stn: "CNB", pf: 1, arr: "21:30", dep: "21:35", dyn_arr: "21:54", dyn_dep: "21:59", color: "#00f2fe" },
      { train_no: "12004", name: "Lucknow Shatabdi", stn: "CNB", pf: 1, arr: "11:20", dep: "11:25", dyn_arr: "11:38", dyn_dep: "11:43", color: "#f59e0b" },
      { train_no: "22436", name: "Vande Bharat Exp", stn: "CNB", pf: 2, arr: "10:08", dep: "10:10", dyn_arr: "10:11", dyn_dep: "10:13", color: "#10b981" },
      { train_no: "12802", name: "Purushottam Exp", stn: "CNB", pf: 4, arr: "04:00", dep: "04:05", dyn_arr: "04:52", dyn_dep: "04:57", color: "#a855f7" },
      { train_no: "12556", name: "Gorakhdham Exp", stn: "CNB", pf: 3, arr: "20:45", dep: "20:55", dyn_arr: "21:05", dyn_dep: "21:15", color: "#38bdf8" },
      { train_no: "12418", name: "Prayagraj Exp", stn: "CNB", pf: 5, arr: "22:10", dep: "22:20", dyn_arr: "22:15", dyn_dep: "22:25", color: "#ec4899" },
      { train_no: "02564", name: "Barauni Spl", stn: "CNB", pf: 1, arr: "21:40", dep: "21:50", dyn_arr: "21:48", dyn_dep: "21:58", color: "#f97316", conflict: true }
    ];
  }

  setStation(stnCode) {
    if (this.stationPlatforms[stnCode]) {
      this.selectedStation = stnCode;
      this.render();
    }
  }

  parseTimeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.split(":");
    let h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (h < this.timeStartHour) h += 24;
    return (h - this.timeStartHour) * 60 + m;
  }

  formatMinutes(mins) {
    let abs = (this.timeStartHour * 60 + Math.round(mins)) % (24 * 60);
    const h = Math.floor(abs / 60);
    const m = abs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  render() {
    if (!this.container) return;

    const stnInfo = this.stationPlatforms[this.selectedStation] || this.stationPlatforms["CNB"];
    const platformCount = stnInfo.count;

    const width = Math.max(900, this.container.clientWidth || 900);
    const rowHeight = 36;
    const headerHeight = 40;
    const paddingLeft = 80;
    const paddingRight = 30;
    const height = headerHeight + platformCount * rowHeight + 20;

    const plotWidth = width - paddingLeft - paddingRight;
    const totalMins = this.timeHours * 60;
    const scaleX = (mins) => paddingLeft + (mins / totalMins) * plotWidth;

    let svg = `
      <svg viewBox="0 0 ${width} ${height}" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="user-select: none; font-family: 'Inter', sans-serif;">
        <defs>
          <pattern id="ganttConflictStripe" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(239, 68, 68, 0.6)" stroke-width="4" />
          </pattern>
        </defs>

        <!-- Background -->
        <rect x="0" y="0" width="${width}" height="${height}" fill="#040814" rx="8" />

        <!-- Header Time Scale -->
        <g class="time-header">
    `;

    for (let h = 0; h <= this.timeHours; h++) {
      const mins = h * 60;
      const x = scaleX(mins);
      const timeLabel = this.formatMinutes(mins);

      svg += `
        <line x1="${x}" y1="${headerHeight}" x2="${x}" y2="${height - 10}" stroke="rgba(255, 255, 255, 0.05)" stroke-width="1" stroke-dasharray="2,2" />
        <text x="${x}" y="${headerHeight - 12}" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" fill="#38bdf8" text-anchor="middle">
          ${timeLabel}
        </text>
      `;
    }

    svg += `</g>`;

    // Platform Rows
    for (let pf = 1; pf <= platformCount; pf++) {
      const y = headerHeight + (pf - 1) * rowHeight;
      const isEven = pf % 2 === 0;

      svg += `
        <g class="platform-row">
          <!-- Row background -->
          <rect x="${paddingLeft}" y="${y}" width="${plotWidth}" height="${rowHeight - 4}" rx="4" fill="${isEven ? 'rgba(15, 23, 42, 0.4)' : 'rgba(15, 23, 42, 0.2)'}" />
          
          <!-- Platform Badge -->
          <rect x="8" y="${y + 2}" width="60" height="${rowHeight - 8}" rx="4" fill="rgba(56, 189, 248, 0.12)" stroke="rgba(56, 189, 248, 0.3)" stroke-width="1" />
          <text x="38" y="${y + rowHeight/2 + 2}" font-family="'Outfit', sans-serif" font-size="11" font-weight="800" fill="#f8fafc" text-anchor="middle">
            PF ${pf}
          </text>
        </g>
      `;
    }

    // Render Occupancy Blocks
    this.platformBookings.forEach(book => {
      if (book.stn !== this.selectedStation) return;
      if (book.pf > platformCount) return;

      const y = headerHeight + (book.pf - 1) * rowHeight + 4;
      const h = rowHeight - 12;

      // Use dynamic updated arrival & departure
      const startMins = this.parseTimeToMinutes(book.dyn_arr || book.arr);
      const endMins = this.parseTimeToMinutes(book.dyn_dep || book.dep);

      // Handle minimum width for visual clarity (minimum 15 mins block on chart)
      const effectiveEndMins = Math.max(endMins, startMins + 15);

      const x1 = scaleX(startMins);
      const x2 = scaleX(effectiveEndMins);
      const blockWidth = Math.max(28, x2 - x1);

      const hasConflict = book.conflict || false;

      svg += `
        <g class="occupancy-block" style="cursor: pointer;" onclick="window.app.selectTrain('${book.train_no}')">
          <rect x="${x1}" y="${y}" width="${blockWidth}" height="${h}" rx="5" 
                fill="${hasConflict ? 'url(#ganttConflictStripe)' : book.color}" 
                fill-opacity="${hasConflict ? '1' : '0.85'}"
                stroke="${hasConflict ? '#ef4444' : '#ffffff'}" stroke-width="${hasConflict ? '2' : '1'}" />
          
          <text x="${x1 + 6}" y="${y + h/2 + 3.5}" font-family="'JetBrains Mono', monospace" font-size="9" font-weight="900" fill="#030814">
            #${book.train_no} (${book.dyn_arr})
          </text>
          
          ${hasConflict ? `
            <circle cx="${x1 + blockWidth - 8}" cy="${y + 8}" r="5" fill="#ef4444" />
            <text x="${x1 + blockWidth - 8}" y="${y + 11}" font-size="8" font-weight="900" fill="#fff" text-anchor="middle">!</text>
          ` : ''}
        </g>
      `;
    });

    svg += `</svg>`;
    this.container.innerHTML = svg;
  }
}

window.PlatformGantt = PlatformGantt;
