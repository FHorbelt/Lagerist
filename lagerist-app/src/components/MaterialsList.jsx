export default function MaterialsList({ materials, onDelete }) {
  if (materials.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-lg">Noch keine Materialentnahmen erfasst</p>
        <p className="text-sm mt-2">Scannen Sie einen Barcode, um zu beginnen</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-700">
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-600">
              Lagerort
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-600">
              Artikelnr.
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-600">
              Menge
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-600">
              Einheit
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-600">
              Bezeichnung
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-600">
              Aktion
            </th>
          </tr>
        </thead>
        <tbody>
          {materials.map((material, index) => (
            <tr key={index} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
              <td className="px-4 py-3 text-sm font-semibold dark:text-gray-300">{material.location}</td>
              <td className="px-4 py-3 text-sm font-mono dark:text-gray-300">{material.articleNumber}</td>
              <td className="px-4 py-3 text-sm dark:text-gray-300">{material.quantity}</td>
              <td className="px-4 py-3 text-sm dark:text-gray-300">{material.unit}</td>
              <td className="px-4 py-3 text-sm dark:text-gray-300">{material.description || '-'}</td>
              <td className="px-4 py-3 text-sm">
                <button
                  onClick={() => onDelete(index)}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-xs"
                >
                  Löschen
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 text-right text-sm text-gray-600 dark:text-gray-400">
        Gesamt: {materials.length} Einträge
      </div>
    </div>
  );
}
