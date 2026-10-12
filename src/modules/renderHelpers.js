// src/modules/renderHelpers.js
import { getState } from '../state.js';
import { escapeHtml } from '../utils.js';

export function createForm(type) {
  try {
    const form = document.createElement('div');
    form.className = 'add-form';
    form.id = 'addForm';

    const ratingOptions = [1,2,3,4,5,6,7,8,9,10]
      .map(v => `<option value="${v}">${v} ★</option>`).join('');

    const typeLabels = {
      songs: 'песню',
      books: 'книгу',
      films: 'фильм',
      notes: 'заметку'
    };

    form.innerHTML = `
      <div class="form-row" id="dynamic-fields"></div>
      <div class="form-row">
        <div class="form-group">
          <label for="itemLink">Ссылка</label>
          <input type="url" id="itemLink" placeholder="https://...">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label for="itemRating">Оценка (1-10)</label>
          <select id="itemRating">
            <option value="0">— нет —</option>
            ${ratingOptions}
          </select>
        </div>
        <div class="form-group">
          <label for="itemStatus">Статус</label>
          <select id="itemStatus">
            <option value="">— нет —</option>
            ${type === 'songs' ? '<option value="Прослушано">Прослушано</option>' : ''}
            ${type === 'books' ? '<option value="Прочитано">Прочитано</option>' : ''}
            ${type === 'films' ? '<option value="Просмотрено">Просмотрено</option>' : ''}
            <option value="В процессе">В процессе</option>
            <option value="Брошено">Брошено</option>
            <option value="Запланировано">Запланировано</option>
          </select>
        </div>
      </div>
      <button class="btn-primary" id="saveBtn">➕ Добавить ${typeLabels[type] || 'запись'}</button>
    `;

    const dynamicRow = form.querySelector('#dynamic-fields');
    if (!dynamicRow) {
      console.error('Не найден #dynamic-fields в форме');
      return form;
    }

    if (type === 'songs') {
      dynamicRow.innerHTML = `
        <div class="form-group">
          <label for="itemTitle">Название</label>
          <input type="text" id="itemTitle" placeholder="Название песни">
        </div>
        <div class="form-group">
          <label for="itemArtist">Исполнитель</label>
          <input type="text" id="itemArtist" placeholder="Исполнитель">
        </div>
      `;
    } else if (type === 'books') {
      dynamicRow.innerHTML = `
        <div class="form-group">
          <label for="itemTitle">Название книги</label>
          <input type="text" id="itemTitle" placeholder="Название">
        </div>
        <div class="form-group">
          <label for="itemAuthor">Автор</label>
          <input type="text" id="itemAuthor" placeholder="Автор">
        </div>
        <div class="form-group">
          <label for="itemChapter">Глава</label>
          <input type="number" id="itemChapter" placeholder="Текущая глава">
        </div>
        <div class="form-group">
          <label for="itemTotalChapters">Всего глав</label>
          <input type="number" id="itemTotalChapters" placeholder="Если известно">
        </div>
      `;
    } else if (type === 'films') {
      dynamicRow.innerHTML = `
        <div class="form-group">
          <label for="itemTitle">Название фильма</label>
          <input type="text" id="itemTitle" placeholder="Название">
        </div>
        <div class="form-group">
          <label for="itemSeason">Год / сезон</label>
          <input type="text" id="itemSeason" placeholder="2024, Лето 2024, и т.д.">
        </div>
      `;
    } else {
      dynamicRow.innerHTML = `
        <div class="form-group">
          <label for="itemText">Текст заметки</label>
          <textarea id="itemText" placeholder="Текст заметки..."></textarea>
        </div>
      `;
    }

    return form;
  } catch (error) {
    console.error('Ошибка в createForm:', error);
    return document.createElement('div');
  }
}

export function createCard(item, type) {
  try {
    const state = getState();
    const card = document.createElement('div');
    card.className = 'item-card';
    card.dataset.id = item.id;
    card.dataset.type = type;
    card.draggable = state.sortBy === 'manual';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'item-checkbox';
    checkbox.dataset.id = item.id;
    if (state.selectedIds.includes(item.id)) checkbox.checked = true;
    card.appendChild(checkbox);

    const info = document.createElement('div');
    info.className = 'item-info';

    const titleRow = document.createElement('div');
    titleRow.className = 'item-title';

    if (item.cover) {
      const img = document.createElement('img');
      img.src = item.cover;
      img.className = 'cover-image';
      titleRow.appendChild(img);
    }

    const titleSpan = document.createElement('span');
    titleSpan.textContent = item.title || item.text || '';
    titleRow.appendChild(titleSpan);

    const favStar = document.createElement('span');
    favStar.className = `favorite-star ${item.favorite ? '' : 'inactive'}`;
    favStar.dataset.id = item.id;
    favStar.textContent = '⭐';
    titleRow.appendChild(favStar);

    const ratingDiv = document.createElement('div');
    ratingDiv.className = 'rating';
    for (let i = 1; i <= 10; i++) {
      const star = document.createElement('span');
      star.className = `rating-star ${i <= item.rating ? '' : 'inactive'}`;
      star.dataset.id = item.id;
      star.dataset.rating = i;
      star.textContent = '★';
      ratingDiv.appendChild(star);
    }
    titleRow.appendChild(ratingDiv);
    info.appendChild(titleRow);

    const metaDiv = document.createElement('div');
    metaDiv.className = 'item-meta';

    if (type === 'songs') {
      if (item.artist) {
        const span = document.createElement('span');
        span.innerHTML = `🎤 ${escapeHtml(item.artist)}`;
        metaDiv.appendChild(span);
      }
      if (item.status) {
        const span = document.createElement('span');
        span.className = 'status-badge';
        span.textContent = item.status;
        metaDiv.appendChild(span);
      }
    } else if (type === 'books') {
      if (item.author) {
        const span = document.createElement('span');
        span.innerHTML = `✎ ${escapeHtml(item.author)}`;
        metaDiv.appendChild(span);
      }
      if (item.chapter) {
        const span = document.createElement('span');
        span.innerHTML = `📖 гл. ${escapeHtml(item.chapter)}${item.totalChapters ? '/' + item.totalChapters : ''}`;
        metaDiv.appendChild(span);
      }
      if (item.status) {
        const span = document.createElement('span');
        span.className = 'status-badge';
        span.textContent = item.status;
        metaDiv.appendChild(span);
      }
    } else if (type === 'films') {
      if (item.season) {
        const span = document.createElement('span');
        span.innerHTML = `🎬 ${escapeHtml(item.season)}`;
        metaDiv.appendChild(span);
      }
      if (item.status) {
        const span = document.createElement('span');
        span.className = 'status-badge';
        span.textContent = item.status;
        metaDiv.appendChild(span);
      }
    }

    info.appendChild(metaDiv);

    if (type === 'books' && item.totalChapters && item.chapter) {
      const progressBar = document.createElement('div');
      progressBar.className = 'progress-bar';
      const fill = document.createElement('div');
      fill.className = 'progress-fill';
      fill.style.width = `${(item.chapter / item.totalChapters) * 100}%`;
      progressBar.appendChild(fill);
      info.appendChild(progressBar);
    }

    const dateSmall = document.createElement('div');
    dateSmall.innerHTML = `<small>${new Date(item.createdAt).toLocaleDateString()}${item.archived ? ' [Архив]' : ''}</small>`;
    info.appendChild(dateSmall);

    card.appendChild(info);

    const actions = document.createElement('div');
    actions.className = 'item-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'btn-icon edit-btn';
    editBtn.dataset.id = item.id;
    editBtn.textContent = '✎';
    actions.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-icon delete-btn';
    deleteBtn.dataset.id = item.id;
    deleteBtn.textContent = '🗑️';
    actions.appendChild(deleteBtn);

    const archiveBtn = document.createElement('button');
    archiveBtn.className = 'btn-icon archive-btn';
    archiveBtn.dataset.id = item.id;
    archiveBtn.textContent = '📦';
    actions.appendChild(archiveBtn);

    card.appendChild(actions);

    return card;
  } catch (error) {
    console.error('Ошибка в createCard:', error, item, type);
    return document.createElement('div');
  }
}

export function createTrashView() {
  try {
    const state = getState();
    const container = document.createElement('div');
    container.className = 'panel-header';
    container.innerHTML = `<h1>🗑️ Корзина</h1><span class="badge">${state.trash.length}</span>`;

    if (state.trash.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'Корзина пуста';
      empty.style.padding = '40px';
      empty.style.textAlign = 'center';
      empty.style.color = 'var(--text-secondary)';
      container.appendChild(empty);
    } else {
      const grid = document.createElement('div');
      grid.className = 'items-grid';
      state.trash.forEach((item, idx) => {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.dataset.index = idx;

        const info = document.createElement('div');
        info.className = 'item-info';
        const title = item.title || item.text || 'Без названия';
        const typeLabels = {
          songs: '🎵 Песня',
          books: '📚 Книга',
          films: '🎬 Фильм',
          notes: '📝 Заметка'
        };
        const typeLabel = typeLabels[item.originalType] || '📄 Запись';
        
        info.innerHTML = `
          <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px;">
            <span style="font-size:18px;">${typeLabel}</span>
            <b>${escapeHtml(title)}</b>
          </div>
          <div style="font-size:13px; color:var(--text-secondary);">
            🗑️ Удалён: ${new Date(item.deletedAt).toLocaleDateString()} ${new Date(item.deletedAt).toLocaleTimeString()}
          </div>
        `;
        card.appendChild(info);

        const actions = document.createElement('div');
        actions.className = 'item-actions';
        
        const restore = document.createElement('button');
        restore.className = 'btn-icon restore-btn';
        restore.dataset.index = idx;
        restore.textContent = '↩️ Восстановить';
        restore.style.background = 'var(--success)';
        restore.style.color = 'white';
        restore.style.border = 'none';
        actions.appendChild(restore);
        
        const permDelete = document.createElement('button');
        permDelete.className = 'btn-icon delete-perm-btn';
        permDelete.dataset.index = idx;
        permDelete.textContent = '❌ Удалить навсегда';
        permDelete.style.background = 'var(--danger)';
        permDelete.style.color = 'white';
        permDelete.style.border = 'none';
        actions.appendChild(permDelete);

        card.appendChild(actions);
        grid.appendChild(card);
      });
      container.appendChild(grid);
    }
    return container;
  } catch (error) {
    console.error('Ошибка в createTrashView:', error);
    return document.createElement('div');
  }
}