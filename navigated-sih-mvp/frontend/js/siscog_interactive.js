/**
 * SISCOG Enterprise Interactive Module.
 * Powers:
 * 1. Multi-Theme Switching (CREWS Midnight, Dark, Light)
 * 2. Enterprise Menu Bar (File, View, Operations, Colouring, Tools, etc.)
 * 3. Sub-Product Navigation (ONTIME, FLEET, CREWS, RAILWAY, WORKSHOP)
 * 4. Filter Rule Builder & Condition Droppers
 * 5. 28-Color Swatch Category Customizer Modal
 * 6. Interactive Validation Warning Banners
 */

class SiscogEnterpriseUI {
  constructor() {
    this.currentTheme = 'midnight'; // 'midnight' | 'dark' | 'light'
    this.activeProduct = 'ontime'; // 'ontime' | 'fleet' | 'crews' | 'railway' | 'workshop'
    this.activeMenu = null;
    this.selectedColorHex = '#00A3FF';
    this.validationAlerts = [
      { id: 'VAL-01', text: 'You have 1 unvalidated conflict in Section SEC-TDL-ETW (Howrah Rajdhani vs Winter Fog advisory).', resolved: false }
    ];
    
    // 28-Color SISCOG Category Swatch Palette
    this.colorSwatches = [
      '#FFB800', '#FFA000', '#FF8F00', '#FF6F00',
      '#FF5252', '#FF1744', '#D50000', '#C51162',
      '#AA00FF', '#7C4DFF', '#651FFF', '#3D5AFE',
      '#00A3FF', '#00B0FF', '#00E5FF', '#1DE9B6',
      '#00C853', '#00E676', '#76FF03', '#AEEA00',
      '#FFD600', '#FFAB00', '#FF9100', '#FF3D00',
      '#8D6E63', '#607D8B', '#78909C', '#37474F'
    ];
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.setupMenuBars();
    this.setupProductTabs();
    this.setupThemeSwitcher();
    this.setupColorPickerModal();
    this.setupValidationBanner();
    this.setupFilterRuleBuilder();
  }

  applyTheme(theme) {
    this.currentTheme = theme;
    document.body.className = `theme-${theme}`;
    
    // Update theme toggle buttons
    document.querySelectorAll('.btn-theme-opt').forEach(btn => {
      const t = btn.getAttribute('data-theme');
      btn.classList.toggle('active', t === theme);
    });

    // Re-render diagrams with updated theme colors
    if (window.stringlineDiagram) window.stringlineDiagram.render();
    if (window.platformGantt) window.platformGantt.render();
    if (window.corridorMapInstance) window.corridorMapInstance.render();
  }

  setupThemeSwitcher() {
    document.querySelectorAll('.btn-theme-opt').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const theme = btn.getAttribute('data-theme');
        this.applyTheme(theme);
        window.soundEngine.playClick();
      });
    });
  }

  setupProductTabs() {
    document.querySelectorAll('.siscog-product-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const product = btn.getAttribute('data-product');
        this.switchProduct(product);
        window.soundEngine.playClick();
      });
    });
  }

  switchProduct(product) {
    this.activeProduct = product;
    document.querySelectorAll('.siscog-product-pill').forEach(p => {
      p.classList.toggle('active', p.getAttribute('data-product') === product);
    });

    // Map product to corresponding views
    if (product === 'ontime') {
      window.app.switchTab('passenger');
    } else if (product === 'fleet') {
      window.app.switchTab('dispatch-matrix');
    } else if (product === 'crews') {
      window.app.switchTab('platform-gantt');
    } else if (product === 'railway') {
      window.app.switchTab('stringline');
    } else if (product === 'workshop') {
      window.app.switchTab('disruptions');
    }
  }

  setupMenuBars() {
    // Top menu bar item clicks (File, View, Operations, etc.)
    document.querySelectorAll('.siscog-menubar-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const menuKey = item.getAttribute('data-menu');
        if (this.activeMenu === menuKey) {
          this.closeMenus();
        } else {
          this.openMenu(menuKey, item);
        }
      });
    });

    // Close menus when clicking outside
    document.addEventListener('click', () => {
      this.closeMenus();
    });
  }

  openMenu(menuKey, targetEl) {
    this.closeMenus();
    this.activeMenu = menuKey;
    targetEl.classList.add('active');

    const dropdown = targetEl.querySelector('.siscog-dropdown-menu');
    if (dropdown) {
      dropdown.style.display = 'block';
    }
  }

  closeMenus() {
    this.activeMenu = null;
    document.querySelectorAll('.siscog-menubar-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.siscog-dropdown-menu').forEach(d => d.style.display = 'none');
  }

  setupColorPickerModal() {
    const grid = document.getElementById('siscogColorPaletteGrid');
    if (!grid) return;

    grid.innerHTML = this.colorSwatches.map((color, idx) => `
      <div class="siscog-color-chip ${color === this.selectedColorHex ? 'selected' : ''}" 
           style="background: ${color};" 
           onclick="window.siscogUI.selectColor('${color}')"></div>
    `).join('');
  }

  selectColor(hex) {
    this.selectedColorHex = hex;
    document.querySelectorAll('.siscog-color-chip').forEach(c => {
      c.classList.toggle('selected', c.style.backgroundColor === hex || c.getAttribute('style').includes(hex));
    });
    window.soundEngine.playClick();
  }

  openColorModal() {
    const modal = document.getElementById('siscogColorModal');
    if (modal) modal.style.display = 'flex';
  }

  closeColorModal() {
    const modal = document.getElementById('siscogColorModal');
    if (modal) modal.style.display = 'none';
  }

  setupValidationBanner() {
    const banner = document.getElementById('siscogValidationBanner');
    if (!banner) return;

    const alert = this.validationAlerts.find(a => !a.resolved);
    if (alert) {
      banner.style.display = 'flex';
      const textEl = document.getElementById('siscogValidationText');
      if (textEl) textEl.innerText = alert.text;
    } else {
      banner.style.display = 'none';
    }
  }

  validateActiveConflict() {
    const alert = this.validationAlerts.find(a => !a.resolved);
    if (alert) {
      alert.resolved = true;
      window.soundEngine.playRetrainSuccess();
      this.setupValidationBanner();
      
      // Auto propagate dynamic forecast update
      if (window.app) {
        window.app.refreshActiveViews();
      }
    }
  }

  setupFilterRuleBuilder() {
    // Condition builder dynamic triggers
    document.querySelectorAll('.siscog-filter-select').forEach(select => {
      select.addEventListener('change', () => {
        window.soundEngine.playClick();
        if (window.app) window.app.renderDispatchTable();
      });
    });
  }
}

window.siscogUI = new SiscogEnterpriseUI();
window.addEventListener('DOMContentLoaded', () => {
  window.siscogUI.init();
});
