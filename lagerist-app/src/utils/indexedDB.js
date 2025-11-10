// IndexedDB wrapper for storing large amounts of data
const DB_NAME = 'LageristDB';
const DB_VERSION = 2;

// Store names
const STORES = {
  MATERIALS: 'materials',
  JOBS: 'jobs',
  ARTICLE_DATABASES: 'articleDatabases',
  SETTINGS: 'settings',
  LOCATIONS: 'locations'
};

let db = null;

// Initialize IndexedDB
export const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const database = event.target.result;

      // Create object stores if they don't exist
      if (!database.objectStoreNames.contains(STORES.MATERIALS)) {
        database.createObjectStore(STORES.MATERIALS, { keyPath: 'id', autoIncrement: true });
      }

      if (!database.objectStoreNames.contains(STORES.JOBS)) {
        database.createObjectStore(STORES.JOBS, { keyPath: 'id' });
      }

      if (!database.objectStoreNames.contains(STORES.ARTICLE_DATABASES)) {
        database.createObjectStore(STORES.ARTICLE_DATABASES, { keyPath: 'id' });
      }

      if (!database.objectStoreNames.contains(STORES.SETTINGS)) {
        database.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }

      if (!database.objectStoreNames.contains(STORES.LOCATIONS)) {
        database.createObjectStore(STORES.LOCATIONS, { keyPath: 'id' });
      }
    };
  });
};

// Generic get function
export const getFromStore = (storeName, key = null) => {
  return new Promise(async (resolve, reject) => {
    if (!db) await initDB();

    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);

    if (key) {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    } else {
      // Get all records
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    }
  });
};

// Generic put function
export const putToStore = (storeName, data) => {
  return new Promise(async (resolve, reject) => {
    if (!db) await initDB();

    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(data);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Generic delete function
export const deleteFromStore = (storeName, key) => {
  return new Promise(async (resolve, reject) => {
    if (!db) await initDB();

    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(key);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Generic clear function
export const clearStore = (storeName) => {
  return new Promise(async (resolve, reject) => {
    if (!db) await initDB();

    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

// Specific functions for each store type

// Materials
export const saveMaterials = (jobId, materials) => {
  return putToStore(STORES.MATERIALS, { id: jobId, materials });
};

export const getMaterials = (jobId) => {
  return getFromStore(STORES.MATERIALS, jobId).then(result => result?.materials || []);
};

export const deleteMaterials = (jobId) => {
  return deleteFromStore(STORES.MATERIALS, jobId);
};

// Jobs
export const saveJobs = (jobs) => {
  return Promise.all(jobs.map(job => putToStore(STORES.JOBS, job)));
};

export const getJobs = () => {
  return getFromStore(STORES.JOBS);
};

export const deleteJob = (jobId) => {
  return deleteFromStore(STORES.JOBS, jobId);
};

// Article Databases
export const saveArticleDatabases = (databases) => {
  return Promise.all(databases.map(db => putToStore(STORES.ARTICLE_DATABASES, db)));
};

export const getArticleDatabases = () => {
  return getFromStore(STORES.ARTICLE_DATABASES);
};

export const deleteArticleDatabase = (dbId) => {
  return deleteFromStore(STORES.ARTICLE_DATABASES, dbId);
};

// Locations
export const saveLocations = (locations) => {
  return Promise.all(locations.map(loc => putToStore(STORES.LOCATIONS, loc)));
};

export const getLocations = () => {
  return getFromStore(STORES.LOCATIONS);
};

export const deleteLocation = (locationId) => {
  return deleteFromStore(STORES.LOCATIONS, locationId);
};

// Settings (for storing simple key-value pairs like active database IDs, dark mode, etc.)
export const saveSetting = (key, value) => {
  return putToStore(STORES.SETTINGS, { key, value });
};

export const getSetting = (key) => {
  return getFromStore(STORES.SETTINGS, key).then(result => result?.value);
};

// Migration from localStorage
export const migrateFromLocalStorage = async () => {
  console.log('Starting migration from localStorage to IndexedDB...');

  try {
    // Migrate jobs
    const jobsData = localStorage.getItem('lagerist_jobs');
    if (jobsData) {
      const jobs = JSON.parse(jobsData);
      await saveJobs(jobs);
      console.log(`Migrated ${jobs.length} jobs`);
    }

    // Migrate materials for each job
    const currentJobId = localStorage.getItem('lagerist_current_job_id');
    if (currentJobId) {
      const materialsData = localStorage.getItem('lagerist_materials');
      if (materialsData) {
        const materials = JSON.parse(materialsData);
        await saveMaterials(currentJobId, materials);
        console.log(`Migrated ${materials.length} materials for job ${currentJobId}`);
      }
      await saveSetting('currentJobId', currentJobId);
    }

    // Migrate article databases
    const articleDBData = localStorage.getItem('lagerist_article_databases');
    if (articleDBData) {
      const databases = JSON.parse(articleDBData);
      await saveArticleDatabases(databases);
      console.log(`Migrated ${databases.length} article databases`);
    }

    // Migrate active database IDs
    const activeDatabaseIds = localStorage.getItem('lagerist_active_database_ids');
    if (activeDatabaseIds) {
      await saveSetting('activeDatabaseIds', JSON.parse(activeDatabaseIds));
      console.log('Migrated active database IDs');
    }

    // Migrate dark mode setting
    const darkMode = localStorage.getItem('lagerist_dark_mode');
    if (darkMode !== null) {
      await saveSetting('darkMode', darkMode === 'true');
      console.log('Migrated dark mode setting');
    }

    console.log('Migration completed successfully!');
    return true;
  } catch (error) {
    console.error('Migration error:', error);
    return false;
  }
};

export { STORES };
