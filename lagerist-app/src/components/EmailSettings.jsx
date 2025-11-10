import { useState } from 'react';
import ConfirmModal from './ConfirmModal';
import { useSwipe } from '../utils/useSwipe';

export default function EmailSettings({ settings, onUpdateSettings, onClose, onCloseAll }) {
  const [newRecipientName, setNewRecipientName] = useState('');
  const [newRecipientEmail, setNewRecipientEmail] = useState('');
  const [editingRecipientId, setEditingRecipientId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [confirmModal, setConfirmModal] = useState(null);

  const recipients = settings.recipients || [];
  const defaultRecipients = settings.defaultRecipients || [];
  const defaultMessage = settings.defaultMessage || '';

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

  const handleAddRecipient = () => {
    if (!newRecipientName.trim()) {
      alert('Bitte geben Sie einen Namen ein');
      return;
    }
    if (!newRecipientEmail.trim()) {
      alert('Bitte geben Sie eine E-Mail-Adresse ein');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newRecipientEmail.trim())) {
      alert('Bitte geben Sie eine gültige E-Mail-Adresse ein');
      return;
    }

    const newRecipient = {
      id: `recipient_${Date.now()}`,
      name: newRecipientName.trim(),
      email: newRecipientEmail.trim()
    };

    onUpdateSettings({
      ...settings,
      recipients: [...recipients, newRecipient]
    });

    setNewRecipientName('');
    setNewRecipientEmail('');
  };

  const handleDeleteRecipient = (recipientId) => {
    onUpdateSettings({
      ...settings,
      recipients: recipients.filter(r => r.id !== recipientId),
      defaultRecipients: defaultRecipients.filter(id => id !== recipientId)
    });
  };

  const handleEditRecipient = (recipientId) => {
    if (!editName.trim()) {
      alert('Bitte geben Sie einen Namen ein');
      return;
    }
    if (!editEmail.trim()) {
      alert('Bitte geben Sie eine E-Mail-Adresse ein');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editEmail.trim())) {
      alert('Bitte geben Sie eine gültige E-Mail-Adresse ein');
      return;
    }

    onUpdateSettings({
      ...settings,
      recipients: recipients.map(r =>
        r.id === recipientId
          ? { ...r, name: editName.trim(), email: editEmail.trim() }
          : r
      )
    });

    setEditingRecipientId(null);
    setEditName('');
    setEditEmail('');
  };

  const startEdit = (recipient) => {
    setEditingRecipientId(recipient.id);
    setEditName(recipient.name);
    setEditEmail(recipient.email);
  };

  const handleToggleDefault = (recipientId) => {
    const isDefault = defaultRecipients.includes(recipientId);

    onUpdateSettings({
      ...settings,
      defaultRecipients: isDefault
        ? defaultRecipients.filter(id => id !== recipientId)
        : [...defaultRecipients, recipientId]
    });
  };

  const handleUpdateMessage = (message) => {
    onUpdateSettings({
      ...settings,
      defaultMessage: message
    });
  };

  // Gruppiere Empfänger nach Anfangsbuchstaben (Telefonbuch-Stil)
  const groupRecipientsByLetter = () => {
    const sorted = [...recipients].sort((a, b) => a.name.localeCompare(b.name, 'de'));
    const grouped = {};

    sorted.forEach(recipient => {
      const firstLetter = recipient.name.charAt(0).toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(recipient);
    });

    return grouped;
  };

  const groupedRecipients = groupRecipientsByLetter();
  const letters = Object.keys(groupedRecipients).sort();

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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">E-Mail Einstellungen</h2>
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

          {/* Default Message */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Standard-Nachricht</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Diese Nachricht wird am Anfang jeder E-Mail eingefügt
            </p>
            <textarea
              value={defaultMessage}
              onChange={(e) => handleUpdateMessage(e.target.value)}
              placeholder="z.B. Hallo, anbei die Materialentnahmen..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-300 resize-none"
            />
          </div>

          {/* Add New Recipient */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Neuen Empfänger hinzufügen</h3>
            <div className="space-y-2">
              <input
                type="text"
                value={newRecipientName}
                onChange={(e) => setNewRecipientName(e.target.value)}
                placeholder="Name (z.B. Max Mustermann, Lager)"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-300"
              />
              <div className="flex gap-2">
                <input
                  type="email"
                  value={newRecipientEmail}
                  onChange={(e) => setNewRecipientEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddRecipient()}
                  placeholder="E-Mail (z.B. lager@firma.de)"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-300"
                />
                <button
                  onClick={handleAddRecipient}
                  className="px-4 py-2 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors flex items-center justify-center text-2xl font-semibold"
                  title="Empfänger hinzufügen"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Recipients List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">E-Mail Empfänger</h3>
            {recipients.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p className="text-lg mb-2">Keine Empfänger vorhanden</p>
                <p className="text-sm">Fügen Sie einen neuen Empfänger hinzu</p>
              </div>
            ) : (
              <div className="space-y-4">
                {letters.map((letter) => (
                  <div key={letter}>
                    {/* Buchstaben-Header */}
                    <div className="sticky top-0 bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg mb-2">
                      <h4 className="text-xl font-bold text-gray-900 dark:text-white">{letter}</h4>
                    </div>

                    {/* Empfänger unter diesem Buchstaben */}
                    <div className="space-y-3 ml-2">
                      {groupedRecipients[letter].map((recipient) => (
                        <div
                          key={recipient.id}
                          className="border rounded-lg p-4 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
                        >
                          {editingRecipientId === recipient.id ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="Name"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-300"
                                autoFocus
                              />
                              <input
                                type="email"
                                value={editEmail}
                                onChange={(e) => setEditEmail(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleEditRecipient(recipient.id)}
                                placeholder="E-Mail"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-300"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleEditRecipient(recipient.id)}
                                  className="flex-1 px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded hover:bg-gray-50 dark:hover:bg-gray-600 text-sm font-semibold border-2"
                                  style={{ borderColor: 'rgb(193, 218, 81)' }}
                                >
                                  OK
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingRecipientId(null);
                                    setEditName('');
                                    setEditEmail('');
                                  }}
                                  className="flex-1 px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                                >
                                  Abbrechen
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{recipient.name}</h4>
                                    {defaultRecipients.includes(recipient.id) && (
                                      <span className="px-2 py-0.5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs rounded font-semibold border-2" style={{ borderColor: 'rgb(193, 218, 81)' }}>
                                        Standard
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{recipient.email}</p>
                                </div>
                              </div>

                              {/* Als Standard Toggle */}
                              <div className="mb-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                                <label className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                  <span className="text-base text-gray-700 dark:text-gray-300">Als Standard-Empfänger verwenden</span>
                                  <div className="relative">
                                    <input
                                      type="checkbox"
                                      checked={defaultRecipients.includes(recipient.id)}
                                      onChange={() => handleToggleDefault(recipient.id)}
                                      className="sr-only peer"
                                    />
                                    <div className="w-14 h-8 bg-gray-300 dark:bg-gray-600 rounded-full peer peer-checked:bg-accent-500 transition-colors"></div>
                                    <div className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full transition-transform peer-checked:translate-x-6"></div>
                                  </div>
                                </label>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-2 flex-wrap">
                                <button
                                  onClick={() => startEdit(recipient)}
                                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
                                >
                                  Bearbeiten
                                </button>
                                <button
                                  onClick={() => setConfirmModal({
                                    message: `Empfänger "${recipient.name}" wirklich löschen?`,
                                    onConfirm: () => {
                                      handleDeleteRecipient(recipient.id);
                                      setConfirmModal(null);
                                    },
                                    onCancel: () => setConfirmModal(null)
                                  })}
                                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                                >
                                  Löschen
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
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
                  <strong>Hinweis:</strong> Bei aktiviertem Standard-Empfänger werden E-Mails automatisch an diese Adresse(n) gesendet. Ohne Standard-Empfänger wird Ihr Standard-E-Mail-Programm ohne vorausgefüllte Empfänger geöffnet.
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
