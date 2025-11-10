# Lagerist - Materialentnahmen Web-App

Eine mobilfreundliche Web-App zur Erfassung von Materialentnahmen mit Barcode-Scanning, entwickelt mit React und Tailwind CSS.

## Funktionen

- **Barcode/QR-Code Scanning**: Nutzt die Handykamera zum Scannen von Barcodes
- **Manuelle Eingabe**: Alternative zur Barcode-Erfassung
- **Formular für Materialentnahmen**:
  - Menge (numerisch mit Dezimalstellen)
  - Einheit (Stück oder Meter)
  - Lagerort (Frei gestaltbar)
- **Materialübersicht**: Tabellarische Darstellung aller erfassten Entnahmen
- **Export-Funktionen**:
  - CSV-Export (für Excel)
  - PDF-Export
  - E-Mail-Versand (mailto)
- **Persistente Speicherung**: Daten werden im Browser-LocalStorage gespeichert
- **Responsive Design**: Optimiert für mobile Endgeräte (iOS/Android)

## Installation

### Voraussetzungen

- Node.js (v14 oder höher)
- npm oder yarn

### Schritte

1. **Projekt-Verzeichnis öffnen**:
   ```bash
   cd /Users/florianhorbelt/Documents/Xcode/Lagerist/lagerist-app
   ```

2. **Dependencies sind bereits installiert**. Falls nötig, neu installieren:
   ```bash
   npm install
   ```

3. **Entwicklungsserver starten**:
   ```bash
   npm run dev
   ```

4. **Im Browser öffnen**:
   - Die App läuft standardmäßig auf `http://localhost:5173`
   - Im Terminal wird die genaue URL angezeigt

## Verwendung

### Lokal testen (Desktop)

1. Starten Sie den Dev-Server mit `npm run dev`
2. Öffnen Sie die angezeigte URL im Browser
3. Für Barcode-Tests können Sie Online-Barcode-Generatoren nutzen

### Auf dem Handy testen

Es gibt mehrere Möglichkeiten, die App auf dem Handy zu testen:

#### Methode 1: Im gleichen WLAN-Netzwerk

1. Stellen Sie sicher, dass Mac und Handy im gleichen WLAN sind
2. Starten Sie den Dev-Server: `npm run dev -- --host`
3. Im Terminal sehen Sie mehrere URLs, z.B.:
   ```
   Local:   http://localhost:5173
   Network: http://192.168.1.xxx:5173
   ```
4. Öffnen Sie die Network-URL auf Ihrem Handy

#### Methode 2: Über ngrok (einfachste Methode)

1. Installieren Sie ngrok: `brew install ngrok` (falls noch nicht installiert)
2. Starten Sie den Dev-Server: `npm run dev`
3. In einem neuen Terminal: `ngrok http 5173`
4. Kopieren Sie die angezeigte HTTPS-URL (z.B. `https://xyz.ngrok.io`) und öffnen Sie sie auf dem Handy

#### Methode 3: Production Build + lokaler Server

1. Build erstellen: `npm run build`
2. Preview-Server starten: `npm run preview -- --host`
3. Verwenden Sie die Network-URL auf dem Handy

### Kamera-Berechtigungen

- Beim ersten Öffnen der Scanner-Funktion wird nach Kamera-Zugriff gefragt
- Erlauben Sie den Zugriff, damit die App Barcodes scannen kann
- Auf iOS: Einstellungen > Safari > Kamera (falls Probleme auftreten)
- Auf Android: Einstellungen > Apps > Chrome/Browser > Berechtigungen > Kamera

## Nutzung der App

1. **Barcode scannen**:
   - Tippen Sie auf "Barcode scannen"
   - Richten Sie die Kamera auf den Barcode
   - Nach erfolgreichem Scan öffnet sich automatisch das Formular

2. **Manuelle Eingabe**:
   - Tippen Sie auf "Manuell eingeben"
   - Geben Sie die Artikelnummer ein
   - Bestätigen Sie mit OK

3. **Material erfassen**:
   - Geben Sie die Menge ein
   - Wählen Sie die Einheit (Stück/Meter)
   - Wählen Sie den Lagerort (D10/D90)
   - Tippen Sie auf "Hinzufügen"

4. **Exportieren**:
   - CSV: Lädt eine Excel-kompatible Datei herunter
   - PDF: Erstellt ein formatiertes PDF-Dokument
   - E-Mail: Öffnet Ihr E-Mail-Programm mit vorausgefülltem Text

5. **Daten verwalten**:
   - Einzelne Einträge löschen: Button "Löschen" in der Zeile
   - Alle Einträge löschen: Button "Alle löschen" oben rechts

## Projektstruktur

```
lagerist-app/
├── src/
│   ├── components/
│   │   ├── BarcodeScanner.jsx    # Barcode-Scanner-Komponente
│   │   ├── EntryForm.jsx          # Eingabeformular
│   │   ├── MaterialsList.jsx      # Materialliste
│   │   ├── ExportButtons.jsx      # Export-Funktionen
│   │   └── JobManager.jsx         # Auftragslisten-Verwaltung
│   ├── App.jsx                     # Hauptkomponente
│   ├── main.jsx                    # React-Einstiegspunkt
│   └── index.css                   # Tailwind CSS
├── public/
│   └── CNAME                       # Custom Domain für GitHub Pages
├── dist/                           # Build-Output (generiert)
├── package.json
├── tailwind.config.js
├── vite.config.js
└── README.md
```

## Technologien

- **React 18**: UI-Framework
- **Vite**: Build-Tool und Dev-Server
- **Tailwind CSS**: Styling
- **@zxing/library**: Barcode/QR-Code Scanning
- **jsPDF**: PDF-Generierung
- **jspdf-autotable**: Tabellen für PDFs
- **LocalStorage**: Persistente Datenspeicherung
- **gh-pages**: Automatisches Deployment auf GitHub Pages

## Tipps & Troubleshooting

### Kamera funktioniert nicht

- Stellen Sie sicher, dass Sie HTTPS verwenden (ngrok tut dies automatisch)
- Chrome und Safari benötigen HTTPS für Kamera-Zugriff (außer localhost)
- Prüfen Sie die Browser-Berechtigungen

### Barcode wird nicht erkannt

- Stellen Sie sicher, dass genug Licht vorhanden ist
- Halten Sie den Barcode ruhig vor die Kamera
- Probieren Sie verschiedene Abstände aus
- Nicht alle Barcode-Typen werden unterstützt (z.B. Data Matrix)

### App lädt nicht auf dem Handy

- Prüfen Sie, ob Mac und Handy im gleichen WLAN sind
- Prüfen Sie die Firewall-Einstellungen auf dem Mac
- Versuchen Sie ngrok als Alternative

### Daten gehen verloren

- Daten werden im LocalStorage gespeichert
- Löschen Sie nicht den Browser-Cache
- Exportieren Sie regelmäßig wichtige Daten

## Production Build & Deployment

### Lokaler Build

Für einen Production Build:

```bash
npm run build
```

Die fertigen Dateien befinden sich im `dist/` Ordner und können auf jedem Webserver gehostet werden.

Um den Build lokal zu testen:

```bash
npm run preview
```

### Deployment auf GitHub Pages

Die App ist live unter: **https://lagerist.hr-eventtechnik.de**

#### Erstmaliges Setup

1. **DNS-Konfiguration** (bereits erledigt):
   - Bei deinem DNS-Provider einen CNAME Record erstellen:
   ```
   Type:  CNAME
   Name:  lagerist
   Value: FHorbelt.github.io
   ```
   - DNS-Änderungen können bis zu 48 Stunden dauern

2. **CNAME-Datei** (bereits konfiguriert):
   - Die Datei `public/CNAME` enthält: `lagerist.hr-eventtechnik.de`
   - Diese wird automatisch beim Build nach `dist/` kopiert

3. **GitHub Pages aktivieren** (bereits erledigt):
   - Repository → Settings → Pages
   - Source: `gh-pages` Branch
   - Custom domain: `lagerist.hr-eventtechnik.de`
   - HTTPS aktivieren (automatisch nach DNS-Propagation)

#### Zukünftige Deployments

Nach Änderungen am Code einfach deployen mit:

```bash
npm run deploy
```

Dieser Befehl führt automatisch aus:
1. `npm run build` - Baut die App neu
2. `gh-pages -d dist` - Pusht den `dist/` Ordner zum `gh-pages` Branch

**Wichtig**: Immer vom `lagerist-app/` Verzeichnis ausführen!

#### Deployment überprüfen

- **GitHub Pages Status**: https://github.com/FHorbelt/Lagerist/deployments
- **Live App**: https://lagerist.hr-eventtechnik.de
- **Fallback URL**: https://FHorbelt.github.io/Lagerist

## Support

Bei Fragen oder Problemen:
- Prüfen Sie die Browser-Konsole auf Fehlermeldungen (F12)
- Stellen Sie sicher, dass alle Dependencies korrekt installiert sind
- Testen Sie in verschiedenen Browsern (Chrome, Safari)

## E-Mail-Konfiguration

Die Standard-E-Mail-Adresse ist `lager@firma.de`. Um diese zu ändern:

1. Öffnen Sie `src/components/ExportButtons.jsx`
2. Suchen Sie nach `mailto:lager@firma.de`
3. Ersetzen Sie die E-Mail-Adresse mit Ihrer gewünschten Adresse

## Lizenz

Dieses Projekt ist für den internen Gebrauch bestimmt.

---

**Entwickelt 2025** - Lagerist Materialverwaltung
