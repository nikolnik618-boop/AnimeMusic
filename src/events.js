import { getState, setState, produceState } from './state.js';
import { persistState } from './storage.js';
import { renderApp } from './render.js';
import { showToast, addHistory, findItemById, updateDailyQuote, debounce, generateId, escapeHtml, normalizeItem, isValidUrl, closeAllModals } from './utils.js';
import { elements } from './domElements.js';
import { moveToTrash, bulkMoveToTrash, restoreLastDeleted, restoreFromTrash } from './modules/trash.js';
import { openViewModal } from './modules/view.js';
import { openEditModal } from './modules/edit.js';

export function initEventDelegation(container, elements) {
  if (!container) return;
  container.addEventListener('click', (e) => handleMainClick(e, elements));
  container.addEventListener('change', (e) => handleMainChange(e, elements));
  container.addEventListener('dragstart', handleDragStart);
  container.addEventListener('dragend', handleDragEnd);
  container.addEventListener('dragover', handleDragOver);
  container.addEventListener('drop', (e) => handleDrop(e, elements));
}

async function handleMainClick(e, elements) {
  if (e.target.closest('.add-form')) return;
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
  
  const target = e.target;
  const card = target.closest('.item-card');

  if (target.closest('.delete-btn')) {
    e.stopPropagation();
    const id = target.closest('.delete-btn').dataset.id;
    await moveToTrash(id, elements);
    return;
  }

  if (target.closest('.edit-btn')) {
    e.stopPropagation();
    const id = target.closest('.edit-btn').dataset.id;
    openEditModal(id, elements);
    return;
  }

  if (target.closest('.favorite-star')) {
    e.stopPropagation();
    const id = target.closest('.favorite-star').dataset.id;
    const found = findItemById(id);
    if (found) {
      produceState(draft => {
        if (found.type === 'songs') draft.songs[found.index].favorite = !found.item.favorite;
        else if (found.type === 'books') draft.books[found.index].favorite = !found.item.favorite;
        else if (found.type === 'films') draft.films[found.index].favorite = !found.item.favorite;
        else if (found.type === 'notes') draft.notes[found.index].favorite = !found.item.favorite;
      });
      await persistState();
      renderApp();
    }
    return;
  }

  if (target.closest('.rating-star')) {
    e.stopPropagation();
    const star = target.closest('.rating-star');
    const id = star.dataset.id;
    const rating = parseInt(star.dataset.rating);
    const found = findItemById(id);
    if (found) {
      produceState(draft => {
        if (found.type === 'songs') draft.songs[found.index].rating = rating;
        else if (found.type === 'books') draft.books[found.index].rating = rating;
        else if (found.type === 'films') draft.films[found.index].rating = rating;
        else if (found.type === 'notes') draft.notes[found.index].rating = rating;
      });
      await persistState();
      renderApp();
    }
    return;
  }

  if (target.closest('.archive-btn')) {
    e.stopPropagation();
    const id = target.closest('.archive-btn').dataset.id;
    const found = findItemById(id);
    if (found) {
      produceState(draft => {
        if (found.type === 'songs') draft.songs[found.index].archived = !found.item.archived;
        else if (found.type === 'books') draft.books[found.index].archived = !found.item.archived;
        else if (found.type === 'films') draft.films[found.index].archived = !found.item.archived;
        else if (found.type === 'notes') draft.notes[found.index].archived = !found.item.archived;
      });
      await persistState();
      renderApp();
    }
    return;
  }

  if (card && !e.target.closest('button') && !e.target.closest('.item-checkbox') && !e.target.closest('.favorite-star') && !e.target.closest('.rating-star')) {
    const id = card.dataset.id;
    if (id) openViewModal(id, elements);
    return;
  }

  if (target.closest('.restore-btn')) {
    e.stopPropagation();
    const index = parseInt(target.closest('.restore-btn').dataset.index);
    await restoreFromTrash(index, elements);
    return;
  }

  if (target.closest('.delete-perm-btn')) {
    e.stopPropagation();
    if (confirm('Удалить навсегда?')) {
      const index = parseInt(target.closest('.delete-perm-btn').dataset.index);
      produceState(draft => {
        draft.trash.splice(index, 1);
      });
      await persistState();
      renderApp();
      showToast('Запись удалена навсегда', 'info');
    }
    return;
  }
}

function handleMainChange(e, elements) {
  if (e.target.classList.contains('item-checkbox')) {
    const id = e.target.dataset.id;
    const state = getState();
    let newArray = [...state.selectedIds];
    if (e.target.checked) {
      if (!newArray.includes(id)) newArray.push(id);
    } else {
      newArray = newArray.filter(i => i !== id);
    }
    setState({ selectedIds: newArray });
  }
}

let draggedItem = null;

function handleDragStart(e) {
  const card = e.target.closest('.item-card');
  if (!card) return;
  const state = getState();
  if (state.sortBy !== 'manual') {
    e.preventDefault();
    return;
  }
  draggedItem = card;
  card.classList.add('dragging');
  e.dataTransfer.setData('text/plain', card.dataset.id);
}

function handleDragEnd(e) {
  const card = e.target.closest('.item-card');
  if (card) card.classList.remove('dragging');
  draggedItem = null;
}

function handleDragOver(e) {
  e.preventDefault();
}

async function handleDrop(e, elements) {
  e.preventDefault();
  const state = getState();
  if (state.sortBy !== 'manual' || !draggedItem) return;
  const target = e.target.closest('.item-card');
  if (!target || target === draggedItem) return;
  const container = target.parentNode;
  const items = [...container.querySelectorAll('.item-card')];
  const draggedIdx = items.indexOf(draggedItem);
  const targetIdx = items.indexOf(target);
  if (draggedIdx < targetIdx) {
    container.insertBefore(draggedItem, target.nextSibling);
  } else {
    container.insertBefore(draggedItem, target);
  }
  const newOrder = [...container.querySelectorAll('.item-card')].map((card, idx) => {
    const id = card.dataset.id;
    const found = findItemById(id);
    if (found) {
      produceState(draft => {
        if (found.type === 'songs') draft.songs[found.index].order = idx;
        else if (found.type === 'books') draft.books[found.index].order = idx;
        else if (found.type === 'films') draft.films[found.index].order = idx;
        else if (found.type === 'notes') draft.notes[found.index].order = idx;
      });
    }
  });
  await persistState();
}

export function setupEventListeners(elements) {
  if (!elements) return;

  elements.tabSongs.addEventListener('click', () => { closeAllModals(); setState({ activeTab: 'songs' }); renderApp(); });
  elements.tabBooks.addEventListener('click', () => { closeAllModals(); setState({ activeTab: 'books' }); renderApp(); });
  elements.tabFilms.addEventListener('click', () => { closeAllModals(); setState({ activeTab: 'films' }); renderApp(); });
  elements.tabNotes.addEventListener('click', () => { closeAllModals(); setState({ activeTab: 'notes' }); renderApp(); });
  elements.tabTrash.addEventListener('click', () => { closeAllModals(); setState({ activeTab: 'trash' }); renderApp(); });

  elements.filterFavoriteBtn.addEventListener('click', () => {
    closeAllModals();
    const state = getState();
    setState({ showOnlyFavorite: !state.showOnlyFavorite });
    renderApp();
  });
  elements.showArchiveBtn.addEventListener('click', () => {
    closeAllModals();
    const state = getState();
    setState({ showArchive: !state.showArchive });
    renderApp();
  });

  const debouncedSearch = debounce((value) => {
    closeAllModals();
    setState({ searchQuery: value });
    renderApp();
  }, 300);
  elements.searchInput.addEventListener('input', (e) => debouncedSearch(e.target.value));

  elements.sortSelect.addEventListener('change', (e) => {
    closeAllModals();
    setState({ sortBy: e.target.value });
    renderApp();
  });

  elements.clearFiltersBtn.addEventListener('click', () => {
    closeAllModals();
    setState({
      searchQuery: '',
      showOnlyFavorite: false,
      showArchive: false,
      filterStatuses: [],
      filterMinRating: 0,
      filterPeriod: 'all',
    });
    elements.searchInput.value = '';
    elements.filterStatusRead.checked = false;
    elements.filterStatusReading.checked = false;
    elements.filterStatusDropped.checked = false;
    elements.filterStatusPlanned.checked = false;
    elements.filterRating.value = '0';
    elements.filterPeriodSelect.value = 'all';
    renderApp();
  });

  elements.filterToggle.addEventListener('click', () => {
    elements.filterPanel.classList.toggle('active');
  });

  elements.applyFiltersBtn.addEventListener('click', () => {
    closeAllModals();
    const statuses = [];
    if (elements.filterStatusRead.checked) statuses.push('Прочитано');
    if (elements.filterStatusReading.checked) statuses.push('В процессе');
    if (elements.filterStatusDropped.checked) statuses.push('Брошено');
    if (elements.filterStatusPlanned.checked) statuses.push('Запланировано');
    setState({
      filterStatuses: statuses,
      filterMinRating: parseInt(elements.filterRating.value) || 0,
      filterPeriod: elements.filterPeriodSelect.value || 'all',
    });
    renderApp();
    elements.filterPanel.classList.remove('active');
  });

  elements.viewListBtn.addEventListener('click', () => {
    closeAllModals();
    setState({ viewMode: 'list' });
    renderApp();
  });
  elements.viewGridBtn.addEventListener('click', () => {
    closeAllModals();
    setState({ viewMode: 'grid' });
    renderApp();
  });

  elements.refreshQuoteBtn.addEventListener('click', updateDailyQuote);

  elements.randomBtn.addEventListener('click', () => {
    const state = getState();
    const activeTab = state.activeTab;
    let items = [];
    if (activeTab === 'songs') items = state.songs;
    else if (activeTab === 'books') items = state.books;
    else if (activeTab === 'films') items = state.films;
    else if (activeTab === 'notes') items = state.notes;
    else return;
    const filtered = items.filter(i => !i.archived || state.showArchive);
    if (filtered.length === 0) {
      showToast('Нет записей', 'info');
      return;
    }
    const random = filtered[Math.floor(Math.random() * filtered.length)];
    openViewModal(random.id, elements);
  });

  elements.shareBtn.addEventListener('click', () => {
    const state = getState();
    const activeTab = state.activeTab;
    let items = [];
    if (activeTab === 'songs') items = state.songs;
    else if (activeTab === 'books') items = state.books;
    else if (activeTab === 'films') items = state.films;
    else if (activeTab === 'notes') items = state.notes;
    else if (activeTab === 'trash') items = state.trash;
    const filtered = items.filter(i => !i.archived || state.showArchive);
    const titles = filtered.map(i => i.title || i.text || '...').join('\n');
    navigator.clipboard.writeText(titles).then(() => showToast('Список скопирован', 'success'));
  });

  elements.exportBtn.addEventListener('click', () => {
    const state = getState();
    const data = {
      songs: state.songs,
      books: state.books,
      films: state.films,
      notes: state.notes,
      trash: state.trash,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'заметки-backup.json'; a.click();
  });

  elements.exportTxtBtn.addEventListener('click', () => {
    const state = getState();
    let txt = 'Заметки Export\n\n';
    txt += '=== Песни ===\n' + state.songs.map(s => `${s.title || '?'} — ${s.artist || '?'}`).join('\n') + '\n\n';
    txt += '=== Книги ===\n' + state.books.map(b => `${b.title || '?'} — ${b.author || '?'} (гл.${b.chapter || '?'})`).join('\n') + '\n\n';
    txt += '=== Фильмы ===\n' + state.films.map(f => `${f.title || '?'} — ${f.season || ''}`).join('\n') + '\n\n';
    txt += '=== Заметки ===\n' + state.notes.map(n => n.text || '?').join('\n\n');
    const blob = new Blob([txt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'заметки.txt'; a.click();
  });

  elements.importBtn.addEventListener('click', () => elements.importFile.click());
  elements.importCsvBtn.addEventListener('click', () => {
    elements.importFile.accept = '.csv';
    elements.importFile.click();
  });

  elements.importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        if (file.name.endsWith('.json')) {
          const data = JSON.parse(ev.target.result);
          produceState(draft => {
            if (data.songs) draft.songs = data.songs.map(i => normalizeItem(i, 'songs'));
            if (data.books || data.manga) draft.books = (data.books || data.manga).map(i => normalizeItem(i, 'books'));
            if (data.films || data.anime) draft.films = (data.films || data.anime).map(i => normalizeItem(i, 'films'));
            if (data.notes) draft.notes = data.notes.map(i => normalizeItem(i, 'notes'));
            if (data.trash) draft.trash = data.trash;
          });
          await persistState();
          showToast('Импорт JSON выполнен', 'success');
        } else if (file.name.endsWith('.csv')) {
          const lines = ev.target.result.split('\n');
          const headers = lines[0].split(',');
          const type = prompt('Тип импортируемых данных: songs / books / films / notes', 'songs');
          if (!type) return;
          produceState(draft => {
            for (let i = 1; i < lines.length; i++) {
              if (!lines[i].trim()) continue;
              const values = lines[i].split(',');
              const obj = {};
              headers.forEach((h, idx) => obj[h.trim()] = values[idx]?.trim());
              if (type === 'songs') draft.songs.push(normalizeItem({ 
                title: obj.title, 
                artist: obj.artist,
                link: obj.link || '',
                rating: parseInt(obj.rating) || 0,
                status: obj.status || '',
              }, 'songs'));
              else if (type === 'books') draft.books.push(normalizeItem({ 
                title: obj.title, 
                author: obj.author, 
                chapter: obj.chapter, 
                totalChapters: obj.totalChapters,
                link: obj.link || '',
                rating: parseInt(obj.rating) || 0,
                status: obj.status || '',
              }, 'books'));
              else if (type === 'films') draft.films.push(normalizeItem({ 
                title: obj.title, 
                season: obj.season, 
                status: obj.status, 
                rating: obj.rating, 
                link: obj.link, 
              }, 'films'));
              else if (type === 'notes') draft.notes.push(normalizeItem({ 
                text: obj.text,
              }, 'notes'));
            }
          });
          await persistState();
          showToast('Импорт CSV выполнен', 'success');
        }
        renderApp();
      } catch (err) {
        showToast('Ошибка импорта', 'error');
      }
    };
    reader.readAsText(file);
    elements.importFile.value = '';
  });

  elements.dataHeader.addEventListener('click', () => {
    elements.dataHeader.classList.toggle('open');
    elements.dataContent.classList.toggle('open');
  });

  elements.statsPreview.addEventListener('click', () => {
    elements.statsPreview.classList.toggle('open');
    elements.statsDetail.classList.toggle('open');
  });

  // ESCAPE для закрытия модалок
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key === 'Escape') {
      if (elements.viewModal?.classList.contains('active')) {
        elements.viewModal.classList.remove('active');
        e.preventDefault();
        return;
      }
      if (elements.editModal?.classList.contains('active')) {
        elements.editModal.classList.remove('active');
        setState({ editingItem: null });
        e.preventDefault();
        return;
      }
      const bgModal = document.getElementById('background-modal');
      if (bgModal?.classList.contains('active')) {
        bgModal.classList.remove('active');
        e.preventDefault();
        return;
      }
    }
  });

  // Сохранение новой записи
  document.addEventListener('click', async (e) => {
    if (e.target.id === 'saveBtn' || e.target.closest('#saveBtn')) {
      e.preventDefault();
      const state = getState();
      const type = state.activeTab;
      let item = {};

      if (!document.getElementById('addForm')) return;

      if (type === 'songs') {
        const title = document.getElementById('itemTitle')?.value.trim();
        const artist = document.getElementById('itemArtist')?.value.trim();
        if (!title || !artist) { alert('Заполните название и исполнителя'); return; }
        item.title = title;
        item.artist = artist;
        item.link = document.getElementById('itemLink')?.value.trim() || '';
        if (item.link && !isValidUrl(item.link)) { alert('Некорректная ссылка'); return; }
        item.rating = parseInt(document.getElementById('itemRating')?.value) || 0;
        item.status = document.getElementById('itemStatus')?.value || '';
      } else if (type === 'books') {
        const title = document.getElementById('itemTitle')?.value.trim();
        const author = document.getElementById('itemAuthor')?.value.trim();
        if (!title || !author) { alert('Заполните название и автора'); return; }
        item.title = title;
        item.author = author;
        item.chapter = document.getElementById('itemChapter')?.value.trim() || '';
        item.totalChapters = document.getElementById('itemTotalChapters')?.value.trim() || null;
        item.link = document.getElementById('itemLink')?.value.trim() || '';
        if (item.link && !isValidUrl(item.link)) { alert('Некорректная ссылка'); return; }
        item.rating = parseInt(document.getElementById('itemRating')?.value) || 0;
        item.status = document.getElementById('itemStatus')?.value || '';
      } else if (type === 'films') {
        const title = document.getElementById('itemTitle')?.value.trim();
        const season = document.getElementById('itemSeason')?.value.trim();
        if (!title) { alert('Заполните название'); return; }
        item.title = title;
        item.season = season || '';
        item.link = document.getElementById('itemLink')?.value.trim() || '';
        if (item.link && !isValidUrl(item.link)) { alert('Некорректная ссылка'); return; }
        item.rating = parseInt(document.getElementById('itemRating')?.value) || 0;
        item.status = document.getElementById('itemStatus')?.value || '';
      } else if (type === 'notes') {
        const text = document.getElementById('itemText')?.value.trim();
        if (!text) { alert('Введите текст заметки'); return; }
        item.text = text;
      }

      const newItem = normalizeItem(item, type);
      produceState(draft => {
        if (type === 'songs') draft.songs.push(newItem);
        else if (type === 'books') draft.books.push(newItem);
        else if (type === 'films') draft.films.push(newItem);
        else if (type === 'notes') draft.notes.push(newItem);
      });
      addHistory('Добавлено', newItem.title || newItem.text);
      await persistState();
      updateDailyQuote();
      renderApp();
      document.querySelectorAll('#addForm input, #addForm textarea, #addForm select').forEach(el => el.value = '');
      if (type !== 'notes') {
        const ratingSelect = document.getElementById('itemRating');
        if (ratingSelect) ratingSelect.value = '0';
      }
    }
  });

  // Сохранение редактирования
  elements.editSaveBtn.addEventListener('click', async () => {
    const state = getState();
    const id = state.editingItem;
    const found = findItemById(id);
    if (!found) return;
    const type = found.type;
    const item = {};

    if (type === 'songs') {
      item.title = elements.editSongTitle ? elements.editSongTitle.value.trim() : '';
      item.artist = elements.editSongArtist ? elements.editSongArtist.value.trim() : '';
      if (!item.title || !item.artist) { alert('Заполните название и исполнителя'); return; }
      item.link = elements.editCommonLink ? elements.editCommonLink.value.trim() : '';
      if (item.link && !isValidUrl(item.link)) { alert('Некорректная ссылка'); return; }
      item.rating = parseInt(elements.editCommonRating ? elements.editCommonRating.value : 0) || 0;
      item.status = elements.editCommonStatus ? elements.editCommonStatus.value : '';
    } else if (type === 'books') {
      item.title = elements.editBooksTitle ? elements.editBooksTitle.value.trim() : '';
      item.author = elements.editBooksAuthor ? elements.editBooksAuthor.value.trim() : '';
      if (!item.title || !item.author) { alert('Заполните название и автора'); return; }
      item.chapter = elements.editBooksChapter ? elements.editBooksChapter.value.trim() : '';
      item.totalChapters = elements.editBooksTotalChapters ? elements.editBooksTotalChapters.value.trim() : null;
      item.link = elements.editCommonLink ? elements.editCommonLink.value.trim() : '';
      if (item.link && !isValidUrl(item.link)) { alert('Некорректная ссылка'); return; }
      item.rating = parseInt(elements.editCommonRating ? elements.editCommonRating.value : 0) || 0;
      item.status = elements.editCommonStatus ? elements.editCommonStatus.value : '';
    } else if (type === 'films') {
      item.title = elements.editFilmsTitle ? elements.editFilmsTitle.value.trim() : '';
      item.season = elements.editFilmsSeason ? elements.editFilmsSeason.value.trim() : '';
      if (!item.title) { alert('Заполните название'); return; }
      item.link = elements.editCommonLink ? elements.editCommonLink.value.trim() : '';
      if (item.link && !isValidUrl(item.link)) { alert('Некорректная ссылка'); return; }
      item.rating = parseInt(elements.editCommonRating ? elements.editCommonRating.value : 0) || 0;
      item.status = elements.editCommonStatus ? elements.editCommonStatus.value : '';
    } else if (type === 'notes') {
      item.text = elements.editNotesText ? elements.editNotesText.value.trim() : '';
      if (!item.text) { alert('Введите текст заметки'); return; }
    }

    produceState(draft => {
      const idx = found.index;
      if (type === 'songs') draft.songs[idx] = { ...draft.songs[idx], ...item };
      else if (type === 'books') draft.books[idx] = { ...draft.books[idx], ...item };
      else if (type === 'films') draft.films[idx] = { ...draft.films[idx], ...item };
      else if (type === 'notes') draft.notes[idx] = { ...draft.notes[idx], ...item };
    });
    addHistory('Обновлено', item.title || item.text);
    await persistState();
    renderApp();
    elements.editModal.classList.remove('active');
    setState({ editingItem: null });
  });

  elements.editCancelBtn.addEventListener('click', () => {
    elements.editModal.classList.remove('active');
    setState({ editingItem: null });
  });

  elements.editModalClose.addEventListener('click', () => {
    elements.editModal.classList.remove('active');
    setState({ editingItem: null });
  });

  elements.editModal.addEventListener('click', (e) => {
    if (e.target === elements.editModal) {
      elements.editModal.classList.remove('active');
      setState({ editingItem: null });
    }
  });
}