export default function UpdateNotification({ onUpdate, onDismiss }) {
  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-[100] animate-slideInUp">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border-4 overflow-hidden" style={{ borderColor: 'rgb(193, 218, 81)' }}>
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 text-3xl">🔄</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white mb-1">Neue Version verfügbar</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Eine neue Version der Lagerist App ist verfügbar. Möchten Sie jetzt aktualisieren?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={onUpdate}
                  className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-semibold border-2"
                  style={{ borderColor: 'rgb(193, 218, 81)' }}
                >
                  Jetzt aktualisieren
                </button>
                <button
                  onClick={onDismiss}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Später
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
