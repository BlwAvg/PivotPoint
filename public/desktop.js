/**
 * desktop.js
 * 
 * Creates draggable "window" elements on the browser "desktop."
 * Provides functions for opening each app from the taskbar.
 */

let zIndexCounter = 1000;

function createWindow(title) {
  const desktop = document.getElementById('desktop');
  const win = document.createElement('div');
  win.classList.add('window');
  win.style.zIndex = zIndexCounter++;

  // Header
  const header = document.createElement('div');
  header.classList.add('window-header');
  const titleSpan = document.createElement('span');
  titleSpan.innerText = title;
  const closeBtn = document.createElement('button');
  closeBtn.innerText = 'X';
  closeBtn.classList.add('window-close-button');
  closeBtn.addEventListener('click', () => {
    desktop.removeChild(win);
  });
  header.appendChild(titleSpan);
  header.appendChild(closeBtn);

  // Body
  const body = document.createElement('div');
  body.classList.add('window-body');

  // Add to DOM
  win.appendChild(header);
  win.appendChild(body);
  desktop.appendChild(win);

  // Make window draggable
  makeDraggable(win, header);

  // Bring to front on click
  win.addEventListener('mousedown', () => {
    win.style.zIndex = zIndexCounter++;
  });

  return body;
}

function makeDraggable(win, header) {
  let offsetX = 0, offsetY = 0;
  let isDragging = false;

  header.addEventListener('mousedown', (e) => {
    isDragging = true;
    const rect = win.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    win.style.left = (e.clientX - offsetX) + 'px';
    win.style.top = (e.clientY - offsetY) + 'px';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

/** Taskbar triggers */
function openGuacRDP() {
  createGuacRDPWindow();
}
function openGuacVNC() {
  createGuacVNCWindow();
}
function openGuacSSH() {
  createGuacSSHWindow();
}
function openGuacTelnet() {
  createGuacTelnetWindow();
}
function openNotepad() {
  createNotepadWindow();
}


---

9. public/notepad.js

/**
 * notepad.js
 * 
 * A simple text editor storing notes on the server as JSON.
 */

function createNotepadWindow() {
  const container = createWindow('Notepad');
  container.innerHTML = `
    <div style="display:flex; flex-direction: column; height:100%;">
      <div style="margin-bottom:5px;">
        <button id="new-note-btn">New Note</button>
        <select id="note-select"></select>
        <button id="save-note-btn">Save</button>
        <button id="delete-note-btn">Delete</button>
      </div>
      <textarea id="notepad-textarea"></textarea>
    </div>
  `;

  const noteSelect = container.querySelector('#note-select');
  const textArea = container.querySelector('#notepad-textarea');
  const newBtn = container.querySelector('#new-note-btn');
  const saveBtn = container.querySelector('#save-note-btn');
  const deleteBtn = container.querySelector('#delete-note-btn');

  let notes = [];
  let currentNoteId = null;

  // Load existing notes
  fetch('/api/notes')
    .then(res => res.json())
    .then(data => {
      notes = data;
      refreshNoteList();
    });

  function refreshNoteList() {
    noteSelect.innerHTML = '';
    notes.forEach(note => {
      const opt = document.createElement('option');
      opt.value = note.id;
      opt.textContent = note.title || note.id;
      noteSelect.appendChild(opt);
    });
    if (notes.length > 0) {
      currentNoteId = notes[0].id;
      noteSelect.value = currentNoteId;
      loadNote(currentNoteId);
    } else {
      currentNoteId = null;
      textArea.value = '';
    }
  }

  function loadNote(id) {
    const note = notes.find(n => n.id === id);
    if (!note) return;
    textArea.value = note.content;
  }

  noteSelect.addEventListener('change', () => {
    currentNoteId = noteSelect.value;
    loadNote(currentNoteId);
  });

  newBtn.addEventListener('click', () => {
    const newId = 'note-' + Date.now();
    const newNote = {
      id: newId,
      title: `Untitled (${newId})`,
      content: ''
    };
    notes.push(newNote);
    currentNoteId = newId;
    refreshNoteList();
    noteSelect.value = newId;
    textArea.value = '';
  });

  saveBtn.addEventListener('click', () => {
    if (!currentNoteId) return;
    const note = notes.find(n => n.id === currentNoteId);
    if (!note) return;
    note.content = textArea.value;
    fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(note)
    })
    .then(res => {
      if (!res.ok) alert('Error saving note');
      else alert('Note saved');
    });
  });

  deleteBtn.addEventListener('click', () => {
    if (!currentNoteId) return;
    if (!confirm('Delete this note?')) return;
    fetch('/api/notes/' + currentNoteId, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) {
          alert('Error deleting note');
          return;
        }
        notes = notes.filter(n => n.id !== currentNoteId);
        refreshNoteList();
      });
  });
}