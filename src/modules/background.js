// src/modules/background.js
import { showToast } from '../utils.js';

const DEFAULT_BG = 'default';
const STORAGE_KEY = 'backgroundSettings';

export const BACKGROUNDS = [
  { id: 'default', name: 'По умолчанию (тёмный)', thumbnail: '' },
  { id: 'bg1', name: 'Фон 1', thumbnail: '/assets/backgrounds/bg1.jpg' },
  { id: 'bg2', name: 'Фон 2', thumbnail: '/assets/backgrounds/bg2.jpg' },
  { id: 'bg3', name: 'Фон 3', thumbnail: '/assets/backgrounds/bg3.jpg' },
  { id: 'bg4', name: 'Фон 4', thumbnail: '/assets/backgrounds/bg4.jpg' },
  { id: 'bg5', name: 'Фон 5', thumbnail: '/assets/backgrounds/bg5.jpg' },
  { id: 'bg6', name: 'Фон 6', thumbnail: '/assets/backgrounds/bg6.jpg' },
  { id: 'bg7', name: 'Фон 7', thumbnail: '/assets/backgrounds/bg7.jpg' },
  { id: 'bg8', name: 'Фон 8', thumbnail: '/assets/backgrounds/bg8.jpg' },
];

let currentBackground = null;

export function loadBackgroundSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const settings = JSON.parse(saved);
      currentBackground = settings.background || DEFAULT_BG;
      setTimeout(() => applyBackground(currentBackground), 50);
      return settings;
    }
  } catch (e) {}
  currentBackground = DEFAULT_BG;
  setTimeout(() => applyBackground(DEFAULT_BG), 50);
  return { background: DEFAULT_BG };
}

export function applyBackground(backgroundId) {
  const bg = BACKGROUNDS.find(b => b.id === backgroundId);
  if (!bg) return;

  currentBackground = backgroundId;
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ background: backgroundId }));
  
  if (backgroundId === 'default') {
    document.documentElement.style.setProperty('--bg-image', 'none');
    document.documentElement.style.setProperty('--bg-overlay', 'none');
    document.body.style.backgroundImage = 'none';
    document.body.style.background = 'var(--bg-primary)';
    document.body.classList.remove('has-background');
    updateChildElements();
    return;
  }

  const imagePath = `/assets/backgrounds/${backgroundId}.jpg?v=${Date.now()}`;
  const img = new Image();
  
  img.onload = () => {
    document.body.style.backgroundImage = `url('${imagePath}')`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
    document.body.style.backgroundRepeat = 'no-repeat';
    document.body.classList.add('has-background');
    document.documentElement.style.setProperty('--bg-overlay', 'rgba(0,0,0,0.5)');
    document.documentElement.style.setProperty('--bg-image', `url('${imagePath}')`);
    updateChildElements();
    console.log(`✅ Фон "${bg.name}" применён`);
  };
  
  img.onerror = () => {
    console.warn(`⚠️ Фон ${backgroundId} не найден по пути ${imagePath}`);
    const fallbackPath = `/assets/backgrounds/${backgroundId}.jpg`;
    const fallbackImg = new Image();
    
    fallbackImg.onload = () => {
      document.body.style.backgroundImage = `url('${fallbackPath}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.classList.add('has-background');
      document.documentElement.style.setProperty('--bg-overlay', 'rgba(0,0,0,0.5)');
      document.documentElement.style.setProperty('--bg-image', `url('${fallbackPath}')`);
      updateChildElements();
      console.log(`✅ Фон "${bg.name}" применён (без кеша)`);
    };
    
    fallbackImg.onerror = () => {
      console.error(`❌ Фон ${backgroundId} не найден, используем стандартный`);
      applyBackground(DEFAULT_BG);
      showToast(`Фон "${bg.name}" не найден`, 'error');
    };
    
    fallbackImg.src = fallbackPath;
  };
  
  img.src = imagePath;
}

function updateChildElements() {
  const sidebar = document.querySelector('.sidebar');
  const mainPanel = document.querySelector('.main-panel');
  const cards = document.querySelectorAll('.item-card');
  const addForms = document.querySelectorAll('.add-form');
  const filterPanel = document.querySelector('.filter-panel');
  const quoteContainer = document.querySelector('.quote-of-day');
  
  const isBackgroundActive = currentBackground && currentBackground !== 'default';
  
  if (isBackgroundActive) {
    if (sidebar) {
      sidebar.style.background = 'rgba(11, 11, 11, 0.7)';
      sidebar.style.backdropFilter = 'blur(25px)';
      sidebar.style.borderColor = 'rgba(255,255,255,0.06)';
      sidebar.classList.add('bg-active');
    }
    if (mainPanel) {
      mainPanel.style.background = 'rgba(11, 11, 11, 0.55)';
      mainPanel.style.backdropFilter = 'blur(25px)';
      mainPanel.style.borderColor = 'rgba(255,255,255,0.06)';
      mainPanel.classList.add('bg-active');
    }
    cards.forEach(card => {
      card.style.background = 'rgba(30, 30, 30, 0.7)';
      card.style.backdropFilter = 'blur(10px)';
      card.classList.add('bg-active');
    });
    addForms.forEach(form => {
      form.style.background = 'rgba(30, 30, 30, 0.7)';
      form.style.backdropFilter = 'blur(10px)';
      form.classList.add('bg-active');
    });
    if (filterPanel) {
      filterPanel.style.background = 'rgba(30, 30, 30, 0.7)';
      filterPanel.style.backdropFilter = 'blur(10px)';
      filterPanel.classList.add('bg-active');
    }
    if (quoteContainer) {
      quoteContainer.style.background = 'rgba(30, 30, 30, 0.6)';
      quoteContainer.style.backdropFilter = 'blur(10px)';
      quoteContainer.classList.add('bg-active');
    }
    const searchButtons = document.querySelectorAll('.search-bar .btn-icon');
    searchButtons.forEach(btn => {
      btn.style.background = 'rgba(30, 30, 30, 0.7)';
      btn.style.backdropFilter = 'blur(10px)';
      btn.classList.add('bg-active');
    });
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
      searchInput.style.background = 'rgba(30, 30, 30, 0.7)';
      searchInput.style.backdropFilter = 'blur(10px)';
      searchInput.classList.add('bg-active');
    }
  } else {
    if (sidebar) {
      sidebar.style.background = '';
      sidebar.style.backdropFilter = '';
      sidebar.style.borderColor = '';
      sidebar.classList.remove('bg-active');
    }
    if (mainPanel) {
      mainPanel.style.background = '';
      mainPanel.style.backdropFilter = '';
      mainPanel.style.borderColor = '';
      mainPanel.classList.remove('bg-active');
    }
    cards.forEach(card => {
      card.style.background = '';
      card.style.backdropFilter = '';
      card.classList.remove('bg-active');
    });
    addForms.forEach(form => {
      form.style.background = '';
      form.style.backdropFilter = '';
      form.classList.remove('bg-active');
    });
    if (filterPanel) {
      filterPanel.style.background = '';
      filterPanel.style.backdropFilter = '';
      filterPanel.classList.remove('bg-active');
    }
    if (quoteContainer) {
      quoteContainer.style.background = '';
      quoteContainer.style.backdropFilter = '';
      quoteContainer.classList.remove('bg-active');
    }
    const searchButtons = document.querySelectorAll('.search-bar .btn-icon');
    searchButtons.forEach(btn => {
      btn.style.background = '';
      btn.style.backdropFilter = '';
      btn.classList.remove('bg-active');
    });
    const searchInput = document.querySelector('.search-bar input');
    if (searchInput) {
      searchInput.style.background = '';
      searchInput.style.backdropFilter = '';
      searchInput.classList.remove('bg-active');
    }
  }
}

export function createBackgroundModal() {
  const oldModal = document.getElementById('background-modal');
  if (oldModal) oldModal.remove();
  
  const modal = document.createElement('div');
  modal.className = 'modal background-modal';
  modal.id = 'background-modal';
  
  const bgList = BACKGROUNDS.slice(1);
  
  modal.innerHTML = `
    <div class="modal-content background-modal-content">
      <span class="modal-close" id="bg-modal-close">&times;</span>
      <h2>🖼️ Выбор фона</h2>
      <p style="color: var(--text-secondary); margin-bottom: 16px;">
        Выберите фон для приложения. Изображения хранятся локально.
      </p>
      
      <div style="margin-bottom: 16px;">
        <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">Стандартный</div>
        <div class="background-grid" style="grid-template-columns: 1fr;">
          <div class="bg-option ${currentBackground === 'default' ? 'active' : ''}" data-bg="default">
            <div class="bg-preview default-preview">
              <div class="bg-check">${currentBackground === 'default' ? '✓' : ''}</div>
              <span style="color: var(--text-secondary); font-size: 14px;">🌙 Тёмная тема</span>
            </div>
            <div class="bg-name">По умолчанию</div>
          </div>
        </div>
      </div>
      
      <div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 8px;">Доступные фоны</div>
      <div class="background-grid" id="background-grid">
        ${bgList.map(bg => `
          <div class="bg-option ${currentBackground === bg.id ? 'active' : ''}" data-bg="${bg.id}">
            <div class="bg-preview" style="background-image: url('${bg.thumbnail}');">
              <div class="bg-check">${currentBackground === bg.id ? '✓' : ''}</div>
            </div>
            <div class="bg-name">${bg.name}</div>
          </div>
        `).join('')}
      </div>
      
      <div style="display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end;">
        <button class="btn-icon" id="bg-reset-default">↺ Сбросить</button>
        <button class="btn-primary" id="bg-close-btn" style="width: auto; padding: 10px 30px; margin: 0;">Закрыть</button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  const closeBtn = modal.querySelector('#bg-modal-close');
  const closeBtn2 = modal.querySelector('#bg-close-btn');
  const resetBtn = modal.querySelector('#bg-reset-default');
  const grid = modal.querySelector('#background-grid');
  const defaultOption = modal.querySelector('.bg-option[data-bg="default"]');
  
  const closeModal = () => {
    modal.classList.remove('active');
  };
  
  closeBtn.addEventListener('click', closeModal);
  closeBtn2.addEventListener('click', closeModal);
  
  resetBtn.addEventListener('click', () => {
    applyBackground(DEFAULT_BG);
    updateGridSelection();
    showToast('Фон сброшен на стандартный', 'success');
    closeModal();
  });
  
  if (defaultOption) {
    defaultOption.addEventListener('click', () => {
      applyBackground(DEFAULT_BG);
      updateGridSelection();
      showToast('Фон сброшен на стандартный', 'success');
      closeModal();
    });
  }
  
  grid.addEventListener('click', (e) => {
    const option = e.target.closest('.bg-option');
    if (!option) return;
    const bgId = option.dataset.bg;
    applyBackground(bgId);
    updateGridSelection();
    const bgName = BACKGROUNDS.find(b => b.id === bgId)?.name || bgId;
    showToast(`Фон "${bgName}" применён`, 'success');
    closeModal();
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });
  
  function updateGridSelection() {
    const allOptions = modal.querySelectorAll('.bg-option');
    allOptions.forEach(opt => {
      const id = opt.dataset.bg;
      opt.classList.toggle('active', id === currentBackground);
      const check = opt.querySelector('.bg-check');
      if (check) check.textContent = id === currentBackground ? '✓' : '';
    });
  }
  
  return modal;
}

export function openBackgroundModal() {
  let modal = document.getElementById('background-modal');
  if (!modal) {
    modal = createBackgroundModal();
  }
  
  const allOptions = modal.querySelectorAll('.bg-option');
  allOptions.forEach(opt => {
    const id = opt.dataset.bg;
    opt.classList.toggle('active', id === currentBackground);
    const check = opt.querySelector('.bg-check');
    if (check) check.textContent = id === currentBackground ? '✓' : '';
  });
  
  modal.classList.add('active');
}

export function initBackground() {
  loadBackgroundSettings();
  
  const bgButton = document.getElementById('open-bg-modal');
  if (bgButton) {
    bgButton.addEventListener('click', openBackgroundModal);
  }
}

export { currentBackground };