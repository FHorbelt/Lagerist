import { useState } from 'react';
import ConfirmModal from './ConfirmModal';
import { useSwipe } from '../utils/useSwipe';

export default function LocationManager({ locations, onCreateLocation, onDeleteLocation, onRenameLocation, onClose, onCloseAll }) {
  const [newLocationName, setNewLocationName] = useState('');
  const [renamingLocationId, setRenamingLocationId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [isClosing, setIsClosing] = useState(false);
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

  const handleCreateLocation = () => {
    if (!newLocationName.trim()) {
      alert('Bitte geben Sie einen Lagerort-Namen ein');
      return;
    }

    // Check if location already exists
    if (locations.some(loc => loc.name.toLowerCase() === newLocationName.trim().toLowerCase())) {
      alert('Dieser Lagerort existiert bereits');
      return;
    }

    onCreateLocation(newLocationName.trim());
    setNewLocationName('');
  };

  const handleRename = (locationId) => {
    if (!renameValue.trim()) {
      alert('Bitte geben Sie einen Namen ein');
      return;
    }

    // Check if location already exists (excluding current one)
    if (locations.some(loc => loc.id !== locationId && loc.name.toLowerCase() === renameValue.trim().toLowerCase())) {
      alert('Dieser Lagerort existiert bereits');
      return;
    }

    onRenameLocation(locationId, renameValue.trim());
    setRenamingLocationId(null);
    setRenameValue('');
  };

  const startRename = (location) => {
    setRenamingLocationId(location.id);
    setRenameValue(location.name);
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Lagerortverwaltung</h2>
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
          {/* Create New Location */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Neuen Lagerort erstellen</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newLocationName}
                onChange={(e) => setNewLocationName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateLocation()}
                placeholder="Name für neuen Lagerort (z.B. D10, D90, A1)..."
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-300"
              />
              <button
                onClick={handleCreateLocation}
                className="px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors flex items-center justify-center text-2xl font-semibold"
                title="Neuen Lagerort erstellen"
              >
                +
              </button>
            </div>
          </div>

          {/* Locations List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Lagerorte</h3>
            {locations.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p className="text-lg mb-2">Keine Lagerorte vorhanden</p>
                <p className="text-sm">Erstellen Sie einen neuen Lagerort, um zu beginnen</p>
              </div>
            ) : (
              <div className="space-y-3">
                {locations.map((location) => (
                  <div
                    key={location.id}
                    className="border rounded-lg p-4 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
                  >
                    {renamingLocationId === location.id ? (
                      <div className="space-y-2 mb-2">
                        <input
                          type="text"
                          value={renameValue}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleRename(location.id)}
                          className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-300"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRename(location.id)}
                            className="flex-1 px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-50 dark:hover:bg-gray-600 text-sm font-semibold border-2"
                            style={{ borderColor: 'rgb(193, 218, 81)' }}
                          >
                            OK
                          </button>
                          <button
                            onClick={() => setRenamingLocationId(null)}
                            className="flex-1 px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                          >
                            Abbrechen
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{location.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Erstellt: {new Date(location.createdAt).toLocaleDateString('de-DE')}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => startRename(location)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
                      >
                        Umbenennen
                      </button>
                      <button
                        onClick={() => setConfirmModal({
                          message: `Lagerort "${location.name}" wirklich löschen?`,
                          onConfirm: () => {
                            onDeleteLocation(location.id);
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

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400 text-lg">ℹ️</span>
              <div className="flex-1">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Hinweis:</strong> Neue Lagerorte werden beim CSV-Import automatisch angelegt, wenn sie in der ersten Spalte der CSV-Datei vorkommen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
}
