/* ============================================
   AGATE ESPORTS — Asynchronous API Layer (api.js)
   ============================================ */
window.App = window.App || {};

App.API = (() => {
  const LATENCY = 800;

  function simulateNetwork() {
    return new Promise((resolve, reject) => {
      const forceFail = localStorage.getItem('ag_simulate_network_failure') === 'true';
      // 5% random failure rate if not explicitly disabled
      const randomFail = localStorage.getItem('ag_disable_random_failure') !== 'true' && Math.random() < 0.05;
      
      setTimeout(() => {
        if (forceFail || randomFail) {
          reject(new Error("Network request failed. Please check your connection and retry."));
        } else {
          resolve();
        }
      }, LATENCY);
    });
  }

  function addActivityLog(type, text) {
    const logs = App.DB.getStore('ag_activity_log');
    logs.unshift({
      id: 'act' + Date.now(),
      type,
      text,
      timestamp: new Date().toISOString()
    });
    App.DB.setStore('ag_activity_log', logs.slice(0, 100));
  }

  function register(username, email, password, role, gamertag, preferredGame) {
    return simulateNetwork().then(() => {
      const users = App.DB.getStore('ag_users');
      if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
        throw new Error('Email is already registered.');
      }
      if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        throw new Error('Username is already taken.');
      }
      
      const user = {
        id: 'u' + Date.now(),
        username,
        email,
        password,
        role: role || 'player',
        gamertag: gamertag || '',
        preferredGame: preferredGame || '',
        created: new Date().toISOString()
      };
      
      users.push(user);
      App.DB.setStore('ag_users', users);
      
      // Auto-set session
      App.DB.setObj('ag_session', { id: user.id, username: user.username, email: user.email, role: user.role });
      
      addActivityLog('user', `New user registered: ${username} (${role})`);
      return { ok: true, user };
    });
  }

  function login(email, password) {
    return simulateNetwork().then(() => {
      const users = App.DB.getStore('ag_users');
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      
      if (!user) {
        throw new Error('Invalid email or password.');
      }
      
      App.DB.setObj('ag_session', { id: user.id, username: user.username, email: user.email, role: user.role });
      
      addActivityLog('user', `${user.username} logged in.`);
      return { ok: true, user };
    });
  }

  function registerTeam(teamName, teamTag, tournamentId, players) {
    return simulateNetwork().then(() => {
      const teams = App.DB.getStore('ag_teams');
      const tournaments = App.DB.getStore('ag_tournaments');
      const session = App.Auth.getSession();
      
      const t = tournaments.find(x => x.id === tournamentId);
      if (!t) {
        throw new Error('Tournament not found.');
      }
      if (t.status === 'full' || t.registered >= t.slots) {
        throw new Error('This tournament is already full.');
      }

      const nameConflict = teams.some(team => team.tournamentId === tournamentId && team.name.toLowerCase() === teamName.toLowerCase());
      if (nameConflict) {
        throw new Error(`A team named "${teamName}" is already registered in this tournament.`);
      }

      const registeredIgns = new Set();
      teams.filter(team => team.tournamentId === tournamentId && team.status !== 'rejected')
           .forEach(team => team.players.forEach(p => registeredIgns.add(p.ign.toLowerCase())));

      for (const player of players) {
        if (registeredIgns.has(player.ign.toLowerCase())) {
          throw new Error(`Player In-Game ID "${player.ign}" is already registered in this tournament.`);
        }
      }

      const team = {
        id: 'tm' + Date.now(),
        name: teamName,
        tag: teamTag.toUpperCase(),
        tournamentId,
        players,
        status: 'pending',
        registeredBy: session ? session.username : 'anonymous',
        registeredAt: new Date().toISOString(),
        regId: 'AG-' + Math.random().toString(36).substring(2, 8).toUpperCase()
      };
      
      teams.push(team);
      App.DB.setStore('ag_teams', teams);
      
      t.registered = Math.min(t.registered + 1, t.slots);
      if (t.registered >= t.slots) t.status = 'full';
      App.DB.setStore('ag_tournaments', tournaments);

      addActivityLog('user', `Team registered: "${teamName}" [${team.tag}] for "${t.title}"`);
      return team;
    });
  }

  function updateRegistrationStatus(teamId, status) {
    return simulateNetwork().then(() => {
      const teams = App.DB.getStore('ag_teams');
      const team = teams.find(t => t.id === teamId);
      
      if (!team) {
        throw new Error('Registration not found.');
      }

      const oldStatus = team.status;
      team.status = status;
      App.DB.setStore('ag_teams', teams);

      const tournaments = App.DB.getStore('ag_tournaments');
      const t = tournaments.find(x => x.id === team.tournamentId);
      
      if (t) {
        if (oldStatus !== 'rejected' && status === 'rejected') {
          t.registered = Math.max(0, t.registered - 1);
          if (t.status === 'full') t.status = 'open';
        } else if (oldStatus === 'rejected' && status !== 'rejected') {
          t.registered = Math.min(t.registered + 1, t.slots);
          if (t.registered >= t.slots) t.status = 'full';
        }
        App.DB.setStore('ag_tournaments', tournaments);
      }

      const session = App.Auth.getSession();
      const adminName = session ? session.username : 'admin';
      addActivityLog('admin', `Admin (${adminName}) updated Team "${team.name}" status from "${oldStatus}" to "${status}"`);
      
      return team;
    });
  }

  function deleteRegistration(teamId) {
    return simulateNetwork().then(() => {
      const teams = App.DB.getStore('ag_teams');
      const index = teams.findIndex(t => t.id === teamId);
      
      if (index === -1) {
        throw new Error('Registration not found.');
      }

      const team = teams[index];
      teams.splice(index, 1);
      App.DB.setStore('ag_teams', teams);

      if (team.status !== 'rejected') {
        const tournaments = App.DB.getStore('ag_tournaments');
        const t = tournaments.find(x => x.id === team.tournamentId);
        if (t) {
          t.registered = Math.max(0, t.registered - 1);
          if (t.status === 'full') t.status = 'open';
          App.DB.setStore('ag_tournaments', tournaments);
        }
      }

      const session = App.Auth.getSession();
      const adminName = session ? session.username : 'admin';
      addActivityLog('admin', `Admin (${adminName}) deleted Team "${team.name}" registration.`);
    });
  }

  return {
    register,
    login,
    registerTeam,
    updateRegistrationStatus,
    deleteRegistration,
    addActivityLog
  };
})();
