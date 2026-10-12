// src/modules/trash.js
import { getState, produceState } from '../state.js';
import { persistState } from '../storage.js';
import { addHistory, findItemById, showToast } from '../utils.js';
import { renderApp } from '../render.js';

let undoTimeout = null;
let lastDeletedItem = null;

export async function moveToTrash(id, elements) {
  const found = findItemById(id);
  if (!found) return;
  const item = { ...found.item, originalType: found.type, deletedAt: new Date().toISOString() };

  produceState(draft => {
    if (found.type === 'songs') draft.songs.splice(found.index, 1);
    else if (found.type === 'books') draft.books.splice(found.index, 1);
    else if (found.type === 'films') draft.films.splice(found.index, 1);
    else if (found.type === 'notes') draft.notes.splice(found.index, 1);
    draft.trash.push(item);
    if (draft.selectedIds.includes(id)) {
      draft.selectedIds = draft.selectedIds.filter(i => i !== id);
    }
  });

  addHistory('Удалено', item.title || item.text);
  await persistState();
  renderApp();
  
  lastDeletedItem = item;
  if (undoTimeout) clearTimeout(undoTimeout);
  showUndoToast(item, elements);
}

export async function bulkMoveToTrash(ids, elements) {
  if (ids.length === 0) return;
  const items = [];
  produceState(draft => {
    ids.forEach(id => {
      const found = findItemById(id);
      if (found) {
        const item = { ...found.item, originalType: found.type, deletedAt: new Date().toISOString() };
        items.push(item);
        if (found.type === 'songs') draft.songs.splice(found.index, 1);
        else if (found.type === 'books') draft.books.splice(found.index, 1);
        else if (found.type === 'films') draft.films.splice(found.index, 1);
        else if (found.type === 'notes') draft.notes.splice(found.index, 1);
        draft.trash.push(item);
      }
    });
    draft.selectedIds = [];
  });
  addHistory('Массовое удаление', `${items.length} записей`);
  await persistState();
  renderApp();
  showToast(`Удалено ${items.length} записей`, 'info');
}

function showUndoToast(item, elements) {
  document.querySelectorAll('.undo-toast').forEach(el => el.remove());
  
  const toast = document.createElement('div');
  toast.className = 'undo-toast';
  const btnId = 'undo-btn-' + Date.now() + Math.random().toString(36).substr(2, 5);
  toast.innerHTML = `Запись удалена. <button id="${btnId}">Отменить</button>`;
  document.body.appendChild(toast);
  
  const btn = document.getElementById(btnId);
  if (btn) {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      await restoreLastDeleted(elements);
      toast.remove();
      if (undoTimeout) clearTimeout(undoTimeout);
    });
  }
  
  undoTimeout = setTimeout(() => {
    toast.remove();
    lastDeletedItem = null;
  }, 10000);
}

export async function restoreLastDeleted(elements) {
  if (!lastDeletedItem) {
    showToast('Нет записей для восстановления', 'info');
    return;
  }
  
  const item = { ...lastDeletedItem };
  const originalType = item.originalType || 'notes';
  
  delete item.deletedAt;
  delete item.originalType;

  produceState(draft => {
    if (originalType === 'songs') draft.songs.push(item);
    else if (originalType === 'books') draft.books.push(item);
    else if (originalType === 'films') draft.films.push(item);
    else if (originalType === 'notes') draft.notes.push(item);
    draft.trash = draft.trash.filter(t => t.id !== item.id);
  });

  lastDeletedItem = null;
  if (undoTimeout) clearTimeout(undoTimeout);
  addHistory('Восстановлено', item.title || item.text);
  await persistState();
  renderApp();
  showToast(`Запись "${item.title || item.text || '...'}" восстановлена`, 'success');
}

export async function restoreFromTrash(index, elements) {
  const state = getState();
  const trashItem = state.trash[index];
  if (!trashItem) {
    showToast('Запись не найдена', 'error');
    return;
  }
  
  const item = { ...trashItem };
  const originalType = item.originalType || 'notes';
  
  delete item.deletedAt;
  delete item.originalType;

  produceState(draft => {
    if (originalType === 'songs') draft.songs.push(item);
    else if (originalType === 'books') draft.books.push(item);
    else if (originalType === 'films') draft.films.push(item);
    else if (originalType === 'notes') draft.notes.push(item);
    draft.trash.splice(index, 1);
  });

  addHistory('Восстановлено из корзины', item.title || item.text);
  await persistState();
  renderApp();
  showToast(`Запись "${item.title || item.text || '...'}" восстановлена из корзины`, 'success');
}