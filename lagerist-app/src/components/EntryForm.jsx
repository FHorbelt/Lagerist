import { useState, useEffect, useRef } from 'react';
import { removeLeadingZeros } from '../utils/articleUtils';

export default function EntryForm({ articleData, onSubmit, onCancel, onLookup, onRescan, locations = [], onCreateLocation }) {
  // articleData can be either a string (legacy) or object {articleNumber, description, suggestedLocation}
  const isLegacy = typeof articleData === 'string';
  const initialArticleNumber = isLegacy ? articleData : (articleData?.articleNumber || '');
  const initialDescription = isLegacy ? '' : (articleData?.description || '');

  // Use first location as default if no specific location suggested
  const defaultLocation = locations.length > 0 ? locations[0].name : '';
  const initialLocation = isLegacy ? defaultLocation : (articleData?.suggestedLocation || defaultLocation);
  const wasScanned = !!articleData; // Track if this was from a scan

  const [editableArticleNumber, setEditableArticleNumber] = useState(initialArticleNumber);
  const [description, setDescription] = useState(initialDescription);
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('Stück');
  const [location, setLocation] = useState(initialLocation);
  const [newLocationName, setNewLocationName] = useState('');
  const [showLocationCreation, setShowLocationCreation] = useState(false);
  const articleInputRef = useRef(null);
  const quantityInputRef = useRef(null);

  // Reset form fields when articleData changes
  useEffect(() => {
    setEditableArticleNumber(initialArticleNumber);
    setDescription(initialDescription);
    setQuantity('');
    setUnit('Stück');
    setLocation(initialLocation);
  }, [articleData, initialArticleNumber, initialDescription, initialLocation]);

  // Auto-focus: if no article number, focus article field; otherwise focus quantity
  useEffect(() => {
    if (!initialArticleNumber || initialArticleNumber.trim() === '') {
      articleInputRef.current?.focus();
    } else {
      quantityInputRef.current?.focus();
    }
  }, [initialArticleNumber]);

  // Live lookup when article number changes (for manual entry)
  useEffect(() => {
    if (editableArticleNumber && editableArticleNumber.trim() !== '' && onLookup) {
      const articleInfo = onLookup(editableArticleNumber.trim());
      if (articleInfo) {
        setDescription(articleInfo.description || '');
        setLocation(articleInfo.location || defaultLocation);
      } else {
        // Reset if not found
        if (description && !initialDescription) {
          setDescription('');
        }
        if (location !== defaultLocation && !initialLocation) {
          setLocation(defaultLocation);
        }
      }
    }
  }, [editableArticleNumber, onLookup, defaultLocation]);

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
    setLocation(newLocationName.trim());
    setNewLocationName('');
    setShowLocationCreation(false);
  };

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

    if (!location || location.trim() === '') {
      alert('Bitte wählen Sie einen Lagerort oder erstellen Sie einen neuen');
      return;
    }

    // Remove leading zeros from article number before submitting
    const normalizedArticleNumber = removeLeadingZeros(editableArticleNumber.trim());

    onSubmit({
      articleNumber: normalizedArticleNumber,
      quantity: parseFloat(quantity),
      unit,
      location,
      description: description || '', // Include description from database lookup
      timestamp: new Date().toISOString()
    });

    // Reset form
    setQuantity('');
    setUnit('Stück');
    setLocation(defaultLocation);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Materialentnahme</h2>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Artikelnummer *
              </label>
              <input
                ref={articleInputRef}
                type="text"
                inputMode="numeric"
                value={editableArticleNumber}
                onChange={(e) => setEditableArticleNumber(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-accent-300"
                placeholder="z.B. 4102560010386"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {initialArticleNumber ? 'Sie können die gescannte Nummer hier korrigieren' : 'Bitte Artikelnummer eingeben'}
              </p>
            </div>

            {/* Material Description (read-only) */}
            {description && (
              <div className="mb-4">
                <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                  Materialbeschreibung
                </label>
                <div className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white">
                  {description}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Aus Artikeldatenbank geladen
                </p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Menge *
              </label>
              <input
                ref={quantityInputRef}
                type="number"
                inputMode="decimal"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="z.B. 5 oder 2.5"
                className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-300"
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Einheit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-300"
              >
                <option value="Stück">Stück</option>
                <option value="Meter">Meter</option>
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                Lagerort *
              </label>

              {showLocationCreation ? (
                // Quick add location interface
                <div className="space-y-2">
                  <input
                    type="text"
                    value={newLocationName}
                    onChange={(e) => setNewLocationName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateLocation()}
                    placeholder="Neuer Lagerort (z.B. A1, B5)..."
                    className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-300"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCreateLocation}
                      className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-semibold border-2"
                      style={{ borderColor: 'rgb(193, 218, 81)' }}
                    >
                      OK
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowLocationCreation(false);
                        setNewLocationName('');
                      }}
                      className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              ) : (
                // Location selection (dropdown or empty state with same layout)
                <div>
                  <div className="flex gap-2">
                    {locations.length === 0 ? (
                      <input
                        type="text"
                        value=""
                        disabled
                        placeholder="Noch keine Lagerorte vorhanden"
                        className="flex-1 px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                      />
                    ) : (
                      <select
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="flex-1 px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-300"
                      >
                        {locations.map(loc => (
                          <option key={loc.id} value={loc.name}>{loc.name}</option>
                        ))}
                      </select>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowLocationCreation(true)}
                      className="px-4 py-3 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors text-xl font-semibold"
                      title="Neuen Lagerort hinzufügen"
                    >
                      +
                    </button>
                  </div>
                  {locations.length === 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Klicken Sie auf '+' um einen neuen Lagerort zu erstellen
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Show rescan button only if this was a scanned article */}
            {wasScanned && onRescan && (
              <div className="mb-3">
                <button
                  type="button"
                  onClick={onRescan}
                  className="w-full px-6 py-3 text-lg bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center gap-2"
                >
                  <span>📷</span>
                  <span>Erneut scannen</span>
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
                  Barcode wurde falsch gescannt? Hier neu scannen
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-6 py-3 text-lg bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
              >
                Schließen
              </button>
              <button
                type="submit"
                className="flex-1 px-6 py-3 text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-semibold border-3"
                style={{ borderWidth: '3px', borderColor: 'rgb(193, 218, 81)' }}
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
