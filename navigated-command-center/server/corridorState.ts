export type ScenarioId = "fog" | "tsr" | "freight" | "aspect" | null;
export type ActionType =
  | "NAVIGATE_VIEW" | "SET_SCENARIO" | "CLEAR_SCENARIO" | "SET_SPEED" | "TOGGLE_LIVE"
  | "SELECT_TRAIN" | "RUN_RECALCULATION" | "RUN_RETRAIN" | "RUN_API_TEST" | "EXPORT_BRIEF"
  | "TOGGLE_PLAYBACK" | "PLAYBACK_SEEK";

export type CorridorAction = { type: ActionType; payload?: Record<string, unknown>; at: string };

const scenarioDelays: Record<Exclude<ScenarioId, null>, number> = { fog: 18, tsr: 11, freight: 7, aspect: 14 };

let state = {
  version: 1,
  activeScenario: null as ScenarioId,
  speed: "1×",
  isLive: true,
  selectedTrain: 0,
  playbackPlaying: true,
  playbackOffsetMinutes: 0,
  recalculationCount: 0,
  lastAction: null as CorridorAction | null,
  actionCount: 0,
  affectedFleet: 0,
  networkDelayMinutes: 0,
  updatedAt: new Date().toISOString(),
};

const actionLog: CorridorAction[] = [];
const scenarioLog: Array<{ scenarioId: string; action: "SET" | "CLEAR" | "RECALCULATE"; at: string; delayMinutes: number; affectedFleet: number }> = [];

export function getCorridorState() {
  return { ...state, recentActions: actionLog.slice(-8).reverse(), recentScenarios: scenarioLog.slice(-8).reverse() };
}

export function getInMemoryActionHistory() { return actionLog.slice(-24).reverse(); }
export function getInMemoryScenarioHistory() { return scenarioLog.slice(-12).reverse(); }

export function dispatchCorridorAction(type: ActionType, payload: Record<string, unknown> = {}) {
  const action = { type, payload, at: new Date().toISOString() } satisfies CorridorAction;
  let scenarioEvent: typeof scenarioLog[number] | null = null;

  switch (type) {
    case "SET_SCENARIO": {
      const scenario = payload.scenario;
      state.activeScenario = scenario === "fog" || scenario === "tsr" || scenario === "freight" || scenario === "aspect" ? scenario : null;
      state.networkDelayMinutes = state.activeScenario ? scenarioDelays[state.activeScenario] : 0;
      state.affectedFleet = state.activeScenario ? 42 : 0;
      if (state.activeScenario) scenarioEvent = { scenarioId: state.activeScenario, action: "SET", at: action.at, delayMinutes: state.networkDelayMinutes, affectedFleet: state.affectedFleet };
      break;
    }
    case "CLEAR_SCENARIO": {
      const previous = String(payload.scenario ?? state.activeScenario ?? "baseline");
      state.activeScenario = null; state.networkDelayMinutes = 0; state.affectedFleet = 0;
      scenarioEvent = { scenarioId: previous, action: "CLEAR", at: action.at, delayMinutes: 0, affectedFleet: 0 };
      break;
    }
    case "SET_SPEED":
      if (["1×", "5×", "15×"].includes(String(payload.speed))) state.speed = String(payload.speed);
      break;
    case "TOGGLE_LIVE": state.isLive = Boolean(payload.isLive); break;
    case "SELECT_TRAIN": state.selectedTrain = Math.max(0, Math.min(3, Number(payload.index) || 0)); break;
    case "TOGGLE_PLAYBACK": state.playbackPlaying = Boolean(payload.playing); break;
    case "PLAYBACK_SEEK": state.playbackOffsetMinutes = Math.max(-120, Math.min(120, Number(payload.offsetMinutes) || 0)); break;
    case "RUN_RECALCULATION":
      state.recalculationCount += 1; state.affectedFleet = 42;
      if (state.activeScenario) scenarioEvent = { scenarioId: state.activeScenario, action: "RECALCULATE", at: action.at, delayMinutes: state.networkDelayMinutes, affectedFleet: state.affectedFleet };
      break;
    default: break;
  }

  state.version += 1; state.actionCount += 1; state.lastAction = action; state.updatedAt = action.at;
  actionLog.push(action); if (actionLog.length > 50) actionLog.shift();
  if (scenarioEvent) { scenarioLog.push(scenarioEvent); if (scenarioLog.length > 50) scenarioLog.shift(); }
  return { state: getCorridorState(), scenarioEvent };
}
