/* ============================================
   AGATE ESPORTS — Main Common Script (main.js)
   ============================================ */
window.App = window.App || {};

App.Main = (() => {
  function toast(message, type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    
    let icon = '⚡';
    if (type === 'success') icon = '🏆';
    if (type === 'error') icon = '❌';
    
    t.innerHTML = `
      <div class="toast-content">
        <span class="toast-icon">${icon}</span>
        <span class="toast-msg">${message}</span>
      </div>
      <div class="toast-progress"></div>
    `;
    container.appendChild(t);
    
    setTimeout(() => {
      t.classList.add('toast-fadeout');
      setTimeout(() => t.remove(), 400);
    }, 3800);
  }

  function updateNavAuth() {
    const authContainers = document.querySelectorAll('.nav-auth');
    const session = App.Auth.getSession();
    
    authContainers.forEach(container => {
      if (!container) return;
      if (session) {
        container.innerHTML = `
          <div class="nav-user-container">
            <span class="nav-user">⚡ ${session.username}</span>
            <span class="nav-user-role">${session.role}</span>
          </div>
          ${session.role === 'admin' ? '<a href="admin.html" class="btn btn-sm btn-outline btn-bracket">Dashboard</a>' : ''}
          <button onclick="App.Auth.logout()" class="btn btn-sm btn-danger btn-bracket">Logout</button>
        `;
      } else {
        container.innerHTML = `
          <a href="login.html" class="btn btn-sm btn-outline btn-bracket">Login</a>
          <a href="register.html" class="btn btn-sm btn-primary btn-bracket">Sign Up</a>
        `;
      }
    });
  }

  function initMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    if (hamburger && navLinks) {
      const newHamburger = hamburger.cloneNode(true);
      hamburger.parentNode.replaceChild(newHamburger, hamburger);
      
      newHamburger.addEventListener('click', () => {
        newHamburger.classList.toggle('active');
        navLinks.classList.toggle('open');
      });
    }
  }

  function initPageAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('slide-up-active');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.animate-on-scroll, .slide-up').forEach(el => {
      el.classList.add('slide-up-prepare');
      observer.observe(el);
    });
  }

  function formatDate(isoStr) {
    if (!isoStr) return '—';
    return new Date(isoStr).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function setBtnLoading(btn, isLoading, defaultHtml = 'Submit') {
    let buttonEl = typeof btn === 'string' ? document.getElementById(btn) : btn;
    if (!buttonEl) return;
    
    if (isLoading) {
      buttonEl.disabled = true;
      buttonEl.innerHTML = `<span class="spinner"></span> Processing...`;
    } else {
      buttonEl.disabled = false;
      buttonEl.innerHTML = defaultHtml;
    }
  }

  function init() {
    App.DB.init();
    updateNavAuth();
    initMobileMenu();
    initPageAnimations();
  }

  return {
    init,
    toast,
    updateNavAuth,
    formatDate,
    setBtnLoading
  };
})();

document.addEventListener('DOMContentLoaded', App.Main.init);
