# Review 2 Speaking Notes & Viva Defense: Adesh (Member 4)

**Role**: Executive Frontend Engineer & UI/UX Architect  
**Subsystem**: `frontend/`  
**Assigned Slides**: Slide 8 & Slide 10 (Executive Dashboard & Review 3 Roadmap)

---

## 🎙️ 2-Minute Presentation Script
"Good morning, panel. I developed the Executive Web Dashboard and Frontend Analytics Platform.

An algorithm is only as good as its usability. We built an intuitive Single Page Application using **React 19, Vite, and TailwindCSS 4**, designed specifically for Engineering Managers and Tech Leads.

The interface delivers:
1. **Executive KPI Cards**: Real-time project health scores, total accumulated debt hours, active hotspot counts, and defect probabilities.
2. **Interactive 4-Quadrant Priority Matrix**: Built with **Recharts**, this 2D scatterplot visualizes Business Value against Remediation Effort, allowing managers to immediately filter and assign **Quick Wins**.
3. **File Intelligence Explorer**: Deep-dives into individual files, rendering complexity distribution, author ownership entropy, and ML risk drivers.
4. **AI Refactoring Copilot**: An interactive interface offering structured recommendations for high-risk files.

For production reliability, our Axios service layer includes **automated graceful fallback to mock telemetry**, guaranteeing that the dashboard never crashes during client presentations."

---

## 🥊 Examiner "Why This vs. Why Not That?" Justification Cheat Sheet

### Q1: Why did you use React 19 + Vite instead of Streamlit / Dash or Next.js?
- **Answer**: Streamlit and Dash re-execute the entire Python script on every user interaction, causing sluggish visual lag. React 19 provides granular Virtual DOM reconciliation for smooth 60fps chart interactions. Vite enables instant Hot Module Replacement (HMR) and sub-second build times. Because DebtScope is an internal authenticated dashboard, client-side SPA routing avoids unnecessary SSR server complexity.

### Q2: Why did you choose TailwindCSS 4 and Recharts over heavier libraries (Bootstrap, Chart.js, D3)?
- **Answer**: Recharts is built natively for React with declarative SVG rendering. D3 relies on direct imperative DOM manipulation that directly conflicts with React's Virtual DOM reconciliation. TailwindCSS 4 provides modern utility-first tokenized styling with zero unused CSS bloat.

### Q3: Why implement client-side mock fallback in the Axios service layer?
- **Answer**: It implements the **Graceful Degradation** design pattern. If the backend is restarting or network connectivity drops during an executive presentation, the UI automatically falls back to cached mock telemetry, preventing blank screens or uncaught promise errors.
