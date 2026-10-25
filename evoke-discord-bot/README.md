# 🏆 EVOKE ESPORTS DISCORD BOT (v1.0)

> **Official Discord automation and community-management engine for Evoke Esports.**  
> Supports seamless player registration (BGMI, VALORANT, EA FC), automatic game role provisioning, duplicate account protection, administrative controls, and an isolated REST API integration layer.

---

## 🔌 API CONTRACT & ADAPTER ARCHITECTURE

The Discord bot **never directly depends on a specific website implementation**. All Discord interactions and domain services communicate solely through the `IEvokeApiClient` interface contract:

```
Discord UI (Buttons / Modals / Slash Commands)
                       │
                       ▼
       Interaction & Command Handlers
                       │
                       ▼
                 Domain Services
   (Registration, Roles, Feedback, Tournaments, Logs)
                       │
                       ▼
             IEvokeApiClient Layer
            ┌──────────┴──────────┐
            ▼                     ▼
   MockEvokeApiClient     HttpEvokeApiClient
   (Local JSON Store)      (Future Website REST API)
   [MOCK_API=true]         [MOCK_API=false]
```

### `IEvokeApiClient` Contract Methods:
- `registerPlayer(payload: RegistrationPayload): Promise<RegistrationResponse>`
- `checkDuplicate(payload: RegistrationPayload): Promise<DuplicateCheckResult>`
- `getPlayerProfile(query: { discordId?: string; playerId?: string }): Promise<PlayerProfile | null>`
- `updatePlayerStatus(playerId: string, status: string): Promise<boolean>`
- `listPlayers(filter?: { game?: string; status?: string }): Promise<PlayerProfile[]>`
- `getTournaments(game?: string): Promise<Tournament[]>`
- `getTournamentById(tournamentId: string): Promise<Tournament | null>`
- `registerForTournament(playerId: string, tournamentId: string): Promise<TournamentRegResponse>`
- `submitFeedback(feedback: FeedbackPayload): Promise<{ success: boolean; message?: string }>`

> [!NOTE]
> **Zero Coupling:** Discord interaction handlers **must NOT contain direct HTTP requests**. This allows the website developer to build or modify the backend implementation without requiring changes to the bot's interaction layer.

---

## 🎯 MVP Implementation Roadmap

```text
PHASE 1 — CORE BOT (MVP)
├── Bot setup & Gateway client (No Message Content intent needed)
├── Registration panel & game selection dropdown
├── Game-specific registration modals (BGMI, VALORANT, EA FC)
├── Robust input validation & configurable age ranges
├── Duplicate protection (Discord ID, Email, Game UIDs)
├── Persistent Mock API adapter (data/mock_db.json)
├── Evoke Player ID generation (EVK-XXXXX)
├── Automatic game role assignment with hierarchy protection
├── /profile command (Strict privacy: No email/age in public embed)
├── Audit logging to #bot-logs (masked emails)
├── /feedback modal routing
└── Full Admin suite (/admin stats, lookup, verify, setup, config)

PHASE 2 — WEBSITE INTEGRATION (Ready for Web Developer 🌐)
├── Real API adapter activation (MOCK_API=false)
├── Website player profile linking
├── Website registration sync
└── Account verification handshake

PHASE 3 — ESPORTS FEATURES 🏆
├── Tournament bracket integration
├── Scrim scheduling automation
├── Match results posting
└── Community leaderboards
```

---

## 🎮 Supported Game Divisions

| Game | Identifier | Required Information | Automatic Role |
| :--- | :--- | :--- | :--- |
| 🔫 **BGMI** | `bgmi` | Full Name, IGN, Character UID (5-15 digits), Email, Age | `BGMI_ROLE_ID` |
| ⚡ **VALORANT** | `valorant` | Full Name, IGN, Riot ID (`Username#TAG`), Email, Age | `VALORANT_ROLE_ID` |
| ⚽ **EA FC** | `eafc` | Full Name, IGN, EA Account ID, Platform (PC/PlayStation/Xbox), Email, Age | `EAFC_ROLE_ID` |

---

## 🛡️ Registration Privacy & Security Rules

1. **Public Privacy Protection:** Players may only view their own private profile by default. Public profile information may be viewed through `player_id` or mention, but **Email, Age, Discord ID, and other sensitive fields must NEVER be exposed**.
2. **Ephemeral Registration Flow:** All registration steps, modal submissions, review cards, and confirmation dialogues are strictly **ephemeral** (visible only to the registering user).
3. **Audit Log Masking:** All log messages dispatched to `#bot-logs` automatically mask email addresses (e.g. `d***v@example.com`).
4. **Idempotency & Concurrency Locking:** An in-flight lock prevents double-click spam on the Confirm button from creating duplicate player records.
5. **Session Timeout:** Unconfirmed registration sessions expire after **10 minutes** to prevent stale memory state.

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v20.0.0 or higher
- **npm**: v10.0.0 or higher
- A Discord Application registered in the [Discord Developer Portal](https://discord.com/developers/applications)

### 2. Installation
```bash
# Navigate to the bot directory
cd evoke-discord-bot

# Install dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file:
```bash
cp .env.example .env
```

Configure your environment variables:
```ini
# Discord Bot Credentials (from Discord Developer Portal)
DISCORD_TOKEN=your_bot_token_here
DISCORD_CLIENT_ID=your_client_id_here
DISCORD_GUILD_ID=your_guild_id_here

# Discord Game Role IDs
BGMI_ROLE_ID=
VALORANT_ROLE_ID=
EAFC_ROLE_ID=

# Common & Staff Roles
STAFF_ROLE_ID=
ADMIN_ROLE_ID=
VERIFIED_ROLE_ID=

# Channel IDs
REGISTRATION_CHANNEL_ID=
FEEDBACK_CHANNEL_ID=
LOG_CHANNEL_ID=
SM_POSTS_CHANNEL_ID=
SHARE_BOOST_CHANNEL_ID=
FEEDBACK_LOG_CHANNEL_ID=   # Optional private staff channel; falls back to LOG_CHANNEL_ID

# Configurable Age Boundaries (Defaults: 12 - 99)
MIN_PLAYER_AGE=12
MAX_PLAYER_AGE=99

# Backend Website API Integration Layer
# Leave blank until the Evoke website/API is provided
EVOKE_API_URL=
EVOKE_API_KEY=
EVOKE_WEBSITE_URL=

# Development / Testing Mode
MOCK_API=true
```

### 4. Deploy Slash Commands
```bash
npm run deploy-commands
```

### 5. Run the Bot
```bash
# Development Mode (auto-reload)
npm run dev

# Production Build & Run
npm run build
npm start
```

---

## ⚙️ Discord Developer Portal Setup

1. Open [Discord Developer Portal](https://discord.com/developers/applications) -> Your App.
2. Under **Bot** tab:
   - ✅ Enable **Server Members Intent** (Privileged Intent).
   - ❌ **Message Content Intent is NOT required.** (The bot uses modern Slash Commands, Buttons, Select Menus, and Modals).
3. Under **OAuth2 -> URL Generator**:
   - Scopes: `bot`, `applications.commands`
   - Bot Permissions: `Manage Roles`, `Send Messages`, `Embed Links`, `Use Slash Commands`, `View Channels`, `Read Message History`.
4. **Role Hierarchy Requirement:** In Discord Server Settings -> Roles, position the **Evoke Bot Role** **above** the `BGMI`, `VALORANT`, and `EA FC` roles so Discord allows the bot to assign them.

---

## 📋 Slash Commands Reference

### Player-Facing Commands
| Command | Description |
| :--- | :--- |
| `/register now` | Initiates the multi-game registration flow |
| `/profile [user] [player_id]` | Displays public Evoke Player Profile card with verification badges |
| `/tournaments [game]` | Lists active tournaments and scrims |
| `/tournament info <id>` | Shows prize pool, format, rules, and register button |
| `/tournament register <id>` | Direct registration for an upcoming tournament |
| `/feedback submit` | Opens modal to submit suggestions or report issues |

### Staff & Admin Commands
| Command | Description | Required Permissions |
| :--- | :--- | :--- |
| `/register panel` | Deploys the permanent registration card to `#registration` | Staff / Admin |
| `/feedback panel` | Deploys the permanent feedback card to `#feedback` | Staff / Admin |
| `/announce-social` | Broadcasts styled alert to `#sm-posts` with link button | Manage Messages |
| `/admin stats` | Shows live count of registered players by game division | Administrator |
| `/admin player-lookup` | Shows complete internal player record including email/status | Administrator |
| `/admin verify <player_id>` | Manually updates player verification status | Administrator |
| `/admin registrations` | Lists recent player signups | Administrator |
| `/admin setup [panel]` | One-click deploy for registration and feedback panels | Administrator |
| `/admin config` | Inspects active role IDs, channels, and API mode | Administrator |

---

## 🌐 Website Developer Integration Spec

When the separate Evoke Website API is ready, switch the bot to live API mode by updating `.env`:
```ini
MOCK_API=false
EVOKE_API_URL=https://your-api-domain.com
EVOKE_API_KEY=your_api_key_here
EVOKE_WEBSITE_URL=https://your-website-domain.com
```

### Endpoints Expected by `HttpEvokeApiClient`:

1. **`POST /api/players/register`**
   - Payload: `{ discordId, discordUsername, fullName, game, ign, gameUid, email, age, platform?, riotId?, riotTag? }`
   - Response: `{ success: true, playerId: "EVK-00142", profileId: "prf_xxx" }`

2. **`POST /api/players/check-duplicate`**
   - Payload: `{ discordId, email, game, gameUid }`
   - Response: `{ isDuplicate: boolean, duplicateField?: string, duplicateValue?: string }`

3. **`GET /api/players/profile?discord_id=...` or `?player_id=...`**
   - Response: PlayerProfile object

4. **`POST /api/feedback`**
   - Payload: `{ discordId, discordUsername, category, message, attachmentUrl? }`
   - Response: `{ success: true }`

---

## 🧪 Automated Test Suite

```bash
npm test
```

All **27 unit and integration tests** across 6 test suites verify:
- Input validation schemas & age limits
- Duplicate detection across Discord ID, Email, and Game UIDs
- Mock database persistence
- Role assignment and permission hierarchies
- Idempotency and in-flight click locking
- Registration privacy and profile filtering
- Tournament eligibility and slot handling

---

## 📜 License
Proprietary — Developed exclusively for **Evoke Esports**. All rights reserved.
