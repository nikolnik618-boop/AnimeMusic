// src/render.js
import { getState, setState } from './state.js';
import { elements } from './domElements.js';
import { createForm, createCard, createTrashView } from './modules/renderHelpers.js';

export function renderApp() {
  const state = getState();
  const activeTab = state.activeTab;

  [elements.tabSongs, elements.tabBooks, elements.tabFilms, elements.tabNotes, elements.tabTrash].forEach(tab => {
    if (tab) tab.classList.remove('active');
  });
  const activeTabElement = activeTab === 'songs' ? elements.tabSongs :
                           activeTab === 'books' ? elements.tabBooks :
                           activeTab === 'films' ? elements.tabFilms :
                           activeTab === 'notes' ? elements.tabNotes :
                           elements.tabTrash;
  if (activeTabElement) activeTabElement.classList.add('active');

  if (elements.filterFavoriteBtn) elements.filterFavoriteBtn.classList.toggle('active', state.showOnlyFavorite);
  if (elements.showArchiveBtn) elements.showArchiveBtn.classList.toggle('active', state.showArchive);

  updateStats();
  renderHistory();

  if (!elements.mainPanel) {
    console.error('mainPanel not found');
    return;
  }

  elements.mainPanel.innerHTML = '';

  if (activeTab === 'trash') {
    const trashView = createTrashView();
    if (trashView instanceof Node) {
      elements.mainPanel.appendChild(trashView);
    } else {
      console.error('createTrashView не вернул Node');
    }
  } else {
    let items = [];
    if (activeTab === 'songs') items = state.songs;
    else if (activeTab === 'books') items = state.books;
    else if (activeTab === 'films') items = state.films;
    else if (activeTab === 'notes') items = state.notes;
    const filtered = filterItems(items);
    const tabContent = renderTab(activeTab, filtered);
    if (tabContent instanceof Node) {
      elements.mainPanel.appendChild(tabContent);
    } else {
      console.error('renderTab не вернул Node');
    }
  }
}

function filterItems(items) {
  const state = getState();
  let filtered = items.filter(i => !i.archived || state.showArchive);
  filtered = filtered.filter(item => {
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      const fields = [item.title, item.artist, item.author, item.text, item.season].filter(Boolean).map(f => f.toLowerCase());
      if (!fields.some(f => f.includes(q))) return false;
    }
    if (state.showOnlyFavorite && !item.favorite) return false;
    if (state.filterStatuses.length && !state.filterStatuses.includes(item.status)) return false;
    if (state.filterMinRating && (item.rating || 0) < state.filterMinRating) return false;
    if (state.filterPeriod !== 'all') {
      const days = state.filterPeriod === 'today' ? 1 : state.filterPeriod === 'week' ? 7 : 30;
      const created = new Date(item.createdAt);
      if (isNaN(created.getTime())) return true;
      const now = new Date();
      const diff = Math.floor((now - created) / (1000 * 60 * 60 * 24));
      if (diff > days) return false;
    }
    return true;
  });
  filtered.sort((a, b) => {
    if (state.sortBy === 'manual') return (a.order || 0) - (b.order || 0);
    if (state.sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
    if (state.sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
    if (state.sortBy === 'title_asc') return (a.title || '').localeCompare(b.title || '');
    if (state.sortBy === 'rating_desc') return (b.rating || 0) - (a.rating || 0);
    return 0;
  });
  return filtered;
}

function updateStats() {
  const state = getState();
  const totalSongs = state.songs.filter(i => !i.archived || state.showArchive).length;
  const totalBooks = state.books.filter(i => !i.archived || state.showArchive).length;
  const totalFilms = state.films.filter(i => !i.archived || state.showArchive).length;
  const totalNotes = state.notes.filter(i => !i.archived || state.showArchive).length;
  const totalFav = [...state.songs, ...state.books, ...state.films, ...state.notes].filter(i => i.favorite && (!i.archived || state.showArchive)).length;
  if (elements.statSongs) elements.statSongs.textContent = totalSongs;
  if (elements.statBooks) elements.statBooks.textContent = totalBooks;
  if (elements.statFilms) elements.statFilms.textContent = totalFilms;
  if (elements.statNotes) elements.statNotes.textContent = totalNotes;
  if (elements.statFav) elements.statFav.textContent = totalFav;
  if (elements.statTrash) elements.statTrash.textContent = state.trash.length;
}

function renderHistory() {
  const state = getState();
  if (!elements.historyList) return;
  elements.historyList.innerHTML = state.history.map(h => `
    <div class="history-item">
      <strong>${h.action}</strong> ${h.details}
      <div><small>${new Date(h.time).toLocaleString()}</small></div>
    </div>
  `).join('');
}

function renderTab(type, filtered) {
  try {
    const container = document.createElement('div');
    const header = document.createElement('div');
    header.className = 'panel-header';
    
    const typeLabels = {
      songs: '🎵 Песни',
      books: '📚 Книги',
      films: '🎬 Фильмы',
      notes: '📝 Заметки'
    };
    
    header.innerHTML = `
      <h1>${typeLabels[type] || type}</h1>
      <span class="badge">${filtered.length}</span>
    `;
    container.appendChild(header);

    let form;
    try {
      form = createForm(type);
    } catch (e) {
      console.error('Исключение в createForm:', e);
      form = document.createElement('div');
    }
    if (form instanceof Node) {
      container.appendChild(form);
    } else {
      console.error('createForm не вернул DOM-элемент для типа', type);
      container.appendChild(document.createElement('div'));
    }

    const grid = document.createElement('div');
    grid.className = `items-grid ${getState().viewMode === 'grid' ? 'grid-view' : ''}`;

    const groups = filtered.reduce((acc, item) => {
      const group = getDateGroup(item.createdAt);
      (acc[group] = acc[group] || []).push(item);
      return acc;
    }, {});

    const groupOrder = ['today', 'yesterday', 'week', 'month', 'older'];
    const groupLabels = {
      today: 'Сегодня',
      yesterday: 'Вчера',
      week: 'На этой неделе',
      month: 'В этом месяце',
      older: 'Ранее'
    };

    groupOrder.forEach(group => {
      if (groups[group]?.length) {
        const groupDiv = document.createElement('div');
        groupDiv.className = 'date-group';
        const heading = document.createElement('h3');
        heading.textContent = groupLabels[group];
        groupDiv.appendChild(heading);
        groups[group].forEach(item => {
          try {
            const card = createCard(item, type);
            if (card instanceof Node) {
              groupDiv.appendChild(card);
            } else {
              console.error('createCard не вернул DOM-элемент для item', item);
            }
          } catch (e) {
            console.error('Исключение при создании карточки:', e, item);
          }
        });
        grid.appendChild(groupDiv);
      }
    });

    container.appendChild(grid);
    return container;
  } catch (error) {
    console.error('Ошибка в renderTab:', error);
    return document.createElement('div');
  }
}

function getDateGroup(dateStr) {
  const d = new Date(dateStr); d.setHours(0,0,0,0);
  const today = new Date(); today.setHours(0,0,0,0);
  const diff = (today - d) / (1000*60*60*24);
  if (diff === 0) return 'today';
  if (diff === 1) return 'yesterday';
  if (diff <= 7) return 'week';
  if (diff <= 14) return 'week';
  if (diff <= 30) return 'month';
  return 'older';
}