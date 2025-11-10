export default function ConfirmModal({ message, onConfirm, onCancel, confirmText = 'Ja', cancelText = 'Abbrechen', type = 'warning' }) {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return '⚠️';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '❓';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md animate-fadeIn">
        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <span className="text-4xl">{getIcon()}</span>
            <div className="flex-1">
              <p className="text-lg text-gray-800 dark:text-white whitespace-pre-line">
                {message}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-6 py-3 text-lg bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-semibold"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 px-6 py-3 text-lg rounded-lg transition-colors font-semibold ${
                type === 'danger'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 border-2'
              }`}
              style={type !== 'danger' ? { borderColor: 'rgb(193, 218, 81)' } : {}}
              autoFocus
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
