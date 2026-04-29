let notes = [];
let currentNoteId = null;

/* ========================= SIDEBAR ========================= */
function toggleSidebar() {
  document.getElementById("sidebar").classList.toggle("active");
  document.body.classList.toggle("sidebar-open");
}

/* ========================= DB READY ========================= */
window.onDBReady = loadNotes;

/* ========================= OPEN EDITOR ========================= */
function openEditor(note = null) {

  document.getElementById("editorPage").classList.add("active");
  document.body.classList.add("modal-open");

  if (note) {
    currentNoteId = note.id;
    title.value = note.title || "";
    content.value = note.content || "";
    tags.value = note.tags || "";
    openEditor.createdAt = note.createdAt || note.id;
  } else {
    currentNoteId = null;
    openEditor.createdAt = null;
    title.value = "";
    content.value = "";
    tags.value = "";
  }
}

/* ========================= BACK ========================= */
function goBack() {
  document.getElementById("editorPage").classList.remove("active");
  document.body.classList.remove("modal-open");
}

/* ========================= SAVE ========================= */
function saveNote() {

  const now = Date.now();
  const createdAt = openEditor.createdAt || now;

  const note = {
    id: currentNoteId || now,
    title: title.value.trim(),
    content: content.value.trim(),
    tags: tags.value.trim(),
    createdAt,
    updatedAt: now
  };

  if (!note.title && !note.content) {
    alert("Empty note not allowed");
    return;
  }

  saveToDB(note);

  setTimeout(loadNotes, 200);
  goBack();
}

/* ========================= LOAD ========================= */
function loadNotes() {
  getAllNotes(data => {
    notes = data || [];

    document.getElementById("noteCount").textContent = notes.length;

    renderNotes();
    renderSidebarNotes(); // ⭐ IMPORTANT FIX
  });
}

/* ========================= MAIN RENDER ========================= */
function renderNotes(list = notes) {

  const grid = document.getElementById("notesGrid");
  const empty = document.getElementById("emptyState");

  grid.innerHTML = "";

  if (!list || list.length === 0) {
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";

  list.forEach(note => {

    const div = document.createElement("div");
    div.className = "note-card";

    div.innerHTML = `
      <div class="note-title">${note.title || "No Title"}</div>

      <div class="note-content">
        ${(note.content || "").slice(0, 100)}
      </div>

      <div class="note-tag">
        ${note.tags || "General"}
      </div>

      <div class="note-footer">
        <div class="note-date">
          Created: ${new Date(note.createdAt).toLocaleString()}<br>
          Updated: ${new Date(note.updatedAt).toLocaleString()}
        </div>

        <div class="note-actions">
          <button class="edit-btn">✏️</button>
          <button class="delete-btn">🗑</button>
        </div>
      </div>
    `;

    div.querySelector(".note-tag").onclick = () => filterByTag(note.tags);
    div.querySelector(".edit-btn").onclick = () => openEditor(note);
    div.querySelector(".delete-btn").onclick = () => deleteNoteById(note.id);

    grid.appendChild(div);
  });
}

/* ========================= DELETE ========================= */
function deleteNote() {
  if (!currentNoteId) return;
  deleteFromDB(currentNoteId);
  setTimeout(loadNotes, 200);
  goBack();
}

function deleteNoteById(id) {
  deleteFromDB(id);
  setTimeout(loadNotes, 200);
}

/* ========================= SEARCH ========================= */
function searchNotes() {

  const value = document.getElementById("searchBox").value.toLowerCase();

  const filtered = notes.filter(n =>
    (n.title || "").toLowerCase().includes(value) ||
    (n.content || "").toLowerCase().includes(value) ||
    (n.tags || "").toLowerCase().includes(value)
  );

  renderNotes(filtered);
}

/* ========================= SORT ========================= */
function sortNotes() {

  const type = document.getElementById("sortBox")?.value || "new";

  if (type === "new") {
    notes.sort((a, b) => b.createdAt - a.createdAt);
  } else if (type === "old") {
    notes.sort((a, b) => a.createdAt - b.createdAt);
  } else if (type === "modified") {
    notes.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  renderNotes();
}

/* ========================= DARK MODE ========================= */
function toggleDarkMode() {
  document.body.classList.toggle("dark");
}

/* ========================= EXPORT ========================= */
function exportNotes() {
  const blob = new Blob([JSON.stringify(notes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "notes.json";
  a.click();
}

/* ========================= RESET ========================= */
function resetApp() {
  indexedDB.deleteDatabase("NotesDB");
  location.reload();
}

/* ========================= INIT ========================= */
window.onload = () => setTimeout(loadNotes, 300);

/* ========================= FILTER TAG ========================= */
function filterByTag(tag) {
  const filtered = notes.filter(n =>
    (n.tags || "").toLowerCase().includes(tag.toLowerCase())
  );

  renderNotes(filtered);
}

/* ========================= SIDEBAR NOTES ========================= */
function renderSidebarNotes() {

  const container = document.getElementById("sidebarNotes");
  container.innerHTML = "";

  notes.forEach((note, index) => {

    const div = document.createElement("div");
    div.className = "sidebar-note-item";

    div.textContent = `${index + 1}. ${note.title || "No Title"}`;

    div.onclick = () => openEditor(note);

    container.appendChild(div);
  });
}

/* ========================= SIDEBAR NOTES TOGGLE ========================= */
function toggleSidebarNotes() {

  const container = document.getElementById("sidebarNotes");

  if (container.style.display === "block") {
    container.style.display = "none";
    return;
  }

  container.style.display = "block";
  renderSidebarNotes();
}

/* ========================= TAGS ========================= */
function showTags() {

  const container = document.getElementById("sidebarTags");

  if (container.style.display === "block") {
    container.style.display = "none";
    return;
  }

  container.style.display = "block";
  container.innerHTML = "";

  const allTags = [];

  notes.forEach(n => {
    if (n.tags) {
      n.tags.split(",").forEach(t => allTags.push(t.trim()));
    }
  });

  [...new Set(allTags)].forEach(tag => {

    const div = document.createElement("div");
    div.className = "sidebar-tag-item";
    div.textContent = tag;

    div.onclick = () => {
      filterByTag(tag);
      toggleSidebar();
    };

    container.appendChild(div);
  });
}