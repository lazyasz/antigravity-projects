/* ============================================
   AGATE ESPORTS — Authentication Service (auth.js)
   ============================================ */
window.App = window.App || {};

App.Auth = (() => {
  function getSession() {
    return App.DB.getObj('ag_session');
  }

  function isLoggedIn() {
    return !!getSession();
  }

  function isAdmin() {
    const session = getSession();
    return session && session.role === 'admin';
  }

  function logout() {
    const session = getSession();
    if (session && window.App.API) {
      window.App.API.addActivityLog('user', `${session.username} logged out.`);
    }
    localStorage.removeItem('ag_session');
    window.location.href = 'index.html';
  }

  function requireAuth(redirect = 'login.html') {
    if (!isLoggedIn()) {
      if (window.App.Main) {
        window.App.Main.toast('Authentication required. Please login first.', 'error');
      }
      setTimeout(() => { window.location.href = redirect; }, 1000);
      return false;
    }
    return true;
  }

  function requireAdmin() {
    if (!isAdmin()) {
      if (window.App.Main) {
        window.App.Main.toast('Access denied. Administrator privileges required.', 'error');
      }
      setTimeout(() => { window.location.href = 'index.html'; }, 1000);
      return false;
    }
    return true;
  }

  return {
    getSession,
    isLoggedIn,
    isAdmin,
    logout,
    requireAuth,
    requireAdmin
  };
})();
