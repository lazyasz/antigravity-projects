// NAVSHAKTI 2026: THE CAMPUS SHOWDOWN
// Institution: MIT-ADT University, Pune | Event: SOC Navratri Celebration (14 October 2026)
// Core Application Controller & Dual-Screen Sync Engine

import { soundEngine } from './soundEngine.js';
import { NAVSHAKTI_ROUNDS, INITIAL_QUESTION_BANK, loadNavshaktiQuestions, saveNavshaktiQuestions } from './questionsData.js';
import { GameStateManager } from './stateManager.js';

class NavshaktiApp {
  constructor() {
    this.questions = loadNavshaktiQuestions();
    this.rounds = NAVSHAKTI_ROUNDS;
    this.stateManager = new GameStateManager(this.questions);

    this.currentView = 'stage'; // 'stage', 'host', or 'audience'

    this.initDOM();
    this.initMarqueeBulbs();
    this.initEventListeners();
    this.initViewRouting();

    // Subscribe to state changes (whether local or broadcast from another tab/window)
    this.stateManager.subscribe((state, eventType) => {
      this.renderFromState(state, eventType);
    });

    // Initial render
    this.renderFromState(this.stateManager.state, 'INIT');
  }

  get currentQuestion() {
    const idx = this.stateManager.state.currentQuestionIndex;
    return this.questions[idx] || this.questions[0];
  }

  initDOM() {
    // Header navigation
    this.btnTabStage = document.getElementById('view-tab-stage');
    this.btnTabHost = document.getElementById('view-tab-host');
    this.btnTabAudience = document.getElementById('view-tab-audience');
    this.btnPopoutStage = document.getElementById('btn-popout-stage');
    this.btnShowQr = document.getElementById('btn-show-qr');
    this.btnThemeFanfare = document.getElementById('btn-theme-fanfare');
    this.btnToggleSound = document.getElementById('btn-toggle-sound');
    this.btnFullscreen = document.getElementById('btn-fullscreen');

    // View Panels
    this.panelStage = document.getElementById('panel-stage-view');
    this.panelHost = document.getElementById('panel-host-view');
    this.panelAudience = document.getElementById('panel-audience-view');

    // Stage Display Elements
    this.stageRoundName = document.getElementById('stage-round-name');
    this.stageTeam1Name = document.getElementById('stage-team-1-name');
    this.stageTeam2Name = document.getElementById('stage-team-2-name');
    this.stageTeam1Score = document.getElementById('stage-team-1-score');
    this.stageTeam2Score = document.getElementById('stage-team-2-score');
    this.haloTeam1 = document.getElementById('halo-team-1');
    this.haloTeam2 = document.getElementById('halo-team-2');
    this.stagePodium1 = document.getElementById('stage-podium-team-1');
    this.stagePodium2 = document.getElementById('stage-podium-team-2');

    this.stageMultVal = document.getElementById('stage-mult-val');
    this.stageMultText = document.getElementById('stage-mult-text');
    this.stageQuestionCategory = document.getElementById('stage-question-category');
    this.stageQuestionText = document.getElementById('stage-question-text');
    this.stageProvisionalTag = document.getElementById('stage-provisional-tag');
    this.stageBankScore = document.getElementById('stage-bank-score');
    this.stageStealBanner = document.getElementById('stage-steal-banner');
    this.stageStealText = document.getElementById('stage-steal-text');
    this.stageTilesGrid = document.getElementById('stage-tiles-grid');
    this.stageTickerText = document.getElementById('stage-ticker-text');

    this.strikeBoxes = [
      document.getElementById('strike-box-1'),
      document.getElementById('strike-box-2'),
      document.getElementById('strike-box-3')
    ];
    this.strikeOverlay = document.getElementById('strike-overlay');
    this.overlayMarks = [
      document.getElementById('overlay-x-1'),
      document.getElementById('overlay-x-2'),
      document.getElementById('overlay-x-3')
    ];

    // Host Controller Elements
    this.hostRoundSelect = document.getElementById('host-round-select');
    this.hostQuestionSelect = document.getElementById('host-question-select');
    this.hostBtnPrevQ = document.getElementById('host-btn-prev-q');
    this.hostBtnNextQ = document.getElementById('host-btn-next-q');
    this.hostBtnToggleQ = document.getElementById('host-btn-toggle-q-visible');
    this.hostCheatTilesGrid = document.getElementById('host-cheat-tiles-grid');
    this.hostCheatQTitle = document.getElementById('host-cheat-question-title');
    this.hostBtnRevealAll = document.getElementById('host-btn-reveal-all');

    this.hostFuzzyInput = document.getElementById('host-fuzzy-input');
    this.hostFuzzySubmitBtn = document.getElementById('host-fuzzy-submit-btn');

    this.btnTurnT1 = document.getElementById('btn-turn-t1');
    this.btnTurnT2 = document.getElementById('btn-turn-t2');
    this.hostBtnAddStrike = document.getElementById('host-btn-add-strike');
    this.hostBtnClearStrikes = document.getElementById('host-btn-clear-strikes');
    this.hostBtnTriggerSteal = document.getElementById('host-btn-trigger-steal');

    this.hostBankDisplay = document.getElementById('host-bank-display');
    this.hostBtnAwardT1 = document.getElementById('host-btn-award-t1');
    this.hostBtnAwardT2 = document.getElementById('host-btn-award-t2');
    this.hostBtnUndo = document.getElementById('host-btn-undo');
    this.hostBtnOpenWinner = document.getElementById('host-btn-open-winner');
    this.hostBtnResetGame = document.getElementById('host-btn-reset-game');

    this.hostT1NameInput = document.getElementById('host-t1-name-input');
    this.hostT2NameInput = document.getElementById('host-t2-name-input');
    this.hostT1ScoreVal = document.getElementById('host-t1-score-val');
    this.hostT2ScoreVal = document.getElementById('host-t2-score-val');
    this.hostT1Plus = document.getElementById('host-t1-plus');
    this.hostT1Minus = document.getElementById('host-t1-minus');
    this.hostT2Plus = document.getElementById('host-t2-plus');
    this.hostT2Minus = document.getElementById('host-t2-minus');
    this.hostVolSlider = document.getElementById('host-vol-slider');

    // Audience View Elements
    this.audT1Name = document.getElementById('aud-t1-name');
    this.audT2Name = document.getElementById('aud-t2-name');
    this.audT1Score = document.getElementById('aud-t1-score');
    this.audT2Score = document.getElementById('aud-t2-score');
    this.audQuestionText = document.getElementById('aud-question-text');
    this.audGuessInput = document.getElementById('aud-guess-input');
    this.audGuessSubmitBtn = document.getElementById('aud-guess-submit-btn');
    this.audFeedbackMsg = document.getElementById('aud-feedback-msg');

    // Modals
    this.qrModal = document.getElementById('qr-modal');
    this.btnCloseQr = document.getElementById('btn-close-qr');
    this.winnerModal = document.getElementById('winner-modal');
    this.winnerTeamName = document.getElementById('winner-team-name');
    this.winnerScorePill = document.getElementById('winner-score-pill');
    this.btnCloseWinner = document.getElementById('btn-close-winner');
    this.resetConfirmModal = document.getElementById('reset-confirm-modal');
    this.btnCancelReset = document.getElementById('btn-cancel-reset');
    this.btnAbortReset = document.getElementById('btn-abort-reset');
    this.btnConfirmReset = document.getElementById('btn-confirm-reset');

    this.populateHostQuestionSelect();
  }

  // ------------------------------------------------------------------------
  // VIEW ROUTING & MULTI-SCREEN SWITCHING
  // ------------------------------------------------------------------------
  initViewRouting() {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#host') {
        this.switchView('host');
      } else if (hash === '#audience') {
        this.switchView('audience');
      } else {
        this.switchView('stage');
      }
    };

    window.addEventListener('hashchange', handleHash);
    handleHash();
  }

  switchView(viewName) {
    this.currentView = viewName;
    this.btnTabStage.classList.toggle('active', viewName === 'stage');
    this.btnTabHost.classList.toggle('active', viewName === 'host');
    this.btnTabAudience.classList.toggle('active', viewName === 'audience');

    this.panelStage.style.display = viewName === 'stage' ? 'flex' : 'none';
    this.panelHost.style.display = viewName === 'host' ? 'block' : 'none';
    this.panelAudience.style.display = viewName === 'audience' ? 'flex' : 'none';

    window.location.hash = `#${viewName}`;
  }

  // ------------------------------------------------------------------------
  // CHASING MARQUEE BULBS AROUND THE TORAN ARCH
  // ------------------------------------------------------------------------
  initMarqueeBulbs() {
    const ring = document.getElementById('marquee-bulb-ring');
    if (!ring) return;

    const bulbCount = 48;
    ring.innerHTML = '';
    const bulbs = [];

    for (let i = 0; i < bulbCount; i++) {
      const bulb = document.createElement('div');
      bulb.className = 'marquee-bulb-dot';
      ring.appendChild(bulb);
      bulbs.push(bulb);
    }

    const layoutBulbs = () => {
      const w = ring.clientWidth;
      const h = ring.clientHeight;
      if (!w || !h) return;

      const perim = 2 * (w + h);
      const step = perim / bulbCount;

      bulbs.forEach((bulb, i) => {
        let dist = (i * step) % perim;
        let x = 0, y = 0;

        if (dist < w) {
          x = dist; y = 0;
        } else if (dist < w + h) {
          x = w; y = dist - w;
        } else if (dist < 2 * w + h) {
          x = w - (dist - (w + h)); y = h;
        } else {
          x = 0; y = h - (dist - (2 * w + h));
        }

        bulb.style.left = `${x}px`;
        bulb.style.top = `${y}px`;
      });
    };

    setTimeout(layoutBulbs, 100);
    window.addEventListener('resize', layoutBulbs);

    // Chasing festive lighting sequence
    let step = 0;
    setInterval(() => {
      step = (step + 1) % 3;
      bulbs.forEach((bulb, i) => {
        bulb.classList.toggle('lit-1', (i + step) % 3 === 0);
        bulb.classList.toggle('lit-2', (i + step) % 3 === 1);
      });
    }, 200);
  }

  // ------------------------------------------------------------------------
  // POPULATE HOST SELECTORS
  // ------------------------------------------------------------------------
  populateHostQuestionSelect(selectedRoundId = null) {
    this.hostQuestionSelect.innerHTML = '';
    
    let filteredQuestions = this.questions;
    if (selectedRoundId) {
      filteredQuestions = this.questions.filter(q => q.roundId === selectedRoundId);
    }

    filteredQuestions.forEach((q) => {
      const globalIdx = this.questions.findIndex(item => item.id === q.id);
      const opt = document.createElement('option');
      opt.value = globalIdx;
      opt.textContent = `Q${q.questionNumber || (globalIdx + 1)}. ${q.question}`;
      this.hostQuestionSelect.appendChild(opt);
    });

    this.hostQuestionSelect.value = this.stateManager.state.currentQuestionIndex;
  }

  // ------------------------------------------------------------------------
  // RENDER FROM SYNCHRONIZED STATE
  // ------------------------------------------------------------------------
  renderFromState(state, eventType) {
    const q = this.currentQuestion;

    // 1. Stage Presentation Header & Question
    if (this.stageRoundName) this.stageRoundName.textContent = q.roundName;
    if (this.stageQuestionCategory) {
      this.stageQuestionCategory.textContent = `SOC NAVRATRI SPECIAL • SURVEY QUESTION #${q.questionNumber || (state.currentQuestionIndex + 1)}`;
    }

    if (this.stageQuestionText) {
      if (state.questionRevealed) {
        this.stageQuestionText.textContent = q.question;
        this.stageQuestionText.style.filter = 'none';
      } else {
        this.stageQuestionText.textContent = '🔒 [QUESTION HIDDEN BY HOST — LISTEN CAREFULLY TO THE EMCEE]';
        this.stageQuestionText.style.filter = 'drop-shadow(0 0 8px #f5c518)';
      }
    }

    if (this.stageProvisionalTag) {
      this.stageProvisionalTag.textContent = q.surveyNote || '[PROVISIONAL DEMO DATA — 100 Survey Points Total]';
    }

    // Multiplier
    if (this.stageMultVal) this.stageMultVal.textContent = `${state.multiplier}X`;
    if (this.stageMultText) {
      this.stageMultText.textContent = state.multiplier === 1 ? 'SINGLE' : (state.multiplier === 2 ? 'DOUBLE' : 'TRIPLE');
    }

    // Bank Score
    const bankFormatted = String(state.bankScore).padStart(3, '0');
    if (this.stageBankScore) this.stageBankScore.textContent = bankFormatted;
    if (this.hostBankDisplay) this.hostBankDisplay.textContent = state.bankScore;

    // Team Scores & Names
    if (this.stageTeam1Name) this.stageTeam1Name.textContent = state.team1Name;
    if (this.stageTeam2Name) this.stageTeam2Name.textContent = state.team2Name;
    if (this.stageTeam1Score) this.stageTeam1Score.textContent = state.team1Score;
    if (this.stageTeam2Score) this.stageTeam2Score.textContent = state.team2Score;

    if (this.hostT1NameInput && document.activeElement !== this.hostT1NameInput) {
      this.hostT1NameInput.value = state.team1Name;
    }
    if (this.hostT2NameInput && document.activeElement !== this.hostT2NameInput) {
      this.hostT2NameInput.value = state.team2Name;
    }
    if (this.hostT1ScoreVal) this.hostT1ScoreVal.textContent = state.team1Score;
    if (this.hostT2ScoreVal) this.hostT2ScoreVal.textContent = state.team2Score;

    // Active Turn Halo
    if (this.stagePodium1) this.stagePodium1.classList.toggle('is-active', state.activeTeam === 1);
    if (this.stagePodium2) this.stagePodium2.classList.toggle('is-active', state.activeTeam === 2);
    if (this.btnTurnT1) this.btnTurnT1.classList.toggle('active', state.activeTeam === 1);
    if (this.btnTurnT2) this.btnTurnT2.classList.toggle('active', state.activeTeam === 2);

    // Steal Opportunity Banner
    if (this.stageStealBanner) {
      if (state.stealActive) {
        const stealTeamName = state.stealTargetTeam === 1 ? state.team1Name : state.team2Name;
        this.stageStealText.textContent = `🔥 STEAL OPPORTUNITY FOR ${stealTeamName}! ONE GUESS TO TAKE THE BANK! 🔥`;
        this.stageStealBanner.style.display = 'flex';
      } else {
        this.stageStealBanner.style.display = 'none';
      }
    }

    // Rotation Axis Mode
    if (this.stageTilesGrid) {
      this.stageTilesGrid.classList.toggle('axis-horizontal', state.rotationAxis === 'horizontal');
      this.stageTilesGrid.classList.toggle('axis-vertical', state.rotationAxis === 'vertical');
    }

    // 2. Render 8 Slat Tiles on Stage Board
    const answers = q.answers || [];
    for (let i = 0; i < 8; i++) {
      const slot = document.getElementById(`tile-slot-${i}`);
      const textEl = document.getElementById(`ans-text-${i}`);
      const scoreEl = document.getElementById(`ans-score-${i}`);

      if (!slot) continue;

      if (i < answers.length) {
        slot.classList.remove('empty-inactive');
        if (textEl) textEl.textContent = answers[i].text;
        if (scoreEl) scoreEl.textContent = answers[i].points;

        const isRev = !!state.revealedStates[i];
        slot.classList.toggle('revealed', isRev);
      } else {
        slot.classList.add('empty-inactive');
        slot.classList.remove('revealed');
        if (textEl) textEl.textContent = '---';
        if (scoreEl) scoreEl.textContent = '0';
      }
    }

    // 3. Strikes
    this.strikeBoxes.forEach((box, idx) => {
      if (box) box.classList.toggle('active', idx < state.strikes);
    });

    // 4. Host Cheat Sheet
    if (this.hostCheatQTitle) {
      this.hostCheatQTitle.textContent = `Q${q.questionNumber || (state.currentQuestionIndex + 1)}: ${q.question}`;
    }
    this.renderHostCheatTiles(q, state);

    // Update Host Question dropdown value
    if (this.hostQuestionSelect && document.activeElement !== this.hostQuestionSelect) {
      this.hostQuestionSelect.value = state.currentQuestionIndex;
    }
    if (this.hostRoundSelect && document.activeElement !== this.hostRoundSelect) {
      this.hostRoundSelect.value = q.roundId || 'r1';
    }

    document.querySelectorAll('.host-mult-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.mult) === state.multiplier);
    });

    // 5. Audience View updates
    if (this.audT1Name) this.audT1Name.textContent = state.team1Name;
    if (this.audT2Name) this.audT2Name.textContent = state.team2Name;
    if (this.audT1Score) this.audT1Score.textContent = state.team1Score;
    if (this.audT2Score) this.audT2Score.textContent = state.team2Score;
    if (this.audQuestionText) {
      this.audQuestionText.textContent = state.questionRevealed ? q.question : '🔒 Question hidden by host...';
    }

    // 6. Winner Modal State
    if (this.winnerModal) {
      if (state.winnerModalOpen && state.winnerData) {
        this.winnerTeamName.textContent = state.winnerData.name;
        this.winnerScorePill.textContent = `TOTAL SCORE: ${state.winnerData.score} POINTS`;
        this.winnerModal.style.display = 'flex';
      } else {
        this.winnerModal.style.display = 'none';
      }
    }
  }

  renderHostCheatTiles(q, state) {
    this.hostCheatTilesGrid.innerHTML = '';
    const answers = q.answers || [];

    answers.forEach((ans, idx) => {
      const isRev = !!state.revealedStates[idx];
      const row = document.createElement('div');
      row.className = `host-cheat-row ${isRev ? 'revealed' : ''}`;
      
      const aliasesStr = ans.aliases && ans.aliases.length > 0 ? `(${ans.aliases.slice(0, 3).join(', ')})` : '';

      row.innerHTML = `
        <span class="cheat-idx">#${idx + 1}</span>
        <div class="cheat-text-col">
          <span class="cheat-main-text">${ans.text}</span>
          <span class="cheat-aliases">${aliasesStr}</span>
        </div>
        <span class="cheat-pts">${ans.points} pts</span>
        <button class="cheat-reveal-toggle-btn" data-tile-idx="${idx}">
          ${isRev ? 'Conceal' : 'Reveal'}
        </button>
      `;

      row.querySelector('.cheat-reveal-toggle-btn').addEventListener('click', () => {
        this.toggleTileReveal(idx);
      });

      this.hostCheatTilesGrid.appendChild(row);
    });
  }

  // ------------------------------------------------------------------------
  // GAMEPLAY ACTIONS: REVEALS, SCORING, STRIKES & STEALS
  // ------------------------------------------------------------------------
  toggleTileReveal(index) {
    const q = this.currentQuestion;
    if (index >= q.answers.length) return;

    const currentRev = [...this.stateManager.state.revealedStates];
    const targetState = !currentRev[index];
    currentRev[index] = targetState;

    const ansPts = (q.answers[index].points || 0) * this.stateManager.state.multiplier;
    let newBank = this.stateManager.state.bankScore;

    if (targetState) {
      // Revealing tile
      newBank += ansPts;
      soundEngine.playTileFlip();
      setTimeout(() => soundEngine.playDing(), 280);

      // Trigger sparkle sweep animation on the slot
      const slot = document.getElementById(`tile-slot-${index}`);
      if (slot) slot.classList.add('revealing');
    } else {
      // Concealing tile
      newBank = Math.max(0, newBank - ansPts);
      soundEngine.playTileFlip();
    }

    this.stateManager.updateMultiple({
      revealedStates: currentRev,
      bankScore: newBank
    }, `${targetState ? 'Revealed' : 'Concealed'} Tile #${index + 1}`);
  }

  revealAllAnswers() {
    const q = this.currentQuestion;
    let delay = 0;

    q.answers.forEach((_, idx) => {
      if (!this.stateManager.state.revealedStates[idx]) {
        setTimeout(() => {
          this.toggleTileReveal(idx);
        }, delay);
        delay += 380;
      }
    });
  }

  triggerStrike() {
    const nextStrikes = (this.stateManager.state.strikes % 3) + 1;
    this.stateManager.updateField('strikes', nextStrikes, `Strike ${nextStrikes}`);

    // Audio & Screen tremor
    soundEngine.playBuzzer(nextStrikes);
    this.showStrikeOverlay(nextStrikes);

    if (this.panelStage) {
      this.panelStage.classList.add('screen-shake');
      setTimeout(() => this.panelStage.classList.remove('screen-shake'), 450);
    }

    // Auto-prompt steal on 3 strikes
    if (nextStrikes === 3) {
      const opposingTeam = this.stateManager.state.activeTeam === 1 ? 2 : 1;
      setTimeout(() => {
        this.activateStealOpportunity(opposingTeam);
      }, 1200);
    }
  }

  showStrikeOverlay(count) {
    this.overlayMarks.forEach((mark, idx) => {
      mark.classList.toggle('visible', idx < count);
    });

    this.strikeOverlay.classList.add('active');
    setTimeout(() => {
      this.strikeOverlay.classList.remove('active');
    }, 1100);
  }

  clearStrikes() {
    this.stateManager.updateMultiple({
      strikes: 0,
      stealActive: false
    }, 'Cleared Strikes');
  }

  activateStealOpportunity(targetTeam) {
    this.stateManager.updateMultiple({
      stealActive: true,
      stealTargetTeam: targetTeam
    }, `Steal Activated for Team ${targetTeam}`);

    soundEngine.playStealAlert();
  }

  awardBankToTeam(teamNum) {
    const pts = this.stateManager.state.bankScore;
    if (pts === 0) return;

    if (teamNum === 1) {
      const newScore = this.stateManager.state.team1Score + pts;
      this.stateManager.updateMultiple({
        team1Score: newScore,
        bankScore: 0,
        stealActive: false,
        strikes: 0
      }, `Awarded Bank to ${this.stateManager.state.team1Name}`);
    } else {
      const newScore = this.stateManager.state.team2Score + pts;
      this.stateManager.updateMultiple({
        team2Score: newScore,
        bankScore: 0,
        stealActive: false,
        strikes: 0
      }, `Awarded Bank to ${this.stateManager.state.team2Name}`);
    }

    soundEngine.playWinFanfare();
  }

  checkContestantGuess(guessText) {
    const raw = (guessText || '').trim().toLowerCase();
    if (!raw) return;

    const q = this.currentQuestion;
    let matchedIdx = -1;

    q.answers.forEach((ans, idx) => {
      if (matchedIdx !== -1) return;
      const main = ans.text.toLowerCase();
      if (main.includes(raw) || raw.includes(main)) {
        matchedIdx = idx;
        return;
      }
      if (ans.aliases && Array.isArray(ans.aliases)) {
        if (ans.aliases.some(al => al.toLowerCase() === raw || raw.includes(al.toLowerCase()) || al.toLowerCase().includes(raw))) {
          matchedIdx = idx;
        }
      }
    });

    if (matchedIdx !== -1) {
      if (!this.stateManager.state.revealedStates[matchedIdx]) {
        this.toggleTileReveal(matchedIdx);
        return { success: true, answer: q.answers[matchedIdx].text };
      } else {
        return { success: false, reason: 'Already Revealed' };
      }
    } else {
      this.triggerStrike();
      return { success: false, reason: 'Incorrect Guess' };
    }
  }

  loadQuestionByIndex(index) {
    if (index < 0 || index >= this.questions.length) return;
    const q = this.questions[index];

    this.stateManager.updateMultiple({
      currentQuestionIndex: index,
      multiplier: q.multiplier || 1,
      bankScore: 0,
      revealedStates: [false, false, false, false, false, false, false, false],
      strikes: 0,
      stealActive: false,
      questionRevealed: true
    }, `Loaded Question ${q.questionNumber || (index + 1)}`);
  }

  openWinnerDeclaration() {
    const s1 = this.stateManager.state.team1Score;
    const s2 = this.stateManager.state.team2Score;
    let winnerName = this.stateManager.state.team1Name;
    let winnerScore = s1;

    if (s2 > s1) {
      winnerName = this.stateManager.state.team2Name;
      winnerScore = s2;
    } else if (s1 === s2) {
      winnerName = "IT'S A DRAW! BOTH TEAMS SHARE THE SHAKTI TROPHY";
      winnerScore = s1;
    }

    this.stateManager.updateMultiple({
      winnerModalOpen: true,
      winnerData: { name: winnerName, score: winnerScore }
    }, 'Winner Declared');

    soundEngine.playGrandWin();
  }

  // ------------------------------------------------------------------------
  // EVENT LISTENERS & HOTKEYS
  // ------------------------------------------------------------------------
  initEventListeners() {
    // Mode Switch Tabs
    this.btnTabStage.addEventListener('click', () => this.switchView('stage'));
    this.btnTabHost.addEventListener('click', () => this.switchView('host'));
    this.btnTabAudience.addEventListener('click', () => this.switchView('audience'));

    // Popout Stage Window for Projector (opens dual-screen synchronized view)
    this.btnPopoutStage.addEventListener('click', () => {
      const url = `${window.location.origin}${window.location.pathname}#stage`;
      window.open(url, 'NavshaktiProjectorStage', 'width=1600,height=900,menubar=no,toolbar=no');
    });

    // Sound Controls
    this.btnThemeFanfare.addEventListener('click', () => soundEngine.playWinFanfare());
    this.btnToggleSound.addEventListener('click', () => {
      const muted = soundEngine.toggleMute();
      this.btnToggleSound.textContent = muted ? '🔇 Sound OFF' : '🔊 Sound ON';
    });

    // Fullscreen Toggle
    this.btnFullscreen.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    });

    // QR Code Modal
    this.btnShowQr.addEventListener('click', () => {
      const link = document.getElementById('qr-direct-link');
      if (link) link.textContent = `${window.location.origin}${window.location.pathname}#audience`;
      this.qrModal.style.display = 'flex';
    });
    this.btnCloseQr.addEventListener('click', () => {
      this.qrModal.style.display = 'none';
    });

    // Winner Modal Close
    this.btnCloseWinner.addEventListener('click', () => {
      this.stateManager.updateField('winnerModalOpen', false, 'Closed Winner Modal');
    });

    // Safe Game Reset
    this.hostBtnResetGame.addEventListener('click', () => {
      this.resetConfirmModal.style.display = 'flex';
    });
    this.btnCancelReset.addEventListener('click', () => {
      this.resetConfirmModal.style.display = 'none';
    });
    this.btnAbortReset.addEventListener('click', () => {
      this.resetConfirmModal.style.display = 'none';
    });
    this.btnConfirmReset.addEventListener('click', () => {
      this.resetConfirmModal.style.display = 'none';
      this.stateManager.resetGame();
      this.loadQuestionByIndex(0);
    });

    // Host Round Select
    this.hostRoundSelect.addEventListener('change', (e) => {
      const rId = e.target.value;
      const targetQIdx = this.questions.findIndex(q => q.roundId === rId);
      if (targetQIdx !== -1) {
        this.loadQuestionByIndex(targetQIdx);
      }
    });

    // Host Question Select
    this.hostQuestionSelect.addEventListener('change', (e) => {
      this.loadQuestionByIndex(parseInt(e.target.value));
    });

    this.hostBtnPrevQ.addEventListener('click', () => {
      const cur = this.stateManager.state.currentQuestionIndex;
      this.loadQuestionByIndex(Math.max(0, cur - 1));
    });

    this.hostBtnNextQ.addEventListener('click', () => {
      const cur = this.stateManager.state.currentQuestionIndex;
      this.loadQuestionByIndex(Math.min(this.questions.length - 1, cur + 1));
    });

    // Host Hide/Show Question on Projector
    this.hostBtnToggleQ.addEventListener('click', () => {
      const cur = this.stateManager.state.questionRevealed;
      this.stateManager.updateField('questionRevealed', !cur, `${!cur ? 'Revealed' : 'Concealed'} Question Text`);
    });

    // Host Multiplier
    document.querySelectorAll('.host-mult-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const mult = parseInt(e.target.dataset.mult);
        this.stateManager.updateField('multiplier', mult, `Multiplier ${mult}X`);
      });
    });

    // Host Reveal All
    this.hostBtnRevealAll.addEventListener('click', () => {
      this.revealAllAnswers();
    });

    // Host Fuzzy Guess Matcher
    const runFuzzy = () => {
      const val = this.hostFuzzyInput.value;
      if (!val) return;
      this.hostFuzzyInput.value = '';
      this.checkContestantGuess(val);
    };
    this.hostFuzzySubmitBtn.addEventListener('click', runFuzzy);
    this.hostFuzzyInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') runFuzzy();
    });

    // Turn Selection
    this.btnTurnT1.addEventListener('click', () => {
      this.stateManager.updateField('activeTeam', 1, 'Active Turn Team 1');
    });
    this.btnTurnT2.addEventListener('click', () => {
      this.stateManager.updateField('activeTeam', 2, 'Active Turn Team 2');
    });

    // Strikes
    this.hostBtnAddStrike.addEventListener('click', () => this.triggerStrike());
    this.hostBtnClearStrikes.addEventListener('click', () => this.clearStrikes());

    // Steal Trigger
    this.hostBtnTriggerSteal.addEventListener('click', () => {
      const opp = this.stateManager.state.activeTeam === 1 ? 2 : 1;
      this.activateStealOpportunity(opp);
    });

    // Award Bank
    this.hostBtnAwardT1.addEventListener('click', () => this.awardBankToTeam(1));
    this.hostBtnAwardT2.addEventListener('click', () => this.awardBankToTeam(2));

    // Undo
    this.hostBtnUndo.addEventListener('click', () => {
      const ok = this.stateManager.undo();
      if (!ok) alert('No actions available to undo!');
    });

    // Declare Winner
    this.hostBtnOpenWinner.addEventListener('click', () => this.openWinnerDeclaration());

    // Soundboard Chips
    document.getElementById('sfx-ding').addEventListener('click', () => soundEngine.playDing());
    document.getElementById('sfx-buzz').addEventListener('click', () => soundEngine.playBuzzer(1));
    document.getElementById('sfx-steal').addEventListener('click', () => soundEngine.playStealAlert());
    document.getElementById('sfx-flip').addEventListener('click', () => soundEngine.playTileFlip());
    document.getElementById('sfx-fanfare').addEventListener('click', () => soundEngine.playWinFanfare());

    // Volume Slider
    this.hostVolSlider.addEventListener('input', (e) => {
      soundEngine.setVolume(parseFloat(e.target.value));
    });

    // Team Names & Score Nudges
    this.hostT1NameInput.addEventListener('change', (e) => {
      this.stateManager.updateField('team1Name', e.target.value.trim().toUpperCase() || 'TEAM 1', 'Renamed Team 1');
    });
    this.hostT2NameInput.addEventListener('change', (e) => {
      this.stateManager.updateField('team2Name', e.target.value.trim().toUpperCase() || 'TEAM 2', 'Renamed Team 2');
    });

    this.hostT1Plus.addEventListener('click', () => {
      this.stateManager.updateField('team1Score', this.stateManager.state.team1Score + 10, 'T1 +10');
    });
    this.hostT1Minus.addEventListener('click', () => {
      this.stateManager.updateField('team1Score', Math.max(0, this.stateManager.state.team1Score - 10), 'T1 -10');
    });
    this.hostT2Plus.addEventListener('click', () => {
      this.stateManager.updateField('team2Score', this.stateManager.state.team2Score + 10, 'T2 +10');
    });
    this.hostT2Minus.addEventListener('click', () => {
      this.stateManager.updateField('team2Score', Math.max(0, this.stateManager.state.team2Score - 10), 'T2 -10');
    });

    // Tile Axis Rotation Toggles
    document.getElementById('host-btn-axis-horizontal').addEventListener('click', () => {
      this.stateManager.updateField('rotationAxis', 'horizontal', 'Axis Horizontal');
      document.getElementById('host-btn-axis-horizontal').classList.add('active');
      document.getElementById('host-btn-axis-vertical').classList.remove('active');
    });
    document.getElementById('host-btn-axis-vertical').addEventListener('click', () => {
      this.stateManager.updateField('rotationAxis', 'vertical', 'Axis Vertical');
      document.getElementById('host-btn-axis-vertical').classList.add('active');
      document.getElementById('host-btn-axis-horizontal').classList.remove('active');
    });

    // Direct Tile Click on Stage Display (Allows host or presentation operator to click tile on screen)
    for (let i = 0; i < 8; i++) {
      const slot = document.getElementById(`tile-slot-${i}`);
      if (slot) {
        slot.addEventListener('click', () => {
          if (!slot.classList.contains('empty-inactive')) {
            this.toggleTileReveal(i);
          }
        });
      }
    }

    // Audience Guess Input
    this.audGuessSubmitBtn.addEventListener('click', () => {
      const txt = this.audGuessInput.value.trim();
      if (!txt) return;
      this.audGuessInput.value = '';
      this.audFeedbackMsg.style.display = 'block';
      this.audFeedbackMsg.textContent = `✨ Guess "${txt}" sent to the campus stage!`;
      setTimeout(() => {
        this.audFeedbackMsg.style.display = 'none';
      }, 4000);
    });

    // GLOBAL KEYBOARD SHORTCUTS FOR EVENT OPERATOR
    window.addEventListener('keydown', (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
        return;
      }

      const key = e.key.toUpperCase();

      // Number keys 1-8 for tile reveal
      if (key >= '1' && key <= '8' && !e.shiftKey) {
        const idx = parseInt(key) - 1;
        this.toggleTileReveal(idx);
        return;
      }

      // Shift + 1 -> Award T1, Shift + 2 -> Award T2
      if (e.shiftKey && key === '!') {
        this.awardBankToTeam(1);
        return;
      }
      if (e.shiftKey && key === '@') {
        this.awardBankToTeam(2);
        return;
      }

      // 'X' -> Add Strike
      if (key === 'X') {
        this.triggerStrike();
        return;
      }

      // 'C' -> Clear Strikes
      if (key === 'C') {
        this.clearStrikes();
        return;
      }

      // Space -> Reveal all
      if (e.code === 'Space') {
        e.preventDefault();
        this.revealAllAnswers();
        return;
      }

      // 'U' -> Undo
      if (key === 'U') {
        this.stateManager.undo();
        return;
      }

      // 'S' -> Steal
      if (key === 'S') {
        const opp = this.stateManager.state.activeTeam === 1 ? 2 : 1;
        this.activateStealOpportunity(opp);
        return;
      }

      // 'H' -> Switch to Host View, 'P' or 'Escape' -> Switch to Stage View
      if (key === 'H') {
        this.switchView('host');
        return;
      }
      if (key === 'P' || e.key === 'Escape') {
        this.switchView('stage');
        return;
      }
    });
  }
}

// Bootstrap Application
document.addEventListener('DOMContentLoaded', () => {
  window.navshaktiApp = new NavshaktiApp();

  // One-time gesture to unlock Web Audio API
  const unlockAudio = () => {
    soundEngine.init();
    window.removeEventListener('click', unlockAudio);
    window.removeEventListener('keydown', unlockAudio);
  };
  window.addEventListener('click', unlockAudio);
  window.addEventListener('keydown', unlockAudio);
});
