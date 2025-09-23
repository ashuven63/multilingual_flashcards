const DB_NAME = 'FlashcardAppDB';
const DB_VERSION = 2;
const STORE_NAME = 'images';

let db: IDBDatabase;

// Function to open and initialize the database
const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    // If db is already initialized, return it
    if (db) {
      return resolve(db);
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Database error:', (event.target as IDBRequest).error);
      reject('Database error');
    };

    request.onsuccess = (event) => {
      db = (event.target as IDBRequest).result;
      resolve(db);
    };

    // This event is only triggered when the version changes.
    request.onupgradeneeded = (event) => {
      const dbInstance = (event.target as IDBRequest).result;
      // For version 2, we remove keyPath to allow custom keys, wiping old data.
      if (event.oldVersion < 2) {
        if (dbInstance.objectStoreNames.contains(STORE_NAME)) {
            dbInstance.deleteObjectStore(STORE_NAME);
        }
        dbInstance.createObjectStore(STORE_NAME);
      }
    };
  });
};

// Function to get an image from the database
export const getImage = async (key: string): Promise<{ imageSrc: string } | undefined> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onerror = (event) => {
      console.error('Error fetching image from DB:', (event.target as IDBRequest).error);
      reject('Error fetching image');
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBRequest).result);
    };
  });
};

// Function to save an image to the database
export const saveImage = async (key: string, imageSrc: string): Promise<void> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    // Store the image source in an object, as IndexedDB can't store raw strings for object stores.
    const request = store.put({ imageSrc }, key);

    request.onerror = (event) => {
      console.error('Error saving image to DB:', (event.target as IDBRequest).error);
      reject('Error saving image');
    };

    request.onsuccess = () => {
      resolve();
    };
  });
};