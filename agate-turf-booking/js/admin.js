/* ============================================
   AGATE ESPORTS — Admin Dashboard Logic (admin.js)
   ============================================ */
window.App = window.App || {};

App.Admin = (() => {
  let activeTeamDetails = null;

  function init() {
    if (!App.Auth.requireAdmin()) return;
    
    populateFilters();
    renderDashboard();
    initActivityLog();
    initDevTools();
    
    // Wire up events
    document.getElementById('admin-search').addEventListener('input', renderTable);
    document.getElementById('admin-filter-game').addEventListener('change', renderTable);
    document.getElementById('admin-filter-status').addEventListener('change', renderTable);
    
    document.getElementById('clear-data-btn').addEventListener('click', clearAllRegistrations);

    // Setup modal close handler
    const closeBtn = document.querySelector('.close-modal-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
    }
    window.addEventListener('click', (e) => {
      const modal = document.getElementById('details-modal');
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  function populateFilters() {
    const sel = document.getElementById('admin-filter-game');
    if (!sel) return;
    
    sel.innerHTML = '<option value="">All Tournaments</option>';
    
    App.DB.getStore('ag_tournaments').forEach(t => {
      const opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = `${t.game} — ${t.title}`;
      sel.appendChild(opt);
    });
  }

  function renderDashboard() {
    const teams = App.DB.getStore('ag_teams');
    const tournaments = App.DB.getStore('ag_tournaments');
    
    const pending = teams.filter(t => t.status === 'pending').length;
    const approved = teams.filter(t => t.status === 'approved').length;
    const rejected = teams.filter(t => t.status === 'rejected').length;

    const elTotal = document.getElementById('stat-teams-total');
    const elApproved = document.getElementById('stat-teams-approved');
    const elPending = document.getElementById('stat-teams-pending');
    const elRejected = document.getElementById('stat-teams-rejected');

    if (elTotal) elTotal.textContent = teams.length;
    if (elApproved) elApproved.textContent = approved;
    if (elPending) elPending.textContent = pending;
    if (elRejected) elRejected.textContent = rejected;

    renderTable();
    renderTournamentBreakdown(teams, tournaments);
  }

  function renderTournamentBreakdown(teams, tournaments) {
    const container = document.getElementById('tournament-breakdown');
    if (!container) return;
    
    if (tournaments.length === 0) {
      container.innerHTML = '<p class="text-muted text-center" style="padding: 1rem;">No tournaments configured.</p>';
      return;
    }
    
    container.innerHTML = tournaments.map(t => {
      const registered = teams.filter(team => team.tournamentId === t.id && team.status !== 'rejected').length;
      const pct = Math.min(100, Math.round((registered / t.slots) * 100));
      
      return `
        <div class="breakdown-item animate-on-scroll">
          <div class="breakdown-header">
            <span class="breakdown-game">${t.game} • ${t.title}</span>
            <span class="breakdown-stats">${registered}/${t.slots} teams (${pct}%)</span>
          </div>
          <div class="progress-bar-container">
            <div class="progress-bar-fill" style="width: ${pct}%; background: linear-gradient(90deg, ${t.color}, #0066ff)"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  function renderTable() {
    const search = document.getElementById('admin-search').value.toLowerCase();
    const filterTournament = document.getElementById('admin-filter-game').value;
    const filterStatus = document.getElementById('admin-filter-status').value;
    let teams = App.DB.getStore('ag_teams');

    if (search) {
      teams = teams.filter(t =>
        t.name.toLowerCase().includes(search) ||
        t.tag.toLowerCase().includes(search) ||
        t.regId.toLowerCase().includes(search) ||
        t.players.some(p => p.name.toLowerCase().includes(search) || p.ign.toLowerCase().includes(search))
      );
    }
    
    if (filterTournament) teams = teams.filter(t => t.tournamentId === filterTournament);
    if (filterStatus) teams = teams.filter(t => t.status === filterStatus);

    const tbody = document.getElementById('teams-tbody');
    const noTeams = document.getElementById('no-teams');
    const wrapper = document.getElementById('teams-table-wrapper');

    if (!tbody) return;

    if (teams.length === 0) {
      tbody.innerHTML = '';
      noTeams.style.display = 'block';
      wrapper.style.display = 'none';
      return;
    }
    
    noTeams.style.display = 'none';
    wrapper.style.display = 'block';

    tbody.innerHTML = teams.map((team, idx) => {
      const tournament = App.DB.getStore('ag_tournaments').find(t => t.id === team.tournamentId);
      const statusClass = `badge-${team.status}`;
      return `
        <tr class="admin-table-row">
          <td><strong>${team.name}</strong> <span class="team-tag-badge">[${team.tag}]</span></td>
          <td>${tournament ? `<span class="game-tag" style="border-color:${tournament.color}">${tournament.game}</span> ${tournament.title}` : team.tournamentId}</td>
          <td>${team.players.length} Players</td>
          <td><span class="reg-id-text">${team.regId}</span></td>
          <td><span class="badge ${statusClass}">${team.status}</span></td>
          <td>
            <div class="admin-actions-cell">
              <button class="btn btn-sm btn-outline btn-bracket" onclick="App.Admin.viewDetails('${team.id}')">Roster</button>
              ${team.status !== 'approved' ? `<button class="btn btn-sm btn-primary btn-bracket" onclick="App.Admin.updateStatus('${team.id}', 'approved', this)">Approve</button>` : ''}
              ${team.status !== 'rejected' ? `<button class="btn btn-sm btn-danger btn-bracket" onclick="App.Admin.updateStatus('${team.id}', 'rejected', this)">Reject</button>` : ''}
              <button class="btn btn-sm btn-danger-icon" onclick="App.Admin.deleteReg('${team.id}', this)" title="Delete Registration">✕</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function viewDetails(teamId) {
    const teams = App.DB.getStore('ag_teams');
    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    activeTeamDetails = team;
    const tournament = App.DB.getStore('ag_tournaments').find(t => t.id === team.tournamentId);

    const detailsContainer = document.getElementById('modal-team-info');
    if (!detailsContainer) return;

    detailsContainer.innerHTML = `
      <div class="detail-row"><span class="detail-label">Team Name</span><span class="detail-val">${team.name} [${team.tag}]</span></div>
      <div class="detail-row"><span class="detail-label">Registration ID</span><span class="detail-val" style="color:var(--accent); font-family:var(--font-heading);">${team.regId}</span></div>
      <div class="detail-row"><span class="detail-label">Tournament</span><span class="detail-val">${tournament ? tournament.title : team.tournamentId}</span></div>
      <div class="detail-row"><span class="detail-label">Game</span><span class="detail-val">${tournament ? tournament.game : '—'}</span></div>
      <div class="detail-row"><span class="detail-label">Status</span><span class="detail-val"><span class="badge badge-${team.status}">${team.status}</span></span></div>
      <div class="detail-row"><span class="detail-label">Registered By</span><span class="detail-val">${team.registeredBy}</span></div>
      <div class="detail-row"><span class="detail-label">Registered Date</span><span class="detail-val">${App.Main.formatDate(team.registeredAt)}</span></div>
    `;

    const rosterContainer = document.getElementById('modal-roster-list');
    if (rosterContainer) {
      rosterContainer.innerHTML = team.players.map((p, idx) => `
        <div class="modal-roster-player">
          <div class="player-num">#${idx + 1}</div>
          <div class="player-details-text">
            <span class="player-name">${p.name}</span>
            <span class="player-ign">${p.ign}</span>
          </div>
          <span class="player-role-badge">${p.role}</span>
        </div>
      `).join('');
    }

    const modal = document.getElementById('details-modal');
    if (modal) {
      modal.classList.add('visible');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    const modal = document.getElementById('details-modal');
    if (modal) {
      modal.classList.remove('visible');
      document.body.style.overflow = '';
      activeTeamDetails = null;
    }
  }

  function updateStatus(teamId, status, btnEl) {
    let btnText = status === 'approved' ? 'Approve' : 'Reject';
    if (btnEl) App.Main.setBtnLoading(btnEl, true);
    
    App.API.updateRegistrationStatus(teamId, status)
      .then(updatedTeam => {
        App.Main.toast(`Team "${updatedTeam.name}" has been ${status}.`, 'success');
        renderDashboard();
        initActivityLog();
        closeModal();
      })
      .catch(err => {
        App.Main.toast(err.message, 'error');
        if (btnEl) App.Main.setBtnLoading(btnEl, false, btnText);
      });
  }

  function deleteReg(teamId, btnEl) {
    if (!confirm('Are you sure you want to delete this registration? This will reclaim any slots and remove all roster details.')) return;
    
    if (btnEl) App.Main.setBtnLoading(btnEl, true);
    
    App.API.deleteRegistration(teamId)
      .then(() => {
        App.Main.toast('Registration deleted successfully.', 'success');
        renderDashboard();
        initActivityLog();
        closeModal();
      })
      .catch(err => {
        App.Main.toast(err.message, 'error');
        if (btnEl) App.Main.setBtnLoading(btnEl, false, '✕');
      });
  }

  function clearAllRegistrations() {
    if (!confirm('WARNING: Clear ALL team registration data? This cannot be undone.')) return;
    
    localStorage.removeItem('ag_teams');
    localStorage.removeItem('ag_tournaments');
    App.API.addActivityLog('admin', 'Admin cleared all team registration data.');
    
    App.Main.toast('All registrations cleared.', 'info');
    setTimeout(() => location.reload(), 600);
  }

  function initActivityLog() {
    const container = document.getElementById('activity-logs');
    if (!container) return;
    
    const logs = App.DB.getStore('ag_activity_log');
    if (logs.length === 0) {
      container.innerHTML = '<p class="text-muted text-center" style="padding: 2rem;">No recent activities.</p>';
      return;
    }

    container.innerHTML = logs.map(l => {
      let icon = '🔔';
      if (l.type === 'system') icon = '⚙️';
      if (l.type === 'admin') icon = '🛡️';
      if (l.type === 'user') icon = '👤';
      
      const timeStr = new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return `
        <div class="log-item log-type-${l.type}">
          <span class="log-icon">${icon}</span>
          <div class="log-body">
            <span class="log-text">${l.text}</span>
            <span class="log-time">${timeStr}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  function initDevTools() {
    const failToggle = document.getElementById('dev-simulate-failure');
    if (failToggle) {
      failToggle.checked = localStorage.getItem('ag_simulate_network_failure') === 'true';
      failToggle.addEventListener('change', (e) => {
        localStorage.setItem('ag_simulate_network_failure', e.target.checked ? 'true' : 'false');
        App.Main.toast(`Simulate network failure: ${e.target.checked ? 'ENABLED' : 'DISABLED'}`, 'info');
      });
    }

    const disableRandomToggle = document.getElementById('dev-disable-random-fail');
    if (disableRandomToggle) {
      disableRandomToggle.checked = localStorage.getItem('ag_disable_random_failure') === 'true';
      disableRandomToggle.addEventListener('change', (e) => {
        localStorage.setItem('ag_disable_random_failure', e.target.checked ? 'true' : 'false');
        App.Main.toast(`Random API failures (5%): ${e.target.checked ? 'DISABLED' : 'ENABLED'}`, 'info');
      });
    }
  }

  return {
    init,
    viewDetails,
    closeModal,
    updateStatus,
    deleteReg
  };
})();

document.addEventListener('DOMContentLoaded', App.Admin.init);
