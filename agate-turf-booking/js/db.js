/* ============================================
   AGATE ESPORTS — Database & Storage Layer (db.js)
   ============================================ */
window.App = window.App || {};

App.DB = (() => {
  const TOURNAMENTS = [
    { id: 't1', game: 'VALORANT', title: 'Agate Invitational S3', date: '2026-07-15', prize: '$5,000', slots: 16, registered: 11, status: 'open', color: '#ff4655', desc: '5v5 Tactical Shooter — Double Elimination' },
    { id: 't2', game: 'CS2', title: 'Counter-Strike Showdown', date: '2026-07-22', prize: '$3,500', slots: 12, registered: 10, status: 'closing', color: '#de9b35', desc: '5v5 Competitive — Best of 3 Series' },
    { id: 't3', game: 'APEX LEGENDS', title: 'Apex Arena Championship', date: '2026-08-01', prize: '$4,000', slots: 20, registered: 20, status: 'full', color: '#da292a', desc: '3v3 Battle Royale — Points Based' },
    { id: 't4', game: 'DOTA 2', title: 'Aegis Cup Qualifier', date: '2026-08-10', prize: '$8,000', slots: 16, registered: 7, status: 'open', color: '#a12a12', desc: '5v5 MOBA — Captain\'s Mode' },
    { id: 't5', game: 'LEAGUE OF LEGENDS', title: 'Rift Rivals Open', date: '2026-08-18', prize: '$6,000', slots: 16, registered: 14, status: 'closing', color: '#c89b3c', desc: '5v5 MOBA — Draft Pick Format' },
    { id: 't6', game: 'PUBG MOBILE', title: 'Battleground Blitz', date: '2026-09-02', prize: '$2,500', slots: 24, registered: 9, status: 'open', color: '#f2a900', desc: '4-Player Squad — Classic Erangel' }
  ];

  const ROLES = ['IGL', 'Entry Fragger', 'Support', 'Lurker', 'AWPer', 'Flex', 'Controller', 'Duelist', 'Initiator', 'Sentinel'];

  function getStore(key) {
    try {
      return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
      return [];
    }
  }

  function setStore(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  function getObj(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  }

  function setObj(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
  }

  function init() {
    if (!localStorage.getItem('ag_tournaments')) setStore('ag_tournaments', TOURNAMENTS);
    if (!localStorage.getItem('ag_users')) {
      // Seed default accounts
      setStore('ag_users', [
        { id: 'admin', username: 'admin', email: 'admin@agate.gg', password: 'Password123!', role: 'admin', created: new Date().toISOString() },
        { id: 'u1', username: 'pro_gamer', email: 'gamer@agate.gg', password: 'Password123!', role: 'player', gamertag: 'xBlaze#1337', preferredGame: 'valorant', created: new Date().toISOString() }
      ]);
    }
    if (!localStorage.getItem('ag_teams')) setStore('ag_teams', []);
    if (!localStorage.getItem('ag_activity_log')) {
      setStore('ag_activity_log', [
        { id: 'act0', type: 'system', text: 'Agate Esports Registration Platform Initialized.', timestamp: new Date().toISOString() }
      ]);
    }
  }

  return {
    init,
    getStore,
    setStore,
    getObj,
    setObj,
    ROLES
  };
})();
