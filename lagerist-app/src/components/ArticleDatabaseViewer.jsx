import { useState, useEffect } from 'react';
import { useSwipe } from '../utils/useSwipe';

export default function ArticleDatabaseViewer({ database, onClose, onUpdateArticles, locations = [], onCreateLocation }) {
  const [articles, setArticles] = useState(database?.articles || []);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editValues, setEditValues] = useState({ articleNumber: '', description: '', location: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewLocationInput, setShowNewLocationInput] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [showAddArticleForm, setShowAddArticleForm] = useState(false);
  const [newArticle, setNewArticle] = useState({ articleNumber: '', description: '', location: '' });
  const [showLocationCreation, setShowLocationCreation] = useState(false);
  const [createLocationName, setCreateLocationName] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 100;

  // Swipe-Geste zum Schließen (von links nach rechts) - zurück zur Artikeldatenbanken-Übersicht
  const swipeContainerRef = useSwipe(() => {
    if (!showAddArticleForm && !showLocationCreation && !showNewLocationInput) {
      // Nur schließen wenn keine Sub-Modals offen sind
      onClose();
    }
  });

  if (!database) return null;

  const defaultLocation = locations.length > 0 ? locations[0].name : '';

  const filteredArticles = articles.filter(article =>
    article.articleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
  const startIndex = (currentPage - 1) * articlesPerPage;
  const endIndex = startIndex + articlesPerPage;
  const currentArticles = filteredArticles.slice(startIndex, endIndex);

  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleEdit = (index) => {
    const article = articles[index];
    setEditingIndex(index);
    setEditValues({
      articleNumber: article.articleNumber,
      description: article.description,
      location: article.location
    });
  };

  const handleSaveEdit = () => {
    if (!editValues.articleNumber.trim() || !editValues.description.trim()) {
      alert('Artikelnummer und Beschreibung dürfen nicht leer sein');
      return;
    }

    const updatedArticles = [...articles];
    updatedArticles[editingIndex] = {
      articleNumber: editValues.articleNumber.trim(),
      description: editValues.description.trim(),
      location: editValues.location
    };
    setArticles(updatedArticles);
    onUpdateArticles(database.id, updatedArticles);
    setEditingIndex(null);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setEditValues({ articleNumber: '', description: '', location: '' });
  };

  const handleDelete = (index) => {
    const article = articles[index];
    if (window.confirm(`Artikel "${article.description}" (${article.articleNumber}) wirklich löschen?`)) {
      const updatedArticles = articles.filter((_, i) => i !== index);
      setArticles(updatedArticles);
      onUpdateArticles(database.id, updatedArticles);
    }
  };

  const handleAddNew = () => {
    setNewArticle({
      articleNumber: '',
      description: '',
      location: defaultLocation
    });
    setShowAddArticleForm(true);
  };

  const handleSaveNewArticle = () => {
    if (!newArticle.articleNumber.trim() || !newArticle.description.trim()) {
      alert('Artikelnummer und Beschreibung sind erforderlich');
      return;
    }

    if (!newArticle.location.trim()) {
      alert('Bitte wählen Sie einen Lagerort oder erstellen Sie einen neuen');
      return;
    }

    const articleToAdd = {
      articleNumber: newArticle.articleNumber.trim(),
      description: newArticle.description.trim(),
      location: newArticle.location
    };

    const updatedArticles = [...articles, articleToAdd];
    setArticles(updatedArticles);
    onUpdateArticles(database.id, updatedArticles);
    setShowAddArticleForm(false);
    setNewArticle({ articleNumber: '', description: '', location: '' });
  };

  const handleCancelNewArticle = () => {
    setShowAddArticleForm(false);
    setNewArticle({ articleNumber: '', description: '', location: '' });
    setShowLocationCreation(false);
    setCreateLocationName('');
  };

  const handleCreateLocationInForm = () => {
    if (!createLocationName.trim()) {
      alert('Bitte geben Sie einen Lagerort-Namen ein');
      return;
    }

    // Check if location already exists
    if (locations.some(loc => loc.name.toLowerCase() === createLocationName.trim().toLowerCase())) {
      alert('Dieser Lagerort existiert bereits');
      return;
    }

    onCreateLocation(createLocationName.trim());
    setNewArticle({ ...newArticle, location: createLocationName.trim() });
    setCreateLocationName('');
    setShowLocationCreation(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
      <div ref={swipeContainerRef} className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{database.name}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {articles.length} Artikel gesamt • Zeige {startIndex + 1}-{Math.min(endIndex, filteredArticles.length)} von {filteredArticles.length}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Search */}
          <div className="flex gap-2">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Suche nach Artikelnummer oder Beschreibung..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-300"
            />
            <button
              onClick={handleAddNew}
              className="px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors font-semibold"
            >
              + Artikel
            </button>
          </div>
        </div>

        {/* Articles Table */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredArticles.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <p className="text-lg">Keine Artikel gefunden</p>
              {searchTerm && <p className="text-sm mt-2">Versuchen Sie einen anderen Suchbegriff</p>}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-700">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-600">
                        Artikelnummer
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-600">
                        Beschreibung
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-600">
                        Lagerort
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300 border-b dark:border-gray-600">
                        Aktionen
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentArticles.map((article, index) => {
                      const actualIndex = articles.indexOf(article);
                      const isEditing = editingIndex === actualIndex;

                    return (
                      <tr
                        key={actualIndex}
                        className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        {isEditing ? (
                          <>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={editValues.articleNumber}
                                onChange={(e) => setEditValues({ ...editValues, articleNumber: e.target.value })}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm font-mono"
                              />
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="text"
                                value={editValues.description}
                                onChange={(e) => setEditValues({ ...editValues, description: e.target.value })}
                                className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                              />
                            </td>
                            <td className="px-4 py-3">
                              {locations.length === 0 ? (
                                <div className="text-sm text-gray-500 dark:text-gray-400 italic">Keine Lagerorte verfügbar</div>
                              ) : (
                                <select
                                  value={editValues.location}
                                  onChange={(e) => setEditValues({ ...editValues, location: e.target.value })}
                                  className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                                >
                                  {locations.map(loc => (
                                    <option key={loc.id} value={loc.name}>{loc.name}</option>
                                  ))}
                                </select>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={handleSaveEdit}
                                  className="px-3 py-1 bg-accent-500 text-white rounded hover:bg-accent-600 text-xs"
                                >
                                  Speichern
                                </button>
                                <button
                                  onClick={handleCancelEdit}
                                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-xs"
                                >
                                  Abbrechen
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-4 py-3 text-sm font-mono dark:text-gray-300">
                              {article.articleNumber}
                            </td>
                            <td className="px-4 py-3 text-sm dark:text-gray-300">
                              {article.description}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold dark:text-gray-300">
                              {article.location}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEdit(actualIndex)}
                                  className="px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-50 dark:hover:bg-gray-600 text-xs border-2"
                                  style={{ borderColor: 'rgb(193, 218, 81)' }}
                                >
                                  Bearbeiten
                                </button>
                                <button
                                  onClick={() => handleDelete(actualIndex)}
                                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs"
                                >
                                  Löschen
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t dark:border-gray-700 pt-4">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-semibold border-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ borderColor: 'rgb(193, 218, 81)' }}
                >
                  ← Vorherige
                </button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Seite {currentPage} von {totalPages}
                  </span>

                  {/* Page number buttons (show current and nearby pages) */}
                  <div className="hidden sm:flex gap-1 ml-4">
                    {currentPage > 2 && (
                      <>
                        <button
                          onClick={() => goToPage(1)}
                          className="px-3 py-1 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          1
                        </button>
                        {currentPage > 3 && <span className="px-2 text-gray-500">...</span>}
                      </>
                    )}

                    {currentPage > 1 && (
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        className="px-3 py-1 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        {currentPage - 1}
                      </button>
                    )}

                    <button
                      className="px-3 py-1 rounded text-sm font-bold text-white"
                      style={{ backgroundColor: 'rgb(193, 218, 81)' }}
                    >
                      {currentPage}
                    </button>

                    {currentPage < totalPages && (
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        className="px-3 py-1 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        {currentPage + 1}
                      </button>
                    )}

                    {currentPage < totalPages - 1 && (
                      <>
                        {currentPage < totalPages - 2 && <span className="px-2 text-gray-500">...</span>}
                        <button
                          onClick={() => goToPage(totalPages)}
                          className="px-3 py-1 rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-semibold border-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ borderColor: 'rgb(193, 218, 81)' }}
                >
                  Nächste →
                </button>
              </div>
            )}
          </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
          >
            Schließen
          </button>
        </div>
      </div>

      {/* Add Article Modal */}
      {showAddArticleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[80] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">Neuer Artikel</h2>

              <form onSubmit={(e) => { e.preventDefault(); handleSaveNewArticle(); }}>
                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                    Artikelnummer *
                  </label>
                  <input
                    type="text"
                    value={newArticle.articleNumber}
                    onChange={(e) => setNewArticle({ ...newArticle, articleNumber: e.target.value })}
                    className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-accent-300"
                    placeholder="z.B. 4102560010386"
                    autoFocus
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                    Beschreibung *
                  </label>
                  <input
                    type="text"
                    value={newArticle.description}
                    onChange={(e) => setNewArticle({ ...newArticle, description: e.target.value })}
                    className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-300"
                    placeholder="Artikelbeschreibung..."
                  />
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
                        value={createLocationName}
                        onChange={(e) => setCreateLocationName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateLocationInForm()}
                        placeholder="Neuer Lagerort (z.B. A1, B5)..."
                        className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-300"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleCreateLocationInForm}
                          className="flex-1 px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-semibold border-2"
                          style={{ borderColor: 'rgb(193, 218, 81)' }}
                        >
                          OK
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowLocationCreation(false);
                            setCreateLocationName('');
                          }}
                          className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                        >
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Location selection
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
                            value={newArticle.location}
                            onChange={(e) => setNewArticle({ ...newArticle, location: e.target.value })}
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

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleCancelNewArticle}
                    className="flex-1 px-6 py-3 text-lg bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 text-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-semibold border-3"
                    style={{ borderWidth: '3px', borderColor: 'rgb(193, 218, 81)' }}
                  >
                    Speichern
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
