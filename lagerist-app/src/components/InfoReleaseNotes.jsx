import { useState } from 'react';
import { useSwipe } from '../utils/useSwipe';

export default function InfoReleaseNotes({ onClose, onCloseAll }) {
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
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Info & Release Notes</h2>
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

          {/* App Info */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-4">
              <img src="/Lagerist_Logo.png" alt="Lagerist Logo" className="h-16 w-16 rounded-lg" />
              <div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-white">Lagerist</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Materialverwaltung & Entnahme-Tracking</p>
              </div>
            </div>

            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <p>
                <strong>Lagerist</strong> ist eine Progressive Web App (PWA) zur schnellen und einfachen Erfassung von Materialentnahmen mit Barcode-Scanner-Unterstützung.
              </p>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mt-4">
                <h4 className="font-semibold mb-2 text-gray-800 dark:text-white">Hauptfunktionen:</h4>
                <ul className="space-y-1 text-sm list-disc list-inside">
                  <li>Barcode-Scanning über Gerätekamera</li>
                  <li>Manuelle Materialerfassung</li>
                  <li>Mehrere Auftragslisten parallel verwalten</li>
                  <li>Artikeldatenbanken mit CSV-Import</li>
                  <li>Flexible Lagerortverwaltung</li>
                  <li>CSV & E-Mail Export</li>
                  <li>Offline-fähig (PWA)</li>
                  <li>Dark/Light Mode</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="bg-blue-50 dark:bg-blue-900 dark:bg-opacity-20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex gap-2">
              <span className="text-blue-600 dark:text-blue-400 text-lg">ℹ️</span>
              <div className="flex-1 text-sm text-blue-800 dark:text-blue-300">
                <p>
                  <strong>Hinweis:</strong> Diese App speichert alle Daten lokal auf Ihrem Gerät in IndexedDB.
                  Keine Daten werden an externe Server übertragen.
                </p>
              </div>
            </div>
          </div>

          {/* Release Notes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Release Notes</h3>

            {/* Version 2025.07 */}
            <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-full text-sm font-bold border-2" style={{ borderColor: 'rgb(193, 218, 81)' }}>
                  Version 2025.07
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">November 2025 • Aktuell</span>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">🎉 Neue Features</h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside ml-2">
                    <li><strong>Backup & Wiederherstellung:</strong> Vollständiges Backup-System zum Sichern und Wiederherstellen aller Daten (Auftragslisten, Datenbanken, Lagerorte, Einstellungen)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">🔧 Verbesserungen</h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside ml-2">
                    <li><strong>Aktive Liste immer oben:</strong> In der Auftragsverwaltung wird die aktive Liste automatisch an erster Stelle angezeigt</li>
                    <li><strong>Menü bleibt geöffnet:</strong> Beim Wechseln von Auftragslisten und Dark/Light Mode bleibt das Menü geöffnet</li>
                    <li><strong>Menü Navigation verbessert:</strong> Menüs können durch swipegeste nach links geschlossen werden</li>
                    <li><strong>Einheitliches Design:</strong> Toggle-Switches in Export-Einstellungen, Artikeldatenbanken und E-Mail-Empfängern.</li>
                    <li><strong>Styled Modals:</strong> Alle System-Dialoge (Alerts, Bestätigungen) verwenden jetzt das App-Design</li>
                    <li><strong>Bessere Button-Layouts:</strong> OK/Abbrechen-Buttons beim Umbenennen jetzt unterhalb der Eingabefelder (besser auf kleinen Bildschirmen)</li>
                    <li><strong>Kompakteres Menü:</strong> Optimierte Button-Größen für bessere Übersicht ohne Scrollen</li>
                    <li><strong>Reorganisierte Export-Einstellungen:</strong> Übersichtlichere Gruppierung von CSV und E-Mail Optionen</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Version 2025.06 */}
            <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-semibold">
                  Version 2025.06
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">🔧 Verbesserungen</h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside ml-2">
                    <li>Anpassung der Menüanimationen für ein flüssigeres Nutzererlebnis</li>
                    <li>E-Mail Empfängerliste wird alphabetisch mit Buchstaben-Headern gruppiert</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">🐛 Bugfixes</h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside ml-2">
                    <li><strong>E-Mail Einstellungen:</strong> Standardnachricht und Empfängerliste geht nach App-Neustart nicht mehr verloren</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Version 2025.05 */}
            <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-semibold">
                  Version 2025.05
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">🎉 Neue Features</h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside ml-2">
                    <li><strong>Vollständige Offline-Funktionalität:</strong> App funktioniert komplett ohne Internetverbindung</li>
                    <li><strong>Service Worker Integration:</strong> Automatisches Caching aller App-Dateien für Offline-Nutzung</li>
                    <li><strong>Progressive Web App (PWA):</strong> Installierbar auf dem Homescreen mit nativer App-Erfahrung</li>
                    <li><strong>Automatische Updates:</strong> Neue Versionen werden automatisch im Hintergrund geladen</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">🔧 Verbesserungen</h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside ml-2">
                    <li>App startet auch ohne Internetverbindung</li>
                    <li>Alle Daten und Funktionen offline verfügbar</li>
                    <li>Schnellere Ladezeiten durch intelligentes Caching</li>
                    <li>Optimierte PWA-Konfiguration für mobile Geräte</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Version 2025.04 */}
            <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-semibold">
                  Version 2025.04
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">🎉 Neue Features</h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside ml-2">
                    <li><strong>CSV-Import-Vorschau:</strong> Zeigt die ersten 10 Zeilen einer CSV-Datei vor dem Import an</li>
                    <li><strong>Kopfzeilen überspringen:</strong> Möglichkeit, eine bestimmte Anzahl von Zeilen zu überspringen (z.B. Spaltenüberschriften)</li>
                    <li><strong>Visuelle Status-Anzeige:</strong> Farbkodierte Vorschau zeigt, welche Zeilen importiert werden (grün), übersprungen werden (rot) oder ungültig sind (gelb)</li>
                    <li><strong>Pagination für Artikeldatenbank:</strong> 100 Artikel pro Seite mit intelligenter Navigation</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">🐛 Bugfixes</h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside ml-2">
                    <li><strong>Absturz bei großen Datenbanken behoben:</strong> App stürzt nicht mehr ab beim Ansehen von Datenbanken mit tausenden Artikeln</li>
                    <li><strong>Performance-Optimierung:</strong> Nur noch 100 Artikel werden gleichzeitig gerendert statt alle</li>
                    <li><strong>CSV-Import verbessert:</strong> Spaltenüberschriften werden nicht mehr versehentlich als Artikel importiert</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">🔧 Verbesserungen</h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside ml-2">
                    <li>Seitennavigation mit Vorherige/Nächste Buttons und Seitenzahlen</li>
                    <li>Anzeige "Zeige 1-100 von 25.348" für bessere Übersicht</li>
                    <li>Suche funktioniert weiterhin über alle Artikel und springt automatisch zu Seite 1</li>
                    <li>Responsive Pagination-Controls für Mobile und Desktop</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Version 2025.03 */}
            <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-semibold">
                  Version 2025.03
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">🎉 Neue Features</h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside ml-2">
                    <li><strong>Intelligente Barcode-Verarbeitung:</strong> Führende Nullen werden automatisch von gescannten Barcodes entfernt</li>
                    <li><strong>Flexible Artikelsuche:</strong> Produkte können auch über die letzten relevanten Stellen der Artikelnummer gefunden werden</li>
                    <li><strong>Normalisierung bei CSV-Import:</strong> Importierte Artikelnummern werden automatisch normalisiert</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">🔧 Verbesserungen</h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside ml-2">
                    <li>Optimierte Darstellung von Artikelnummern ohne unnötige führende Nullen</li>
                    <li>Verbesserte Benutzerfreundlichkeit bei der manuellen Eingabe</li>
                    <li>Konsistente Artikelnummern-Formatierung in allen Bereichen der App</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Version 2025.02 */}
            <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-semibold">
                  Version 2025.02
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">🎉 Neue Features</h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside ml-2">
                    <li><strong>Lagerortverwaltung:</strong> Lagerorte können nun frei erstellt, umbenannt und gelöscht werden</li>
                    <li><strong>Schnellerfassung:</strong> Neue Lagerorte können direkt beim Erfassen von Materialien angelegt werden</li>
                    <li><strong>Auto-Erstellung:</strong> CSV-Import erstellt automatisch neue Lagerorte aus der ersten Spalte</li>
                    <li><strong>Exporteinstellungen:</strong> Separate Kontrolle über CSV/Email Export-Buttons und Zeitstempel-Einbeziehung</li>
                    <li><strong>E-Mail Einstellungen:</strong> Anlegen von Empfängerlisten, Festlegen von Standardempfängern und festlegen einer Standardnachricht sind nun möglich</li>
                    <li><strong>HTML E-Mail Tabellen:</strong> E-Mail Export verwendet nun professionell formatierte HTML-Tabellen</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white mb-2">🔧 Verbesserungen</h4>
                  <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside ml-2">
                    <li>Keine hardcoded Lagerorte mehr (D10/D90) - vollständig flexibel</li>
                    <li>Verbesserte Menü-Struktur mit logischer Reihenfolge</li>
                    <li>Optimiertes Layout für Lagerort-Schnellerfassung</li>
                    <li>Separate Zeitstempel-Einstellungen für CSV und E-Mail</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Version 2025.01 */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-semibold">
                  Version 2025.01
                </span>
              </div>

              <p className="text-sm text-gray-700 dark:text-gray-300">
                🚀 Erster offizieller Release der Lagerist App mit allen Grundfunktionen:
                Barcode-Scanning, Materialerfassung, Auftragslisten, Artikeldatenbanken, CSV/E-Mail Export, Dark Mode und PWA-Unterstützung.
              </p>
            </div>
          </div>

          
        </div>
      </div>
    </div>
  );
}
