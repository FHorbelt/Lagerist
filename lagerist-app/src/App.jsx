import { useState, useEffect } from 'react';
import BarcodeScanner from './components/BarcodeScanner';
import EntryForm from './components/EntryForm';
import MaterialsList from './components/MaterialsList';
import ExportButtons from './components/ExportButtons';
import JobManager from './components/JobManager';
import ArticleDatabaseManager from './components/ArticleDatabaseManager';
import ExportSettings from './components/ExportSettings';
import LocationManager from './components/LocationManager';
import InfoReleaseNotes from './components/InfoReleaseNotes';
import EmailSettings from './components/EmailSettings';
import BackupManager from './components/BackupManager';
import AlertModal from './components/AlertModal';
import UpdateNotification from './components/UpdateNotification';
import { findArticleByNumber } from './utils/articleUtils';
import { useSwipe } from './utils/useSwipe';
import {
  initDB,
  getJobs,
  saveJobs,
  deleteJob,
  getMaterials,
  saveMaterials,
  deleteMaterials,
  getArticleDatabases,
  saveArticleDatabases,
  deleteArticleDatabase,
  getLocations,
  saveLocations,
  deleteLocation,
  getSetting,
  saveSetting,
  migrateFromLocalStorage
} from './utils/indexedDB';

function App() {
  const [jobs, setJobs] = useState([]);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedArticle, setScannedArticle] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [entryMode, setEntryMode] = useState('scan'); // 'scan' or 'manual'
  const [darkMode, setDarkMode] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);
  const [showDatabaseManager, setShowDatabaseManager] = useState(false);
  const [showJobManager, setShowJobManager] = useState(false);
  const [showExportSettings, setShowExportSettings] = useState(false);
  const [showLocationManager, setShowLocationManager] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showEmailSettings, setShowEmailSettings] = useState(false);
  const [showBackupManager, setShowBackupManager] = useState(false);
  const [alertModal, setAlertModal] = useState(null); // { message, type }
  const [articleDatabases, setArticleDatabases] = useState([]); // Multiple article databases
  const [activeDatabaseIds, setActiveDatabaseIds] = useState([]); // Array of active database IDs
  const [locations, setLocations] = useState([]); // Available storage locations
  const [dbInitialized, setDbInitialized] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [formKey, setFormKey] = useState(0); // Key to force EntryForm re-render
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [newJobName, setNewJobName] = useState('');
  const [exportSettings, setExportSettings] = useState({
    showCsvExport: true,
    showEmailExport: true,
    csvIncludeTimestamp: false,
    emailIncludeTimestamp: false
  });
  const [emailSettings, setEmailSettings] = useState({
    recipients: [],
    defaultRecipients: [],
    defaultMessage: ''
  });
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);
  const [updateSW, setUpdateSW] = useState(null);

  // Get current job's materials
  const currentJob = jobs.find(j => j.id === currentJobId);
  const materials = currentJob?.materials || [];

  // Get all articles from all active databases
  const articles = articleDatabases
    .filter(db => activeDatabaseIds.includes(db.id))
    .flatMap(db => db.articles);

  // Initialize IndexedDB and migrate from localStorage if needed
  useEffect(() => {
    const initialize = async () => {
      try {
        await initDB();

        // Check if we need to migrate from localStorage
        const hasLocalStorageData = localStorage.getItem('lagerist_jobs') ||
                                      localStorage.getItem('lagerist_article_databases');

        if (hasLocalStorageData) {
          console.log('Migrating data from localStorage to IndexedDB...');
          await migrateFromLocalStorage();

          // Clear localStorage after successful migration
          localStorage.removeItem('lagerist_jobs');
          localStorage.removeItem('lagerist_current_job_id');
          localStorage.removeItem('lagerist_materials');
          localStorage.removeItem('lagerist_article_databases');
          localStorage.removeItem('lagerist_active_database_ids');
          localStorage.removeItem('lagerist_articles');
          localStorage.removeItem('lagerist_current_database_id');

          console.log('Migration complete, localStorage cleared');
        }

        setDbInitialized(true);
      } catch (error) {
        console.error('Failed to initialize IndexedDB:', error);
        setAlertModal({ message: 'Fehler beim Initialisieren der Datenbank. Bitte laden Sie die Seite neu.', type: 'error' });
      }
    };

    initialize();
  }, []);

  // Load data from IndexedDB once initialized
  useEffect(() => {
    if (!dbInitialized) return;

    const loadData = async () => {
      try {
        // Load dark mode
        const savedDarkMode = await getSetting('darkMode');
        if (savedDarkMode !== undefined) {
          setDarkMode(savedDarkMode);
          if (savedDarkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }

        // Load jobs
        const loadedJobs = await getJobs();
        if (loadedJobs && loadedJobs.length > 0) {
          setJobs(loadedJobs);

          // Load current job ID
          const savedJobId = await getSetting('currentJobId');
          if (savedJobId && loadedJobs.some(j => j.id === savedJobId)) {
            setCurrentJobId(savedJobId);
          } else {
            setCurrentJobId(loadedJobs[0].id);
          }
        } else {
          // Create default job
          const defaultJob = {
            id: Date.now().toString(),
            name: 'Standard Auftrag',
            materials: [],
            createdAt: new Date().toISOString()
          };
          await saveJobs([defaultJob]);
          setJobs([defaultJob]);
          setCurrentJobId(defaultJob.id);
          await saveSetting('currentJobId', defaultJob.id);
        }

        // Load article databases
        const loadedDatabases = await getArticleDatabases();
        if (loadedDatabases && loadedDatabases.length > 0) {
          setArticleDatabases(loadedDatabases);

          // Load active database IDs
          const savedActiveIds = await getSetting('activeDatabaseIds');
          if (savedActiveIds && Array.isArray(savedActiveIds) && savedActiveIds.length > 0) {
            // Filter to only include IDs that actually exist
            const validIds = savedActiveIds.filter(id =>
              loadedDatabases.some(db => db.id === id)
            );
            setActiveDatabaseIds(validIds.length > 0 ? validIds : [loadedDatabases[0].id]);
          } else {
            setActiveDatabaseIds([loadedDatabases[0].id]);
          }
        } else {
          // Create default database
          const defaultDatabase = {
            id: Date.now().toString(),
            name: 'Standard Artikeldatenbank',
            articles: [],
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
          };
          await saveArticleDatabases([defaultDatabase]);
          setArticleDatabases([defaultDatabase]);
          setActiveDatabaseIds([defaultDatabase.id]);
          await saveSetting('activeDatabaseIds', [defaultDatabase.id]);
        }

        // Load export settings
        const savedExportSettings = await getSetting('exportSettings');
        if (savedExportSettings) {
          setExportSettings(savedExportSettings);
        }

        // Load email settings
        const savedEmailSettings = await getSetting('emailSettings');
        if (savedEmailSettings) {
          setEmailSettings(savedEmailSettings);
        }

        // Load locations
        const loadedLocations = await getLocations();
        if (loadedLocations && loadedLocations.length > 0) {
          setLocations(loadedLocations);
        }
        // No default locations - user must create them manually

        // Mark data as loaded
        setDataLoaded(true);
      } catch (error) {
        console.error('Error loading data from IndexedDB:', error);
        setDataLoaded(true); // Still mark as loaded even on error
      }
    };

    loadData();
  }, [dbInitialized]);

  // Save dark mode changes
  useEffect(() => {
    if (!dbInitialized || !dataLoaded) return;

    saveSetting('darkMode', darkMode).catch(console.error);
  }, [darkMode, dbInitialized, dataLoaded]);

  // Apply dark mode to DOM (separate effect to run immediately)
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Save export settings changes
  useEffect(() => {
    if (!dbInitialized || !dataLoaded) return;

    saveSetting('exportSettings', exportSettings).catch(console.error);
  }, [exportSettings, dbInitialized, dataLoaded]);

  // Save email settings changes
  useEffect(() => {
    if (!dbInitialized || !dataLoaded) return;

    saveSetting('emailSettings', emailSettings).catch(console.error);
  }, [emailSettings, dbInitialized, dataLoaded]);

  // Register service worker for PWA updates
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Dynamic import to avoid issues in dev mode
      import('virtual:pwa-register').then(({ registerSW }) => {
        const updateFunction = registerSW({
          onNeedRefresh() {
            setShowUpdateNotification(true);
            setUpdateSW(() => updateFunction);
          },
          onOfflineReady() {
            console.log('App ist offline-bereit');
          },
          immediate: true
        });
      }).catch(err => {
        console.log('PWA registration not available:', err);
      });
    }
  }, []);

  // Save jobs to IndexedDB whenever they change
  useEffect(() => {
    if (!dbInitialized || jobs.length === 0) return;

    saveJobs(jobs).catch(error => {
      console.error('Error saving jobs:', error);
    });
  }, [jobs, dbInitialized]);

  // Save current job ID to IndexedDB
  useEffect(() => {
    if (!dbInitialized || !currentJobId) return;

    saveSetting('currentJobId', currentJobId).catch(console.error);
  }, [currentJobId, dbInitialized]);

  // Save article databases to IndexedDB
  useEffect(() => {
    if (!dbInitialized || articleDatabases.length === 0) return;

    saveArticleDatabases(articleDatabases).catch(error => {
      console.error('Error saving article databases:', error);
      setAlertModal({ message: 'Fehler beim Speichern der Artikeldatenbanken.', type: 'error' });
    });
  }, [articleDatabases, dbInitialized]);

  // Save active database IDs to IndexedDB
  useEffect(() => {
    if (!dbInitialized || activeDatabaseIds.length === 0) return;

    saveSetting('activeDatabaseIds', activeDatabaseIds).catch(console.error);
  }, [activeDatabaseIds, dbInitialized]);

  // Save locations to IndexedDB
  useEffect(() => {
    if (!dbInitialized || locations.length === 0) return;

    saveLocations(locations).catch(error => {
      console.error('Error saving locations:', error);
    });
  }, [locations, dbInitialized]);

  // Swipe-Gesten für Burger Menu - schließt das Menü
  const burgerMenuSwipeRef = useSwipe(() => {
    if (showMenu) {
      // Direkt schließen ohne Animation (Swipe macht bereits die Animation)
      setShowMenu(false);
      setIsMenuClosing(false);
    }
  });

  // No longer needed - fullscreen menu has close button

  const handleScan = (code) => {
    const articleInfo = lookupArticle(code);

    setScannedArticle({
      articleNumber: code,
      description: articleInfo?.description || '',
      suggestedLocation: articleInfo?.location || 'D10'
    });
    setEntryMode('scan');
    setShowForm(true);
    setIsScanning(false);
  };

  const handleManualEntry = () => {
    setScannedArticle(null);
    setEntryMode('manual');
    setShowForm(true);
  };

  const handleRescan = () => {
    setShowForm(false);
    setScannedArticle(null);
    setIsScanning(true);
  };

  const handleCloseMenu = () => {
    setIsMenuClosing(true);
    setTimeout(() => {
      setShowMenu(false);
      setIsMenuClosing(false);
    }, 200); // Faster close animation
  };

  const handleCloseAll = () => {
    // Close all submenus immediately (they're already animating out)
    setShowJobManager(false);
    setShowDatabaseManager(false);
    setShowExportSettings(false);
    setShowLocationManager(false);
    setShowInfo(false);
    setShowEmailSettings(false);
    setShowBackupManager(false);

    // Close main menu with animation
    setIsMenuClosing(true);
    setTimeout(() => {
      setShowMenu(false);
      setIsMenuClosing(false);
    }, 200); // Faster close animation
  };

  const handleUpdateExportSettings = (newSettings) => {
    setExportSettings(newSettings);
  };

  const handleUpdateEmailSettings = (newSettings) => {
    setEmailSettings(newSettings);
  };

  // Location Management
  const handleCreateLocation = (locationName) => {
    const newLocation = {
      id: `loc_${Date.now()}`,
      name: locationName,
      createdAt: new Date().toISOString()
    };
    setLocations([...locations, newLocation]);
  };

  const handleDeleteLocation = async (locationId) => {
    try {
      await deleteLocation(locationId);
      setLocations(locations.filter(loc => loc.id !== locationId));
    } catch (error) {
      console.error('Error deleting location from IndexedDB:', error);
    }
  };

  const handleRenameLocation = (locationId, newName) => {
    const updatedLocations = locations.map(loc =>
      loc.id === locationId ? { ...loc, name: newName } : loc
    );
    setLocations(updatedLocations);
  };

  const lookupArticle = (articleNumber) => {
    return findArticleByNumber(articleNumber, articles);
  };

  const handleAddMaterial = (material) => {
    const updatedJobs = jobs.map(job => {
      if (job.id === currentJobId) {
        return {
          ...job,
          materials: [...job.materials, material]
        };
      }
      return job;
    });
    setJobs(updatedJobs);

    // Re-open the same input method after adding
    if (entryMode === 'scan') {
      // Was a barcode scan - reopen scanner
      setShowForm(false);
      setScannedArticle(null);
      setIsScanning(true);
    } else {
      // Was manual entry - reopen manual entry form with fresh state
      setScannedArticle(null);
      setFormKey(prev => prev + 1); // Force form to re-render with empty fields
      setShowForm(true);
    }
  };

  const handleDeleteMaterial = (index) => {
    const updatedJobs = jobs.map(job => {
      if (job.id === currentJobId) {
        return {
          ...job,
          materials: job.materials.filter((_, i) => i !== index)
        };
      }
      return job;
    });
    setJobs(updatedJobs);
  };

  const handleSelectJob = (jobId) => {
    setCurrentJobId(jobId);
  };

  const handleCreateJob = (jobName) => {
    const newJob = {
      id: Date.now().toString(),
      name: jobName,
      materials: [],
      createdAt: new Date().toISOString()
    };
    setJobs([...jobs, newJob]);
    setCurrentJobId(newJob.id);
  };

  const handleCreateJobFromModal = () => {
    if (!newJobName.trim()) {
      setAlertModal({ message: 'Bitte geben Sie einen Namen ein', type: 'warning' });
      return;
    }
    handleCreateJob(newJobName.trim());
    setNewJobName('');
    setShowCreateJobModal(false);
  };

  const handleCancelCreateJob = () => {
    setNewJobName('');
    setShowCreateJobModal(false);
  };

  const handleDeleteJob = async (jobId) => {
    const updatedJobs = jobs.filter(job => job.id !== jobId);
    setJobs(updatedJobs);

    if (currentJobId === jobId) {
      setCurrentJobId(updatedJobs.length > 0 ? updatedJobs[0].id : null);
    }

    // Delete from IndexedDB
    try {
      await deleteJob(jobId);
      await deleteMaterials(jobId);
    } catch (error) {
      console.error('Error deleting job from IndexedDB:', error);
    }
  };

  const handleRenameJob = (jobId, newName) => {
    const updatedJobs = jobs.map(job =>
      job.id === jobId ? { ...job, name: newName } : job
    );
    setJobs(updatedJobs);
  };

  const handleClearMaterials = () => {
    const updatedJobs = jobs.map(job => {
      if (job.id === currentJobId) {
        return {
          ...job,
          materials: []
        };
      }
      return job;
    });
    setJobs(updatedJobs);
  };

  // Article Database Management
  const handleCreateDatabase = (databaseName) => {
    const newDatabase = {
      id: Date.now().toString(),
      name: databaseName,
      articles: [],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    const updatedDatabases = [...articleDatabases, newDatabase];
    setArticleDatabases(updatedDatabases);

    // Auto-activate the new database
    setActiveDatabaseIds([...activeDatabaseIds, newDatabase.id]);
  };

  const handleDeleteDatabase = async (databaseId) => {
    const updatedDatabases = articleDatabases.filter(db => db.id !== databaseId);
    setArticleDatabases(updatedDatabases);

    // Remove from active databases
    const newActiveIds = activeDatabaseIds.filter(id => id !== databaseId);

    // Ensure at least one database is active if any exist
    if (updatedDatabases.length === 0) {
      // If no databases left, create a default one
      const defaultDatabase = {
        id: Date.now().toString(),
        name: 'Standard Artikeldatenbank',
        articles: [],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };
      setArticleDatabases([defaultDatabase]);
      setActiveDatabaseIds([defaultDatabase.id]);
    } else if (newActiveIds.length === 0) {
      // If no active databases but databases exist, activate the first one
      setActiveDatabaseIds([updatedDatabases[0].id]);
    } else {
      setActiveDatabaseIds(newActiveIds);
    }

    // Delete from IndexedDB
    try {
      await deleteArticleDatabase(databaseId);
    } catch (error) {
      console.error('Error deleting database from IndexedDB:', error);
    }
  };

  const handleRenameDatabase = (databaseId, newName) => {
    const updatedDatabases = articleDatabases.map(db =>
      db.id === databaseId
        ? { ...db, name: newName, lastModified: new Date().toISOString() }
        : db
    );
    setArticleDatabases(updatedDatabases);
  };

  const handleImportToDatabase = (databaseId, articles) => {
    const updatedDatabases = articleDatabases.map(db => {
      if (db.id === databaseId) {
        return {
          ...db,
          articles: articles,
          lastModified: new Date().toISOString()
        };
      }
      return db;
    });
    setArticleDatabases(updatedDatabases);
  };

  const handleToggleDatabase = (databaseId) => {
    setActiveDatabaseIds(prev => {
      if (prev.includes(databaseId)) {
        // Trying to deactivate - ensure at least one remains active
        const newIds = prev.filter(id => id !== databaseId);
        if (newIds.length === 0) {
          setAlertModal({ message: 'Mindestens eine Datenbank muss aktiv bleiben.', type: 'warning' });
          return prev; // Keep current state
        }
        return newIds;
      } else {
        // Activating a database
        return [...prev, databaseId];
      }
    });
  };

  if (!dbInitialized) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-accent-300 mb-4"></div>
          <p className="text-gray-700 dark:text-gray-300 text-lg">Datenbank wird initialisiert...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 p-2 shadow-lg sticky top-0 z-10 border-b-4" style={{ borderBottomColor: 'rgb(193, 218, 81)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img src="/Lagerist_Logo.png" alt="Lagerist Logo" className="h-10 w-10 rounded-lg" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Lagerist</h1>
                <p className="text-xs text-gray-700 dark:text-gray-200">Materialentnahmen erfassen</p>
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 text-gray-900 dark:text-white hover:bg-accent-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Menu"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              {showMenu && (
                <>
                  {/* Backdrop */}
                  <div
                    className={`fixed inset-0 bg-black bg-opacity-50 z-40 ${isMenuClosing ? 'animate-fadeOut' : 'animate-fadeIn'}`}
                    onClick={handleCloseMenu}
                  />

                  {/* Menu Panel sliding from right */}
                  <div ref={burgerMenuSwipeRef} className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-gray-900 z-50 flex flex-col shadow-2xl ${isMenuClosing ? 'animate-slideOutRight' : 'animate-slideInRight'}`}>
                    {/* Menu Header */}
                    <div className="bg-white dark:bg-gray-800 p-2 shadow-lg border-b-4" style={{ borderBottomColor: 'rgb(193, 218, 81)' }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <img src="/Lagerist_Logo.png" alt="Lagerist Logo" className="h-10 w-10 rounded-lg" />
                          <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Menü</h2>
                            <p className="text-xs text-gray-700 dark:text-gray-200">Lagerist App</p>
                          </div>
                        </div>
                        <button
                          onClick={handleCloseMenu}
                          className="p-2 text-gray-900 dark:text-white hover:bg-accent-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          aria-label="Menü schließen"
                        >
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="flex-1 overflow-y-auto p-4">
                      <div className="space-y-2">
                        <button
                          onClick={() => setShowJobManager(true)}
                          className="w-full px-5 py-3 text-left text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all text-base font-semibold flex items-center gap-3 border-2 border-gray-200 dark:border-gray-700 hover:border-accent-500"
                        >
                          <span className="text-2xl">📋</span>
                          <span>Auftragslisten</span>
                        </button>
                        <button
                          onClick={() => setShowDatabaseManager(true)}
                          className="w-full px-5 py-3 text-left text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all text-base font-semibold flex items-center gap-3 border-2 border-gray-200 dark:border-gray-700 hover:border-accent-500"
                        >
                          <span className="text-2xl">📚</span>
                          <span>Artikeldatenbanken</span>
                        </button>
                        <button
                          onClick={() => setShowLocationManager(true)}
                          className="w-full px-5 py-3 text-left text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all text-base font-semibold flex items-center gap-3 border-2 border-gray-200 dark:border-gray-700 hover:border-accent-500"
                        >
                          <span className="text-2xl">📍</span>
                          <span>Lagerortverwaltung</span>
                        </button>
                        <button
                          onClick={() => setShowExportSettings(true)}
                          className="w-full px-5 py-3 text-left text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all text-base font-semibold flex items-center gap-3 border-2 border-gray-200 dark:border-gray-700 hover:border-accent-500"
                        >
                          <span className="text-2xl">⚙️</span>
                          <span>Exporteinstellungen</span>
                        </button>
                        <button
                          onClick={() => setShowEmailSettings(true)}
                          className="w-full px-5 py-3 text-left text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all text-base font-semibold flex items-center gap-3 border-2 border-gray-200 dark:border-gray-700 hover:border-accent-500"
                        >
                          <span className="text-2xl">📧</span>
                          <span>E-Mail Einstellungen</span>
                        </button>
                        <button
                          onClick={() => setShowBackupManager(true)}
                          className="w-full px-5 py-3 text-left text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all text-base font-semibold flex items-center gap-3 border-2 border-gray-200 dark:border-gray-700 hover:border-accent-500"
                        >
                          <span className="text-2xl">💾</span>
                          <span>Backup & Wiederherstellung</span>
                        </button>
                        <button
                          onClick={() => setDarkMode(!darkMode)}
                          className="w-full px-5 py-3 text-left text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all text-base font-semibold flex items-center gap-3 border-2 border-gray-200 dark:border-gray-700 hover:border-accent-500"
                        >
                          <span className="text-2xl">{darkMode ? '☀️' : '🌙'}</span>
                          <span>{darkMode ? 'Lightmode' : 'Darkmode'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Footer with Info & Version */}
                    <div className="border-t-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 space-y-2">
                      <button
                        onClick={() => setShowInfo(true)}
                        className="w-full px-5 py-3 text-left text-gray-900 dark:text-white bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all text-base font-semibold flex items-center gap-3 border-2 border-gray-200 dark:border-gray-700 hover:border-accent-500"
                      >
                        <span className="text-2xl">ℹ️</span>
                        <span>Info & Release Notes</span>
                      </button>
                      <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                        Version 2025.07
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Active Databases Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Aktive Artikeldatenbanken:</p>
              {articleDatabases.filter(db => activeDatabaseIds.includes(db.id)).length === 0 ? (
                <p className="text-base font-semibold text-gray-800 dark:text-white">Keine Datenbanken aktiv</p>
              ) : (
                <>
                  <p className="text-base font-semibold text-gray-800 dark:text-white">
                    {articleDatabases.filter(db => activeDatabaseIds.includes(db.id)).map(db => db.name).join(', ')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {articleDatabases.filter(db => activeDatabaseIds.includes(db.id)).length} {articleDatabases.filter(db => activeDatabaseIds.includes(db.id)).length === 1 ? 'Datenbank' : 'Datenbanken'} • Gesamt: {articleDatabases.filter(db => activeDatabaseIds.includes(db.id)).reduce((sum, db) => sum + db.articles.length, 0)} Artikel
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Current Job Info */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Aktuelle Auftragsliste:</p>
              <p className="text-base font-semibold text-gray-800 dark:text-white">
                {currentJob?.name || 'Kein Auftrag ausgewählt'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {materials.length} {materials.length === 1 ? 'Eintrag' : 'Einträge'}
              </p>
            </div>
            <button
              onClick={() => setShowCreateJobModal(true)}
              className="px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors text-2xl font-semibold"
              title="Neue Auftragsliste erstellen"
            >
              +
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Neue Entnahme</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setIsScanning(true)}
              className="px-6 py-4 bg-white dark:bg-gray-700 border-3 border-accent-500 text-gray-900 dark:text-white rounded-lg hover:bg-accent-50 dark:hover:bg-gray-600 transition-colors text-lg font-semibold shadow-md flex items-center justify-center gap-2"
              style={{ borderWidth: '3px', borderColor: 'rgb(193, 218, 81)' }}
            >
              <span>📷</span>
              <span>Barcode scannen</span>
            </button>
            <button
              onClick={handleManualEntry}
              className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-lg font-semibold shadow-md flex items-center justify-center gap-2"
            >
              <span>✏️</span>
              <span>Manuelle Eingabe</span>
            </button>
          </div>
        </div>

        {/* Materials List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
            Erfasste Materialien
          </h2>
          <MaterialsList materials={materials} onDelete={handleDeleteMaterial} />
        </div>

        {/* Export Buttons */}
        {materials.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <ExportButtons
              materials={materials}
              jobName={currentJob?.name}
              exportSettings={exportSettings}
              emailSettings={emailSettings}
            />
          </div>
        )}
      </main>

      {/* Barcode Scanner Modal */}
      {isScanning && (
        <BarcodeScanner
          onScan={handleScan}
          onClose={() => setIsScanning(false)}
        />
      )}

      {/* Entry Form Modal */}
      {showForm && (
        <EntryForm
          key={formKey}
          articleData={scannedArticle}
          onSubmit={handleAddMaterial}
          onCancel={() => {
            setShowForm(false);
            setScannedArticle(null);
          }}
          onLookup={lookupArticle}
          onRescan={handleRescan}
          locations={locations}
          onCreateLocation={handleCreateLocation}
        />
      )}

      {/* Job Manager Modal */}
      {showJobManager && (
        <JobManager
          jobs={jobs}
          currentJobId={currentJobId}
          onSelectJob={handleSelectJob}
          onCreateJob={handleCreateJob}
          onDeleteJob={handleDeleteJob}
          onRenameJob={handleRenameJob}
          onClose={() => setShowJobManager(false)}
          onCloseAll={handleCloseAll}
        />
      )}

      {/* Article Database Manager Modal */}
      {showDatabaseManager && (
        <ArticleDatabaseManager
          databases={articleDatabases}
          activeDatabaseIds={activeDatabaseIds}
          onToggleDatabase={handleToggleDatabase}
          onCreateDatabase={handleCreateDatabase}
          onDeleteDatabase={handleDeleteDatabase}
          onRenameDatabase={handleRenameDatabase}
          onImportToDatabase={handleImportToDatabase}
          onClose={() => setShowDatabaseManager(false)}
          onCloseAll={handleCloseAll}
          locations={locations}
          onCreateLocation={handleCreateLocation}
        />
      )}

      {/* Export Settings Modal */}
      {showExportSettings && (
        <ExportSettings
          settings={exportSettings}
          onUpdateSettings={handleUpdateExportSettings}
          onClose={() => setShowExportSettings(false)}
          onCloseAll={handleCloseAll}
        />
      )}

      {/* Location Manager Modal */}
      {showLocationManager && (
        <LocationManager
          locations={locations}
          onCreateLocation={handleCreateLocation}
          onDeleteLocation={handleDeleteLocation}
          onRenameLocation={handleRenameLocation}
          onClose={() => setShowLocationManager(false)}
          onCloseAll={handleCloseAll}
        />
      )}

      {/* Info & Release Notes Modal */}
      {showInfo && (
        <InfoReleaseNotes
          onClose={() => setShowInfo(false)}
          onCloseAll={handleCloseAll}
        />
      )}

      {/* Email Settings Modal */}
      {showEmailSettings && (
        <EmailSettings
          settings={emailSettings}
          onUpdateSettings={handleUpdateEmailSettings}
          onClose={() => setShowEmailSettings(false)}
          onCloseAll={handleCloseAll}
        />
      )}

      {/* Backup Manager Modal */}
      {showBackupManager && (
        <BackupManager
          onClose={() => setShowBackupManager(false)}
          onCloseAll={handleCloseAll}
        />
      )}

      {/* Create Job Modal */}
      {showCreateJobModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Neue Auftragsliste</h2>

              <form onSubmit={(e) => { e.preventDefault(); handleCreateJobFromModal(); }}>
                <div className="mb-6">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                    Name der Auftragsliste *
                  </label>
                  <input
                    type="text"
                    value={newJobName}
                    onChange={(e) => setNewJobName(e.target.value)}
                    className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-300"
                    placeholder="z.B. Projekt A, Auftrag 2025-01..."
                    autoFocus
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCancelCreateJob}
                    className="flex-1 px-6 py-3 text-lg bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-semibold border-3"
                    style={{ borderWidth: '3px', borderColor: 'rgb(193, 218, 81)' }}
                  >
                    Erstellen
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      {alertModal && (
        <AlertModal
          message={alertModal.message}
          type={alertModal.type}
          onClose={() => setAlertModal(null)}
        />
      )}

      {/* Update Notification */}
      {showUpdateNotification && updateSW && (
        <UpdateNotification
          onUpdate={() => {
            updateSW(true);
            setShowUpdateNotification(false);
          }}
          onDismiss={() => setShowUpdateNotification(false)}
        />
      )}
    </div>
  );
}

export default App;
