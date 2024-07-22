import { openDB } from 'idb';

const DB_NAME = 'ThreeJSObjectsDB';
const DB_VERSION = 1;
const OBJECT_STORE_NAME = 'objects';
const FILE_STORE_NAME = 'files';

async function initDB() {
  try {
    const db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
          db.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'uuid' });
        }
        if (!db.objectStoreNames.contains(FILE_STORE_NAME)) {
          db.createObjectStore(FILE_STORE_NAME);
        }
      },
    });
    console.log('IndexedDB initialized successfully.');
    return db;
  } catch (error) {
    console.error('Error initializing IndexedDB:', error);
  }
}

async function saveObject(object) {
  const db = await initDB();
  const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
  await tx.objectStore(OBJECT_STORE_NAME).put(object);
  await tx.done;
}

async function saveFile(url, file) {
  const db = await initDB();
  const tx = db.transaction(FILE_STORE_NAME, 'readwrite');
  const reader = new FileReader();
  reader.onloadend = async () => {
    const arrayBuffer = reader.result;
    await tx.objectStore(FILE_STORE_NAME).put(arrayBuffer, url);
    await tx.done;
  };
  reader.readAsArrayBuffer(file);
}

async function getAllObjects() {
  const db = await initDB();
  const tx = db.transaction(OBJECT_STORE_NAME, 'readonly');
  const objects = await tx.objectStore(OBJECT_STORE_NAME).getAll();
  await tx.done;
  return objects;
}

async function getFile(url) {
  const db = await initDB();
  const tx = db.transaction(FILE_STORE_NAME, 'readonly');
  const file = await tx.objectStore(FILE_STORE_NAME).get(url);
  await tx.done;
  return new Blob([file]);
}

async function clearAllObjects() {
  const db = await initDB();
  const tx1 = db.transaction(OBJECT_STORE_NAME, 'readwrite');
  await tx1.objectStore(OBJECT_STORE_NAME).clear();
  await tx1.done;

  const tx2 = db.transaction(FILE_STORE_NAME, 'readwrite');
  await tx2.objectStore(FILE_STORE_NAME).clear();
  await tx2.done;
}

export { saveObject, saveFile, getAllObjects, getFile, clearAllObjects };
