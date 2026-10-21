const DB_NAME = "EasyLogDB";

const LEGACY_DB_NAME = "SnapLogDB";

const HANDLES_STORE = "handles";

const ROOT_DIR_HANDLE_KEY = "root_dir_handle";

const BACKUP_FOLDER_NAME = "easylog";

let cachedRootHandle = null;

const openHandleDb = (e = DB_NAME) =>
  new Promise((resolve, reject) => {
    const o = indexedDB.open(e, 1);
    o.onupgradeneeded = (a) => {
      const result = a.target.result;
      if (!result.objectStoreNames.contains(HANDLES_STORE)) {
        result.createObjectStore(HANDLES_STORE);
      }
    };
    o.onsuccess = () => resolve(o.result);
    o.onerror = () => reject(o.error);
  });

const getRootDirHandle = async () => {
  if (cachedRootHandle) {
    return cachedRootHandle;
  }
  try {
    let e = await openHandleDb(DB_NAME);
    let t = await new Promise((resolve, reject) => {
      const u = e
        .transaction(HANDLES_STORE, "readonly")
        .objectStore(HANDLES_STORE)
        .get(ROOT_DIR_HANDLE_KEY);
      u.onsuccess = () => resolve(u.result);
      u.onerror = () => reject(u.error);
    });
    if (!t) {
      try {
        const s = await openHandleDb(LEGACY_DB_NAME);
        t = await new Promise((resolve, reject) => {
          const f = s
            .transaction(HANDLES_STORE, "readonly")
            .objectStore(HANDLES_STORE)
            .get(ROOT_DIR_HANDLE_KEY);
          f.onsuccess = () => resolve(f.result);
          f.onerror = () => reject(f.error);
        });
        if (t) {
          saveRootDirHandle(t);
        }
      } catch {}
    }
    if (t) {
      cachedRootHandle = t;
    }
    return t;
  } catch (error) {
    console.error("IDB Error", error);
    return;
  }
};

const saveRootDirHandle = async (e) => {
  cachedRootHandle = e;
  const t = await openHandleDb();
  return new Promise((resolve, reject) => {
    const u = t
      .transaction(HANDLES_STORE, "readwrite")
      .objectStore(HANDLES_STORE)
      .put(e, ROOT_DIR_HANDLE_KEY);
    u.onsuccess = () => resolve();
    u.onerror = () => reject(u.error);
  });
};

export const disconnectBackupFolder = async () => {
  cachedRootHandle = null;
  try {
    const e = await openHandleDb();
    return new Promise((resolve, reject) => {
      const d = e
        .transaction(HANDLES_STORE, "readwrite")
        .objectStore(HANDLES_STORE)
        .delete(ROOT_DIR_HANDLE_KEY);
      d.onsuccess = () => resolve();
      d.onerror = () => reject(d.error);
    });
  } catch (error) {
    console.error("Failed to disconnect", error);
  }
};

export const hasBackupFolder = async () => !!(await getRootDirHandle());

export const getBackupFolderName = async () => {
  try {
    const e = await getRootDirHandle();
    if (e) {
      return e.name;
    }
    return null;
  } catch {
    return null;
  }
};

export const connectBackupFolder = async () => {
  var e;
  try {
    if (!("showDirectoryPicker" in window)) {
      console.warn("File System Access API not supported in this browser.");
      return false;
    }
    const t = await window.showDirectoryPicker({
      mode: "readwrite",
    });
    await saveRootDirHandle(t);
    return true;
  } catch (error) {
    if (error.name === "AbortError") {
      return false;
    }
    if (
      error.name === "SecurityError" ||
      ((e = error.message) != null && e.includes("Cross origin"))
    ) {
      return (
        console.warn(
          "Directory picker blocked by browser security (likely iframe/preview restriction).",
        ),
        false
      );
    }
    return (console.error("Directory selection failed:", error), false);
  }
};

const verifyFolderPermission = async (e, t = false, s = false) => {
  try {
    const o = {
      mode: t ? "readwrite" : "read",
    };
    if ((await e.queryPermission(o)) === "granted") {
      return true;
    }
    if (s) {
      return false;
    }
    return (await e.requestPermission(o)) === "granted";
  } catch {
    return false;
  }
};

export const writeBackupToFolder = async (e, t = false) => {
  try {
    const s = await getRootDirHandle();
    if (!s) {
      return {
        success: false,
        error: "unknown",
      };
    }
    if (!(await verifyFolderPermission(s, true, t))) {
      return {
        success: false,
        error: "permission",
      };
    }
    const a = await s.getDirectoryHandle(BACKUP_FOLDER_NAME, {
      create: true,
    });
    const u = `backup-${new Date().toISOString().replace(/[:.]/g, "-")}.json`;
    const m = await (
      await a.getFileHandle(u, {
        create: true,
      })
    ).createWritable();
    await m.write(JSON.stringify(e, null, 2));
    await m.close();
    await pruneOldBackups(a);
    return {
      success: true,
      path: `${s.name}/${BACKUP_FOLDER_NAME}/${u}`,
    };
  } catch (error) {
    console.error("Backup to folder failed:", error);
    if (error.name === "NotAllowedError" || error.code === 0) {
      return {
        success: false,
        error: "permission",
      };
    }
    return {
      success: false,
      error: "unknown",
    };
  }
};

const pruneOldBackups = async (e) => {
  try {
    const t = [];
    for await (const [o, a] of e.entries()) {
      if (o.startsWith("backup-") && o.endsWith(".json")) {
        t.push({
          name: o,
          time: 0,
        });
      }
    }
    t.sort((o, a) => a.name.localeCompare(o.name));
    const s = t.slice(50);
    for (const o of s) {
      await e.removeEntry(o.name);
    }
  } catch (error) {
    console.error("Cleanup failed", error);
  }
};

export const listFolderBackups = async () => {
  try {
    const e = await getRootDirHandle();
    if (!e) {
      return [];
    }
    if (!(await verifyFolderPermission(e, false, true))) {
      return [];
    }
    const s = await e.getDirectoryHandle(BACKUP_FOLDER_NAME, {
      create: false,
    });
    const o = [];
    for await (const [a, d] of s.entries()) {
      if (a.startsWith("backup-") && a.endsWith(".json") && d.kind === "file") {
        const u = await d.getFile();
        o.push({
          id: a,
          timestamp: new Date(u.lastModified).toISOString(),
          tripCount: 0,
          sizeBytes: u.size,
          data: [],
        });
      }
    }
    return o.sort((a, d) => new Date(d.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch {
    return [];
  }
};

export const readFolderBackup = async (e) => {
  try {
    const t = await getRootDirHandle();
    if (!t) {
      return null;
    }
    const d = await (
      await (
        await (
          await t.getDirectoryHandle(BACKUP_FOLDER_NAME, {
            create: false,
          })
        ).getFileHandle(e)
      ).getFile()
    ).text();
    return JSON.parse(d);
  } catch (error) {
    console.error("Failed to read file", error);
    return null;
  }
};
