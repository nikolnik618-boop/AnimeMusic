// src/modules/edit.js
import { getState, setState } from '../state.js';
import { findItemById, closeAllModals } from '../utils.js';
import { elements } from '../domElements.js';

export function openEditModal(id, elements) {
  closeAllModals();
  const found = findItemById(id);
  if (!found) return;
  setState({ editingItem: id });
  const item = found.item;
  const type = found.type;

  document.querySelectorAll('#edit-form input, #edit-form textarea, #edit-form select').forEach(el => el.value = '');
  document.querySelectorAll('.edit-field').forEach(el => el.style.display = 'none');

  if (type === 'songs') {
    document.querySelectorAll('.edit-song-field').forEach(el => el.style.display = 'block');
    if (elements.editSongTitle) elements.editSongTitle.value = item.title || '';
    if (elements.editSongArtist) elements.editSongArtist.value = item.artist || '';
    if (elements.editCommonLink) elements.editCommonLink.value = item.link || '';
    if (elements.editCommonRating) elements.editCommonRating.value = item.rating || 0;
    if (elements.editCommonStatus) elements.editCommonStatus.value = item.status || '';
  } else if (type === 'books') {
    document.querySelectorAll('.edit-books-field').forEach(el => el.style.display = 'block');
    if (elements.editBooksTitle) elements.editBooksTitle.value = item.title || '';
    if (elements.editBooksAuthor) elements.editBooksAuthor.value = item.author || '';
    if (elements.editBooksChapter) elements.editBooksChapter.value = item.chapter || '';
    if (elements.editBooksTotalChapters) elements.editBooksTotalChapters.value = item.totalChapters || '';
    if (elements.editCommonLink) elements.editCommonLink.value = item.link || '';
    if (elements.editCommonRating) elements.editCommonRating.value = item.rating || 0;
    if (elements.editCommonStatus) elements.editCommonStatus.value = item.status || '';
  } else if (type === 'films') {
    document.querySelectorAll('.edit-films-field').forEach(el => el.style.display = 'block');
    if (elements.editFilmsTitle) elements.editFilmsTitle.value = item.title || '';
    if (elements.editFilmsSeason) elements.editFilmsSeason.value = item.season || '';
    if (elements.editCommonLink) elements.editCommonLink.value = item.link || '';
    if (elements.editCommonRating) elements.editCommonRating.value = item.rating || 0;
    if (elements.editCommonStatus) elements.editCommonStatus.value = item.status || '';
  } else if (type === 'notes') {
    document.querySelectorAll('.edit-notes-field').forEach(el => el.style.display = 'block');
    if (elements.editNotesText) elements.editNotesText.value = item.text || '';
  }

  if (elements.editModal) elements.editModal.classList.add('active');
}