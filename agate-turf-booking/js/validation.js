/* ============================================
   AGATE ESPORTS — Validation Engine (validation.js)
   ============================================ */
window.App = window.App || {};

App.Validation = (() => {
  function validate(rules) {
    let valid = true;
    rules.forEach(({ input, error, checks }) => {
      const errEl = document.getElementById(error);
      const inputEl = document.getElementById(input);
      if (!inputEl || !errEl) return;
      let msg = '';
      for (const check of checks) {
        const result = check(inputEl.value.trim());
        if (result) { msg = result; break; }
      }
      if (msg) {
        valid = false;
        errEl.textContent = msg;
        errEl.classList.add('visible');
        inputEl.classList.add('error');
      } else {
        errEl.classList.remove('visible');
        inputEl.classList.remove('error');
      }
    });
    return valid;
  }

  function checkPasswordStrength(v) {
    if (!v) return 'Password is required.';
    if (v.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(v)) return 'Must contain at least one uppercase letter.';
    if (!/[a-z]/.test(v)) return 'Must contain at least one lowercase letter.';
    if (!/[0-9]/.test(v)) return 'Must contain at least one number.';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(v)) return 'Must contain at least one special character.';
    return null;
  }

  const V = {
    required: (label) => (v) => v ? null : `${label} is required.`,
    minLen: (n) => (v) => v.length >= n ? null : `Must be at least ${n} characters.`,
    email: () => (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? null : 'Enter a valid email address.',
    match: (otherId, label) => (v) => v === document.getElementById(otherId)?.value ? null : `${label} do not match.`,
    passwordStrength: () => (v) => checkPasswordStrength(v),
    ignFormat: () => (v) => {
      if (!v) return 'In-Game ID is required.';
      if (!v.includes('#')) return 'IGN must include tag (e.g. Player#1234).';
      const parts = v.split('#');
      if (parts[0].length < 2 || parts[1].length < 1) return 'IGN and tag must be valid.';
      return null;
    }
  };

  return {
    validate,
    V,
    checkPasswordStrength
  };
})();
