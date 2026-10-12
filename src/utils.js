import { getState, setState } from './state.js';
import { persistState } from './storage.js';
import { elements } from './domElements.js';

export function generateId() {
  return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

export function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe).replace(/[&<>"']/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    if (m === '"') return '&quot;';
    return '&#039;';
  });
}

export function normalizeItem(item, type) {
  if (!item.id) item.id = generateId();
  if (item.favorite === undefined) item.favorite = false;
  if (item.archived === undefined) item.archived = false;
  if (!item.link) item.link = '';
  if (!item.cover) item.cover = '';
  if (!item.rating) item.rating = 0;
  if (!item.status) item.status = '';
  if (type === 'books') {
    if (!item.totalChapters) item.totalChapters = null;
    if (!item.chapter) item.chapter = '';
    if (item.author === undefined) item.author = '';
  }
  if (type === 'films') {
    if (!item.season) item.season = '';
  }
  if (!item.createdAt) item.createdAt = new Date().toISOString();
  if (!item.order) item.order = 999999;
  if (!item.deletedAt) item.deletedAt = null;
  return item;
}

export function showToast(message, type = 'info') {
  if (!elements.toastContainer) return;
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  toast.style.background = type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--accent)';
  elements.toastContainer.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

export function addHistory(action, details) {
  const state = getState();
  const entry = { time: new Date().toISOString(), action, details };
  const newHistory = [entry, ...state.history];
  if (newHistory.length > 50) newHistory.pop();
  setState({ history: newHistory });
  persistState();
}

export function findItemById(id) {
  const state = getState();
  for (let i = 0; i < state.songs.length; i++) if (state.songs[i].id === id) return { type: 'songs', index: i, item: state.songs[i] };
  for (let i = 0; i < state.books.length; i++) if (state.books[i].id === id) return { type: 'books', index: i, item: state.books[i] };
  for (let i = 0; i < state.films.length; i++) if (state.films[i].id === id) return { type: 'films', index: i, item: state.films[i] };
  for (let i = 0; i < state.notes.length; i++) if (state.notes[i].id === id) return { type: 'notes', index: i, item: state.notes[i] };
  return null;
}

export function updateDailyQuote() {
  const state = getState();
  const all = [...state.songs, ...state.books, ...state.films, ...state.notes].filter(i => !i.archived);
  if (elements.quoteText) {
    if (all.length === 0) elements.quoteText.textContent = 'Добавьте первую запись';
    else {
      const rand = all[Math.floor(Math.random() * all.length)];
      elements.quoteText.textContent = rand.title || rand.text || '...';
    }
  }
}

export function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

export function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

export function isValidImageUrl(string) {
  if (!isValidUrl(string)) return false;
  const ext = string.split('.').pop().toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext);
}

export function closeAllModals() {
  if (elements.viewModal) {
    elements.viewModal.classList.remove('active');
  }
  if (elements.editModal && elements.editModal.classList.contains('active')) {
    elements.editModal.classList.remove('active');
    setState({ editingItem: null });
  }
  const bgModal = document.getElementById('background-modal');
  if (bgModal && bgModal.classList.contains('active')) {
    bgModal.classList.remove('active');
  }
}