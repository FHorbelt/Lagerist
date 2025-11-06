export default function MaterialsList({ materials, onDelete }) {
  if (materials.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">Noch keine Materialentnahmen erfasst</p>
        <p className="text-sm mt-2">Scannen Sie einen Barcode, um zu beginnen</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
              Artikelnr.
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
              Menge
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
              Einheit
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
              Lagerort
            </th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">
              Aktion
            </th>
          </tr>
        </thead>
        <tbody>
          {materials.map((material, index) => (
            <tr key={index} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3 text-sm font-mono">{material.articleNumber}</td>
              <td className="px-4 py-3 text-sm">{material.quantity}</td>
              <td className="px-4 py-3 text-sm">{material.unit}</td>
              <td className="px-4 py-3 text-sm font-semibold">{material.location}</td>
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

      <div className="mt-4 text-right text-sm text-gray-600">
        Gesamt: {materials.length} Einträge
      </div>
    </div>
  );
}
