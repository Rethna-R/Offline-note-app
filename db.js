let db;

const request = indexedDB.open("NotesDB", 1);

/* =========================
   ERROR
========================= */
request.onerror = () => {
  console.log("❌ DB failed to open");
};

/* =========================
   UPGRADE / CREATE STORE
========================= */
request.onupgradeneeded = (e) => {
  db = e.target.result;

  if (!db.objectStoreNames.contains("notes")) {
    const store = db.createObjectStore("notes", { keyPath: "id" });

    store.createIndex("title", "title", { unique: false });
    store.createIndex("tags", "tags", { unique: false });

    store.createIndex("createdAt", "createdAt", { unique: false });
    store.createIndex("updatedAt", "updatedAt", { unique: false });
    store.createIndex("isFavorite", "isFavorite", { unique: false });
  }
};

/* =========================
   SUCCESS
========================= */
request.onsuccess = (e) => {
  db = e.target.result;
  console.log("✅ DB ready");

  if (window.onDBReady) window.onDBReady();
};

/* =========================
   SAVE / UPDATE
========================= */
function saveToDB(note) {
  if (!db) {
    console.log("DB not ready yet");
    return;
  }

  const tx = db.transaction("notes", "readwrite");
  const store = tx.objectStore("notes");

  const req = store.put(note);

  req.onsuccess = () => {
    console.log("💾 Saved");
    if (window.onDBReady) window.onDBReady();
  };

  req.onerror = () => {
    console.log("❌ Save failed");
  };
}

/* =========================
   GET ALL NOTES
========================= */
function getAllNotes(callback) {
  if (!db) {
    console.log("DB not ready yet");
    return;
  }

  const tx = db.transaction("notes", "readonly");
  const store = tx.objectStore("notes");

  const req = store.getAll();

  req.onsuccess = () => {
    callback(req.result || []);
  };

  req.onerror = () => {
    console.log("❌ Fetch failed");
    callback([]);
  };
}

/* =========================
   DELETE NOTE
========================= */
function deleteFromDB(id) {
  if (!db) return;

  const tx = db.transaction("notes", "readwrite");
  const store = tx.objectStore("notes");

  const req = store.delete(Number(id));

  req.onsuccess = () => {
    console.log("🗑 Deleted:", id);

    if (window.onDBReady) window.onDBReady();
  };

  req.onerror = () => {
    console.log("❌ Delete failed");
  };
}