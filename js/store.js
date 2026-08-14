(function (global) {
  const DB_NAME = "haithao-wedding";
  const DB_STORE = "kv";
  const CONFIG_KEY = "config";
  const SESSION_KEY = "haithao-admin-ok";

  function openDb() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore(DB_STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function idbGet(key) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readonly");
      const req = tx.objectStore(DB_STORE).get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function idbSet(key, value) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async function idbDel(key) {
    const db = await openDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).delete(key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  function merge(base, over) {
    if (over == null) return structuredClone(base);
    if (Array.isArray(base) || Array.isArray(over)) {
      return Array.isArray(over) ? over.slice() : structuredClone(base);
    }
    if (typeof base !== "object" || base === null || typeof over !== "object") {
      return over;
    }
    const out = structuredClone(base);
    Object.keys(over).forEach((k) => {
      out[k] = k in out ? merge(out[k], over[k]) : structuredClone(over[k]);
    });
    return out;
  }

  async function load() {
    try {
      const saved = await idbGet(CONFIG_KEY);
      return merge(global.WEDDING, saved);
    } catch {
      return structuredClone(global.WEDDING);
    }
  }

  async function save(cfg) {
    await idbSet(CONFIG_KEY, cfg);
  }

  async function reset() {
    await idbDel(CONFIG_KEY);
  }

  function toConfigJs(cfg) {
    return "window.WEDDING = " + JSON.stringify(cfg, null, 2) + ";\n";
  }

  function isAuthed() {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  }

  function setAuthed(ok) {
    if (ok) sessionStorage.setItem(SESSION_KEY, "1");
    else sessionStorage.removeItem(SESSION_KEY);
  }

  function fileToDataUrl(file, maxW) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error);
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const w = Math.min(maxW || 1600, img.width);
          const h = Math.round((img.height * w) / img.width);
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          canvas.getContext("2d").drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        };
        img.onerror = () => resolve(reader.result);
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  global.WeddingStore = {
    load,
    save,
    reset,
    merge,
    toConfigJs,
    isAuthed,
    setAuthed,
    fileToDataUrl,
  };
})(window);
