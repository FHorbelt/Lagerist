import { useState } from 'react';
import { getFromStore, putToStore, clearStore } from '../utils/indexedDB';
import AlertModal from './AlertModal';
import ConfirmModal from './ConfirmModal';
import { useSwipe } from '../utils/useSwipe';

export default function BackupManager({ onClose, onCloseAll }) {
  const [isClosing, setIsClosing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [alertModal, setAlertModal] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);

  // Swipe-Geste zum Schließen (von links nach rechts) - zurück zum Burger Menu
  const swipeContainerRef = useSwipe(() => {
    onClose(); // Direkt zum Burger Menu zurück
  });

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleCloseAll = () => {
    setIsClosing(true);
    setTimeout(() => {
      onCloseAll();
    }, 200);
  };

  const handleExportBackup = async () => {
    setIsExporting(true);
    try {
      // Collect all data from IndexedDB
      const jobs = await getFromStore('jobs');
      const articleDatabases = await getFromStore('articleDatabases');
      const locations = await getFromStore('locations');

      // Get all settings
      const currentJobId = await getFromStore('settings', 'currentJobId');
      const activeDatabaseIds = await getFromStore('settings', 'activeDatabaseIds');
      const darkMode = await getFromStore('settings', 'darkMode');
      const exportSettings = await getFromStore('settings', 'exportSettings');
      const emailSettings = await getFromStore('settings', 'emailSettings');

      // Create backup object
      const backup = {
        version: '2025.07',
        exportDate: new Date().toISOString(),
        data: {
          jobs: jobs || [],
          articleDatabases: articleDatabases || [],
          locations: locations || [],
          settings: {
            currentJobId,
            activeDatabaseIds: activeDatabaseIds || [],
            darkMode: darkMode || false,
            exportSettings: exportSettings || {},
            emailSettings: emailSettings || {}
          }
        }
      };

      // Convert to JSON
      const jsonString = JSON.stringify(backup, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.href = url;
      link.download = `lagerist-backup-${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setAlertModal({
        message: 'Backup erfolgreich erstellt!\n\nWählen Sie jetzt einen Speicherort für die Backup-Datei.',
        type: 'success'
      });
    } catch (error) {
      console.error('Backup Export Error:', error);
      setAlertModal({
        message: 'Fehler beim Erstellen des Backups.\n\nBitte versuchen Sie es erneut.',
        type: 'error'
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportBackup = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Show confirmation modal
    setConfirmModal({
      message: 'ACHTUNG: Backup wiederherstellen?\n\nAlle aktuellen Daten werden durch die Backup-Daten ersetzt!\n\nMöchten Sie fortfahren?',
      onConfirm: () => {
        setConfirmModal(null);
        performImport(file, event);
      },
      onCancel: () => {
        setConfirmModal(null);
        event.target.value = '';
      }
    });
  };

  const performImport = async (file, event) => {
    setIsImporting(true);
    try {
      // Read file
      const text = await file.text();
      const backup = JSON.parse(text);

      // Validate backup structure
      if (!backup.data || !backup.version) {
        throw new Error('Ungültiges Backup-Format');
      }

      const { jobs, articleDatabases, locations, settings } = backup.data;

      // Clear existing data
      await clearStore('jobs');
      await clearStore('articleDatabases');
      await clearStore('locations');

      // Restore jobs
      if (jobs && jobs.length > 0) {
        for (const job of jobs) {
          await putToStore('jobs', job);
        }
      }

      // Restore article databases
      if (articleDatabases && articleDatabases.length > 0) {
        for (const db of articleDatabases) {
          await putToStore('articleDatabases', db);
        }
      }

      // Restore locations
      if (locations && locations.length > 0) {
        for (const location of locations) {
          await putToStore('locations', location);
        }
      }

      // Restore settings
      if (settings) {
        if (settings.currentJobId !== undefined) {
          await putToStore('settings', settings.currentJobId, 'currentJobId');
        }
        if (settings.activeDatabaseIds) {
          await putToStore('settings', settings.activeDatabaseIds, 'activeDatabaseIds');
        }
        if (settings.darkMode !== undefined) {
          await putToStore('settings', settings.darkMode, 'darkMode');
        }
        if (settings.exportSettings) {
          await putToStore('settings', settings.exportSettings, 'exportSettings');
        }
        if (settings.emailSettings) {
          await putToStore('settings', settings.emailSettings, 'emailSettings');
        }
      }

      setAlertModal({
        message: `Backup erfolgreich wiederhergestellt!\n\nAuftragslisten: ${jobs?.length || 0}\nArtikeldatenbanken: ${articleDatabases?.length || 0}\nLagerorte: ${locations?.length || 0}\n\nDie Seite wird jetzt neu geladen.`,
        type: 'success'
      });

      // Reload page after user closes the modal
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error('Backup Import Error:', error);
      setAlertModal({
        message: 'Fehler beim Wiederherstellen des Backups.\n\nBitte überprüfen Sie die Datei und versuchen Sie es erneut.',
        type: 'error'
      });
    } finally {
      setIsImporting(false);
      event.target.value = '';
    }
  };

  return (
    <div ref={swipeContainerRef} className={`fixed inset-0 bg-white dark:bg-gray-900 z-[60] flex flex-col ${isClosing ? 'animate-slideOutRight' : 'animate-slideInRight'}`}>
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 p-2 shadow-lg border-b-4" style={{ borderBottomColor: 'rgb(193, 218, 81)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={handleClose}
              className="p-2 text-gray-900 dark:text-white hover:bg-accent-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Zurück"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <img src="/Lagerist_Logo.png" alt="Lagerist Logo" className="h-10 w-10 rounded-lg" />
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Backup & Wiederherstellung</h2>
              <p className="text-xs text-gray-700 dark:text-gray-200">Lagerist App</p>
            </div>
          </div>
          <button
            onClick={handleCloseAll}
            className="p-2 text-gray-900 dark:text-white hover:bg-red-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Schließen"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto p-4 space-y-4">

          {/* Export Backup */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">📦 Backup erstellen</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Erstellen Sie eine Sicherungskopie aller Ihrer Daten (Auftragslisten, Artikeldatenbanken, Lagerorte, Einstellungen).
            </p>
            <button
              onClick={handleExportBackup}
              disabled={isExporting}
              className="w-full px-6 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-semibold border-2 disabled:opacity-50"
              style={{ borderColor: 'rgb(193, 218, 81)' }}
            >
              {isExporting ? 'Erstelle Backup...' : '⬇️ Backup erstellen'}
            </button>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Nach dem Klick können Sie den Speicherort für die Backup-Datei auswählen (z.B. Downloads-Ordner oder Cloud-Speicher).
            </p>
          </div>

          {/* Import Backup */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">📥 Backup wiederherstellen</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Stellen Sie eine zuvor erstellte Sicherungskopie wieder her.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 rounded-lg p-3 mb-4 border border-yellow-200 dark:border-yellow-800">
              <div className="flex gap-2">
                <span className="text-yellow-600 dark:text-yellow-400 text-lg">⚠️</span>
                <p className="text-sm text-yellow-800 dark:text-yellow-300">
                  <strong>Achtung:</strong> Beim Wiederherstellen werden alle aktuellen Daten durch die Backup-Daten ersetzt!
                </p>
              </div>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              disabled={isImporting}
              className="hidden"
              id="backup-file-input"
            />
            <label
              htmlFor="backup-file-input"
              className={`w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center cursor-pointer ${
                isImporting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isImporting ? 'Importiere Backup...' : '⬆️ Backup-Datei auswählen'}
            </label>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400 text-lg">💡</span>
              <div className="flex-1">
                <p className="text-sm text-blue-800 dark:text-blue-300 mb-2">
                  <strong>Tipps für Backups:</strong>
                </p>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside ml-2">
                  <li>Erstellen Sie regelmäßig Backups Ihrer wichtigen Daten</li>
                  <li>Speichern Sie Backups in einem Cloud-Speicher (Google Drive, iCloud, Dropbox)</li>
                  <li>Bewahren Sie mindestens ein Backup an einem anderen Ort auf</li>
                  <li>Backup-Dateien enthalten alle Ihre Daten im JSON-Format</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Technical Info */}
          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">🔧 Technische Details</h4>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <p><strong>Dateiformat:</strong> JSON (JavaScript Object Notation)</p>
              <p><strong>Enthaltene Daten:</strong> Auftragslisten, Materialeinträge, Artikeldatenbanken, Lagerorte, E-Mail-Einstellungen, Export-Einstellungen</p>
              <p><strong>Dateiname:</strong> lagerist-backup-YYYY-MM-DD.json</p>
              <p><strong>Speichervorgang:</strong> Browser öffnet Datei-Dialog zur Auswahl des Speicherorts</p>
            </div>
          </div>

        </div>
      </div>

      {/* Alert Modal */}
      {alertModal && (
        <AlertModal
          message={alertModal.message}
          type={alertModal.type}
          onClose={() => setAlertModal(null)}
        />
      )}

      {/* Confirm Modal */}
      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={confirmModal.onCancel}
          confirmText="Fortfahren"
          cancelText="Abbrechen"
          type="danger"
        />
      )}
    </div>
  );
}
