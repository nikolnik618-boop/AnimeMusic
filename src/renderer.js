// src/main.js
import { loadData } from './storage.js';
import { initState } from './state.js';
import { renderApp } from './render.js';
import { elements } from './domElements.js';
import { setupEventListeners, initEventDelegation } from './events.js';
import { initView } from './modules/view.js';
import { updateDailyQuote } from './utils.js';
import { initBackground } from './modules/background.js';

async function init() {
  const data = await loadData();
  initState(data);

  elements.mainPanel = document.getElementById('mainPanel');
  elements.tabSongs = document.getElementById('tab-songs');
  elements.tabBooks = document.getElementById('tab-books');
  elements.tabFilms = document.getElementById('tab-films');
  elements.tabNotes = document.getElementById('tab-notes');
  elements.tabTrash = document.getElementById('tab-trash');
  elements.filterFavoriteBtn = document.getElementById('filter-favorite');
  elements.showArchiveBtn = document.getElementById('show-archive');
  elements.searchInput = document.getElementById('global-search');
  elements.sortSelect = document.getElementById('sort-select');
  elements.clearFiltersBtn = document.getElementById('clear-filters');
  elements.filterToggle = document.getElementById('filter-toggle');
  elements.filterPanel = document.getElementById('filter-panel');
  elements.filterStatusRead = document.getElementById('filter-status-read');
  elements.filterStatusReading = document.getElementById('filter-status-reading');
  elements.filterStatusDropped = document.getElementById('filter-status-dropped');
  elements.filterStatusPlanned = document.getElementById('filter-status-planned');
  elements.filterRating = document.getElementById('filter-rating');
  elements.filterPeriodSelect = document.getElementById('filter-period');
  elements.applyFiltersBtn = document.getElementById('apply-filters');
  elements.viewListBtn = document.getElementById('view-list');
  elements.viewGridBtn = document.getElementById('view-grid');
  elements.refreshQuoteBtn = document.getElementById('refreshQuote');
  elements.randomBtn = document.getElementById('random-item');
  elements.shareBtn = document.getElementById('share-list');
  elements.exportBtn = document.getElementById('export-data');
  elements.exportTxtBtn = document.getElementById('export-txt');
  elements.importBtn = document.getElementById('import-data');
  elements.importCsvBtn = document.getElementById('import-csv');
  elements.importFile = document.getElementById('import-file');
  elements.dataHeader = document.getElementById('data-header');
  elements.dataContent = document.getElementById('data-content');
  elements.statsPreview = document.getElementById('stats-preview');
  elements.statsDetail = document.getElementById('stats-detail');
  elements.statSongs = document.getElementById('stat-songs');
  elements.statBooks = document.getElementById('stat-books');
  elements.statFilms = document.getElementById('stat-films');
  elements.statNotes = document.getElementById('stat-notes');
  elements.statFav = document.getElementById('stat-fav');
  elements.statTrash = document.getElementById('stat-trash');
  elements.viewModal = document.getElementById('view-modal');
  elements.viewModalClose = document.getElementById('view-modal-close');
  elements.viewModalBody = document.getElementById('view-modal-body');
  elements.editModal = document.getElementById('edit-modal');
  elements.editModalClose = document.getElementById('edit-modal-close');
  elements.editSaveBtn = document.getElementById('edit-save-btn');
  elements.editCancelBtn = document.getElementById('edit-cancel-btn');
  elements.editSongTitle = document.getElementById('edit-song-title');
  elements.editSongArtist = document.getElementById('edit-song-artist');
  elements.editBooksTitle = document.getElementById('edit-books-title');
  elements.editBooksAuthor = document.getElementById('edit-books-author');
  elements.editBooksChapter = document.getElementById('edit-books-chapter');
  elements.editBooksTotalChapters = document.getElementById('edit-books-totalChapters');
  elements.editFilmsTitle = document.getElementById('edit-films-title');
  elements.editFilmsSeason = document.getElementById('edit-films-season');
  elements.editNotesText = document.getElementById('edit-notes-text');
  elements.editCommonLink = document.getElementById('edit-common-link');
  elements.editCommonRating = document.getElementById('edit-common-rating');
  elements.editCommonStatus = document.getElementById('edit-common-status');
  elements.toastContainer = document.getElementById('toast-container');
  elements.quoteText = document.getElementById('quoteText');

  initBackground();

  setupEventListeners(elements);
  initEventDelegation(document.getElementById('app'), elements);
  initView(elements);
  updateDailyQuote();
  renderApp();
}

init();