// src/state.js
import { produce } from 'https://esm.sh/immer@9.0.6';

let state = {
  activeTab: 'songs',
  songs: [],
  books: [],
  films: [],
  notes: [],
  trash: [],
  showOnlyFavorite: false,
  showArchive: false,
  searchQuery: '',
  sortBy: 'newest',
  filterStatuses: [],
  filterMinRating: 0,
  filterPeriod: 'all',
  viewMode: 'list',
  editingItem: null,
  selectedIds: [],
  history: [],
  lastDeletedItem: null,
};

export function getState() {
  return state;
}

export function setState(newState) {
  state = { ...state, ...newState };
}

export function initState(loadedData) {
  const migrated = { ...loadedData };
  if (loadedData.books === undefined && loadedData.manga) {
    migrated.books = loadedData.manga;
    delete migrated.manga;
  }
  if (loadedData.films === undefined && loadedData.anime) {
    migrated.films = loadedData.anime;
    delete migrated.anime;
  }
  delete migrated.collections;
  delete migrated.templates;
  delete migrated.savedSearches;
  
  state = {
    ...state,
    ...migrated,
    selectedIds: [],
  };
}

export function produceState(recipe) {
  state = produce(state, recipe);
}