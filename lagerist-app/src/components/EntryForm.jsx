import { useState } from 'react';

export default function EntryForm({ articleNumber, onSubmit, onCancel }) {
  const [editableArticleNumber, setEditableArticleNumber] = useState(articleNumber);
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('Stück');
  const [location, setLocation] = useState('D10');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!editableArticleNumber || editableArticleNumber.trim() === '') {
      alert('Bitte geben Sie eine Artikelnummer ein');
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      alert('Bitte geben Sie eine gültige Menge ein');
      return;
    }

    onSubmit({
      articleNumber: editableArticleNumber.trim(),
      quantity: parseFloat(quantity),
      unit,
      location,
      timestamp: new Date().toISOString()
    });

    // Reset form
    setQuantity('');
    setUnit('Stück');
    setLocation('D10');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Materialentnahme</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Artikelnummer *
              </label>
              <input
                type="text"
                value={editableArticleNumber}
                onChange={(e) => setEditableArticleNumber(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg bg-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="z.B. 4102560010386"
              />
              <p className="text-xs text-gray-500 mt-1">
                Sie können die gescannte Nummer hier korrigieren
              </p>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Menge *
              </label>
              <input
                type="number"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="z.B. 5 oder 2.5"
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Einheit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Stück">Stück</option>
                <option value="Meter">Meter</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Lagerort
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="D10">D10</option>
                <option value="D90">D90</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-6 py-3 text-lg bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 text-lg bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                Hinzufügen
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
