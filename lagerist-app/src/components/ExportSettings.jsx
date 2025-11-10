import { useState } from 'react';
import { useSwipe } from '../utils/useSwipe';

export default function ExportSettings({
  settings,
  onUpdateSettings,
  onClose,
  onCloseAll
}) {
  const [isClosing, setIsClosing] = useState(false);

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

  const handleToggle = (key) => {
    onUpdateSettings({
      ...settings,
      [key]: !settings[key]
    });
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Exporteinstellungen</h2>
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

          {/* Export Options */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Export-Optionen</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Konfigurieren Sie die Export-Funktionen nach Ihren Wünschen.
            </p>

            <div className="space-y-4">
              {/* CSV Export */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">📊</span>
                  <h4 className="font-semibold text-gray-900 dark:text-white">CSV Export</h4>
                </div>
                <div className="space-y-3">
                  {/* Toggle: Im Hauptbereich anzeigen */}
                  <label className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-white dark:hover:bg-gray-600 transition-colors">
                    <span className="text-base text-gray-700 dark:text-gray-300">Im Hauptbereich anzeigen</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={settings.showCsvExport}
                        onChange={() => handleToggle('showCsvExport')}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-8 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-accent-500 transition-colors"></div>
                      <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                    </div>
                  </label>
                  {/* Toggle: Zeitstempel mit exportieren */}
                  <label className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-white dark:hover:bg-gray-600 transition-colors">
                    <span className="text-base text-gray-700 dark:text-gray-300">Zeitstempel mit exportieren</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={settings.csvIncludeTimestamp}
                        onChange={() => handleToggle('csvIncludeTimestamp')}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-8 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-accent-500 transition-colors"></div>
                      <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                    </div>
                  </label>
                </div>
              </div>

              {/* E-Mail Export */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">📧</span>
                  <h4 className="font-semibold text-gray-900 dark:text-white">E-Mail Export</h4>
                </div>
                <div className="space-y-3">
                  {/* Toggle: Im Hauptbereich anzeigen */}
                  <label className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-white dark:hover:bg-gray-600 transition-colors">
                    <span className="text-base text-gray-700 dark:text-gray-300">Im Hauptbereich anzeigen</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={settings.showEmailExport}
                        onChange={() => handleToggle('showEmailExport')}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-8 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-accent-500 transition-colors"></div>
                      <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                    </div>
                  </label>
                  {/* Toggle: Zeitstempel mit exportieren */}
                  <label className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-white dark:hover:bg-gray-600 transition-colors">
                    <span className="text-base text-gray-700 dark:text-gray-300">Zeitstempel mit exportieren</span>
                    <div className="relative">
                      <input
                        type="checkbox"
                        checked={settings.emailIncludeTimestamp}
                        onChange={() => handleToggle('emailIncludeTimestamp')}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-8 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-accent-500 transition-colors"></div>
                      <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400 text-lg">ℹ️</span>
              <div className="flex-1">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Hinweis:</strong> Die Einstellungen werden automatisch gespeichert und bleiben auch nach dem Schließen der App erhalten.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
