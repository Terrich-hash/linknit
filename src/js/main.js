import data from '../data/links.json';
import { initParticles } from './particles.js';

// SVG Icon map for dynamic SVG injection
const ICONS = {
  server: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>`,
  briefcase: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>`,
  github: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>`,
  rss: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11a9 9 0 0 1 9 9"></path><path d="M4 4a16 16 0 0 1 16 16"></path><circle cx="5" cy="19" r="1"></circle></svg>`,
  'file-text': `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
  linkedin: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>`,
  mail: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
  arrowRight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>`
};

const THEMES = [
  { id: 'midnight', name: 'Midnight SRE' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon' },
  { id: 'monokai', name: 'Monokai Dark' },
  { id: 'matrix', name: 'Terminal Matrix' }
];

let currentThemeIndex = 0;

document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initTypewriter();
  renderLinks(data.links);
  initSearchAndFilter();
  initThemeToggle();
  initModals();
  initCopyActions();
});

/* --------------------------------------------------------------------------
   1. Dynamic Typewriter Animation
   -------------------------------------------------------------------------- */
function initTypewriter() {
  const el = document.getElementById('typewriter');
  if (!el) return;

  const roles = data.profile.roles || ['Software Engineer', 'AI/ML Architect', 'Linux Enthusiast'];
  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;

  function type() {
    const currentRole = roles[roleIdx];
    
    if (isDeleting) {
      el.textContent = currentRole.substring(0, charIdx - 1);
      charIdx--;
    } else {
      el.textContent = currentRole.substring(0, charIdx + 1);
      charIdx++;
    }

    let speed = isDeleting ? 40 : 80;

    if (!isDeleting && charIdx === currentRole.length) {
      speed = 2200; // Pause at full word
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      speed = 400;
    }

    setTimeout(type, speed);
  }

  type();
}

/* --------------------------------------------------------------------------
   2. Render Links & Card Magnet 3D Effect
   -------------------------------------------------------------------------- */
function renderLinks(linksToRender) {
  const container = document.getElementById('links-container');
  if (!container) return;

  if (linksToRender.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="text-align:center; padding: 30px; color: var(--text-muted); font-family: var(--font-mono);">
        <p>⚡ No matching links found.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = linksToRender.map(link => {
    const iconSvg = ICONS[link.icon] || ICONS.briefcase;
    const isModal = link.action === 'modal';
    const isCopy = link.action === 'copy-email';
    const targetAttr = (isModal || isCopy) ? '' : 'target="_blank" rel="noopener noreferrer"';
    const linkHref = isModal ? '#' : (isCopy ? `mailto:${data.profile.email}` : link.url);

    return `
      <a href="${linkHref}" 
         class="link-card" 
         data-id="${link.id}" 
         data-color="${link.color}"
         data-action="${link.action || 'link'}"
         ${targetAttr}>
        <div class="card-left">
          <div class="card-icon-box">
            ${iconSvg}
          </div>
          <div class="card-info">
            <div class="card-header-row">
              <span class="card-title">${escapeHtml(link.title)}</span>
              <span class="card-badge">${escapeHtml(link.badge)}</span>
            </div>
            <span class="card-subtitle">${escapeHtml(link.subtitle)}</span>
          </div>
        </div>
        <div class="card-right">
          <span class="card-arrow">${ICONS.arrowRight}</span>
        </div>
      </a>
    `;
  }).join('');

  attachCardEvents();
}

function attachCardEvents() {
  const cards = document.querySelectorAll('.link-card');

  cards.forEach(card => {
    const action = card.dataset.action;

    // 3D Magnetic tilt effect
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4;
      const rotateY = ((x - centerX) / centerX) * 4;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px) scale(1.01)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });

    // Special click actions
    card.addEventListener('click', (e) => {
      if (action === 'modal') {
        e.preventDefault();
        openModal('resume-modal');
      } else if (action === 'copy-email') {
        e.preventDefault();
        copyToClipboard(data.profile.email, 'Email harshchoudhary@gmail.com copied!');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   3. Search & Filter Logic
   -------------------------------------------------------------------------- */
function initSearchAndFilter() {
  const searchInput = document.getElementById('link-search');
  const clearBtn = document.getElementById('clear-search');
  const filterPills = document.querySelectorAll('.filter-pill');

  let activeFilter = 'all';
  let searchQuery = '';

  function filterLinks() {
    const filtered = data.links.filter(link => {
      // Category filter match
      let matchesFilter = true;
      if (activeFilter !== 'all') {
        matchesFilter = link.tags && link.tags.includes(activeFilter);
      }

      // Search query match
      let matchesSearch = true;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const titleMatch = link.title.toLowerCase().includes(q);
        const subMatch = link.subtitle.toLowerCase().includes(q);
        const tagMatch = link.tags && link.tags.some(t => t.toLowerCase().includes(q));
        matchesSearch = titleMatch || subMatch || tagMatch;
      }

      return matchesFilter && matchesSearch;
    });

    renderLinks(filtered);
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      clearBtn.hidden = searchQuery === '';
      filterLinks();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      clearBtn.hidden = true;
      filterLinks();
    });
  }

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeFilter = pill.dataset.filter;
      filterLinks();
    });
  });
}

/* --------------------------------------------------------------------------
   4. Theme Switcher
   -------------------------------------------------------------------------- */
function initThemeToggle() {
  const themeBtn = document.getElementById('theme-btn');
  const themeLabel = document.getElementById('current-theme-name');
  if (!themeBtn) return;

  themeBtn.addEventListener('click', () => {
    currentThemeIndex = (currentThemeIndex + 1) % THEMES.length;
    const nextTheme = THEMES[currentThemeIndex];
    document.documentElement.setAttribute('data-theme', nextTheme.id);
    if (themeLabel) themeLabel.textContent = nextTheme.name;
    showToast(`Switched to ${nextTheme.name} theme 🎨`, '🎨');
  });
}

/* --------------------------------------------------------------------------
   5. Modals & Copy Utilities
   -------------------------------------------------------------------------- */
function initModals() {
  const shareBtn = document.getElementById('share-btn');
  const closeResume = document.getElementById('close-resume-modal');
  const closeResumeBtn = document.getElementById('close-resume-btn');
  const closeShare = document.getElementById('close-share-modal');
  const copyQrLink = document.getElementById('copy-qr-link');
  const copySiteLink = document.getElementById('copy-site-link');

  if (shareBtn) {
    shareBtn.addEventListener('click', () => openModal('share-modal'));
  }

  if (closeResume) closeResume.addEventListener('click', () => closeModal('resume-modal'));
  if (closeResumeBtn) closeResumeBtn.addEventListener('click', () => closeModal('resume-modal'));
  if (closeShare) closeShare.addEventListener('click', () => closeModal('share-modal'));

  if (copyQrLink) {
    copyQrLink.addEventListener('click', () => {
      copyToClipboard(window.location.href, 'Profile URL copied to clipboard!');
      closeModal('share-modal');
    });
  }

  if (copySiteLink) {
    copySiteLink.addEventListener('click', () => {
      copyToClipboard(window.location.href, 'linknit URL copied to clipboard!');
    });
  }

  // Close modals on clicking backdrop
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.hidden = true;
      }
    });
  });
}

function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.hidden = false;
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.hidden = true;
}

function initCopyActions() {
  // Handled inside links card & modals
}

function copyToClipboard(text, msg) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(msg, '📋');
  }).catch(() => {
    // Fallback
    showToast('Copied: ' + text, '📋');
  });
}

function showToast(message, icon = '📋') {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  const toastIcon = document.getElementById('toast-icon');

  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  if (toastIcon) toastIcon.textContent = icon;
  toast.hidden = false;

  setTimeout(() => {
    toast.hidden = true;
  }, 3000);
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    }[m];
  });
}
