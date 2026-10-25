import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BatteryCharging,
  Bell,
  BrainCircuit,
  Check,
  ChevronDown,
  Circle,
  ChevronLeft,
  ChevronRight,
  CloudFog,
  Clock3,
  Compass,
  Cpu,
  Download,
  Eye,
  FileText,
  Flame,
  Gauge,
  GitBranch,
  GitCommit,
  GitFork,
  GitMerge,
  Layers3,
  MapPinned,
  Menu,
  Network,
  Octagon,
  PhoneCall,
  Plug,
  Pause,
  Play,
  Power,
  Radio,
  RadioTower,
  RefreshCw,
  RotateCcw,
  Route,
  Search,
  Send,
  Settings2,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Siren,
  Signal,
  SlidersHorizontal,
  Sparkles,
  Terminal,
  TimerReset,
  TrainFront,
  TriangleAlert,
  TrendingDown,
  Volume2,
  VolumeX,
  Wifi,
  Workflow,
  X,
  Zap,
} from "lucide-react";

type View = "overview" | "passenger" | "dispatch" | "sandbox" | "loco" | "diagnostics" | "api";

type Role = "CONTROLLER" | "LOCO_PILOT" | "PASSENGER";

type Scenario = {
  id: "fog" | "tsr" | "freight" | "aspect" | "obstruction" | "ohe";
  label: string;
  sub: string;
  icon: typeof CloudFog;
  color: string;
  impactMinutes: number;
};

type Train = {
  trainNo: string;
  name: string;
  code: string;
  type: string;
  rake: string;
  priority: number;
  baseEta: string;
  baseDelayMin: number;
  nominalSpeedKmh: number;
  confidence: number;
  color: string;
  trackPosition: number;
  routeStops: { code: string; name: string; time: string; delay: number; platform: string; status: "complete" | "current" | "upcoming" }[];
};

type Station = {
  code: string;
  name: string;
  x: number;
  y: number;
  platforms: number;
  assignedPlatform: number;
  state: "clear" | "warn" | "focus";
  kavach: boolean;
  activeTsr?: string;
  weather: string;
  temp: string;
  delayMin: number;
  crowdIndex: number;
};

const scenarios: Scenario[] = [
  { id: "fog", label: "Dense Gangetic Fog", sub: "Visibility < 100 m", icon: CloudFog, color: "#d9b76c", impactMinutes: 18 },
  { id: "tsr", label: "Mirzapur Track Renewal", sub: "TSR at 30 km/h", icon: TriangleAlert, color: "#ed7e63", impactMinutes: 11 },
  { id: "freight", label: "Freight Loop Blockage", sub: "Prayagraj Up Line", icon: TrainFront, color: "#b89cff", impactMinutes: 7 },
  { id: "aspect", label: "Signal Aspect Failure", sub: "Aligarh Interlocking", icon: Signal, color: "#79c7c4", impactMinutes: 14 },
  { id: "obstruction", label: "Track Obstruction / Boulder", sub: "Mirzapur Ghat line blocked", icon: AlertOctagon, color: "#ef4444", impactMinutes: 24 },
  { id: "ohe", label: "25kV OHE Catenary Breakdown", sub: "Kanpur–Fatehpur power drop", icon: Zap, color: "#eab308", impactMinutes: 29 },
];

const INITIAL_TRAINS: Train[] = [
  {
    trainNo: "12301",
    name: "Howrah Rajdhani Express",
    code: "NDLS-HWH",
    type: "Premium Superfast",
    rake: "LHB Executive",
    priority: 1,
    baseEta: "10:42",
    baseDelayMin: 2,
    nominalSpeedKmh: 130,
    confidence: 96,
    color: "#d9b76c",
    trackPosition: 68,
    routeStops: [
      { code: "NDLS", name: "New Delhi", time: "16:55", delay: 0, platform: "08", status: "complete" },
      { code: "CNB", name: "Kanpur Central", time: "21:35", delay: 1, platform: "01", status: "complete" },
      { code: "PRYJ", name: "Prayagraj Jn", time: "23:43", delay: 3, platform: "04", status: "current" },
      { code: "DDU", name: "Pt. Deen Dayal Upadhyaya", time: "01:25", delay: 4, platform: "02", status: "upcoming" },
      { code: "HWH", name: "Howrah Jn", time: "10:42", delay: 2, platform: "09", status: "upcoming" },
    ],
  },
  {
    trainNo: "22436",
    name: "Vande Bharat Express",
    code: "NDLS-PRYJ",
    type: "Semi-High Speed",
    rake: "Train-18 EMU",
    priority: 1,
    baseEta: "11:08",
    baseDelayMin: 4,
    nominalSpeedKmh: 140,
    confidence: 89,
    color: "#79c7c4",
    trackPosition: 52,
    routeStops: [
      { code: "NDLS", name: "New Delhi", time: "06:00", delay: 0, platform: "16", status: "complete" },
      { code: "ALJN", name: "Aligarh Jn", time: "07:18", delay: 1, platform: "03", status: "complete" },
      { code: "CNB", name: "Kanpur Central", time: "10:10", delay: 3, platform: "05", status: "current" },
      { code: "PRYJ", name: "Prayagraj Jn", time: "11:08", delay: 4, platform: "06", status: "upcoming" },
    ],
  },
  {
    trainNo: "12004",
    name: "Lucknow Swarna Shatabdi",
    code: "NDLS-LKO",
    type: "Intercity Express",
    rake: "LHB Chair Car",
    priority: 2,
    baseEta: "09:56",
    baseDelayMin: 0,
    nominalSpeedKmh: 125,
    confidence: 94,
    color: "#b89cff",
    trackPosition: 39,
    routeStops: [
      { code: "NDLS", name: "New Delhi", time: "06:10", delay: 0, platform: "01", status: "complete" },
      { code: "GZB", name: "Ghaziabad Jn", time: "06:48", delay: 0, platform: "02", status: "complete" },
      { code: "ALJN", name: "Aligarh Jn", time: "07:50", delay: 1, platform: "03", status: "current" },
      { code: "TDL", name: "Tundla Jn", time: "08:45", delay: 0, platform: "04", status: "upcoming" },
      { code: "CNB", name: "Kanpur Central", time: "09:56", delay: 0, platform: "01", status: "upcoming" },
    ],
  },
  {
    trainNo: "12802",
    name: "Purushottam Express",
    code: "PURI-NDLS",
    type: "Superfast Mail",
    rake: "ICF High-Capacity",
    priority: 3,
    baseEta: "12:27",
    baseDelayMin: 8,
    nominalSpeedKmh: 105,
    confidence: 74,
    color: "#ed7e63",
    trackPosition: 24,
    routeStops: [
      { code: "HWH", name: "Howrah Jn", time: "03:15", delay: 4, platform: "12", status: "complete" },
      { code: "DDU", name: "Pt. Deen Dayal Upadhyaya", time: "08:20", delay: 6, platform: "07", status: "complete" },
      { code: "MZP", name: "Mirzapur", time: "09:45", delay: 9, platform: "02", status: "current" },
      { code: "PRYJ", name: "Prayagraj Jn", time: "11:10", delay: 8, platform: "03", status: "upcoming" },
      { code: "NDLS", name: "New Delhi", time: "12:27", delay: 8, platform: "05", status: "upcoming" },
    ],
  },
  {
    trainNo: "59001",
    name: "BOXN Coal Freight Rake",
    code: "MGS-TDL",
    type: "Heavy Haul Freight",
    rake: "BOXN 58-Wagon",
    priority: 4,
    baseEta: "14:15",
    baseDelayMin: 22,
    nominalSpeedKmh: 70,
    confidence: 65,
    color: "#67c9a5",
    trackPosition: 12,
    routeStops: [
      { code: "DDU", name: "Pt. Deen Dayal Upadhyaya", time: "06:00", delay: 15, platform: "Loop 1", status: "complete" },
      { code: "MZP", name: "Mirzapur", time: "08:30", delay: 18, platform: "Loop 2", status: "complete" },
      { code: "PRYJ", name: "Prayagraj Jn", time: "11:45", delay: 22, platform: "Goods Yard", status: "current" },
      { code: "TDL", name: "Tundla Jn", time: "14:15", delay: 25, platform: "Yard Track 4", status: "upcoming" },
    ],
  },
];

const INITIAL_STATIONS: Station[] = [
  { code: "NDLS", name: "New Delhi", x: 6, y: 71, platforms: 16, assignedPlatform: 8, state: "clear", kavach: true, weather: "Clear", temp: "26°C", delayMin: 0, crowdIndex: 78 },
  { code: "GZB", name: "Ghaziabad Jn", x: 17, y: 64, platforms: 6, assignedPlatform: 2, state: "clear", kavach: true, weather: "Hazy", temp: "25°C", delayMin: 1, crowdIndex: 45 },
  { code: "ALJN", name: "Aligarh Jn", x: 29, y: 55, platforms: 7, assignedPlatform: 3, state: "warn", kavach: true, activeTsr: "75 km/h", weather: "Morning Mist", temp: "23°C", delayMin: 3, crowdIndex: 52 },
  { code: "TDL", name: "Tundla Jn", x: 38, y: 49, platforms: 5, assignedPlatform: 4, state: "clear", kavach: true, weather: "Dense Fog", temp: "20°C", delayMin: 2, crowdIndex: 38 },
  { code: "CNB", name: "Kanpur Central", x: 44, y: 46, platforms: 10, assignedPlatform: 1, state: "clear", kavach: true, weather: "Clear", temp: "25°C", delayMin: 4, crowdIndex: 88 },
  { code: "PRYJ", name: "Prayagraj Jn", x: 55, y: 41, platforms: 10, assignedPlatform: 4, state: "focus", kavach: true, activeTsr: "30 km/h Loop", weather: "River Fog <80m", temp: "19°C", delayMin: 12, crowdIndex: 94 },
  { code: "MZP", name: "Mirzapur", x: 67, y: 31, platforms: 4, assignedPlatform: 2, state: "warn", kavach: true, activeTsr: "30 km/h Track Renewal", weather: "Hazy", temp: "22°C", delayMin: 9, crowdIndex: 42 },
  { code: "DDU", name: "Pt. Deen Dayal Upadhyaya", x: 79, y: 22, platforms: 8, assignedPlatform: 2, state: "clear", kavach: true, weather: "Clear", temp: "24°C", delayMin: 4, crowdIndex: 68 },
  { code: "HWH", name: "Howrah Jn", x: 94, y: 14, platforms: 23, assignedPlatform: 9, state: "clear", kavach: true, weather: "Overcast", temp: "28°C", delayMin: 2, crowdIndex: 95 },
];

const views: { id: View; label: string; short: string; icon: typeof Activity }[] = [
  { id: "overview", label: "Corridor Pulse", short: "01", icon: Activity },
  { id: "passenger", label: "Passenger Live Portal", short: "02", icon: TrainFront },
  { id: "dispatch", label: "ADDS Dispatch AI", short: "03", icon: Workflow },
  { id: "sandbox", label: "What-If Sandbox", short: "04", icon: SlidersHorizontal },
  { id: "loco", label: "Loco Pilot HUD", short: "05", icon: Compass },
  { id: "diagnostics", label: "ST-GNN Diagnostics", short: "06", icon: BrainCircuit },
  { id: "api", label: "National API Hub", short: "07", icon: Plug },
];

// Web Audio API Synthesizer for Interactive Feedback
class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled = true;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
  }

  beep(freq = 600, duration = 0.04, type: OscillatorType = "sine") {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === "suspended") this.ctx.resume();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio not supported or blocked
    }
  }

  alert() {
    if (!this.enabled) return;
    this.beep(480, 0.08, "triangle");
    setTimeout(() => this.beep(320, 0.12, "triangle"), 80);
  }

  emergencySiren() {
    if (!this.enabled) return;
    for (let i = 0; i < 4; i++) {
      setTimeout(() => this.beep(880, 0.15, "sawtooth"), i * 280);
      setTimeout(() => this.beep(440, 0.15, "sawtooth"), i * 280 + 140);
    }
  }

  success() {
    if (!this.enabled) return;
    this.beep(523, 0.05, "sine");
    setTimeout(() => this.beep(659, 0.05, "sine"), 50);
    setTimeout(() => this.beep(784, 0.09, "sine"), 100);
  }
}

const sfx = new SoundEngine();

function StatCard({
  label,
  value,
  meta,
  icon: Icon,
  tone = "aqua",
  children,
}: {
  label: string;
  value: string;
  meta: string;
  icon: typeof Activity;
  tone?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`stat-card ${tone}`}>
      <div className="stat-top">
        <span>{label}</span>
        <Icon size={16} />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-meta">{meta}</div>
      {children}
    </div>
  );
}

export default function Home() {
  const [activeView, setActiveView] = useState<View>("overview");
  const [activeRole, setActiveRole] = useState<Role>("CONTROLLER");
  const [selectedTrainIdx, setSelectedTrainIdx] = useState<number>(0);
  const [activeScenario, setActiveScenario] = useState<Scenario["id"] | null>(null);

  // Emergency / Failure-Mode State (Feature 1)
  const [emergencyHaltActive, setEmergencyHaltActive] = useState<boolean>(false);
  const [emergencyReason, setEmergencyReason] = useState<string>("KAVACH TCAS AUTOMATIC BRAKE TRIGGER — SECTOR SEC-PRYJ-MZP");

  // Dynamic Disruption Sliders & Parameters
  const [fogVisibility, setFogVisibility] = useState<number>(80);
  const [tsrSpeedLimit, setTsrSpeedLimit] = useState<number>(30);
  const [freightBlocked, setFreightBlocked] = useState<boolean>(false);
  const [signalOverrideAspect, setSignalOverrideAspect] = useState<"GREEN" | "DOUBLE_YELLOW" | "YELLOW" | "RED">("GREEN");

  // Autonomous Dispatch Decision Support (ADDS)
  const [dispatchExecuted, setDispatchExecuted] = useState<boolean>(false);

  // Loco Pilot HUD Throttle & Coasting
  const [throttleNotch, setThrottleNotch] = useState<number>(6); // Notch 0 to 8

  // Simulation Controls
  const [simSpeed, setSimSpeed] = useState<"1x" | "5x" | "15x" | "60x">("1x");
  const [isLive, setIsLive] = useState<boolean>(true);
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const [telemetryTick, setTelemetryTick] = useState<number>(0);
  const [clockLabel, setClockLabel] = useState<string>("05:30:12");

  // Historical Replay Mode State (Feature 6)
  const [replayActive, setReplayActive] = useState<boolean>(false);
  const [replayOffsetMin, setReplayOffsetMin] = useState<number>(0); // -60m (Past) to +30m (Forecast)
  const [isAutoReplaying, setIsAutoReplaying] = useState<boolean>(false);

  // Crew & Staffing / Vigilance Control Device (VCD) (Feature 3)
  const [vcdAcknowledged, setVcdAcknowledged] = useState<boolean>(true);
  const [vcdCountdown, setVcdCountdown] = useState<number>(48);
  const [dutyElapsedMin, setDutyElapsedMin] = useState<number>(402); // 6h 42m

  // Network Resilience & Degraded Mode (Feature 7)
  const [networkMode, setNetworkMode] = useState<"LIVE_CLOUD" | "EDGE_LOCAL" | "DEGRADED_OFFLINE">("LIVE_CLOUD");

  // Interactive Junction Node for Attention Heatmap (Feature 5)
  const [selectedAttentionNode, setSelectedAttentionNode] = useState<string>("PRYJ");

  // Modals & Drawers (Features 1 & 10)
  const [modal, setModal] = useState<"search" | "alerts" | "settings" | "operator" | "integrations" | "station" | "training" | "emergency_confirm" | "architecture" | "crew_relief" | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Cab SMS simulation
  const [smsSent, setSmsSent] = useState<boolean>(false);

  // Training Simulation State
  const [trainingState, setTrainingState] = useState<{ running: boolean; step: number; progress: number; loss: number; error: number }>({
    running: false,
    step: 0,
    progress: 0,
    loss: 0.42,
    error: 1.2,
  });

  // Feature Weights
  const [featureWeights, setFeatureWeights] = useState({
    weather: 28,
    signal: 24,
    headway: 18,
    tsr: 18,
    gradient: 12,
  });

  // API Hub Testbed State
  const [apiTrainId, setApiTrainId] = useState<string>("12301");
  const [apiIncludeUncertainty, setApiIncludeUncertainty] = useState<boolean>(true);
  const [apiIncludePlatform, setApiIncludePlatform] = useState<boolean>(true);
  const [apiLatency, setApiLatency] = useState<number>(38);
  const [apiPayload, setApiPayload] = useState<string>("");

  // Trigger feedback toast
  const triggerToast = (msg: string) => {
    setToast(msg);
    sfx.beep(700, 0.05);
    setTimeout(() => setToast(null), 3800);
  };

  // Sync SFX state
  useEffect(() => {
    sfx.enabled = audioEnabled;
  }, [audioEnabled]);

  // Handle Role Switching
  const handleRoleSwitch = (role: Role) => {
    setActiveRole(role);
    if (role === "CONTROLLER") setActiveView("overview");
    else if (role === "LOCO_PILOT") setActiveView("loco");
    else if (role === "PASSENGER") setActiveView("passenger");
    sfx.beep(700, 0.04);
    triggerToast(`👤 Switched Role: ${role.replace("_", " ")}`);
  };

  // Toggle Emergency Stop Mode (Feature 1)
  const triggerEmergencyStop = () => {
    if (!emergencyHaltActive) {
      setEmergencyHaltActive(true);
      setSignalOverrideAspect("RED");
      sfx.emergencySiren();
      triggerToast("🚨 EMERGENCY BRAKE APPLIED: Sector Halting All Oncoming Rakes!");
    } else {
      setModal("emergency_confirm");
    }
  };

  // Clock & Telemetry Animation Loop
  useEffect(() => {
    if (!isLive) return;
    const intervalMs = simSpeed === "60x" ? 80 : simSpeed === "15x" ? 200 : simSpeed === "5x" ? 400 : 1000;
    const timer = setInterval(() => {
      setTelemetryTick((t) => t + 1);
      const now = new Date();
      setClockLabel(now.toLocaleTimeString("en-US", { hour12: false }));
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isLive, simSpeed]);

  // Replay Animation Loop
  useEffect(() => {
    if (!isAutoReplaying || !replayActive) return;
    const timer = setInterval(() => {
      setReplayOffsetMin((prev) => (prev >= 30 ? -60 : prev + 1));
    }, 400);
    return () => clearInterval(timer);
  }, [isAutoReplaying, replayActive]);

  // VCD Vigilance Countdown Loop (Indian Railways Safety Protocol)
  useEffect(() => {
    const timer = setInterval(() => {
      setVcdCountdown((sec) => {
        if (sec <= 1) {
          setVcdAcknowledged(false);
          sfx.beep(880, 0.1, "triangle");
          return 60;
        }
        return sec - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Dynamic ETA & Speed Calculation with Physics Multipliers
  const dynamicFleet = useMemo(() => {
    return INITIAL_TRAINS.map((train, idx) => {
      let delayMin = train.baseDelayMin;
      let effectiveSpeed = train.nominalSpeedKmh;
      let conf = train.confidence;

      // Emergency Halt Overrides (Feature 1)
      if (emergencyHaltActive) {
        effectiveSpeed = 0;
        delayMin += 35;
        conf = 45;
      } else {
        // ADDS dispatch optimization gain
        if (dispatchExecuted && train.priority <= 2) {
          delayMin = Math.max(0, delayMin - 4);
        }

        // Expanded Scenario Multipliers (Feature 2)
        if (activeScenario === "fog") {
          const fogPenalty = Math.round(((1200 - fogVisibility) / 100) * 1.8);
          delayMin += fogPenalty;
          effectiveSpeed = Math.min(effectiveSpeed, 60);
          conf = Math.max(68, conf - 12);
        } else if (activeScenario === "tsr") {
          delayMin += Math.round(((130 - tsrSpeedLimit) / 10) * 1.2);
          effectiveSpeed = Math.min(effectiveSpeed, tsrSpeedLimit + 10);
          conf = Math.max(72, conf - 8);
        } else if (activeScenario === "freight" || freightBlocked) {
          if (train.priority >= 2) delayMin += 9;
          else delayMin += 4;
          conf = Math.max(70, conf - 6);
        } else if (activeScenario === "aspect" || signalOverrideAspect === "RED") {
          delayMin += 14;
          effectiveSpeed = Math.min(effectiveSpeed, 25);
          conf = Math.max(65, conf - 15);
        } else if (activeScenario === "obstruction") {
          // Feature 2: Track Obstruction Boulder Fall
          delayMin += train.priority === 1 ? 16 : 24;
          effectiveSpeed = Math.min(effectiveSpeed, 15); // Crawl
          conf = Math.max(60, conf - 22);
        } else if (activeScenario === "ohe") {
          // Feature 2: 25kV OHE Catenary Breakdown
          delayMin += 29;
          effectiveSpeed = 0; // Standstill
          conf = 55;
        }

        // Dynamic Throttle Notch Adjustment for selected train
        if (idx === selectedTrainIdx) {
          const notchFactor = throttleNotch / 8;
          effectiveSpeed = Math.round(effectiveSpeed * (0.4 + notchFactor * 0.6));
        }
      }

      // Historical Replay offset factor (Feature 6)
      if (replayActive) {
        delayMin += Math.round(replayOffsetMin * 0.2);
        if (replayOffsetMin < -30) {
          effectiveSpeed = Math.round(effectiveSpeed * 0.8);
        }
      }

      // Dynamic Clock Formatting
      const baseHour = parseInt(train.baseEta.split(":")[0]);
      const baseMin = parseInt(train.baseEta.split(":")[1]);
      const totalMin = baseHour * 60 + baseMin + delayMin;
      const calcHour = Math.floor((totalMin / 60) % 24).toString().padStart(2, "0");
      const calcMin = Math.floor(totalMin % 60).toString().padStart(2, "0");
      const dynamicEta = `${calcHour}:${calcMin}`;

      // Dynamic uncertainty band
      const uncertaintyBand = conf > 90 ? "± 2 min" : conf > 80 ? "± 4 min" : "± 8 min";

      // Dynamic position on map with tick offset and replay time travel offset
      const replayPosDelta = replayActive ? (replayOffsetMin * 0.45) : 0;
      const posOffset = emergencyHaltActive ? 0 : (telemetryTick * (train.priority === 1 ? 0.4 : 0.25)) % 6;
      const currentPos = Math.min(94, Math.max(6, train.trackPosition + posOffset + replayPosDelta));

      return {
        ...train,
        dynamicEta,
        delayMin,
        effectiveSpeed,
        uncertaintyBand,
        confidence: conf,
        currentPos,
      };
    });
  }, [activeScenario, fogVisibility, tsrSpeedLimit, freightBlocked, signalOverrideAspect, telemetryTick, dispatchExecuted, selectedTrainIdx, throttleNotch, emergencyHaltActive, replayActive, replayOffsetMin]);

  const activeTrainData = dynamicFleet[selectedTrainIdx] || dynamicFleet[0];

  // Update API Payload dynamically
  useEffect(() => {
    const payload = {
      train_number: activeTrainData.trainNo,
      train_name: activeTrainData.name,
      corridor: activeTrainData.code,
      dynamic_eta: activeTrainData.dynamicEta,
      scheduled_delay_min: activeTrainData.delayMin,
      uncertainty_confidence: `${activeTrainData.confidence}% [${activeTrainData.confidence > 85 ? "HIGH" : "MEDIUM"}]`,
      conformal_band: apiIncludeUncertainty ? activeTrainData.uncertaintyBand : undefined,
      platform_assigned: apiIncludePlatform ? activeTrainData.routeStops[2]?.platform || "04" : undefined,
      current_telemetry: {
        speed_kmh: activeTrainData.effectiveSpeed,
        current_block: `BLK-NCR-${activeTrainData.routeStops[2]?.code || "PRYJ"}-01`,
        signal_aspect: signalOverrideAspect,
        kavach_handshake: emergencyHaltActive ? "EMERGENCY_INTERVENTION_ACTIVE" : "ARMED_HEALTHY",
        adds_precedence_optimized: dispatchExecuted,
        isro_rtis_ping_lat_long: [25.4484, 81.8340],
      },
      data_provenance: {
        gps_stream: "SIMULATED_ISRO_RTIS_SPEC",
        signaling_stream: "MOCK_ELECTRONIC_INTERLOCKING_DATALOGGER",
        prediction_model: "ST_GNN_DIFFUSION_v2.4.3",
      },
      last_updated: new Date().toISOString(),
    };
    setApiPayload(JSON.stringify(payload, null, 2));
  }, [activeTrainData, apiIncludeUncertainty, apiIncludePlatform, signalOverrideAspect, dispatchExecuted, emergencyHaltActive]);

  // Retrain Simulation Trigger
  const handleRunRetraining = () => {
    sfx.beep(880, 0.08);
    setTrainingState({ running: true, step: 1, progress: 10, loss: 0.38, error: 1.8 });
    setModal("training");

    setTimeout(() => {
      setTrainingState((s) => ({ ...s, step: 2, progress: 45, loss: 0.19 }));
      sfx.beep(740, 0.06);
    }, 1200);

    setTimeout(() => {
      setTrainingState((s) => ({ ...s, step: 3, progress: 80, loss: 0.08 }));
      sfx.beep(880, 0.06);
    }, 2400);

    setTimeout(() => {
      setTrainingState((s) => ({ ...s, step: 4, progress: 100, loss: 0.02, error: 1.2 }));
      sfx.success();
      triggerToast("✅ ST-GNN Checkpoint v2.4.3 Calibrated & Deployed!");
    }, 3600);
  };

  // Export Incident Brief
  const handleExportBrief = () => {
    sfx.beep(900, 0.06);
    const brief = {
      project: "NAVIGATED - SIH 2026",
      problem_id: "SIH26028",
      exported_at: new Date().toISOString(),
      emergency_halt_state: emergencyHaltActive ? "ACTIVE_EMERGENCY" : "NORMAL",
      active_scenario: activeScenario || "BASELINE_NORMAL",
      adds_dispatch_executed: dispatchExecuted,
      active_parameters: {
        fog_visibility_meters: fogVisibility,
        tsr_speed_kmh: tsrSpeedLimit,
        simulation_time_warp: simSpeed,
      },
      active_fleet_summary: dynamicFleet.map((t) => ({
        train_no: t.trainNo,
        name: t.name,
        dynamic_eta: t.dynamicEta,
        delay_min: t.delayMin,
        speed_kmh: t.effectiveSpeed,
        confidence: `${t.confidence}%`,
      })),
      corridor_hotspots: [
        { station: "PRYJ", reason: "Headway bunching zone", dwell_buffer_min: 6 },
        { station: "MZP", reason: "Track renewal TSR 30km/h", delay_delta: "+11 min" },
      ],
      ai_model_metrics: {
        version: "NAVIGATED-ST-GNN-v2.4.3",
        mae_minutes: trainingState.error,
        conformal_coverage: "95.4%",
      },
      provenance_disclosure: "Designed for live ISRO RTIS, CRIS FOIS, and Kavach TCAS integration (Simulated for Evaluation)",
    };

    const blob = new Blob([JSON.stringify(brief, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `NAVIGATED-Operations-Brief-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    triggerToast("📥 Incident Brief JSON downloaded to your system!");
  };

  // Search Results Filtering
  const filteredSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const results: { title: string; subtitle: string; action: () => void; icon: React.ReactNode }[] = [];

    // Search Trains
    dynamicFleet.forEach((train, idx) => {
      if (train.name.toLowerCase().includes(q) || train.trainNo.includes(q) || train.code.toLowerCase().includes(q)) {
        results.push({
          title: `${train.trainNo} ${train.name}`,
          subtitle: `ETA ${train.dynamicEta} · ${train.type} · Select Train`,
          icon: <TrainFront size={14} className="text-[#d9b76c]" />,
          action: () => {
            setSelectedTrainIdx(idx);
            setActiveView("passenger");
            setModal(null);
            sfx.beep(750, 0.05);
          },
        });
      }
    });

    // Search Stations
    INITIAL_STATIONS.forEach((stn) => {
      if (stn.name.toLowerCase().includes(q) || stn.code.toLowerCase().includes(q)) {
        results.push({
          title: `${stn.code} — ${stn.name}`,
          subtitle: `Platforms: ${stn.platforms} · Weather: ${stn.weather} · Open Inspector`,
          icon: <MapPinned size={14} className="text-[#79c7c4]" />,
          action: () => {
            setSelectedStation(stn);
            setModal("station");
            sfx.beep(800, 0.05);
          },
        });
      }
    });

    // Search Scenarios
    scenarios.forEach((sc) => {
      if (sc.label.toLowerCase().includes(q) || sc.sub.toLowerCase().includes(q)) {
        results.push({
          title: `Scenario: ${sc.label}`,
          subtitle: `${sc.sub} · Impact: +${sc.impactMinutes}m · Inject Disruption`,
          icon: <SlidersHorizontal size={14} className="text-[#ed7e63]" />,
          action: () => {
            setActiveScenario(sc.id);
            setActiveView("sandbox");
            setModal(null);
            sfx.alert();
          },
        });
      }
    });

    return results;
  }, [searchQuery, dynamicFleet]);

  return (
    <main className="app-shell">
      {/* ======================================================================= */}
      {/* 1. LEFT COMMAND SIDEBAR                                                 */}
      {/* ======================================================================= */}
      <aside className="rail-sidebar">
        <div className="brand-lockup">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-7 rounded bg-[#d9b76c]" />
            <div>
              <strong className="text-[17px] font-['Space_Grotesk'] tracking-tight block text-[#f4f0e7]">
                NAVIGATED<span className="text-[#d9b76c]">.</span>
              </strong>
              <small className="text-[8px] font-['DM_Mono'] text-[#79c7c4] block tracking-wider uppercase">
                SIH26028 · Living Command
              </small>
            </div>
          </div>
        </div>

        <div className="workspace-pill">
          <span className="live-orb" />
          <span>NDLS-HWH CORRIDOR</span>
          <Wifi size={13} className="text-[#79c7c4]" />
        </div>

        <nav className="primary-nav">
          {views.map((view) => {
            const Icon = view.icon;
            const isActive = activeView === view.id;
            return (
              <button
                key={view.id}
                className={`nav-item ${isActive ? "active" : ""}`}
                onClick={() => {
                  setActiveView(view.id);
                  sfx.beep(isActive ? 600 : 780, 0.04);
                }}
              >
                <span className="nav-index">{view.short}</span>
                <Icon size={15} />
                <span>{view.label}</span>
                {view.id === "dispatch" && (
                  <span className="nav-alert !bg-[#d9b76c]">AI</span>
                )}
                {view.id === "sandbox" && activeScenario && (
                  <span className="nav-alert">!</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-divider" />
        <div className="side-caption">
          ACTIVE FLEET ({dynamicFleet.length}) <span className="provenance-tag simulated ml-1">ISRO RTIS</span>
        </div>

        <div className="space-y-1 overflow-y-auto max-h-[160px] pr-1">
          {dynamicFleet.map((train, idx) => {
            const isSelected = selectedTrainIdx === idx;
            return (
              <button
                key={train.trainNo}
                className={`watch-row w-full transition-all ${
                  isSelected ? "bg-[rgba(121,199,196,0.15)] border-l-2 border-[#79c7c4]" : "hover:bg-[rgba(255,255,255,0.04)]"
                }`}
                onClick={() => {
                  setSelectedTrainIdx(idx);
                  sfx.beep(650 + idx * 40, 0.04);
                }}
              >
                <span className="watch-train" style={{ background: train.color }} />
                <div>
                  <strong>{train.trainNo} {train.name.split(" ")[0]}</strong>
                  <small>{train.effectiveSpeed} km/h · {train.rake.split(" ")[0]}</small>
                </div>
                <span className={`watch-time ${train.delayMin > 0 ? "late" : ""}`}>
                  {train.dynamicEta}
                </span>
              </button>
            );
          })}
        </div>

        <div className="sidebar-bottom">
          <button
            className="utility-row"
            onClick={() => {
              setModal("architecture");
              sfx.beep(750, 0.04);
            }}
          >
            <Cpu size={14} className="text-[#79c7c4]" />
            <span>Architecture Specs</span>
            <b className="!text-[#79c7c4]">SIH '26</b>
          </button>
          <button
            className="utility-row"
            onClick={() => {
              setModal("alerts");
              sfx.beep(700, 0.04);
            }}
          >
            <Bell size={14} />
            <span>Active Advisories</span>
            <b>{emergencyHaltActive ? "CRIT" : activeScenario ? "04" : "01"}</b>
          </button>
          <button
            className="utility-row"
            onClick={() => {
              setModal("settings");
              sfx.beep(700, 0.04);
            }}
          >
            <Settings2 size={14} />
            <span>System Settings</span>
          </button>
          <div
            className="operator cursor-pointer hover:bg-[rgba(255,255,255,0.04)] transition-colors p-2 rounded"
            onClick={() => {
              setModal("operator");
              sfx.beep(650, 0.04);
            }}
          >
            <div className="operator-avatar">DK</div>
            <div>
              <strong>Dhruv & Team</strong>
              <small>Lead Ops Controller</small>
            </div>
            <ArrowUpRight size={13} className="text-[#7e98ae]" />
          </div>
        </div>
      </aside>

      {/* ======================================================================= */}
      {/* 2. MAIN STAGE CONTENT                                                   */}
      {/* ======================================================================= */}
      <section className="main-stage">
        {/* Top Header Bar */}
        <header className="topbar">
          <div className="breadcrumbs">
            <span>INDIAN RAILWAYS</span>
            <span>/</span>
            <span>NORTHERN TRUNK</span>
            <span>/</span>
            <strong>{views.find((v) => v.id === activeView)?.label.toUpperCase()}</strong>
          </div>

          <div className="top-actions">
            {/* Role-Based Switcher (Feature 9) */}
            <div className="role-switcher mr-2">
              <button
                className={`role-pill ${activeRole === "CONTROLLER" ? "active" : ""}`}
                onClick={() => handleRoleSwitch("CONTROLLER")}
              >
                Controller
              </button>
              <button
                className={`role-pill ${activeRole === "LOCO_PILOT" ? "active" : ""}`}
                onClick={() => handleRoleSwitch("LOCO_PILOT")}
              >
                Loco Pilot
              </button>
              <button
                className={`role-pill ${activeRole === "PASSENGER" ? "active" : ""}`}
                onClick={() => handleRoleSwitch("PASSENGER")}
              >
                Passenger
              </button>
            </div>

            {/* Emergency SOS Button (Feature 1) */}
            <button
              className={`emergency-pill-btn ${emergencyHaltActive ? "active animate-pulse" : ""}`}
              onClick={triggerEmergencyStop}
              title="Kavach TCAS Emergency Stop Trigger"
            >
              <Siren size={14} className={emergencyHaltActive ? "animate-spin text-white" : "text-[#ef4444]"} />
              <span>
                {emergencyHaltActive ? "EMERGENCY ACTIVE" : "EMERGENCY SOS"}
              </span>
            </button>

            {/* Audio SFX Toggle */}
            <button
              className={`audio-toggle ${audioEnabled ? "active" : ""}`}
              onClick={() => {
                setAudioEnabled(!audioEnabled);
                triggerToast(audioEnabled ? "🔇 Sound Muted" : "🔊 Sound SFX Enabled");
              }}
              title="Toggle Audio Feedback"
            >
              {audioEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
              <span>{audioEnabled ? "AUDIO ON" : "MUTED"}</span>
            </button>

            {/* Architecture Specs Modal Trigger (Feature 10) */}
            <button
              className="icon-button"
              onClick={() => {
                setModal("architecture");
                sfx.beep(750, 0.04);
              }}
              title="Scalability Architecture & SIH Specs"
            >
              <Layers3 size={14} className="text-[#79c7c4]" />
            </button>

            {/* Global Search Bar */}
            <div
              className="top-search"
              onClick={() => {
                setModal("search");
                sfx.beep(700, 0.04);
              }}
            >
              <Search size={13} />
              <span>Search network (Ctrl+K)...</span>
              <kbd>Ctrl+K</kbd>
            </div>

            {/* Quick Export Button */}
            <button
              className="icon-button"
              onClick={handleExportBrief}
              title="Download Operations Brief JSON"
            >
              <Download size={14} />
            </button>

            {/* Live Retrain Quick Action */}
            <button
              className="gold-button !h-8 !text-[9px]"
              onClick={handleRunRetraining}
            >
              <Sparkles size={13} />
              <span>RETRAIN GNN</span>
            </button>
          </div>
        </header>

        {/* Emergency Alert Banner (Feature 1) */}
        {emergencyHaltActive && (
          <div className="emergency-alert-banner animate-pulse">
            <div className="flex items-center gap-3">
              <AlertOctagon size={20} className="text-white" />
              <div>
                <strong className="text-[12px] font-['Space_Grotesk'] tracking-wide uppercase">
                  🚨 KAVACH TCAS EMERGENCY INTERVENTION ACTIVE — SECTOR SEC-PRYJ-MZP
                </strong>
                <small className="block text-[9px] font-['DM_Mono'] opacity-90">
                  All oncoming coaching rakes halted at -2.4 m/s² · Relay datalogger armed
                </small>
              </div>
            </div>
            <button
              className="resolve-emergency-btn"
              onClick={() => setModal("emergency_confirm")}
            >
              RESOLVE & RE-ARM CORRIDOR
            </button>
          </div>
        )}

        {/* ======================================================================= */}
        {/* VIEW 01: CORRIDOR PULSE & SCADA RADAR                                  */}
        {/* ======================================================================= */}
        {activeView === "overview" && (
          <section className="view-page animate-fadeIn">
            <div className="hero-row">
              <div>
                <div className="eyebrow">
                  <span className="eyebrow-line" /> ISRO RTIS NavIC + Kavach Telemetry Active
                  <span className="provenance-tag simulated ml-2">SIMULATED DATA STREAM</span>
                </div>
                <h1>
                  Forecast dynamic ETAs. <em>In real time.</em>
                </h1>
                <p className="hero-sub">
                  Spatio-Temporal Graph AI fusing signaling interlocking, train headway, Gangetic winter fog, and permanent caution restrictions.
                </p>
              </div>

              <div className="hero-actions">
                <div className="telemetry-readout">
                  <span className="pulse-dot" />
                  <strong>10 Hz</strong>
                  <small>Telemetry Loop</small>
                </div>
                <button
                  className="ghost-button"
                  onClick={() => {
                    setActiveView("dispatch");
                    sfx.beep(750, 0.04);
                  }}
                >
                  <Workflow size={13} /> ADDS Dispatch
                </button>
                <button
                  className="gold-button"
                  onClick={() => {
                    setActiveView("sandbox");
                    sfx.beep(800, 0.05);
                  }}
                >
                  <SlidersHorizontal size={14} /> What-If Sandbox <ArrowRight size={14} />
                </button>
              </div>
            </div>

            {/* Top 4 Real-time Stat Cards */}
            <div className="stat-grid">
              <StatCard
                label="CORRIDOR FLOW DELAY"
                value={`${emergencyHaltActive ? "+35" : activeScenario ? "+" + dynamicFleet[0].delayMin : "+02"} min`}
                meta={emergencyHaltActive ? "🚨 EMERGENCY BRAKE ENGAGED" : activeScenario ? `Active incident: ${activeScenario.toUpperCase()}` : "Within nominal headway buffer"}
                icon={Activity}
                tone={emergencyHaltActive ? "coral" : activeScenario ? "coral" : "aqua"}
              >
                <div className="mini-bars">
                  {[45, 65, 30, 85, 40, emergencyHaltActive || activeScenario ? 95 : 25].map((v, i) => (
                    <span
                      key={i}
                      style={{
                        height: `${v}%`,
                        background: emergencyHaltActive || activeScenario ? "#ed7e63" : "#79c7c4",
                        transition: "height 0.4s ease",
                      }}
                    />
                  ))}
                </div>
              </StatCard>

              <StatCard
                label="CONFORMAL CONFIDENCE"
                value={`${activeTrainData.confidence}%`}
                meta={`Uncertainty ${activeTrainData.uncertaintyBand}`}
                icon={BrainCircuit}
                tone="violet"
              >
                <div className="confidence-ring">
                  <span>{activeTrainData.confidence}%</span>
                </div>
              </StatCard>

              <StatCard
                label="CURRENT TRACK SPEED"
                value={`${activeTrainData.effectiveSpeed} km/h`}
                meta={`Ceiling: ${activeTrainData.nominalSpeedKmh} km/h · ${activeTrainData.trainNo}`}
                icon={Gauge}
                tone={emergencyHaltActive ? "coral" : "gold"}
              />

              <StatCard
                label="KAVACH TCAS STATUS"
                value={emergencyHaltActive ? "EMERGENCY HALT" : "100% ARMED"}
                meta="9 Interlocking stations linked"
                icon={ShieldCheck}
                tone={emergencyHaltActive ? "coral" : "aqua"}
              >
                <div className="exception-count">
                  <span className={emergencyHaltActive ? "crit" : "watch"}>
                    {emergencyHaltActive ? "04" : "00"}
                  </span>
                  <span className={`text-[11px] font-bold ${emergencyHaltActive ? "text-[#ef4444]" : "text-[#67c9a5]"}`}>
                    {emergencyHaltActive ? "HALTED" : "ARMED"}
                  </span>
                </div>
              </StatCard>
            </div>

            {/* Main Interactive SCADA Schematic */}
            <div className="section-heading">
              <div>
                <div className="eyebrow small">
                  INTERACTIVE SCADA TRACK SCHEMATIC <span className="provenance-tag kavach ml-2">KAVACH INTERLOCKING</span>
                </div>
                <h2>
                  NDLS ➔ HWH Living Corridor <span className="muted font-normal text-sm">(Click stations or signals to inspect)</span>
                </h2>
              </div>
              <div className="live-control">
                <span className="live-label">
                  <span className="pulse-dot" /> LIVE STREAMING ({simSpeed})
                </span>
                <button
                  className="toggle"
                  onClick={() => {
                    setIsLive(!isLive);
                    sfx.beep(isLive ? 500 : 800, 0.04);
                    triggerToast(isLive ? "⏸ Telemetry Paused" : "▶ Telemetry Resumed");
                  }}
                >
                  <div className={`toggle-knob ${isLive ? "on" : ""}`} />
                </button>
              </div>
            </div>

            <div className="overview-grid">
              {/* Left Column: Interactive SCADA Schematic + Historical Replay Bar */}
              <div className="flex flex-col gap-2">
                <div className="corridor-map">
                  <div className="map-grid" />
                  <div className="map-topline">
                    <span>
                      {emergencyHaltActive
                        ? "🚨 KAVACH EMERGENCY INTERVENTION ACTIVE · ALL ONCOMING TRACKS HALTED"
                        : replayActive
                        ? `⏪ REPLAY MODE: TIME OFFSET ${replayOffsetMin > 0 ? "+" : ""}${replayOffsetMin} MIN (${replayOffsetMin < 0 ? "PAST INCIDENT" : "FORECAST"})`
                        : activeScenario
                        ? `DISRUPTION ACTIVE: ${scenarios.find((s) => s.id === activeScenario)?.label.toUpperCase()}`
                        : "ALL SECTIONS CLEAR · AUTOMATIC BLOCK SIGNALING & LOOP SIDINGS"}
                    </span>
                    <span className="mono">UTC+05:30 / {clockLabel}</span>
                  </div>

                  <svg viewBox="0 0 1000 430" role="img" aria-label="Corridor Map">
                    <defs>
                      <linearGradient id="trackGlow" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0" stopColor="#d9b76c" />
                        <stop offset="0.5" stopColor="#79c7c4" />
                        <stop offset="1" stopColor="#b89cff" />
                      </linearGradient>
                      <filter id="softGlow">
                        <feGaussianBlur stdDeviation="6" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>

                    {/* Main Tracks */}
                    <path
                      className={`track-shadow ${emergencyHaltActive ? "emergency-track-halt" : ""}`}
                      d="M62 317 C 220 310, 250 240, 380 247 S 575 213, 665 157 S 820 72, 945 49"
                    />
                    <path
                      className={`track-line ${emergencyHaltActive ? "emergency-track-halt" : ""}`}
                      d="M62 317 C 220 310, 250 240, 380 247 S 575 213, 665 157 S 820 72, 945 49"
                    />
                    <path
                      className="track-line secondary"
                      d="M62 328 C 220 321, 250 251, 380 258 S 575 224, 665 168 S 820 83, 945 60"
                    />

                    {/* Loop Siding at Prayagraj (PRYJ) */}
                    <path
                      d="M520 226 Q 550 200, 580 215"
                      stroke={dispatchExecuted ? "#67c9a5" : "#79c7c4"}
                      strokeWidth="2.5"
                      strokeDasharray="3 3"
                      fill="none"
                      opacity="0.75"
                    />
                    <text x="535" y="196" fill={dispatchExecuted ? "#67c9a5" : "#79c7c4"} fontSize="8" fontFamily="DM Mono">
                      {dispatchExecuted ? "PRYJ LOOP (FREIGHT 59001 HELD)" : "PRYJ LOOP 1"}
                    </text>

                    {/* Obstruction visualizer (Feature 2) */}
                    {activeScenario === "obstruction" && (
                      <g transform="translate(680, 140)">
                        <circle r="14" fill="#ef4444" opacity="0.3" className="animate-ping" />
                        <circle r="8" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
                        <text x="0" y="22" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold" fontFamily="DM Mono">
                          🚧 BOULDER OBSTRUCTION
                        </text>
                      </g>
                    )}

                    {/* OHE Power Failure overlay (Feature 2) */}
                    {activeScenario === "ohe" && (
                      <g transform="translate(440, 240)">
                        <rect x="-60" y="-15" width="120" height="30" rx="4" fill="rgba(234,179,8,0.2)" stroke="#eab308" strokeWidth="1" />
                        <text x="0" y="4" textAnchor="middle" fill="#eab308" fontSize="9" fontWeight="bold" fontFamily="DM Mono">
                          ⚡ 0 kV CATENARY DROP
                        </text>
                      </g>
                    )}

                    {/* Fog overlay on Yamuna/Gangetic section */}
                    {(activeScenario === "fog" || fogVisibility < 400) && (
                      <g className="fog-band" opacity="0.85">
                        <path d="M314 210 C 420 160, 515 270, 625 182" stroke="#d9d3c0" strokeWidth="26" fill="none" opacity="0.4" />
                        <path d="M335 233 C 440 185, 530 293, 650 200" stroke="#d9d3c0" strokeWidth="20" fill="none" opacity="0.3" />
                        <text x="440" y="215" fill="#d9b76c" fontSize="11" fontFamily="DM Mono">
                          🌫️ DENSE FOG ZONE ({fogVisibility}m)
                        </text>
                      </g>
                    )}

                    {/* Interactive Station Markers */}
                    {INITIAL_STATIONS.map((stn) => (
                      <g
                        key={stn.code}
                        className={`station station-clickable ${stn.state}`}
                        transform={`translate(${stn.x * 10},${stn.y * 4.4})`}
                        onClick={() => {
                          setSelectedStation(stn);
                          setModal("station");
                          sfx.beep(720, 0.05);
                        }}
                      >
                        <circle r="9" />
                        <circle r="18" className="station-ring" />
                        <text x="0" y="-24" textAnchor="middle">
                          {stn.code}
                        </text>
                      </g>
                    ))}

                    {/* Interactive Signal Lamps */}
                    {INITIAL_STATIONS.slice(0, 5).map((stn, index) => {
                      const aspect =
                        emergencyHaltActive
                          ? "red"
                          : signalOverrideAspect === "RED"
                          ? "red"
                          : index === 3 && activeScenario === "aspect"
                          ? "red"
                          : index === 2
                          ? "double"
                          : "green";
                      return (
                        <g
                          key={`${stn.code}-signal`}
                          className={`signal-lamp signal-lamp-clickable ${aspect}`}
                          transform={`translate(${stn.x * 10 + 20},${stn.y * 4.4 + 4})`}
                          onClick={() => {
                            const next =
                              signalOverrideAspect === "GREEN"
                                ? "DOUBLE_YELLOW"
                                : signalOverrideAspect === "DOUBLE_YELLOW"
                                ? "YELLOW"
                                : signalOverrideAspect === "YELLOW"
                                ? "RED"
                                : "GREEN";
                            setSignalOverrideAspect(next);
                            sfx.beep(next === "RED" ? 300 : 700, 0.06);
                            triggerToast(`🚦 Signal Aspect Override: ${next}`);
                          }}
                        >
                          <path d="M0 0v-22" />
                          <circle cy="-27" r="5" />
                          <circle cy="-27" r="2" />
                        </g>
                      );
                    })}

                    {/* Moving Trains on Track */}
                    {dynamicFleet.map((train, index) => {
                      const x = 62 + train.currentPos * 8.7;
                      const y = 317 - train.currentPos * 2.8 - Math.sin(train.currentPos) * 9;
                      const isSelected = selectedTrainIdx === index;
                      return (
                        <g
                          key={train.trainNo}
                          className={`map-train map-train-clickable ${
                            emergencyHaltActive ? "emergency-train-halt" : ""
                          }`}
                          transform={`translate(${x},${y})`}
                          onClick={() => {
                            setSelectedTrainIdx(index);
                            sfx.beep(850, 0.05);
                            triggerToast(`🚆 Selected: ${train.trainNo} ${train.name}`);
                          }}
                        >
                          {isSelected && (
                            <circle r="18" fill="none" stroke={train.color} strokeWidth="2" strokeDasharray="3 3" opacity="0.8" />
                          )}
                          <circle
                            r="11"
                            fill={emergencyHaltActive ? "#ef4444" : train.color}
                            stroke="#f4f0e7"
                            strokeWidth="2"
                          />
                          <text x="0" y="4" textAnchor="middle" fill="#061d38" fontSize="8" fontWeight="bold" fontFamily="DM Mono">
                            {train.trainNo.slice(-2)}
                          </text>
                        </g>
                      );
                    })}
                  </svg>

                  <div className="map-legend">
                    <span>
                      <i className="legend-dot gold" /> Train Telemetry
                    </span>
                    <span>
                      <i className="legend-dot aqua" /> Automatic Block
                    </span>
                    <span>
                      <i className="legend-dot red" /> Caution / TSR Zone
                    </span>
                  </div>

                  <div
                    className={`map-callout ${emergencyHaltActive ? "!border-[#ef4444] !bg-[rgba(185,28,28,0.3)]" : activeScenario ? "scenario-callout" : ""} cursor-pointer`}
                    onClick={() => {
                      setSelectedTrainIdx(0);
                      setActiveView("passenger");
                      sfx.beep(750, 0.05);
                    }}
                  >
                    <div className="callout-eyebrow">
                      <span className="pulse-dot" />{" "}
                      {emergencyHaltActive
                        ? "EMERGENCY HALT"
                        : activeScenario
                        ? "DISRUPTION RADAR"
                        : "LEAD COACHING TRAIN"}
                    </div>
                    <strong>{activeTrainData.trainNo} {activeTrainData.name.split(" ")[0]}</strong>
                    <span>ETA {activeTrainData.dynamicEta} · {activeTrainData.effectiveSpeed} km/h</span>
                    <ArrowUpRight size={15} />
                  </div>
                </div>

                {/* Historical Replay Mode Controller Bar (Feature 6) */}
                <div className="replay-bar">
                  <div className="flex items-center gap-2">
                    <button
                      className={`gold-button !h-7 !text-[9px] ${
                        replayActive ? "!bg-[#d9b76c] !text-[#061d38]" : "!bg-[rgba(255,255,255,0.06)] !text-[#d9b76c]"
                      }`}
                      onClick={() => {
                        setReplayActive(!replayActive);
                        if (!replayActive) setReplayOffsetMin(-20);
                        else setReplayOffsetMin(0);
                        sfx.beep(700, 0.05);
                        triggerToast(!replayActive ? "⏪ Historical Replay Mode Activated (T-20 min)" : "▶ Returned to Real-Time Live Feed");
                      }}
                    >
                      <RotateCcw size={12} />
                      <span>{replayActive ? "REPLAY ACTIVE" : "ENABLE REPLAY"}</span>
                    </button>
                    {replayActive && (
                      <span className="replay-pill">
                        <Clock3 size={11} />
                        {replayOffsetMin < 0
                          ? `T${replayOffsetMin}m (HISTORICAL)`
                          : replayOffsetMin === 0
                          ? "T-0 (LIVE NOW)"
                          : `T+${replayOffsetMin}m (AI FORECAST)`}
                      </span>
                    )}
                  </div>

                  {replayActive ? (
                    <div className="replay-scrubber">
                      <button
                        className="icon-button !w-6 !h-6"
                        onClick={() => {
                          setReplayOffsetMin((v) => Math.max(-60, v - 5));
                          sfx.beep(500, 0.03);
                        }}
                        title="Rewind 5 minutes"
                      >
                        <ChevronLeft size={13} />
                      </button>

                      <input
                        type="range"
                        min="-60"
                        max="30"
                        step="1"
                        value={replayOffsetMin}
                        className="custom-range flex-1"
                        onChange={(e) => {
                          setReplayOffsetMin(Number(e.target.value));
                          sfx.beep(350 + (Number(e.target.value) + 60) * 4, 0.015);
                        }}
                      />

                      <button
                        className="icon-button !w-6 !h-6"
                        onClick={() => {
                          setReplayOffsetMin((v) => Math.min(30, v + 5));
                          sfx.beep(600, 0.03);
                        }}
                        title="Forward 5 minutes"
                      >
                        <ChevronRight size={13} />
                      </button>

                      <button
                        className={`icon-button !w-6 !h-6 ${isAutoReplaying ? "!text-[#67c9a5]" : ""}`}
                        onClick={() => {
                          setIsAutoReplaying(!isAutoReplaying);
                          sfx.beep(800, 0.04);
                          triggerToast(isAutoReplaying ? "⏸ Replay Paused" : "▶ Replay Playback Active");
                        }}
                      >
                        {isAutoReplaying ? <Pause size={12} /> : <Play size={12} />}
                      </button>
                    </div>
                  ) : (
                    <div className="text-[9px] font-['DM_Mono'] text-[#7e98ae] flex items-center gap-2">
                      <span className="pulse-dot" /> LIVE 10 HZ RTIS TELEMETRY FEED · SCRUB TO REWIND TIMELINE
                    </div>
                  )}

                  <div className="text-[9px] font-['DM_Mono'] text-[#d9b76c] font-bold">
                    {replayActive ? `SNAPSHOT: ${clockLabel} (OFFSET ${replayOffsetMin}m)` : "LIVE STREAM"}
                  </div>
                </div>
              </div>

              {/* Right SCADA Control Actions & Bottleneck Hotspots */}
              <div className="right-rail">
                {/* Autonomous Precedence Recommendation */}
                <div className="dispatch-recommendation-card">
                  <div className="flex items-center justify-between">
                    <span className="dispatch-badge">
                      <Sparkles size={11} /> ADDS DISPATCH ORDER
                    </span>
                    <span className="decision-gain">SAVE 14 MIN</span>
                  </div>
                  <strong className="text-[13px] text-[#f4f0e7] block mt-2">
                    Hold Freight 59001 on Mirzapur Loop Line
                  </strong>
                  <p className="text-[10px] text-[#8ca5b8] mt-1 leading-relaxed">
                    Prioritize Rajdhani (12301) & Vande Bharat (22436) through main line. Eliminates headway compression at Prayagraj.
                  </p>
                  <button
                    className={`gold-button w-full justify-center mt-3 !h-8 !text-[10px] ${
                      dispatchExecuted ? "!bg-[#67c9a5] !text-[#061d38]" : ""
                    }`}
                    onClick={() => {
                      setDispatchExecuted(!dispatchExecuted);
                      sfx.success();
                      triggerToast(
                        dispatchExecuted
                          ? "🔄 Reverted to Conventional Dispatch"
                          : "⚡ Executed AI Dispatch Order: Precedence Set!"
                      );
                    }}
                  >
                    <Check size={13} />
                    <span>{dispatchExecuted ? "DISPATCH ORDER ACTIVE" : "EXECUTE DISPATCH ORDER"}</span>
                  </button>
                </div>

                {/* Real-time Telemetry Event Stream */}
                <div className="panel">
                  <div className="panel-head">
                    <div>
                      <span className="panel-kicker">LIVE TELEMETRY FEED</span>
                      <h3>Signal & RFID Pings</h3>
                    </div>
                    <span className="mono text-[#79c7c4]">10 Hz</span>
                  </div>

                  <div className="event-list">
                    <div className="hover:bg-[rgba(255,255,255,0.03)] p-1 rounded transition-colors">
                      <div className="event-icon aqua">
                        <Radio size={13} />
                      </div>
                      <p>
                        <strong>ISRO NavIC GPS Ping Received</strong>
                        <small>12301 Rajdhani · Km 266.0 · {activeTrainData.effectiveSpeed} km/h</small>
                      </p>
                      <time>Just now</time>
                    </div>

                    <div className="hover:bg-[rgba(255,255,255,0.03)] p-1 rounded transition-colors">
                      <div className="event-icon gold">
                        <CloudFog size={13} />
                      </div>
                      <p>
                        <strong>Gangetic Fog Index Updated</strong>
                        <small>Visibility {fogVisibility}m · Auto-speed cap enforced</small>
                      </p>
                      <time>12s ago</time>
                    </div>

                    <div className="hover:bg-[rgba(255,255,255,0.03)] p-1 rounded transition-colors">
                      <div className="event-icon coral">
                        <ShieldAlert size={13} />
                      </div>
                      <p>
                        <strong>TSR 30 km/h Caution Order Active</strong>
                        <small>Mirzapur renewal block · 8 trains rescheduled</small>
                      </p>
                      <time>45s ago</time>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fleet Status Table */}
            <div className="fleet-section">
              <div className="section-heading compact">
                <div>
                  <div className="eyebrow small">ACTIVE TRAIN RUNNING SUMMARY</div>
                  <h2>Real-Time Dynamic ETAs vs Static NTES</h2>
                </div>
              </div>

              <div className="fleet-table">
                <div className="fleet-table-head">
                  <span>TRAIN / SERVICE</span>
                  <span>CURRENT SPEED</span>
                  <span>DYNAMIC ETA</span>
                  <span>CONFIDENCE BAND</span>
                  <span>ACTION</span>
                </div>

                {dynamicFleet.map((train, idx) => {
                  const isSelected = selectedTrainIdx === idx;
                  return (
                    <button
                      key={train.trainNo}
                      className={`fleet-row ${
                        isSelected ? "bg-[rgba(121,199,196,0.14)]" : ""
                      }`}
                      onClick={() => {
                        setSelectedTrainIdx(idx);
                        setActiveView("passenger");
                        sfx.beep(750, 0.04);
                      }}
                    >
                      <div className="train-cell">
                        <span className="train-marker" style={{ background: train.color }} />
                        <div>
                          <strong>{train.trainNo} {train.name}</strong>
                          <small>{train.code} · {train.rake}</small>
                        </div>
                      </div>

                      <div className="status-cell">
                        <span className="status-dot ok" />
                        <span>{train.effectiveSpeed} km/h</span>
                      </div>

                      <div className="eta-cell">
                        <strong>{train.dynamicEta}</strong>
                        <span className={train.delayMin > 0 ? "late" : ""}>
                          {train.delayMin === 0 ? "On Time" : `+${train.delayMin} min`}
                        </span>
                      </div>

                      <div className="confidence-cell">
                        <span>{train.confidence}% ({train.uncertaintyBand})</span>
                        <div className="confidence-track">
                          <span style={{ width: `${train.confidence}%`, background: train.color }} />
                        </div>
                      </div>

                      <ArrowUpRight size={15} className="text-[#7e98ae]" />
                    </button>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ======================================================================= */}
        {/* VIEW 02: PASSENGER LIVE PORTAL                                         */}
        {/* ======================================================================= */}
        {activeView === "passenger" && (
          <section className="view-page animate-fadeIn">
            <div className="view-title">
              <div>
                <div className="eyebrow">
                  <span className="eyebrow-line" /> Passenger Live Tracking Portal
                  <span className="provenance-tag ai-derived ml-2">CONFORMAL PREDICTION</span>
                </div>
                <h1>
                  {activeTrainData.trainNo} <em>{activeTrainData.name}</em>
                </h1>
                <p>
                  High-resolution dynamic ETA with uncertainty bounds and multimodal cab connection shield.
                </p>
              </div>

              {/* Train Selector Dropdown */}
              <div className="train-select">
                <span>SWITCH TRAIN SERVICE</span>
                <select
                  value={selectedTrainIdx}
                  onChange={(e) => {
                    setSelectedTrainIdx(Number(e.target.value));
                    sfx.beep(720, 0.05);
                  }}
                >
                  {dynamicFleet.map((t, idx) => (
                    <option key={t.trainNo} value={idx}>
                      {t.trainNo} — {t.name} ({t.dynamicEta})
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} />
              </div>
            </div>

            {/* Passenger Big Hero Card */}
            <div className="passenger-hero">
              <div className="passenger-main">
                <div className="service-line">
                  <span className="service-badge">
                    <span className="pulse-dot" /> LIVE EN ROUTE
                  </span>
                  <span className="mono">{activeTrainData.rake}</span>
                  <span className="mono">MAX {activeTrainData.nominalSpeedKmh} KM/H</span>
                </div>

                <h2>
                  {activeTrainData.dynamicEta} <span>{activeTrainData.uncertaintyBand}</span>
                </h2>

                <div className="eta-range">
                  <span>Dynamic ETA Window:</span>
                  <strong>
                    {activeTrainData.dynamicEta} (Confidence: {activeTrainData.confidence}%)
                  </strong>
                  <span className="confidence-badge">
                    <ShieldCheck size={13} /> CONFORMAL CALIBRATED
                  </span>
                </div>

                {/* Dynamic Stop-by-Stop Track Line */}
                <div className="passenger-track">
                  <div className="track-labels">
                    <span>{activeTrainData.routeStops[0]?.name || "Origin"}</span>
                    <span>{activeTrainData.routeStops[2]?.name || "En Route Station"}</span>
                    <span>{activeTrainData.routeStops[activeTrainData.routeStops.length - 1]?.name || "Destination"}</span>
                  </div>

                  <div className="track-rail">
                    <div
                      className="track-progress"
                      style={{ width: `${Math.min(100, activeTrainData.trackPosition + 10)}%` }}
                    />
                    <div
                      className="train-marker-large cursor-pointer"
                      style={{ left: `${Math.min(100, activeTrainData.trackPosition + 10)}%` }}
                      onClick={() => triggerToast(`🚆 Current Speed: ${activeTrainData.effectiveSpeed} km/h`)}
                    >
                      <TrainFront size={14} />
                    </div>
                    <i />
                    <i />
                    <i />
                  </div>

                  <div className="track-meta">
                    <span>Dep: {activeTrainData.routeStops[0]?.time}</span>
                    <span>Scheduled Platform {activeTrainData.routeStops[2]?.platform || "04"}</span>
                    <span>Expected: {activeTrainData.dynamicEta}</span>
                  </div>
                </div>
              </div>

              {/* Side Stats on Train */}
              <div className="passenger-side">
                <div className="side-stat">
                  <span>TELEMETRY SPEED</span>
                  <strong>{activeTrainData.effectiveSpeed} <small className="text-xs font-normal">km/h</small></strong>
                  <small>Speed ceiling {activeTrainData.nominalSpeedKmh} km/h</small>
                </div>

                <div className="side-stat">
                  <span>PLATFORM ASSIGNED</span>
                  <strong className="text-[#67c9a5]">PF-{activeTrainData.routeStops[2]?.platform || "04"}</strong>
                  <small>Auto block interlocking green</small>
                </div>

                <div className="side-stat weather">
                  <CloudFog size={24} className="text-[#d9b76c] flex-shrink-0 mt-1" />
                  <div>
                    <span>SECTION WEATHER</span>
                    <strong>{activeScenario === "fog" ? "Dense River Fog" : "Clear Sky 24°C"}</strong>
                    <small>Visibility {fogVisibility}m</small>
                  </div>
                </div>
              </div>
            </div>

            {/* Lower Passenger Section: Route Timeline + Feeder Cab Shield */}
            <div className="passenger-lower">
              {/* Stop-by-stop Timeline */}
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <span className="panel-kicker">JOURNEY SCHEDULE PROGRESSION</span>
                    <h3>Route Station Checkpoints</h3>
                  </div>
                  <span className="model-tag">RFID VERIFIED</span>
                </div>

                <div className="journey-list">
                  {activeTrainData.routeStops.map((stop, i) => (
                    <div
                      key={stop.code}
                      className={`journey-item ${stop.status} cursor-pointer hover:bg-[rgba(255,255,255,0.03)] p-1 rounded`}
                      onClick={() => {
                        const stn = INITIAL_STATIONS.find((s) => s.code === stop.code);
                        if (stn) {
                          setSelectedStation(stn);
                          setModal("station");
                          sfx.beep(750, 0.05);
                        }
                      }}
                    >
                      <span className="journey-dot">
                        {stop.status === "complete" ? <Check size={11} /> : <Circle size={8} />}
                      </span>
                      <div>
                        <strong>{stop.name} ({stop.code})</strong>
                        <small>Platform {stop.platform} · {stop.delay === 0 ? "On Time" : `+${stop.delay}m delay`}</small>
                      </div>
                      <time>{stop.time}</time>
                    </div>
                  ))}
                </div>
              </div>

              {/* Feeder Cab Protection & Delay Factor Attribution */}
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <span className="panel-kicker">MULTIMODAL SHIELD</span>
                    <h3>Feeder Cab & Metro Shield</h3>
                  </div>
                  <ShieldCheck size={18} className="text-[#67c9a5]" />
                </div>

                <div className="bg-[rgba(103,201,165,0.08)] border border-[rgba(103,201,165,0.25)] rounded p-3 mt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <strong className="text-[12px] text-[#f4f0e7] block">Uber / Metro Feeder Auto-Reschedule</strong>
                      <small className="text-[9px] text-[#7e98ae] block mt-0.5">Pickup automatically delayed by {activeTrainData.delayMin} min to match train arrival.</small>
                    </div>
                    <button
                      className="gold-button !h-7 !text-[9px]"
                      onClick={() => {
                        setSmsSent(true);
                        sfx.success();
                        triggerToast("📱 SMS Passenger Advisory Dispatched to +91 98765 43210");
                      }}
                    >
                      <PhoneCall size={11} />
                      <span>{smsSent ? "DISPATCHED" : "TEST SMS ALERT"}</span>
                    </button>
                  </div>
                </div>

                {/* Delay Factor Breakdown */}
                <div className="mt-4">
                  <span className="panel-kicker">AI DELAY FACTOR ATTRIBUTION</span>
                  <div className="space-y-2 mt-2">
                    <div className="factor">
                      <span>Weather & Fog</span>
                      <div>
                        <span style={{ width: `${activeScenario === "fog" ? 85 : 20}%` }} />
                      </div>
                      <strong>{activeScenario === "fog" ? "42%" : "08%"}</strong>
                    </div>

                    <div className="factor">
                      <span>Signaling Block Aspect</span>
                      <div>
                        <span style={{ width: `${signalOverrideAspect === "RED" ? 90 : 35}%` }} />
                      </div>
                      <strong>{signalOverrideAspect === "RED" ? "54%" : "18%"}</strong>
                    </div>

                    <div className="factor">
                      <span>Headway Buffer</span>
                      <div>
                        <span style={{ width: "40%" }} />
                      </div>
                      <strong>14%</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================================= */}
        {/* VIEW 03: AUTONOMOUS DISPATCH DECISION SUPPORT (ADDS)                   */}
        {/* ======================================================================= */}
        {activeView === "dispatch" && (
          <section className="view-page animate-fadeIn">
            <div className="view-title">
              <div>
                <div className="eyebrow">
                  <span className="eyebrow-line" /> Section Controller AI Co-Pilot
                  <span className="provenance-tag ai-derived ml-2">ADDS PRECEDENCE SOLVER</span>
                </div>
                <h1>
                  Autonomous <em>Dispatch Decision Support</em>
                </h1>
                <p>
                  AI solver optimizing dynamic train precedence, loop line siding utilization, and junction overtakes.
                </p>
              </div>

              <div className="sim-status">
                <span className="pulse-dot" />
                <span>ADDS ACTIVE · {dispatchExecuted ? "OPTIMAL PRECEDENCE" : "CONVENTIONAL DISPATCH"}</span>
              </div>
            </div>

            <div className="sandbox-grid">
              {/* Left: Active Conflict & AI Dispatch Order */}
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <span className="panel-kicker">REAL-TIME CONFLICT DETECTOR</span>
                    <h3>Headway Conflict at Prayagraj–Mirzapur</h3>
                  </div>
                  <span className="severity !text-[#d9b76c] !border-[rgba(217,183,108,0.4)]">
                    BOTTLENECK
                  </span>
                </div>

                <div className="mt-3 p-3 bg-[rgba(1,16,33,0.5)] border border-[var(--line)] rounded">
                  <div className="flex items-center gap-2 text-[11px] text-[#f4f0e7]">
                    <TriangleAlert size={14} className="text-[#ed7e63]" />
                    <strong>Conflict: 59001 Freight slowing 12301 Rajdhani (+18 min delay)</strong>
                  </div>
                  <p className="text-[10px] text-[#8ca5b8] mt-1">
                    Freight train on Up Main line is reducing Rajdhani speed from 130 km/h to 68 km/h. Headway buffer will erode in 12 km.
                  </p>
                </div>

                <div className="dispatch-recommendation-card !mt-4">
                  <div className="flex items-center justify-between">
                    <span className="dispatch-badge">
                      <Sparkles size={11} /> RECOMMENDED DISPATCH ORDER
                    </span>
                    <span className="decision-gain">NET GAIN: +14 MIN</span>
                  </div>

                  <strong className="text-[14px] text-[#f4f0e7] block mt-2">
                    Action: Divert 59001 to Mirzapur Loop Line Track 2
                  </strong>
                  <ul className="text-[10px] text-[#8ca5b8] mt-2 space-y-1 list-disc list-inside">
                    <li>Hold Freight 59001 for 7 minutes on loop siding.</li>
                    <li>Allow 12301 Rajdhani to pass at full 130 km/h on main line.</li>
                    <li>Allow 22436 Vande Bharat to maintain 4-minute headway.</li>
                  </ul>

                  <button
                    className={`gold-button w-full justify-center mt-4 !h-9 ${
                      dispatchExecuted ? "!bg-[#67c9a5] !text-[#061d38]" : ""
                    }`}
                    onClick={() => {
                      setDispatchExecuted(!dispatchExecuted);
                      sfx.success();
                      triggerToast(
                        dispatchExecuted
                          ? "🔄 Reverted Dispatch Order"
                          : "⚡ Executed AI Dispatch Order: Switch Thrown at Mirzapur!"
                      );
                    }}
                  >
                    <Check size={14} />
                    <span>{dispatchExecuted ? "DISPATCH ORDER APPLIED (ACTIVE)" : "APPLY & THROW SWITCH"}</span>
                  </button>
                </div>
              </div>

              {/* Right: Net Network Efficiency Comparison */}
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <span className="panel-kicker">NETWORK EFFICIENCY SIMULATION</span>
                    <h3>Dispatch Strategy Comparison</h3>
                  </div>
                  <span className="model-tag">SIMULATED</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="p-3 bg-[rgba(237,126,99,0.08)] border border-[rgba(237,126,99,0.25)] rounded">
                    <span className="text-[9px] font-['DM_Mono'] text-[#ed7e63] block">CONVENTIONAL (FIFO)</span>
                    <strong className="text-[24px] text-[#ed7e63] block mt-1">+22 min</strong>
                    <small className="text-[9px] text-[#7e98ae]">Cumulative fleet delay</small>
                  </div>

                  <div className="p-3 bg-[rgba(103,201,165,0.08)] border border-[rgba(103,201,165,0.25)] rounded">
                    <span className="text-[9px] font-['DM_Mono'] text-[#67c9a5] block">ADDS AI DISPATCH</span>
                    <strong className="text-[24px] text-[#67c9a5] block mt-1">+4 min</strong>
                    <small className="text-[9px] text-[#7e98ae]">Net delay after loop overtake</small>
                  </div>
                </div>

                {/* Siding Utilization Visualizer */}
                <div className="mt-5">
                  <span className="panel-kicker">STATION LOOP SIDING OCCUPANCY</span>
                  <div className="space-y-2 mt-2">
                    <div className="p-2.5 bg-[rgba(1,16,33,0.45)] border border-[var(--line)] rounded flex justify-between items-center text-[10px]">
                      <span>Mirzapur Loop Line 1 (Main Up)</span>
                      <strong className="text-[#67c9a5]">CLEAR (130 km/h)</strong>
                    </div>
                    <div className="p-2.5 bg-[rgba(1,16,33,0.45)] border border-[var(--line)] rounded flex justify-between items-center text-[10px]">
                      <span>Mirzapur Loop Line 2 (Siding Track)</span>
                      <strong className={dispatchExecuted ? "text-[#d9b76c]" : "text-[#7e98ae]"}>
                        {dispatchExecuted ? "59001 FREIGHT HELD (7m)" : "VACANT"}
                      </strong>
                    </div>
                    <div className="p-2.5 bg-[rgba(1,16,33,0.45)] border border-[var(--line)] rounded flex justify-between items-center text-[10px]">
                      <span>Prayagraj Goods Yard Loop</span>
                      <strong className="text-[#7e98ae]">VACANT</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================================= */}
        {/* VIEW 04: WHAT-IF DISRUPTION SANDBOX (EXPANDED TO 6 SCENARIOS)          */}
        {/* ======================================================================= */}
        {activeView === "sandbox" && (
          <section className="view-page animate-fadeIn">
            <div className="view-title">
              <div>
                <div className="eyebrow">
                  <span className="eyebrow-line" /> Proactive Contingency Sandbox (6 Real-World Incident Types)
                  <span className="provenance-tag simulated ml-2">PARAMETRIC SIMULATION</span>
                </div>
                <h1>
                  What-If <em>Disruption Sandbox</em>
                </h1>
                <p>
                  Inject real-time weather incidents, track renewals, boulder falls, or 25kV OHE catenary failures and observe fleet-wide recalculations.
                </p>
              </div>

              <div className="sim-status">
                <span className="pulse-dot" />
                <span>SANDBOX READY</span>
                <span className="mono font-bold text-[#d9b76c]">[{simSpeed}]</span>
              </div>
            </div>

            <div className="sandbox-grid">
              {/* Left: 6 Incident Scenario Cards + Dynamic Sliders */}
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <span className="panel-kicker">6 REAL-WORLD INCIDENT INJECTIONS</span>
                    <h3>Select Simulated Disruption</h3>
                  </div>
                  {activeScenario && (
                    <button
                      className="text-[9px] font-['DM_Mono'] text-[#ed7e63] flex items-center gap-1 hover:underline"
                      onClick={() => {
                        setActiveScenario(null);
                        setSignalOverrideAspect("GREEN");
                        setFreightBlocked(false);
                        sfx.beep(500, 0.05);
                        triggerToast("🔄 Cleared All Disruption Injections");
                      }}
                    >
                      <RotateCcw size={11} /> Reset Baseline
                    </button>
                  )}
                </div>

                <div className="scenario-list">
                  {scenarios.map((sc) => {
                    const Icon = sc.icon;
                    const isSelected = activeScenario === sc.id;
                    return (
                      <button
                        key={sc.id}
                        className={`scenario-card ${isSelected ? "selected" : ""}`}
                        style={{ "--scenario": sc.color } as React.CSSProperties}
                        onClick={() => {
                          if (isSelected) {
                            setActiveScenario(null);
                            sfx.beep(500, 0.05);
                          } else {
                            setActiveScenario(sc.id);
                            sfx.alert();
                            triggerToast(`⚠️ Injected Scenario: ${sc.label}`);
                          }
                        }}
                      >
                        <div className="scenario-icon">
                          <Icon size={16} />
                        </div>
                        <div>
                          <strong>{sc.label}</strong>
                          <small>{sc.sub}</small>
                        </div>
                        <span className="scenario-impact">+{sc.impactMinutes}m impact</span>
                        {isSelected && <Check size={14} className="scenario-check" />}
                      </button>
                    );
                  })}
                </div>

                {/* Fine-Tuning Multi-parameter Sliders */}
                <div className="mt-5 space-y-3">
                  <div className="interactive-slider-row">
                    <div className="slider-header">
                      <span>🌫️ GAUGE FOG VISIBILITY</span>
                      <strong>{fogVisibility} meters</strong>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="1200"
                      step="20"
                      value={fogVisibility}
                      className="custom-range"
                      onChange={(e) => {
                        setFogVisibility(Number(e.target.value));
                        if (!activeScenario) setActiveScenario("fog");
                        sfx.beep(400 + Number(e.target.value) / 2, 0.02);
                      }}
                    />
                    <div className="flex justify-between text-[8px] font-['DM_Mono'] text-[#7e98ae]">
                      <span>0m (Zero visibility)</span>
                      <span>600m (Haze)</span>
                      <span>1200m (Clear)</span>
                    </div>
                  </div>

                  <div className="interactive-slider-row">
                    <div className="slider-header">
                      <span>⚠️ TSR CAUTION SPEED RESTRICTION</span>
                      <strong>{tsrSpeedLimit} km/h</strong>
                    </div>
                    <input
                      type="range"
                      min="15"
                      max="120"
                      step="5"
                      value={tsrSpeedLimit}
                      className="custom-range"
                      onChange={(e) => {
                        setTsrSpeedLimit(Number(e.target.value));
                        if (!activeScenario) setActiveScenario("tsr");
                        sfx.beep(300 + Number(e.target.value) * 3, 0.02);
                      }}
                    />
                    <div className="flex justify-between text-[8px] font-['DM_Mono'] text-[#7e98ae]">
                      <span>15 km/h (Crawl)</span>
                      <span>60 km/h (Worksite)</span>
                      <span>120 km/h (Nominal)</span>
                    </div>
                  </div>
                </div>

                {/* Simulation Speed Accelerator */}
                <div className="scenario-actions">
                  <div>
                    <span className="panel-kicker">SIMULATION TIME ACCELERATOR</span>
                    <div className="speed-options">
                      {(["1x", "5x", "15x", "60x"] as const).map((s) => (
                        <button
                          key={s}
                          className={simSpeed === s ? "chosen" : ""}
                          onClick={() => {
                            setSimSpeed(s);
                            sfx.beep(600 + parseInt(s) * 10, 0.04);
                            triggerToast(`⏩ Time Warp Multiplier: ${s}`);
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    className="gold-button"
                    onClick={() => {
                      sfx.alert();
                      triggerToast("⚡ Real-time Dynamic ETA Recalculation Complete");
                    }}
                  >
                    <Zap size={14} /> Recalculate Fleet
                  </button>
                </div>
              </div>

              {/* Right: Real-time Impact Delta & Fleet Comparison */}
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <span className="panel-kicker">FLEET IMPACT DELTA</span>
                    <h3>Cascading Delay Propagation</h3>
                  </div>
                  <span className="severity">
                    {activeScenario ? "DISRUPTED" : "NOMINAL"}
                  </span>
                </div>

                <div className="impact-number">
                  <span>CORRIDOR DELAY ADDITION:</span>
                  <strong>
                    +{activeScenario ? (activeScenario === "fog" ? Math.round((1200 - fogVisibility) / 60) : activeScenario === "tsr" ? Math.round((130 - tsrSpeedLimit) / 8) : activeScenario === "obstruction" ? 24 : activeScenario === "ohe" ? 29 : 14) : 0}
                    <small>MINUTES</small>
                  </strong>
                  <span className="impact-confidence">
                    Across 5 monitored train rakes
                  </span>
                </div>

                {/* Fleet Impact Comparison Table */}
                <div className="mt-5 space-y-2">
                  <span className="panel-kicker">BEFORE VS AFTER DISRUPTION</span>
                  <div className="fleet-table mt-2">
                    <div className="fleet-table-head !grid-cols-4">
                      <span>TRAIN</span>
                      <span>BASELINE</span>
                      <span>RECALCULATED</span>
                      <span>DELTA</span>
                    </div>

                    {dynamicFleet.map((t) => (
                      <div key={t.trainNo} className="fleet-row !grid-cols-4 !py-2.5">
                        <span className="text-[10px] font-bold">{t.trainNo} {t.name.split(" ")[0]}</span>
                        <span className="mono text-[#7e98ae]">{t.baseEta}</span>
                        <span className="mono font-bold text-[#f4f0e7]">{t.dynamicEta}</span>
                        <span className={`mono font-bold ${t.delayMin > 0 ? "text-[#ed7e63]" : "text-[#67c9a5]"}`}>
                          {t.delayMin === 0 ? "0m" : `+${t.delayMin}m`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="impact-footer mt-4">
                  <span>
                    <i className="legend-dot gold" /> Conformal coverage 95%
                  </span>
                  <span className="mono">Updated at UTC+05:30 {clockLabel}</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================================= */}
        {/* VIEW 05: LOCO PILOT CAB HUD (GREEN WAVE, ENERGY & CREW ROSTER)         */}
        {/* ======================================================================= */}
        {activeView === "loco" && (
          <section className="view-page animate-fadeIn">
            <div className="view-title">
              <div>
                <div className="eyebrow">
                  <span className="eyebrow-line" /> Driver Advisory, Traction Energy & Crew Duty HUD
                  <span className="provenance-tag kavach ml-2">KAVACH TCAS CAB INTERFACE</span>
                </div>
                <h1>
                  Loco Pilot <em>Cab Assistant</em>
                </h1>
                <p>
                  Green-wave advisory profiling saving 14.2% traction energy with regenerative braking feedback and 10-hour duty compliance.
                </p>
              </div>

              <div className="sim-status !border-[rgba(103,201,165,0.4)]">
                <span className="pulse-dot" />
                <span>GREEN WAVE ARMED · {activeTrainData.trainNo} {activeTrainData.name.split(" ")[0]}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Speedometer Gauge, Throttle Notch & Cab Signals */}
              <div className="space-y-4">
                <div className="loco-hud-card">
                  <div className="panel-head">
                    <div>
                      <span className="panel-kicker">WAP-7 / TRAIN-18 TRACTION CONTROL</span>
                      <h3>Speed & Target Braking Curve</h3>
                    </div>
                    <span className={`model-tag ${emergencyHaltActive ? "!text-[#ef4444] !border-[#ef4444]" : "!text-[#67c9a5] !border-[#67c9a5]"}`}>
                      {emergencyHaltActive ? "EMERGENCY BRAKE" : "KAVACH ARMED"}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center my-5">
                    <div className="text-center">
                      <span className={`text-[52px] font-['Space_Grotesk'] font-bold ${emergencyHaltActive ? "text-[#ef4444]" : "text-[#79c7c4]"}`}>
                        {activeTrainData.effectiveSpeed}
                      </span>
                      <span className="text-[14px] font-['DM_Mono'] text-[#7e98ae] ml-2">KM/H</span>
                    </div>
                    <small className="text-[10px] font-['DM_Mono'] text-[#d9b76c]">
                      {emergencyHaltActive
                        ? "🚨 EMERGENCY BRAKE ENGAGED (-2.4 m/s²)"
                        : "RECOMMENDED ADVISORY SPEED: 118 KM/H (COASTING)"}
                    </small>
                  </div>

                  {/* Throttle Notch Slider */}
                  <div className="p-3 bg-[rgba(1,16,33,0.6)] border border-[var(--line)] rounded">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-[#7e98ae]">THROTTLE MASTER CONTROLLER</span>
                      <strong className="text-[#d9b76c] font-['DM_Mono']">
                        {emergencyHaltActive ? "NOTCH 0 (CUTOFF)" : `NOTCH ${throttleNotch} / 8`}
                      </strong>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="8"
                      disabled={emergencyHaltActive}
                      value={emergencyHaltActive ? 0 : throttleNotch}
                      className="custom-range mt-2"
                      onChange={(e) => {
                        setThrottleNotch(Number(e.target.value));
                        sfx.beep(300 + Number(e.target.value) * 60, 0.03);
                      }}
                    />
                    <div className="flex justify-between text-[8px] font-['DM_Mono'] text-[#7e98ae] mt-1">
                      <span>N-0 (Coasting)</span>
                      <span>N-4 (Cruising)</span>
                      <span>N-8 (Full Power)</span>
                    </div>
                  </div>

                  {/* Cab Signal Indicator */}
                  <div className="mt-3 p-2.5 bg-[rgba(255,255,255,0.03)] border border-[var(--line)] rounded flex justify-between items-center text-[10px]">
                    <div className="flex items-center gap-2">
                      <Signal size={14} className={emergencyHaltActive ? "text-[#ef4444]" : "text-[#67c9a5]"} />
                      <span>Next Block Signal Aspect Target</span>
                    </div>
                    <strong className={emergencyHaltActive ? "text-[#ef4444] font-['DM_Mono']" : "text-[#67c9a5] font-['DM_Mono']"}>
                      {emergencyHaltActive ? "RED (Absolute Stop)" : "GREEN in 4.2 km (Target: 11:08)"}
                    </strong>
                  </div>
                </div>

                {/* Crew & Staffing / Duty Roster Panel (Feature 3) */}
                <div className="crew-card">
                  <div className="panel-head">
                    <div>
                      <span className="panel-kicker">CREW ROSTER & 10-HOUR RULE</span>
                      <h3>Loco Crew & Fatigue Management</h3>
                    </div>
                    <span className="model-tag !text-[#79c7c4] !border-[#79c7c4]">
                      DUTY ARMED
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3 text-[10px]">
                    <div className="p-2.5 bg-[rgba(1,16,33,0.5)] border border-[var(--line)] rounded">
                      <span className="text-[#7e98ae] block font-['DM_Mono']">LOCO PILOT (LP)</span>
                      <strong className="text-[#f4f0e7] text-[11px] block mt-0.5">Rajesh Sharma (CNB Shed)</strong>
                      <small className="text-[#79c7c4]">Grade 1 Superfast Special</small>
                    </div>
                    <div className="p-2.5 bg-[rgba(1,16,33,0.5)] border border-[var(--line)] rounded">
                      <span className="text-[#7e98ae] block font-['DM_Mono']">ASSISTANT LP (ALP)</span>
                      <strong className="text-[#f4f0e7] text-[11px] block mt-0.5">Vikram Singh (NCR)</strong>
                      <small className="text-[#79c7c4]">Kavach Certified</small>
                    </div>
                  </div>

                  {/* 10-Hour Shift Limit Progress */}
                  <div className="mt-3 p-3 bg-[rgba(1,16,33,0.5)] border border-[var(--line)] rounded">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-[#7e98ae]">CONTINUOUS RUNNING DUTY</span>
                      <strong className="font-['DM_Mono'] text-[#d9b76c]">06h 42m / 10h 00m MAX</strong>
                    </div>
                    <div className="w-full h-2 bg-[rgba(255,255,255,0.08)] rounded-full mt-1.5 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#67c9a5] via-[#d9b76c] to-[#ed7e63] w-[67%]" />
                    </div>
                    <div className="flex justify-between text-[8px] font-['DM_Mono'] text-[#7e98ae] mt-1">
                      <span>Shift Start: 22:48</span>
                      <span>Fatigue Risk: 18% (LOW)</span>
                      <span>Relief: PRYJ (PF-04)</span>
                    </div>
                  </div>

                  {/* Vigilance Control Device (VCD) Interactive Button */}
                  <div className="mt-3 flex items-center justify-between p-2.5 bg-[rgba(237,126,99,0.08)] border border-[rgba(237,126,99,0.25)] rounded">
                    <div className="text-[10px]">
                      <strong className="text-[#f4f0e7] block">Vigilance Control Device (VCD)</strong>
                      <small className="text-[#7e98ae]">Acknowledge pedal every 60s · Timer: <span className="text-[#ed7e63] font-bold font-['DM_Mono']">{vcdCountdown}s</span></small>
                    </div>
                    <button
                      className={`vcd-btn ${vcdAcknowledged ? "acknowledged" : ""}`}
                      onClick={() => {
                        setVcdAcknowledged(true);
                        setVcdCountdown(60);
                        sfx.beep(750, 0.05);
                        triggerToast("✅ VCD Pedal Acknowledged — Reset to 60s");
                      }}
                    >
                      <Check size={12} />
                      <span>{vcdAcknowledged ? "ACKNOWLEDGED" : "PRESS VCD PEDAL"}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column: Physics-Informed Davis Drag & Energy Dashboard (Feature 4) */}
              <div className="space-y-4">
                <div className="loco-hud-card">
                  <div className="panel-head">
                    <div>
                      <span className="panel-kicker">ENERGY & REGENERATIVE BRAKING</span>
                      <h3>Traction kWh & Grid Feedback</h3>
                    </div>
                    <BatteryCharging size={18} className="text-[#67c9a5]" />
                  </div>

                  <div className="coasting-meter mt-3">
                    <div>
                      <span className="text-[10px] text-[#7e98ae] block font-['DM_Mono']">TRACTION ENERGY SAVINGS</span>
                      <strong className="text-[20px] text-[#67c9a5] block font-['Space_Grotesk']">14.2% REDUCTION</strong>
                    </div>
                    <Flame size={24} className="text-[#67c9a5]" />
                  </div>

                  {/* 3-Gauge Grid */}
                  <div className="energy-gauge-grid">
                    <div className="energy-gauge">
                      <small>TOTAL CONSUMED</small>
                      <strong className="text-[#79c7c4]">
                        {(activeTrainData.effectiveSpeed * 28.5 + throttleNotch * 240).toFixed(0)} <span className="text-[10px] font-normal">kWh</span>
                      </strong>
                    </div>
                    <div className="energy-gauge">
                      <small>REGEN RETURNED</small>
                      <strong className="text-[#67c9a5]">
                        {(activeTrainData.effectiveSpeed > 0 ? activeTrainData.effectiveSpeed * 4.8 : 0).toFixed(0)} <span className="text-[10px] font-normal">kWh</span>
                      </strong>
                    </div>
                    <div className="energy-gauge">
                      <small>NET SPECIFIC SEC</small>
                      <strong className="text-[#d9b76c]">
                        18.4 <span className="text-[10px] font-normal">kWh/kGTKM</span>
                      </strong>
                    </div>
                  </div>

                  {/* Davis Formula PINN Breakdown */}
                  <div className="mt-4 p-3 bg-[rgba(1,16,33,0.5)] border border-[var(--line)] rounded text-[10px]">
                    <div className="flex justify-between items-center text-[#d9b76c] font-['DM_Mono'] mb-2">
                      <span>DAVIS DRAG EQUATION: R = A + Bv + Cv²</span>
                      <span className="text-[#79c7c4]">PINN CALIBRATED</span>
                    </div>

                    <div className="space-y-1.5 text-[#8ca5b8]">
                      <div className="flex justify-between">
                        <span>• Rolling Resistance (A):</span>
                        <strong className="text-[#f4f0e7] font-['DM_Mono']">1.34 kN/tonne</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>• Mechanical Flange Drag (B · v):</span>
                        <strong className="text-[#f4f0e7] font-['DM_Mono']">
                          {(0.012 * activeTrainData.effectiveSpeed).toFixed(2)} kN/tonne
                        </strong>
                      </div>
                      <div className="flex justify-between">
                        <span>• Aerodynamic Drag (C · v²):</span>
                        <strong className="text-[#f4f0e7] font-['DM_Mono']">
                          {(0.00034 * Math.pow(activeTrainData.effectiveSpeed, 2)).toFixed(2)} kN
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Eco-Coasting Profile Status */}
                  <div className="mt-3 p-2.5 bg-[rgba(103,201,165,0.08)] border border-[rgba(103,201,165,0.2)] rounded text-[10px] flex justify-between items-center">
                    <div>
                      <strong className="text-[#67c9a5] block">Eco-Coasting Profile Active</strong>
                      <small className="text-[#7e98ae]">Coasting on gentle -0.3% gradient approaching Mirzapur</small>
                    </div>
                    <span className="text-[11px] font-bold text-[#67c9a5] font-['DM_Mono']">+15.3% OHE FEED</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================================= */}
        {/* VIEW 06: SPATIO-TEMPORAL GNN & DIAGNOSTICS HUB                         */}
        {/* ======================================================================= */}
        {activeView === "diagnostics" && (
          <section className="view-page animate-fadeIn">
            <div className="view-title">
              <div>
                <div className="eyebrow">
                  <span className="eyebrow-line" /> Spatio-Temporal Graph Neural Networks
                  <span className="provenance-tag ai-derived ml-2">GRAPH DIFFUSION ML</span>
                </div>
                <h1>
                  ST-GNN & PINN <em>Diagnostics</em>
                </h1>
                <p>
                  Diffusion Graph Neural Network capturing cross-station ripple delay propagation along 19 physical sections.
                </p>
              </div>

              <button className="gold-button" onClick={handleRunRetraining}>
                <Sparkles size={14} /> Run Retraining Loop
              </button>
            </div>

            <div className="diagnostic-grid">
              {/* Error Reduction Comparison */}
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <span className="panel-kicker">MAE ERROR REDUCTION</span>
                    <h3>Static Timetable vs ST-GNN AI</h3>
                  </div>
                  <span className="model-tag">v2.4.3 CHECKPOINT</span>
                </div>

                <div className="error-compare">
                  <div>
                    <span>CONVENTIONAL NTES ERROR</span>
                    <strong className="text-[#ed7e63]">15.6 <small>min</small></strong>
                    <div className="error-bar static" />
                    <small>Coarse station linear extrapolation</small>
                  </div>

                  <div>
                    <span>ST-GNN HYBRID ERROR</span>
                    <strong className="aqua-text">{trainingState.error} <small>min</small></strong>
                    <div className="error-bar ai" style={{ width: `${(trainingState.error / 15.6) * 100}%` }} />
                    <small>Topological Graph Diffusion</small>
                  </div>
                </div>

                <div className="reduction-callout">
                  <Sparkles size={18} className="text-[#79c7c4]" />
                  <div>
                    <span>91.2% Accuracy Gain</span>
                    <small className="block">Residual error compressed to sub-90-second horizon.</small>
                  </div>
                </div>
              </div>

              {/* Interactive ST-GNN Edge Attention Matrix & Junction Inspector (Feature 5) */}
              <div className="panel">
                <div className="panel-head">
                  <div>
                    <span className="panel-kicker">GRAPH DIFFUSION ATTENTION</span>
                    <h3>Inter-Station Delay Adjacency ({selectedAttentionNode})</h3>
                  </div>
                  <Network size={15} className="text-[#d9b76c]" />
                </div>

                <p className="text-[10px] text-[#8ca5b8] mt-2">
                  Select key junction node to inspect spatial delay transmission probabilities:
                </p>

                {/* Node Selector Pills */}
                <div className="flex gap-1.5 flex-wrap mt-2">
                  {["NDLS", "ALJN", "CNB", "PRYJ", "MZP", "DDU", "HWH"].map((node) => (
                    <button
                      key={node}
                      className={`px-2 py-1 rounded text-[9px] font-['DM_Mono'] border transition-all ${
                        selectedAttentionNode === node
                          ? "bg-[rgba(121,199,196,0.2)] text-[#79c7c4] border-[#79c7c4] font-bold"
                          : "bg-[rgba(255,255,255,0.04)] text-[#7e98ae] border-[var(--line)] hover:text-white"
                      }`}
                      onClick={() => {
                        setSelectedAttentionNode(node);
                        sfx.beep(650, 0.04);
                        triggerToast(`📍 ST-GNN Node Centered: ${node} Interlocking`);
                      }}
                    >
                      {node}
                    </button>
                  ))}
                </div>

                {/* Dynamic Attention Score Grid */}
                <div className="gnn-matrix-grid mt-3">
                  <div className="gnn-matrix-cell">NDLS</div>
                  <div className="gnn-matrix-cell">ALJN</div>
                  <div className="gnn-matrix-cell">CNB</div>
                  <div className="gnn-matrix-cell">PRYJ</div>
                  <div className="gnn-matrix-cell">DDU</div>

                  <div className={`gnn-matrix-cell ${selectedAttentionNode === "NDLS" ? "high-attn" : "med-attn"}`}>
                    {selectedAttentionNode === "NDLS" ? "0.92" : "0.42"}
                  </div>
                  <div className={`gnn-matrix-cell ${selectedAttentionNode === "ALJN" ? "high-attn" : "med-attn"}`}>
                    {selectedAttentionNode === "ALJN" ? "0.88" : "0.78"}
                  </div>
                  <div className={`gnn-matrix-cell ${selectedAttentionNode === "CNB" ? "high-attn" : ""}`}>
                    {selectedAttentionNode === "CNB" ? "0.95" : "0.18"}
                  </div>
                  <div className={`gnn-matrix-cell ${selectedAttentionNode === "PRYJ" ? "high-attn" : "high-attn"}`}>
                    {selectedAttentionNode === "PRYJ" ? "0.99" : "0.89"}
                  </div>
                  <div className={`gnn-matrix-cell ${selectedAttentionNode === "DDU" ? "high-attn" : "med-attn"}`}>
                    {selectedAttentionNode === "DDU" ? "0.84" : "0.55"}
                  </div>
                </div>

                {/* SHAP-Style Feature Attribution for Active Train (Feature 5) */}
                <div className="shap-card mt-4">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="panel-kicker">SHAP FEATURE ATTRIBUTION: {activeTrainData.trainNo}</span>
                    <span className="text-[#67c9a5] font-['DM_Mono'] font-bold">EXPLAINABLE AI</span>
                  </div>

                  <div className="space-y-2 mt-2.5">
                    {[
                      { name: "Winter River Fog / Visibility", pct: activeScenario === "fog" ? 44 : 28, col: "#d9b76c" },
                      { name: "Signaling Interlocking State", pct: signalOverrideAspect === "RED" ? 52 : 24, col: "#79c7c4" },
                      { name: "Downstream Headway Density", pct: 20, col: "#b89cff" },
                      { name: "Track Gradient & TSR Caution", pct: activeScenario === "tsr" ? 38 : 16, col: "#ed7e63" },
                      { name: "Platform Dwell Buffer", pct: 12, col: "#67c9a5" },
                    ].map((f) => (
                      <div key={f.name} className="shap-bar-row">
                        <span className="text-[#8ca5b8] truncate">{f.name}</span>
                        <div className="shap-bar-track">
                          <div className="shap-bar-fill" style={{ width: `${f.pct}%`, background: f.col }} />
                        </div>
                        <strong className="text-right font-['DM_Mono']" style={{ color: f.col }}>{f.pct}%</strong>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Edge Quantization & Latency Telemetry */}
                <div className="mt-4 p-2.5 bg-[rgba(121,199,196,0.08)] border border-[rgba(121,199,196,0.2)] rounded flex justify-between items-center text-[10px]">
                  <div>
                    <strong className="text-[#79c7c4] block">Edge Quantization (ONNX / TensorRT)</strong>
                    <small className="text-[#7e98ae]">Inference Latency: 32.4ms · Memory Footprint: 420 MB</small>
                  </div>
                  <span className="text-[10px] font-bold text-[#67c9a5] font-['DM_Mono']">FP16 OPTIMIZED</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================================= */}
        {/* VIEW 07: NATIONAL OPEN API & KAFKA STREAMING HUB                       */}
        {/* ======================================================================= */}
        {activeView === "api" && (
          <section className="view-page animate-fadeIn">
            <div className="view-title">
              <div>
                <div className="eyebrow">
                  <span className="eyebrow-line" /> ISRO RTIS / Apache Kafka Ingestion Hub
                  <span className="provenance-tag simulated ml-2">REST & WEBSOCKET SPEC</span>
                </div>
                <h1>
                  Make the ETA <em>Portable.</em>
                </h1>
                <p>
                  REST & WebSocket endpoints ready for plug-and-play integration with NTES, Rail Madad, and IRCTC.
                </p>
              </div>

              {/* Network Resilience Selector (Feature 7) */}
              <div className="flex items-center gap-2">
                <div className="role-switcher">
                  <button
                    className={`role-pill ${networkMode === "LIVE_CLOUD" ? "active" : ""}`}
                    onClick={() => {
                      setNetworkMode("LIVE_CLOUD");
                      sfx.beep(750, 0.04);
                      triggerToast("🟢 Switched to Live Kafka 10 Hz Cluster");
                    }}
                  >
                    Live Cloud (10Hz)
                  </button>
                  <button
                    className={`role-pill ${networkMode === "EDGE_LOCAL" ? "active" : ""}`}
                    onClick={() => {
                      setNetworkMode("EDGE_LOCAL");
                      sfx.beep(700, 0.04);
                      triggerToast("⚡ Switched to Edge Local Inference (420MB Quantized Model)");
                    }}
                  >
                    Edge Local (32ms)
                  </button>
                  <button
                    className={`role-pill ${networkMode === "DEGRADED_OFFLINE" ? "active !bg-[#eab308] !text-black" : ""}`}
                    onClick={() => {
                      setNetworkMode("DEGRADED_OFFLINE");
                      sfx.alert();
                      triggerToast("⚠️ Degraded Mode Activated: Central Telecom Severed — Fallback Cache Active");
                    }}
                  >
                    Degraded / Offline
                  </button>
                </div>
              </div>
            </div>

            {/* Degraded Mode Resilience Banner (Feature 7) */}
            {networkMode === "DEGRADED_OFFLINE" && (
              <div className="degraded-banner">
                <div className="flex items-center gap-2">
                  <TriangleAlert size={16} className="text-[#eab308]" />
                  <span>
                    <strong>CENTRAL TELECOM CUT DETECTED:</strong> System gracefully running on quantized edge ST-GNN weights. Zero prediction outage.
                  </span>
                </div>
                <button
                  className="px-2.5 py-1 bg-[#eab308] text-black font-bold text-[9px] rounded hover:bg-[#ca8a04]"
                  onClick={() => {
                    setNetworkMode("LIVE_CLOUD");
                    sfx.success();
                    triggerToast("✅ Reconnected to Primary ISRO RTIS / Kafka Broker");
                  }}
                >
                  RETRY & RECONNECT PRIMARY
                </button>
              </div>
            )}

            <div className="api-grid">
              {/* Interactive Testbed Query Panel */}
              <div className="panel endpoint-panel">
                <div className="panel-head">
                  <div>
                    <span className="panel-kicker">LIVE API TESTBED</span>
                    <h3>GET /api/v1/trains/{apiTrainId}/eta</h3>
                  </div>
                  <span className="method">GET 200</span>
                </div>

                <div className="endpoint-url">
                  <span>/api/v1</span>/trains/{apiTrainId}/eta
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`http://127.0.0.1:8000/api/v1/trains/${apiTrainId}/eta`);
                      triggerToast("📋 API URL copied to clipboard!");
                    }}
                  >
                    <Layers3 size={14} />
                  </button>
                </div>

                {/* Interactive Query Parameters */}
                <div className="space-y-2 mt-3">
                  <div className="query-row">
                    <label>TRAIN_ID</label>
                    <select
                      value={apiTrainId}
                      className="fake-select"
                      onChange={(e) => {
                        setApiTrainId(e.target.value);
                        sfx.beep(750, 0.04);
                      }}
                    >
                      <option value="12301">12301 (Howrah Rajdhani)</option>
                      <option value="22436">22436 (Vande Bharat)</option>
                      <option value="12004">12004 (Shatabdi)</option>
                      <option value="12802">12802 (Purushottam)</option>
                      <option value="59001">59001 (BOXN Freight)</option>
                    </select>

                    <label>INCLUDE</label>
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1 text-[9px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={apiIncludeUncertainty}
                          onChange={(e) => setApiIncludeUncertainty(e.target.checked)}
                        />
                        Uncertainty
                      </label>
                      <label className="flex items-center gap-1 text-[9px] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={apiIncludePlatform}
                          onChange={(e) => setApiIncludePlatform(e.target.checked)}
                        />
                        Platform
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  className="gold-button run-endpoint mt-3 w-full justify-center"
                  onClick={() => {
                    sfx.success();
                    setApiLatency(Math.floor(Math.random() * 25) + 25);
                    triggerToast(`200 OK — Telemetry returned in ${apiLatency}ms`);
                  }}
                >
                  <Send size={13} /> Send API Request
                </button>

                {/* Syntax Highlighted JSON Response */}
                <div className="response-block mt-3">
                  <div className="response-head">
                    <span>RESPONSE PAYLOAD (application/json)</span>
                    <span className="mono">{apiLatency} ms</span>
                  </div>
                  <pre>{apiPayload}</pre>
                </div>
              </div>

              {/* Connected Railway Ecosystem Cards */}
              <div className="panel api-cards-panel">
                <div className="panel-head">
                  <div>
                    <span className="panel-kicker">CONNECTED SURFACES</span>
                    <h3>Ecosystem Bridges</h3>
                  </div>
                  <Plug size={18} />
                </div>

                <div
                  className="integration-card cursor-pointer hover:border-[#79c7c4] transition-colors"
                  onClick={() => triggerToast("🚆 NTES Live Telemetry Feed Connected")}
                >
                  <span className="integration-mark">N</span>
                  <div>
                    <strong>NTES (National Train Enquiry System)</strong>
                    <small>Public status feed · 10 Hz WebSocket</small>
                  </div>
                  <span className="connected"><Check size={12} /> LINKED</span>
                </div>

                <div
                  className="integration-card cursor-pointer hover:border-[#d9b76c] transition-colors"
                  onClick={() => triggerToast("📢 Rail Madad Passenger Notification Channel OK")}
                >
                  <span className="integration-mark amber">R</span>
                  <div>
                    <strong>Rail Madad App</strong>
                    <small>Passenger disruption advisories</small>
                  </div>
                  <span className="connected"><Check size={12} /> LINKED</span>
                </div>

                <div
                  className="integration-card cursor-pointer hover:border-[#b89cff] transition-colors"
                  onClick={() => triggerToast("🛡️ IRCTC Multimodal Feeder Webhook Armed")}
                >
                  <span className="integration-mark violet">I</span>
                  <div>
                    <strong>IRCTC Webhook Bridge</strong>
                    <small>Cab connection protection guarantee</small>
                  </div>
                  <span className="connected"><Check size={12} /> LINKED</span>
                </div>

                <button
                  className="gold-button w-full justify-center mt-5"
                  onClick={handleExportBrief}
                >
                  <FileText size={14} /> Export Technical Integration Specs
                </button>
              </div>
            </div>
          </section>
        )}
      </section>

      {/* ======================================================================= */}
      {/* 3. MODALS & INTERACTIVE DRAWERS                                         */}
      {/* ======================================================================= */}

      {/* Emergency Confirmation & Recovery Modal (Feature 1) */}
      {modal === "emergency_confirm" && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="action-modal !border-[#ef4444]" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="panel-kicker !text-[#ef4444]">CRITICAL SAFETY ACTION</span>
                <h3 className="text-[#ef4444]">Emergency Intervention Protocol</h3>
              </div>
              <button className="modal-close" onClick={() => setModal(null)}>
                <X size={17} />
              </button>
            </div>

            <div className="p-4 bg-[rgba(185,28,28,0.15)] border border-[#ef4444] rounded mt-4">
              <div className="flex items-center gap-2 text-[#ef4444] font-bold text-[12px]">
                <Siren size={18} />
                <span>Sector Status: {emergencyHaltActive ? "EMERGENCY HALT ARMED" : "NOMINAL"}</span>
              </div>
              <p className="text-[10px] text-[#f4f0e7] mt-2 leading-relaxed">
                {emergencyHaltActive
                  ? "Section SEC-PRYJ-MZP is currently locked in emergency halt. All 4 oncoming trains are at standstill. Confirming recovery will re-arm Kavach automatic signaling."
                  : "Triggering Emergency SOS will send an instant -2.4 m/s² brake override to all trains on the Northern Trunk sector."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <button
                className="ghost-button w-full justify-center"
                onClick={() => setModal(null)}
              >
                Cancel
              </button>
              <button
                className={emergencyHaltActive ? "gold-button w-full justify-center !bg-[#67c9a5] !text-[#061d38]" : "gold-button w-full justify-center !bg-[#ef4444] !text-white"}
                onClick={() => {
                  if (emergencyHaltActive) {
                    setEmergencyHaltActive(false);
                    setSignalOverrideAspect("GREEN");
                    sfx.success();
                    triggerToast("✅ Emergency Cleared — Kavach Re-Armed");
                  } else {
                    setEmergencyHaltActive(true);
                    setSignalOverrideAspect("RED");
                    sfx.emergencySiren();
                    triggerToast("🚨 Emergency Stop Triggered!");
                  }
                  setModal(null);
                }}
              >
                {emergencyHaltActive ? "CLEAR & RE-ARM" : "CONFIRM EMERGENCY"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Interactive Search Modal */}
      {modal === "search" && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="action-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="panel-kicker">GLOBAL SEARCH</span>
                <h3>Search Railway Network</h3>
              </div>
              <button className="modal-close" onClick={() => setModal(null)}>
                <X size={17} />
              </button>
            </div>

            <div className="modal-search">
              <Search size={16} />
              <input
                autoFocus
                value={searchQuery}
                placeholder="Type train number, station code, or scenario..."
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="modal-results">
              {filteredSearchResults.length > 0 ? (
                filteredSearchResults.map((res, i) => (
                  <button key={i} onClick={res.action}>
                    {res.icon}
                    <span>
                      <strong>{res.title}</strong>
                      <small>{res.subtitle}</small>
                    </span>
                    <ArrowUpRight size={14} />
                  </button>
                ))
              ) : searchQuery.trim() ? (
                <div className="text-center py-6 text-xs text-[#7e98ae]">
                  No matching trains or stations found for "{searchQuery}"
                </div>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setSelectedTrainIdx(0);
                      setActiveView("passenger");
                      setModal(null);
                    }}
                  >
                    <TrainFront size={14} className="text-[#d9b76c]" />
                    <span>
                      <strong>12301 Howrah Rajdhani Express</strong>
                      <small>Passenger Portal · Forecast ETA 10:42</small>
                    </span>
                    <ArrowUpRight size={14} />
                  </button>

                  <button
                    onClick={() => {
                      setSelectedTrainIdx(1);
                      setActiveView("passenger");
                      setModal(null);
                    }}
                  >
                    <TrainFront size={14} className="text-[#79c7c4]" />
                    <span>
                      <strong>22436 Vande Bharat Express</strong>
                      <small>Semi-High Speed · ETA 11:08</small>
                    </span>
                    <ArrowUpRight size={14} />
                  </button>

                  <button
                    onClick={() => {
                      setActiveView("sandbox");
                      setActiveScenario("fog");
                      setModal(null);
                    }}
                  >
                    <CloudFog size={14} className="text-[#d9b76c]" />
                    <span>
                      <strong>Dense Gangetic Fog Sandbox</strong>
                      <small>Visibility &lt; 100m speed restriction</small>
                    </span>
                    <ArrowUpRight size={14} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Interactive Station Inspector Modal */}
      {modal === "station" && selectedStation && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="action-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="panel-kicker">STATION BLOCK INSPECTOR</span>
                <h3>{selectedStation.code} — {selectedStation.name}</h3>
              </div>
              <button className="modal-close" onClick={() => setModal(null)}>
                <X size={17} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 bg-[rgba(1,16,33,0.5)] border border-[var(--line)] rounded">
                <span className="text-[8px] font-['DM_Mono'] text-[#7e98ae] block">WEATHER RADAR</span>
                <strong className="text-[14px] text-[#d9b76c] block mt-1">{selectedStation.weather} ({selectedStation.temp})</strong>
                <small className="text-[9px] text-[#7e98ae]">Crowd Index: {selectedStation.crowdIndex}%</small>
              </div>

              <div className="p-3 bg-[rgba(1,16,33,0.5)] border border-[var(--line)] rounded">
                <span className="text-[8px] font-['DM_Mono'] text-[#7e98ae] block">KAVACH INTERLOCKING</span>
                <strong className="text-[14px] text-[#67c9a5] block mt-1">ARMED & ACTIVE</strong>
                <small className="text-[9px] text-[#7e98ae]">Auto block signal lamps green</small>
              </div>
            </div>

            <div className="mt-4">
              <span className="panel-kicker">PLATFORM TRACK ALLOCATION ({selectedStation.platforms} TRACKS)</span>
              <div className="platform-grid">
                {Array.from({ length: selectedStation.platforms }, (_, i) => i + 1).map((pf) => {
                  const isAssigned = pf === selectedStation.assignedPlatform;
                  return (
                    <div
                      key={pf}
                      className={`platform-pill ${isAssigned ? "assigned" : ""}`}
                      onClick={() => {
                        setSelectedStation({
                          ...selectedStation,
                          assignedPlatform: pf,
                        });
                        sfx.beep(600 + pf * 25, 0.04);
                        triggerToast(`📍 Switched to Platform ${pf} at ${selectedStation.code}`);
                      }}
                    >
                      PF-{pf.toString().padStart(2, "0")}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-4 p-3 bg-[rgba(7,28,51,0.5)] border border-[var(--line)] rounded">
              <span className="text-[9px] font-['DM_Mono'] text-[#79c7c4] block">ACTIVE SPEED RESTRICTION</span>
              <p className="text-[11px] text-[#f4f0e7] mt-1">
                {selectedStation.activeTsr || "No permanent caution order. Line clear at max 130 km/h."}
              </p>
            </div>

            <button
              className="gold-button w-full justify-center mt-4"
              onClick={() => {
                setModal(null);
                setActiveView("passenger");
              }}
            >
              Track Approaching Trains <ArrowRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* AI Retraining Animated Modal */}
      {modal === "training" && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="action-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="panel-kicker">CLOSED-LOOP SELF-LEARNING</span>
                <h3>ST-GNN Retraining Pipeline</h3>
              </div>
              <button className="modal-close" onClick={() => setModal(null)}>
                <X size={17} />
              </button>
            </div>

            <div className="training-progress-bar">
              <div className="training-progress-fill" style={{ width: `${trainingState.progress}%` }} />
            </div>

            <div className="space-y-2 mt-4">
              <div className={`training-step-card ${trainingState.step === 1 ? "active" : trainingState.step > 1 ? "completed" : ""}`}>
                <span>{trainingState.step > 1 ? "✓" : "01"}</span>
                <div>
                  <strong>Ingesting Telemetry Checkpoints</strong>
                  <small className="block text-[#7e98ae]">284,500 NTES GPS & Signal records parsed</small>
                </div>
              </div>

              <div className={`training-step-card ${trainingState.step === 2 ? "active" : trainingState.step > 2 ? "completed" : ""}`}>
                <span>{trainingState.step > 2 ? "✓" : "02"}</span>
                <div>
                  <strong>Optimizing Graph Diffusion & Sequence Weights</strong>
                  <small className="block text-[#7e98ae]">Cross-station secondary delay loss: {trainingState.loss}</small>
                </div>
              </div>

              <div className={`training-step-card ${trainingState.step === 3 ? "active" : trainingState.step > 3 ? "completed" : ""}`}>
                <span>{trainingState.step > 3 ? "✓" : "03"}</span>
                <div>
                  <strong>Calibrating Conformal Uncertainty Bounds</strong>
                  <small className="block text-[#7e98ae]">90% quantile empirical coverage test (p &lt; 0.05)</small>
                </div>
              </div>

              <div className={`training-step-card ${trainingState.step === 4 ? "completed" : ""}`}>
                <span>{trainingState.step === 4 ? "✓" : "04"}</span>
                <div>
                  <strong>Checkpoint v2.4.3 Deployed Live</strong>
                  <small className="block text-[#7e98ae]">MAE Error compressed to {trainingState.error} min</small>
                </div>
              </div>
            </div>

            {trainingState.step === 4 && (
              <button
                className="gold-button w-full justify-center mt-5"
                onClick={() => setModal(null)}
              >
                Apply Checkpoint & Close <Check size={14} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Operator Profile Modal */}
      {modal === "operator" && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="action-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="panel-kicker">OPERATOR PROFILE</span>
                <h3>Section Control Desk</h3>
              </div>
              <button className="modal-close" onClick={() => setModal(null)}>
                <X size={17} />
              </button>
            </div>

            <div className="operator-card">
              <div className="operator-avatar large">DK</div>
              <strong>Dhruv & Team NAVIGATED</strong>
              <span>Lead System Architect · SIH 2026</span>
              <small>Northern Trunk Section Control Room · Desk Active</small>
              <button className="ghost-button" onClick={() => setModal(null)}>
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Settings Modal */}
      {modal === "settings" && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="action-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="panel-kicker">SYSTEM PREFERENCES</span>
                <h3>Control Room Settings</h3>
              </div>
              <button className="modal-close" onClick={() => setModal(null)}>
                <X size={17} />
              </button>
            </div>

            <div className="settings-list">
              <label>
                <span>Auto-refresh 10 Hz Telemetry Stream</span>
                <input
                  type="checkbox"
                  checked={isLive}
                  onChange={(e) => setIsLive(e.target.checked)}
                />
              </label>

              <label>
                <span>Synthesized Futuristic Sound FX (SFX)</span>
                <input
                  type="checkbox"
                  checked={audioEnabled}
                  onChange={(e) => setAudioEnabled(e.target.checked)}
                />
              </label>

              <label>
                <span>Show Conformal Uncertainty Bands (±X min)</span>
                <input type="checkbox" defaultChecked />
              </label>

              <label>
                <span>Enable ADDS Precedence Solver</span>
                <input type="checkbox" defaultChecked />
              </label>

              <button
                className="gold-button w-full justify-center mt-3"
                onClick={() => {
                  setModal(null);
                  sfx.success();
                  triggerToast("⚙️ Settings saved to local profile");
                }}
              >
                Save Preferences <Check size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scalability Architecture & System Specs Modal (Feature 10) */}
      {modal === "architecture" && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="action-modal !max-w-[620px]" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="panel-kicker">TECHNICAL ARCHITECTURE & BENCHMARKS</span>
                <h3>NAVIGATED Core Architecture Specifications</h3>
              </div>
              <button className="modal-close" onClick={() => setModal(null)}>
                <X size={17} />
              </button>
            </div>

            <div className="arch-grid">
              <div className="arch-card">
                <span className="text-[8px] font-['DM_Mono'] text-[#79c7c4]">SCALE CAPACITY</span>
                <div className="spec-metric">10,000+</div>
                <small className="text-[9px] text-[#7e98ae]">Trains across 18 Indian Railway Zones & 7,325 Stations</small>
              </div>

              <div className="arch-card">
                <span className="text-[8px] font-['DM_Mono'] text-[#d9b76c]">INFERENCE LATENCY</span>
                <div className="spec-metric !text-[#d9b76c]">32.4 ms</div>
                <small className="text-[9px] text-[#7e98ae]">Topological Spatio-Temporal Graph update horizon</small>
              </div>

              <div className="arch-card">
                <span className="text-[8px] font-['DM_Mono'] text-[#67c9a5]">KAFKA INGESTION</span>
                <div className="spec-metric !text-[#67c9a5]">150k msg/s</div>
                <small className="text-[9px] text-[#7e98ae]">ISRO NavIC GPS + Electronic Interlocking streams</small>
              </div>
            </div>

            <div className="mt-4 p-3 bg-[rgba(1,16,33,0.6)] border border-[var(--line)] rounded">
              <span className="panel-kicker">DISTRIBUTED END-TO-END DATA PIPELINE</span>
              <div className="mt-2 space-y-1.5 text-[10px] text-[#8ca5b8]">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#79c7c4]" />
                  <span><strong>Edge Ingestion:</strong> ISRO RTIS NavIC Satellite GPS & RDSO TCAS transponder radio dataloggers.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d9b76c]" />
                  <span><strong>Graph Neural Core:</strong> Diffusion ST-GNN + PINN (Davis Drag) computing secondary delay ripple.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#b89cff]" />
                  <span><strong>Precedence Solver:</strong> ADDS dynamic siding scheduler solving junction bottlenecks in &lt;100ms.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#67c9a5]" />
                  <span><strong>Safety Standard:</strong> Aligned with RDSO IRS:S-23/2021 SIL-4 level fail-safe compliance.</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <button
                className="ghost-button w-full justify-center"
                onClick={handleExportBrief}
              >
                <Download size={13} /> Export JSON System Specs
              </button>
              <button
                className="gold-button w-full justify-center"
                onClick={() => {
                  setModal(null);
                  sfx.success();
                  triggerToast("⚡ Verified NAVIGATED System Specs");
                }}
              >
                Close Specs <Check size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advisories & Alerts Modal */}
      {modal === "alerts" && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="action-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <div>
                <span className="panel-kicker">CORRIDOR ADVISORIES</span>
                <h3>Active Network Alerts</h3>
              </div>
              <button className="modal-close" onClick={() => setModal(null)}>
                <X size={17} />
              </button>
            </div>

            <div className="modal-results">
              <button
                onClick={() => {
                  setActiveView("sandbox");
                  setActiveScenario("fog");
                  setModal(null);
                }}
              >
                <CloudFog size={15} className="text-[#d9b76c]" />
                <span>
                  <strong>Gangetic Basin Fog Advisory</strong>
                  <small>Visibility {fogVisibility}m · Enforce 60 km/h ceiling</small>
                </span>
                <ArrowUpRight size={14} />
              </button>

              <button
                onClick={() => {
                  setActiveView("sandbox");
                  setActiveScenario("tsr");
                  setModal(null);
                }}
              >
                <TriangleAlert size={15} className="text-[#ed7e63]" />
                <span>
                  <strong>Mirzapur Track Renewal (TSR 30 km/h)</strong>
                  <small>Caution order active · Inspect sandbox</small>
                </span>
                <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Toast Notification */}
      {toast && (
        <div className="toast">
          <span className="toast-icon">
            <Check size={13} />
          </span>
          <span>{toast}</span>
          <button onClick={() => setToast(null)}>
            <X size={13} />
          </button>
        </div>
      )}
    </main>
  );
}
