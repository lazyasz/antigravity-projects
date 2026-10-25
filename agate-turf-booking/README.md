# 🎮 Agate Esports — Enhanced Registration Platform MVP

An enhanced, high-fidelity tournament registration platform for **Agate Esports** featuring a dark neon gaming aesthetic, robust client/server form validation, simulated network API layer, and an administrative control suite. Built using pure HTML5, CSS3, and modular ES6 JavaScript.

![Agate Esports](https://img.shields.io/badge/Agate-Esports-00ffcc?style=for-the-badge&logo=gamepad&logoColor=black)

---

## ✨ Features Added in Week 4

### 1. Visual & UX Upgrades
*   **Theme Modernization**: Elevated the dark gaming theme with HSL colors (neon cyan accent `#00ffcc`, neon pink `#ff0055`, and glassmorphic card elements).
*   **Typography**: Upgraded headings to the high-tech `Orbitron` Google Font and body to `Inter` for premium readability.
*   **Animated UI Feedbacks**: 
    *   Dynamic, custom-designed **Toast Notifications** (`success`, `error`, `info`) with smooth CSS slide-ins and progress countdown bars.
    *   Loading spinners and deactivated states on buttons during form submission to prevent duplicate clicks.
    *   Smooth fade-ins and viewport scroll-driven intersection animations.

### 2. Form Validation & Error Security
*   **Client & Mock Server-Side Validation**:
    *   Rigorous email syntax validation.
    *   Interactive **Password Strength Meter** grading complexity (requires minimum 8 characters, uppercase, lowercase, digits, and special characters) with real-time feedback.
    *   In-game name validation checking for structural tags (e.g. `IGN#1234`).
    *   Duplicate check verifying if the team name is already taken in the target tournament.
    *    Roster duplicate check ensuring no two players share the same IGN within a team, nor are registered multiple times in the same tournament.
*   **Network & Server Simulation**:
    *   Async promise-based query system (`js/api.js`) with 800ms latency simulating server communication.
    *   Configurable transient network error simulator (5% random chance or hard toggle) to test error handling and retry states without losing form data.

### 3. Extended Tournament Admin Dashboard
*   **Metric Cards Overview**: Displays Total, Approved, Pending, and Rejected team registration counts in real time.
*   **Seeding & Slots Breakdown**: Visual progress gauges illustrating filled team slots for every tournament.
*   **Roster Detail lookup**: Click to open a beautiful glassmorphic modal overlay displaying full team rosters, player roles, registered timestamp, and admin metadata.
*   **Interactive Control actions**: Fully functioning buttons to **Approve**, **Reject**, or **Delete** registrations. Approvals and rejections dynamically reserve or reclaim slot counts on target tournaments.
*   **Recent Platform Log**: Auditable, scrolling feed logging recent administrative updates (e.g. status updates, new signups) with timestamps.

---

## 📁 Project Structure

```
agate-esports/
├── css/
│   └── styles.css          # Core design system, cyber layouts & animations
├── js/
│   ├── db.js               # LocalStorage database wrapper & initial seed data
│   ├── auth.js             # User login, logout, and route authentication guards
│   ├── validation.js       # Real-time regex inputs & password strength rules
│   ├── api.js              # Mock asynchronous API backend simulator (Promises)
│   ├── admin.js            # Admin metrics, filtering, modals, & logs logic
│   └── main.js             # General UI init, mobile hamburger, custom toasts
├── index.html              # Landing page with featured tournaments
├── tournaments.html        # Searchable and filterable tournament list
├── register.html           # User signup with real-time strength meter
├── login.html              # User login
├── team-registration.html  # Dynamic team roster form with custom checks
├── confirmation.html       # Success registration breakdown
├── admin.html              # Extended admin panel
└── README.md               # Documentation
```

---

## 🔐 Credentials

| User Role | Email Address | Password |
|---|---|---|
| **Platform Administrator** | `admin@agate.gg` | `Password123!` |
| **Standard Player (Mock)** | `gamer@agate.gg` | `Password123!` |

---

## 🚀 Scalability & Future-Ready Architecture

The codebase has been refactored from a monolithic file into modular JavaScript segments under `js/` that make it easy to adapt for production database integration:

### How to Scale for Production Features:
1.  **Connecting to a Real Backend API**:
    *   Open `js/api.js` and modify the promise resolvers.
    *   Replace `simulateNetwork()` delays with standard browser `fetch()` or `axios` calls pointing to your Node.js/Go/Python REST endpoints:
        ```javascript
        function fetchAPI(endpoint, options) {
          return fetch(`https://api.agate.gg/v1${endpoint}`, options)
            .then(res => {
              if (!res.ok) return res.json().then(e => { throw new Error(e.message) });
              return res.json();
            });
        }
        ```
2.  **Tournament Bracket Management**:
    *   Extend `js/db.js` schema with a `brackets` key (e.g. `seeding: []`, `matches: []`).
    *   Integrate a libraries like `Brackets-Viewer.js` or custom SVG canvas components, reading match nodes dynamically.
3.  **Discord Integration**:
    *   In the backend registration resolver (`js/api.js`), execute a webhook post:
        ```javascript
        // Simulated:
        fetch(DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ content: `🏆 Team ${team.name} registered for ${tournament.title}!` })
        });
        ```
4.  **Payment Gateway (Stripe/Paypal)**:
    *   On submitting team-registration, redirect standard player flow to a Stripe checkout session URL.
    *   Add a webhook handler that updates the registration status from `pending_payment` to `pending_approval` inside the database only after receiving payment verification.
