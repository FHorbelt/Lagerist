export default function AlertModal({ message, onClose, type = 'info' }) {
  // type can be: 'info', 'warning', 'error', 'success'

  const getIcon = () => {
    switch (type) {
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'success':
        return '✅';
      default:
        return 'ℹ️';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'error':
        return 'red';
      case 'warning':
        return 'yellow';
      case 'success':
        return 'green';
      default:
        return 'blue';
    }
  };

  const color = getColor();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md animate-fadeIn">
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <span className="text-4xl">{getIcon()}</span>
            <div className="flex-1">
              <p className="text-lg text-gray-800 dark:text-white whitespace-pre-line">
                {message}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`w-full px-6 py-3 text-lg rounded-lg transition-colors font-semibold ${
              color === 'red'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : color === 'yellow'
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                : color === 'green'
                ? 'bg-accent-500 hover:bg-accent-600 text-white'
                : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 border-2'
            }`}
            style={color === 'blue' ? { borderColor: 'rgb(193, 218, 81)' } : {}}
            autoFocus
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
