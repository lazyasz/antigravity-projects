// State Management & Multi-Window Synchronization for NAVSHAKTI 2026
// Uses BroadcastChannel API with localStorage fallback for real-time dual-screen sync

const CHANNEL_NAME = 'navshakti_2026_sync_channel';
const STORAGE_STATE_KEY = 'navshakti_2026_gamestate_v1';

export class GameStateManager {
  constructor(initialQuestions) {
    this.questions = initialQuestions;
    this.broadcastChannel = null;
    this.undoStack = [];
    this.listeners = [];

    this.state = this.getInitialState();
    this.initBroadcastChannel();
    this.loadPersistedState();
  }

  getInitialState() {
    return {
      currentQuestionIndex: 0,
      questionRevealed: true, // Whether question text is visible on audience screen
      multiplier: 1,
      bankScore: 0,
      revealedStates: [false, false, false, false, false, false, false, false],
      strikes: 0,
      team1Name: 'GARBA GLADIATORS',
      team2Name: 'DANDIYA DYNAMOS',
      team1Score: 0,
      team2Score: 0,
      activeTeam: 1, // 1 or 2
      stealActive: false, // Whether a steal opportunity is currently active
      stealTargetTeam: 2, // Which team has the chance to steal
      roundId: 'r1',
      roundName: 'ROUND 1: SHAKTI & TRADITION',
      winnerModalOpen: false,
      winnerData: null,
      rotationAxis: 'horizontal', // 'horizontal' (Trilon slat) or 'vertical' (3D card)
      lastActionDescription: 'Game Initialized'
    };
  }

  initBroadcastChannel() {
    try {
      if ('BroadcastChannel' in window) {
        this.broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
        this.broadcastChannel.onmessage = (event) => {
          if (event.data && event.data.type === 'STATE_SYNC') {
            this.state = { ...this.state, ...event.data.payload };
            this.notifyListeners(event.data.actionType || 'SYNC_RECEIVED');
          }
        };
      }
    } catch (err) {
      console.warn('BroadcastChannel not supported, falling back to local state:', err);
    }

    // Also listen to window storage event for cross-tab sync
    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_STATE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          this.state = { ...this.state, ...parsed };
          this.notifyListeners('STORAGE_SYNC');
        } catch (err) {}
      }
    });
  }

  loadPersistedState() {
    try {
      const saved = localStorage.getItem(STORAGE_STATE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.state = { ...this.state, ...parsed };
      }
    } catch (err) {
      console.warn('Could not restore game state:', err);
    }
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_STATE_KEY, JSON.stringify(this.state));
    } catch (err) {}

    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage({
          type: 'STATE_SYNC',
          payload: this.state,
          actionType: this.state.lastActionDescription
        });
      } catch (err) {}
    }
  }

  pushUndoSnapshot(actionDesc) {
    // Keep max 15 snapshots
    const snapshot = JSON.parse(JSON.stringify(this.state));
    this.undoStack.push(snapshot);
    if (this.undoStack.length > 15) {
      this.undoStack.shift();
    }
    this.state.lastActionDescription = actionDesc;
  }

  undo() {
    if (this.undoStack.length === 0) return false;
    const previous = this.undoStack.pop();
    this.state = previous;
    this.state.lastActionDescription = 'Undo applied';
    this.saveState();
    this.notifyListeners('UNDO');
    return true;
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners(eventType) {
    this.listeners.forEach(cb => {
      try {
        cb(this.state, eventType);
      } catch (e) {
        console.error('Error in state listener:', e);
      }
    });
  }

  // --- State Mutators with Automatic Undo Snapshot & Broadcast ---

  updateField(field, value, actionDesc = `Updated ${field}`) {
    this.pushUndoSnapshot(actionDesc);
    this.state[field] = value;
    this.saveState();
    this.notifyListeners(actionDesc);
  }

  updateMultiple(fields, actionDesc = 'Batch Update') {
    this.pushUndoSnapshot(actionDesc);
    this.state = { ...this.state, ...fields };
    this.saveState();
    this.notifyListeners(actionDesc);
  }

  resetGame() {
    this.pushUndoSnapshot('Reset Game');
    const fresh = this.getInitialState();
    this.state = fresh;
    this.saveState();
    this.notifyListeners('RESET_GAME');
  }
}
