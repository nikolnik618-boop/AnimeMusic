// src/modules/view.js
import { findItemById, closeAllModals } from '../utils.js';
import { escapeHtml } from '../utils.js';
import { elements } from '../domElements.js';

export function initView(elements) {
  if (!elements.viewModal || !elements.viewModalClose) return;
  
  elements.viewModalClose.addEventListener('click', () => {
    elements.viewModal.classList.remove('active');
  });
  
  window.addEventListener('click', (e) => {
    if (e.target === elements.viewModal) {
      elements.viewModal.classList.remove('active');
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && elements.viewModal?.classList.contains('active')) {
      elements.viewModal.classList.remove('active');
    }
  });
}

export function openViewModal(id, elements) {
  closeAllModals();
  const found = findItemById(id);
  if (!found) return;
  
  const item = found.item;
  const type = found.type;
  
  const cover = item.cover ? `<img src="${item.cover.replace(/"/g, '&quot;')}" style="max-width:200px; border-radius:20px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);">` : '';
  const meta = [];
  
  if (type === 'songs') {
    if (item.artist) meta.push(`🎤 ${escapeHtml(item.artist)}`);
    if (item.status) meta.push(`📌 ${item.status}`);
  } else if (type === 'books') {
    if (item.author) meta.push(`✎ ${escapeHtml(item.author)}`);
    if (item.chapter) meta.push(`📖 гл. ${escapeHtml(item.chapter)}${item.totalChapters ? '/'+item.totalChapters : ''}`);
    if (item.status) meta.push(`📌 ${item.status}`);
  } else if (type === 'films') {
    if (item.season) meta.push(`🎬 ${escapeHtml(item.season)}`);
    if (item.status) meta.push(`📌 ${item.status}`);
  }
  if (item.rating) meta.push(`⭐ ${item.rating}/10`);

  let linkHtml = '';
  if (item.link) {
    linkHtml = `<div style="margin-top:16px; padding-top:16px; border-top: 1px solid rgba(255,255,255,0.06);">
      <a href="${item.link.replace(/"/g, '&quot;')}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: rgba(123, 74, 255, 0.15); border-radius: 60px; transition: all 0.3s ease;">
        🔗 Открыть ссылку
      </a>
    </div>`;
  }

  // Просто отображаем текст без Markdown
  let content;
  if (type === 'notes') {
    content = escapeHtml(item.text || '');
  } else {
    content = escapeHtml(item.title || '');
  }

  const typeIcons = {
    songs: '🎵',
    books: '📚',
    films: '🎬',
    notes: '📝'
  };
  const typeIcon = typeIcons[type] || '📄';

  if (elements.viewModalBody) {
    elements.viewModalBody.innerHTML = `
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px;">
        <span style="font-size: 28px;">${typeIcon}</span>
        <span style="font-size: 13px; color: var(--text-secondary); background: rgba(255,255,255,0.06); padding: 4px 14px; border-radius: 40px; text-transform: uppercase; letter-spacing: 0.05em;">
          ${type === 'songs' ? 'Песня' : type === 'books' ? 'Книга' : type === 'films' ? 'Фильм' : 'Заметка'}
        </span>
        ${item.favorite ? '<span style="font-size: 18px;">⭐</span>' : ''}
      </div>
      <h2 style="font-size: 28px; font-weight: 700; margin: 8px 0 16px 0; background: linear-gradient(135deg, var(--text-primary), var(--accent-light)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
        ${escapeHtml(item.title || (type === 'notes' ? 'Заметка' : ''))}
      </h2>
      ${cover}
      <div style="margin: 20px 0; line-height: 1.8; font-size: 16px; color: var(--text-primary); white-space: pre-wrap;">
        ${content}
      </div>
      ${meta.length ? `<div style="display:flex; flex-wrap:wrap; gap:10px; margin: 12px 0; padding: 12px 0; border-top: 1px solid rgba(255,255,255,0.06); border-bottom: 1px solid rgba(255,255,255,0.06);">
        ${meta.map(m => `<span style="background: rgba(255,255,255,0.06); padding: 6px 16px; border-radius: 40px; font-size: 14px; color: var(--text-secondary);">${m}</span>`).join('')}
      </div>` : ''}
      ${linkHtml}
      <div style="margin-top: 16px; color: var(--text-secondary); font-size: 13px; opacity: 0.6; display: flex; gap: 16px; flex-wrap: wrap;">
        <span>📅 Добавлено: ${new Date(item.createdAt).toLocaleString()}</span>
        ${item.archived ? '<span>📦 В архиве</span>' : ''}
      </div>
    `;
  }
  
  if (elements.viewModal) {
    elements.viewModal.classList.add('active');
    if (elements.viewModalBody) {
      elements.viewModalBody.scrollTop = 0;
    }
  }
}