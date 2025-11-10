import { useState, useRef } from 'react';
import ArticleDatabaseViewer from './ArticleDatabaseViewer';
import ConfirmModal from './ConfirmModal';
import { removeLeadingZeros } from '../utils/articleUtils';
import { useSwipe } from '../utils/useSwipe';

export default function ArticleDatabaseManager({
  databases,
  activeDatabaseIds,
  onToggleDatabase,
  onCreateDatabase,
  onDeleteDatabase,
  onRenameDatabase,
  onImportToDatabase,
  onClose,
  onCloseAll,
  locations = [],
  onCreateLocation
}) {
  const [newDatabaseName, setNewDatabaseName] = useState('');
  const [renamingDatabaseId, setRenamingDatabaseId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [uploadingDatabaseId, setUploadingDatabaseId] = useState(null);
  const [viewingDatabaseId, setViewingDatabaseId] = useState(null);
  const [csvPreview, setCsvPreview] = useState(null);
  const [skipLines, setSkipLines] = useState(0);
  const [isClosing, setIsClosing] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);
  const fileInputRefs = useRef({});

  // Swipe-Geste zum Schließen (von links nach rechts) - zurück zum Burger Menu
  const swipeContainerRef = useSwipe(() => {
    if (!csvPreview && !viewingDatabaseId) { // Nur schließen wenn keine Modals offen sind
      onClose(); // Direkt zum Burger Menu zurück
    }
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

  const handleCreateDatabase = () => {
    if (!newDatabaseName.trim()) {
      alert('Bitte geben Sie einen Namen ein');
      return;
    }
    onCreateDatabase(newDatabaseName.trim());
    setNewDatabaseName('');
  };

  const handleRename = (databaseId) => {
    if (!renameValue.trim()) {
      alert('Bitte geben Sie einen Namen ein');
      return;
    }
    onRenameDatabase(databaseId, renameValue.trim());
    setRenamingDatabaseId(null);
    setRenameValue('');
  };

  const startRename = (database) => {
    setRenamingDatabaseId(database.id);
    setRenameValue(database.name);
  };

  const handleFileUpload = (databaseId, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.trim().split('\n');
        const previewLines = lines.slice(0, 10).map((line, index) => {
          const parts = line.split(';');
          return {
            lineNumber: index + 1,
            raw: line,
            parts: parts.length >= 3 ? {
              location: parts[0]?.trim() || '',
              articleNumber: parts[1]?.trim() || '',
              description: parts[2]?.trim() || ''
            } : null
          };
        });

        setCsvPreview({
          databaseId,
          csvText: text,
          totalLines: lines.length,
          previewLines
        });
        setSkipLines(0);
      } catch (error) {
        console.error('CSV Preview Error:', error);
        alert('Fehler beim Lesen der CSV-Datei.');
      }
    };

    reader.onerror = () => {
      alert('Fehler beim Lesen der Datei.');
    };

    reader.readAsText(file, 'UTF-8');
  };

  const handleConfirmImport = () => {
    if (!csvPreview) return;

    setUploadingDatabaseId(csvPreview.databaseId);

    try {
      const { articles: parsedArticles, newLocations } = parseCSV(csvPreview.csvText, skipLines);

      // Auto-create new locations
      if (newLocations.length > 0 && onCreateLocation) {
        newLocations.forEach(locationName => {
          onCreateLocation(locationName);
        });
        alert(`${parsedArticles.length} Artikel erfolgreich importiert!\n${newLocations.length} neue Lagerorte erstellt: ${newLocations.join(', ')}`);
      } else {
        alert(`${parsedArticles.length} Artikel erfolgreich importiert!`);
      }

      onImportToDatabase(csvPreview.databaseId, parsedArticles);

      // Close preview and reset
      setCsvPreview(null);
      setSkipLines(0);

      // Reset file input
      if (fileInputRefs.current[csvPreview.databaseId]) {
        fileInputRefs.current[csvPreview.databaseId].value = '';
      }
    } catch (error) {
      console.error('CSV Import Error:', error);
      alert('Fehler beim Importieren der CSV-Datei. Bitte überprüfen Sie das Format.');
    } finally {
      setUploadingDatabaseId(null);
    }
  };

  const handleCancelImport = () => {
    if (csvPreview && fileInputRefs.current[csvPreview.databaseId]) {
      fileInputRefs.current[csvPreview.databaseId].value = '';
    }
    setCsvPreview(null);
    setSkipLines(0);
  };

  const parseCSV = (text, skipLines = 0) => {
    const lines = text.trim().split('\n');
    const articles = [];
    const discoveredLocations = new Set();
    const existingLocationNames = new Set(locations.map(loc => loc.name.toLowerCase()));

    for (let i = skipLines; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const parts = line.split(';');

      if (parts.length >= 3) {
        const location = parts[0].trim();
        const articleNumber = parts[1].trim();
        const description = parts[2].trim();

        if (location && articleNumber) {
          // Remove leading zeros from article number
          const normalizedArticleNumber = removeLeadingZeros(articleNumber);

          articles.push({
            articleNumber: normalizedArticleNumber,
            description,
            location
          });

          // Track locations that don't exist yet
          if (!existingLocationNames.has(location.toLowerCase())) {
            discoveredLocations.add(location);
          }
        }
      }
    }

    return {
      articles,
      newLocations: Array.from(discoveredLocations)
    };
  };

  const viewingDatabase = databases.find(db => db.id === viewingDatabaseId);

  return (
    <>
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
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Datenbankenverwaltung</h2>
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
            {/* Create New Database */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Neue Artikeldatenbank erstellen</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newDatabaseName}
                  onChange={(e) => setNewDatabaseName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateDatabase()}
                  placeholder="Name für neue Artikeldatenbank..."
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-300"
                />
                <button
                  onClick={handleCreateDatabase}
                  className="px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors flex items-center justify-center text-2xl font-semibold"
                  title="Neue Artikeldatenbank erstellen"
                >
                  +
                </button>
              </div>
            </div>

            {/* Databases List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Artikeldatenbanken</h3>
              {databases.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <p className="text-lg mb-2">Keine Artikeldatenbanken vorhanden</p>
                  <p className="text-sm">Erstellen Sie eine neue Datenbank, um zu beginnen</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {databases.map((database) => (
                    <div
                      key={database.id}
                      className={`border rounded-lg p-4 transition-all ${
                        activeDatabaseIds.includes(database.id)
                          ? 'border-accent-300 bg-accent-50 dark:border-accent-500 dark:bg-accent-900 dark:bg-opacity-20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      {renamingDatabaseId === database.id ? (
                        <div className="space-y-2 mb-2">
                          <input
                            type="text"
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleRename(database.id)}
                            className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-300"
                            autoFocus
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRename(database.id)}
                              className="flex-1 px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-50 dark:hover:bg-gray-600 text-sm font-semibold border-2"
                              style={{ borderColor: 'rgb(193, 218, 81)' }}
                            >
                              OK
                            </button>
                            <button
                              onClick={() => setRenamingDatabaseId(null)}
                              className="flex-1 px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                            >
                              Abbrechen
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1 pr-3">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{database.name}</h3>
                              {activeDatabaseIds.includes(database.id) && (
                                <span className="px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs rounded font-semibold border-2" style={{ borderColor: 'rgb(193, 218, 81)' }}>
                                  Aktiv
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {database.articles.length} Artikel • Erstellt: {new Date(database.createdAt).toLocaleDateString('de-DE')}
                            </p>
                            {database.lastModified && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Zuletzt geändert: {new Date(database.lastModified).toLocaleString('de-DE')}
                              </p>
                            )}
                          </div>
                          <div className="relative flex-shrink-0 cursor-pointer" onClick={() => onToggleDatabase(database.id)}>
                            <input
                              type="checkbox"
                              checked={activeDatabaseIds.includes(database.id)}
                              onChange={() => onToggleDatabase(database.id)}
                              className="sr-only peer"
                            />
                            <div className="w-14 h-8 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-accent-500 transition-colors"></div>
                            <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6 pointer-events-none"></div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => setViewingDatabaseId(database.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                        >
                          Ansehen
                        </button>

                        {/* CSV Import for this database */}
                        <div className="relative">
                          <input
                            ref={(el) => (fileInputRefs.current[database.id] = el)}
                            type="file"
                            accept=".csv"
                            onChange={(e) => handleFileUpload(database.id, e)}
                            className="hidden"
                            id={`csv-upload-${database.id}`}
                          />
                          <label
                            htmlFor={`csv-upload-${database.id}`}
                            className={`inline-block px-4 py-2 bg-accent-500 text-white rounded hover:bg-accent-600 transition-colors text-sm cursor-pointer ${
                              uploadingDatabaseId === database.id ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {uploadingDatabaseId === database.id ? 'Importiere...' : 'CSV importieren'}
                          </label>
                        </div>

                        <button
                          onClick={() => startRename(database)}
                          className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
                        >
                          Umbenennen
                        </button>
                        <button
                          onClick={() => setConfirmModal({
                            message: `Artikeldatenbank "${database.name}" wirklich löschen?`,
                            onConfirm: () => {
                              onDeleteDatabase(database.id);
                              setConfirmModal(null);
                            },
                            onCancel: () => setConfirmModal(null)
                          })}
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                        >
                          Löschen
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Article Database Viewer (opened from management menu) */}
      {viewingDatabase && (
        <ArticleDatabaseViewer
          database={viewingDatabase}
          onClose={() => setViewingDatabaseId(null)}
          onUpdateArticles={onImportToDatabase}
          locations={locations}
          onCreateLocation={onCreateLocation}
        />
      )}

      {/* CSV Import Preview Modal */}
      {csvPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">CSV-Import Vorschau</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {csvPreview.totalLines} Zeilen insgesamt • Vorschau der ersten 10 Zeilen
              </p>
            </div>

            {/* Preview Table */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="mb-6">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-3">
                  Anzahl der Zeilen überspringen (z.B. für Spaltenüberschriften):
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    min="0"
                    max={csvPreview.totalLines - 1}
                    value={skipLines}
                    onChange={(e) => setSkipLines(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-300"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {skipLines > 0 && `${csvPreview.totalLines - skipLines} Zeilen werden importiert`}
                    {skipLines === 0 && 'Alle Zeilen werden importiert'}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border dark:border-gray-600">
                        Zeile
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border dark:border-gray-600">
                        Status
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border dark:border-gray-600">
                        Lagerort
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border dark:border-gray-600">
                        Artikelnummer
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 border dark:border-gray-600">
                        Beschreibung
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.previewLines.map((line) => {
                      const willBeSkipped = line.lineNumber <= skipLines;
                      const isValid = line.parts !== null;

                      return (
                        <tr
                          key={line.lineNumber}
                          className={`border dark:border-gray-700 ${
                            willBeSkipped
                              ? 'bg-red-50 dark:bg-red-900 dark:bg-opacity-20 opacity-60'
                              : isValid
                                ? 'bg-green-50 dark:bg-green-900 dark:bg-opacity-20'
                                : 'bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20'
                          }`}
                        >
                          <td className="px-3 py-2 font-mono text-gray-600 dark:text-gray-400 border dark:border-gray-700">
                            {line.lineNumber}
                          </td>
                          <td className="px-3 py-2 text-xs border dark:border-gray-700">
                            {willBeSkipped ? (
                              <span className="px-2 py-1 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200 rounded font-semibold">
                                Übersprungen
                              </span>
                            ) : isValid ? (
                              <span className="px-2 py-1 bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 rounded font-semibold">
                                OK
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 rounded font-semibold">
                                Ungültig
                              </span>
                            )}
                          </td>
                          {isValid ? (
                            <>
                              <td className="px-3 py-2 dark:text-gray-300 border dark:border-gray-700">
                                {line.parts.location}
                              </td>
                              <td className="px-3 py-2 font-mono dark:text-gray-300 border dark:border-gray-700">
                                {line.parts.articleNumber}
                              </td>
                              <td className="px-3 py-2 dark:text-gray-300 border dark:border-gray-700">
                                {line.parts.description}
                              </td>
                            </>
                          ) : (
                            <td colSpan="3" className="px-3 py-2 text-gray-500 dark:text-gray-400 italic border dark:border-gray-700">
                              Ungültiges Format (erwartet: Lagerort;Artikelnummer;Beschreibung)
                            </td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-2">
                  💡 Hinweis zum CSV-Format:
                </h4>
                <ul className="text-xs text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• Erwartetes Format: <code className="bg-white dark:bg-gray-800 px-1 py-0.5 rounded">Lagerort;Artikelnummer;Beschreibung</code></li>
                  <li>• Trennzeichen: Semikolon (;)</li>
                  <li>• Führende Nullen bei Artikelnummern werden automatisch entfernt</li>
                  <li>• Neue Lagerorte werden automatisch angelegt</li>
                </ul>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
              <div className="flex gap-3">
                <button
                  onClick={handleCancelImport}
                  className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={uploadingDatabaseId !== null}
                  className="flex-1 px-6 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-semibold border-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ borderWidth: '3px', borderColor: 'rgb(193, 218, 81)' }}
                >
                  {uploadingDatabaseId !== null ? 'Importiere...' : `${csvPreview.totalLines - skipLines} Artikel importieren`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={confirmModal.onCancel}
          confirmText="Löschen"
          cancelText="Abbrechen"
          type="danger"
        />
      )}
    </>
  );
}
