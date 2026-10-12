// src/storage.js
import { normalizeItem } from './utils.js';

let cachedData = null;

export async function loadData() {
  if (cachedData) return cachedData;
  try {
    if (window.api) {
      cachedData = await window.api.loadData();
    } else {
      const rawData = {
        songs: JSON.parse(localStorage.getItem('songs') || '[]').map(i => normalizeItem(i, 'songs')),
        books: JSON.parse(localStorage.getItem('books') || localStorage.getItem('manga') || '[]').map(i => normalizeItem(i, 'books')),
        films: JSON.parse(localStorage.getItem('films') || localStorage.getItem('anime') || '[]').map(i => normalizeItem(i, 'films')),
        notes: JSON.parse(localStorage.getItem('notes') || '[]').map(i => normalizeItem(i, 'notes')),
        trash: JSON.parse(localStorage.getItem('trash') || '[]'),
        history: JSON.parse(localStorage.getItem('history') || '[]'),
      };
      
      if (localStorage.getItem('manga')) localStorage.removeItem('manga');
      if (localStorage.getItem('anime')) localStorage.removeItem('anime');
      if (localStorage.getItem('collections')) localStorage.removeItem('collections');
      if (localStorage.getItem('templates')) localStorage.removeItem('templates');
      if (localStorage.getItem('savedSearches')) localStorage.removeItem('savedSearches');
      
      cachedData = rawData;
    }
  } catch (e) {
    console.warn('Load error', e);
    cachedData = {
      songs: [], books: [], films: [], notes: [], trash: [],
      history: []
    };
  }
  return cachedData;
}

export async function saveAll(data) {
  cachedData = data;
  if (window.api) {
    return await window.api.saveData(data);
  } else {
    localStorage.setItem('songs', JSON.stringify(data.songs));
    localStorage.setItem('books', JSON.stringify(data.books));
    localStorage.setItem('films', JSON.stringify(data.films));
    localStorage.setItem('notes', JSON.stringify(data.notes));
    localStorage.setItem('trash', JSON.stringify(data.trash));
    localStorage.setItem('history', JSON.stringify(data.history));
    localStorage.removeItem('manga');
    localStorage.removeItem('anime');
    localStorage.removeItem('collections');
    localStorage.removeItem('templates');
    localStorage.removeItem('savedSearches');
    return { success: true };
  }
}

import { getState } from './state.js';
export async function persistState() {
  const state = getState();
  const toSave = {
    songs: state.songs,
    books: state.books,
    films: state.films,
    notes: state.notes,
    trash: state.trash,
    history: state.history,
  };
  return await saveAll(toSave);
}