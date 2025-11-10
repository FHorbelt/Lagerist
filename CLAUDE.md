# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Lagerist is a mobile-friendly Progressive Web App (PWA) for tracking material withdrawals with barcode scanning capabilities. Built with React, Vite, and Tailwind CSS, it features dark mode support, IndexedDB persistence, and runs as a single-page application.

**Current Version**: 2025.07 (displayed in app burger menu footer)

**Key Features**:
- Barcode scanning with camera access and rescan capability
- Intelligent barcode processing (automatic leading zeros removal)
- Flexible article search (matches by last 6 digits)
- Dark/Light mode with IndexedDB persistence
- Multiple job/list management with modal interfaces (active list always displayed first)
- Multiple article database support with CSV import and preview
- CSV import preview with skip lines functionality (for headers)
- Pagination for large article databases (100 articles per page)
- Flexible location management (create/rename/delete custom locations)
- CSV and email export with configurable settings (toggle switches)
- Email settings with recipient management (toggle switches for defaults)
- **Backup & Restore system** for all app data (jobs, databases, locations, settings)
- PWA installable on mobile devices
- Animated slide-in burger menu (stays open for list/mode switching)
- **Styled modals** for all user interactions (alerts, confirmations, inputs)
- Modern **toggle switches** for all activation options

**German Language**: All UI text, component names, and user-facing content are in German. Variable names and code comments use German terminology (e.g., "Auftragsliste", "Materialentnahmen", "Lagerort").

## Repository Structure

```
/
├── lagerist-app/          # Main React application (work here)
│   ├── src/
│   │   ├── App.jsx        # Root component with job management & dark mode state
│   │   ├── components/
│   │   │   ├── BarcodeScanner.jsx          # @zxing/library camera integration
│   │   │   ├── EntryForm.jsx               # Material entry form with numeric keyboards & location creation
│   │   │   ├── MaterialsList.jsx           # Materials table display
│   │   │   ├── ExportButtons.jsx           # CSV/Email export logic
│   │   │   ├── JobManager.jsx              # Job/list management UI
│   │   │   ├── ArticleDatabaseManager.jsx  # Article database CRUD operations with CSV preview
│   │   │   ├── ArticleDatabaseViewer.jsx   # View/edit/add articles with pagination (100 per page)
│   │   │   ├── LocationManager.jsx         # Location CRUD operations
│   │   │   ├── ExportSettings.jsx          # Export configuration UI with toggle switches
│   │   │   ├── EmailSettings.jsx           # Email recipient & message settings with toggle switches
│   │   │   ├── BackupManager.jsx           # Backup & restore functionality for all app data
│   │   │   ├── AlertModal.jsx              # Styled alert modal (replaces browser alerts)
│   │   │   ├── ConfirmModal.jsx            # Styled confirmation modal (replaces browser confirms)
│   │   │   └── InfoReleaseNotes.jsx        # App info and version history
│   │   ├── utils/
│   │   │   ├── indexedDB.js      # IndexedDB wrapper for persistent storage
│   │   │   └── articleUtils.js   # Article number normalization and search
│   │   ├── main.jsx       # React entry point
│   │   └── index.css      # Tailwind directives
│   ├── public/
│   │   ├── CNAME          # GitHub Pages custom domain
│   │   ├── manifest.json  # PWA manifest
│   │   └── Lagerist_Logo.png  # App logo (1MB, used for favicon & PWA)
│   ├── dist/              # Build output (generated)
│   ├── vite.config.js     # Vite config with base URL
│   ├── tailwind.config.js # Tailwind with dark mode: 'class' and custom accent color
│   └── package.json       # Dependencies & deployment scripts
└── CLAUDE.md              # This file
```

## Development Commands

All commands must be run from the `lagerist-app/` directory:

```bash
cd lagerist-app

# Development
npm run dev              # Start dev server at http://localhost:5173
npm run dev -- --host    # Expose to network (for mobile testing)

# Building
npm run build           # Build production bundle to dist/ (vite build)
npm run preview         # Preview production build locally
npm run preview -- --host  # Preview with network access

# Code Quality
npm run lint            # Run ESLint

# Deployment
npm run deploy          # Build and deploy to GitHub Pages
                        # (runs predeploy hook automatically)
```

## Key Architecture Patterns

### State Management

**App.jsx** is the central state container:
- Uses React hooks (`useState`, `useEffect`) for all state
- No external state management library (Redux, Zustand, etc.)
- **Persistence via IndexedDB** (migrated from localStorage) with object stores:
  - `jobs` - Job objects with embedded materials
  - `materials` - Materials for each job (keyed by job ID)
  - `articleDatabases` - Article database objects
  - `settings` - Key-value pairs (currentJobId, activeDatabaseIds, darkMode)

**App State Variables**:
```javascript
const [jobs, setJobs] = useState([]);
const [currentJobId, setCurrentJobId] = useState(null);
const [isScanning, setIsScanning] = useState(false);
const [scannedArticle, setScannedArticle] = useState(null);
const [showForm, setShowForm] = useState(false);
const [entryMode, setEntryMode] = useState('scan'); // 'scan' or 'manual'
const [darkMode, setDarkMode] = useState(false);
const [showMenu, setShowMenu] = useState(false);
const [isMenuClosing, setIsMenuClosing] = useState(false); // Menu slide-out animation
const [showDatabaseManager, setShowDatabaseManager] = useState(false);
const [showJobManager, setShowJobManager] = useState(false);
const [showExportSettings, setShowExportSettings] = useState(false);
const [showLocationManager, setShowLocationManager] = useState(false);
const [showInfo, setShowInfo] = useState(false);
const [showEmailSettings, setShowEmailSettings] = useState(false);
const [showCreateJobModal, setShowCreateJobModal] = useState(false);
const [newJobName, setNewJobName] = useState('');
const [articleDatabases, setArticleDatabases] = useState([]); // Multiple databases
const [activeDatabaseIds, setActiveDatabaseIds] = useState([]); // Active database IDs
const [locations, setLocations] = useState([]); // Available storage locations
const [dbInitialized, setDbInitialized] = useState(false);
const [formKey, setFormKey] = useState(0); // Force form re-render
const [exportSettings, setExportSettings] = useState({
  showCsvExport: true,
  showEmailExport: true,
  csvIncludeTimestamp: false,
  emailIncludeTimestamp: false
});
const [emailSettings, setEmailSettings] = useState({
  recipients: [],
  defaultRecipients: [],
  defaultMessage: ''
});
```

**Job Structure**:
```javascript
{
  id: "timestamp_string",
  name: "Auftragsliste DD.MM.YYYY",
  materials: [...],
  createdAt: "ISO_timestamp",
  lastModified: "ISO_timestamp"
}
```

**Material Structure**:
```javascript
{
  id: "timestamp_string",
  articleNumber: "normalized_number", // Leading zeros removed
  quantity: "numeric_string",
  unit: "Stück" | "Meter",
  location: "string", // User-defined location name
  description: "string", // From article database lookup
  timestamp: "ISO_timestamp"
}
```

**Location Structure**:
```javascript
{
  id: "loc_timestamp_string",
  name: "string", // User-defined location name (e.g., "A1", "D10", "Lager West")
  createdAt: "ISO_timestamp"
}
```

**Article Database Structure**:
```javascript
{
  id: "timestamp_string",
  name: "Database name",
  articles: [...], // Array of article objects
  createdAt: "ISO_timestamp",
  lastModified: "ISO_timestamp"
}
```

**Article Structure**:
```javascript
{
  articleNumber: "normalized_number", // Leading zeros removed
  description: "string",
  location: "string" // User-defined location name
}
```

### Component Communication

- **Props drilling**: All components receive callbacks from App.jsx
- **No context providers**: Simple parent-child prop passing
- **Form submission pattern**: Components call `onSubmit(data)` with structured objects

### UI Components and Layouts

**Burger Menu** (App.jsx):
- Slides in from right side with `animate-slideInRight` animation
- Full-screen overlay on mobile, fixed width (sm:w-96) on larger screens
- Includes logo, "Lagerist App" subtitle, and version footer (2025.07)
- Slide-out animation on close via `isMenuClosing` state and `handleCloseMenu()`
- **Stays open** when switching job lists or dark/light mode (no auto-close)
- Compact button design for all menu items to fit without scrolling
- Menu items: Auftragslisten, Artikeldatenbanken, Lagerortverwaltung, Backup & Wiederherstellung, Exporteinstellungen, E-Mail Einstellungen, Dark/Light mode toggle, Info & Release Notes

**JobManager** (JobManager.jsx):
- **Full-page layout** (not modal overlay)
- Layout: `fixed inset-0` with flex column structure
- Header: Logo, title "Auftragsverwaltung", subtitle "Lagerist App", back arrow
- Content: Card-based sections for "Neue Auftragsliste erstellen" and "Auftragslisten"
- **Smart sorting**: Active job always displayed first, others sorted by creation date (newest first)
- Shows active job with accent border and "Aktiv" badge
- Actions: Load (for inactive jobs, menu stays open), Rename, Delete
- **Styled modals** for delete confirmation (ConfirmModal with danger type)

**ArticleDatabaseManager** (ArticleDatabaseManager.jsx):
- **Full-page layout** (not modal overlay)
- Same structure as JobManager: header with logo, title, subtitle, back arrow
- Content: Cards for "Neue Artikeldatenbank erstellen" and "Artikeldatenbanken"
- **Toggle switches** to activate/deactivate databases (multiple can be active)
- Actions: View (opens ArticleDatabaseViewer), CSV Import, Rename, Delete
- Shows active databases with accent border and "Aktiv" badge
- **Styled modals** for delete confirmation (ConfirmModal with danger type)
- **CSV Import Preview Modal** (z-[60]): Shows first 10 lines before importing
  - Visual status indicators: green (OK), red (skipped), yellow (invalid format)
  - Number input to skip N lines (e.g., for headers)
  - Table displays: Zeile | Status | Lagerort | Artikelnummer | Beschreibung
  - Format hints and real-time import count
  - Confirm/Cancel buttons
- CSV import automatically normalizes article numbers (removes leading zeros)
- Auto-creates new locations found in CSV import

**ArticleDatabaseViewer** (ArticleDatabaseViewer.jsx):
- **Modal overlay** (z-50) for viewing/editing articles in a database
- **Pagination**: Displays 100 articles per page for optimal performance
  - Handles large databases (32,000+ articles) without crashing
  - Navigation: "Vorherige"/"Nächste" buttons and page numbers
  - Shows "Zeige 1-100 von 32,451" in header
  - Responsive controls (page numbers hidden on mobile)
- Search functionality to filter by article number or description
  - Search automatically resets to page 1
  - Pagination adapts to filtered results
- Table display with edit/delete actions per article
- **Add Article Modal**: Clicking "+ Artikel" opens modal overlay (not prompt)
- Modal includes fields for article number, description, and location
- Inline location creation via + button in article modal
- All editing uses modal overlays matching app design

**LocationManager** (LocationManager.jsx):
- **Full-page layout** for managing storage locations
- Header with logo, title "Lagerortverwaltung", subtitle, back arrow
- Create new locations with input field and + button
- List of existing locations with rename/delete actions
- No default locations - fully user-defined
- Prevents deletion if location is in use by articles or materials
- **Styled modals** for delete confirmation (ConfirmModal with danger type)

**ExportSettings** (ExportSettings.jsx):
- **Full-page layout** for export configuration
- **Modern toggle switches** for all settings (replaces checkboxes)
- Unified "Export-Optionen" section with CSV and E-Mail subsections
- Each export type has: "Im Hauptbereich anzeigen" and "Zeitstempel mit exportieren" toggles
- Changes saved to IndexedDB automatically
- Hover effects on toggle rows for better UX

**EmailSettings** (EmailSettings.jsx):
- **Full-page layout** for email configuration
- Add/remove email recipients to a list (alphabetically grouped with letter headers)
- **Toggle switches** for selecting default recipients (replaces checkboxes)
- Set default message text for email body
- Recipients separated by semicolon in mailto link
- **Styled modals** for delete confirmation (ConfirmModal with danger type)

**BackupManager** (BackupManager.jsx):
- **Full-page layout** for backup and restore functionality
- **Backup creation**: Exports all data (jobs, databases, locations, settings) to JSON file
  - Version stamped (2025.07)
  - Timestamp in ISO format
  - Browser opens file save dialog for user to choose location
- **Backup restore**: Imports JSON file with confirmation modal
  - Validates backup structure
  - Clears existing data before restore
  - Shows summary of restored items
  - Auto-reloads page after successful restore
- **Styled modals** for alerts and confirmations (AlertModal, ConfirmModal)
- Info boxes with backup tips and technical details

**AlertModal** (AlertModal.jsx):
- **Styled alert modal** replacing browser `alert()`
- Types: info (blue), warning (yellow), error (red), success (green)
- Icon and color coding based on type
- Single OK button with auto-focus
- z-index 70 for proper layering

**ConfirmModal** (ConfirmModal.jsx):
- **Styled confirmation modal** replacing browser `confirm()`
- Types: warning, danger (red confirm button), info
- Icon based on type (⚠️ for warning/danger, ℹ️ for info)
- Two buttons: Cancel (gray) and Confirm (styled by type)
- Confirm button auto-focused
- z-index 70 for proper layering

**InfoReleaseNotes** (InfoReleaseNotes.jsx):
- **Full-page layout** showing app information and version history
- Displays current version (2025.07) with release date
- Changelog for versions 2025.07, 2025.06, 2025.05, 2025.04, 2025.03, 2025.02, and 2025.01
- App features overview and data privacy note

**EntryForm** (EntryForm.jsx):
- Modal overlay for material entry after scanning or manual input
- Auto-focuses quantity field if article number present, otherwise article number field
- Live lookup: searches active databases as user types article number
- Shows description from database (read-only) if found
- **Rescan button**: "Erneut scannen" with camera emoji, only shown if entry was from scan
- Rescan calls `onRescan()` to reopen scanner
- **Location management**: Dropdown to select location or + button to create new inline
- Inline location creation modal within the entry form

**Create Job Modal** (App.jsx):
- **Modal overlay** (z-[60]) for creating new job lists
- Replaces browser prompt() with proper modal matching app design
- Single input field for job name with auto-focus
- Erstellen/Abbrechen buttons with accent color styling

### Article Number Utilities

**utils/articleUtils.js** provides article number processing:
- `removeLeadingZeros(articleNumber)`: Normalizes article numbers by removing leading zeros
  - Used throughout the app for consistent article number formatting
  - Returns '0' if input is all zeros
  - Applied to: scanned barcodes, manual entry, CSV import
- `findArticleByNumber(searchNumber, articles)`: Intelligent article search
  - First tries exact match on normalized numbers
  - Then tries matching by last 6 digits (if search is >= 6 digits)
  - Enables flexible searching with partial article numbers
  - Used in live lookup during manual entry

**Key Integration Points**:
- BarcodeScanner.jsx: Normalizes scanned codes before passing to onScan
- EntryForm.jsx: Normalizes before submitting material entry
- ArticleDatabaseManager.jsx: Normalizes during CSV import
- App.jsx: Uses findArticleByNumber for article lookup

### IndexedDB Storage Layer

**utils/indexedDB.js** provides a complete wrapper around IndexedDB:
- Database: `LageristDB` with 5 object stores (jobs, materials, articleDatabases, locations, settings)
- Generic functions: `getFromStore()`, `putToStore()`, `deleteFromStore()`, `clearStore()`
- Specific helpers: `saveJobs()`, `getJobs()`, `saveArticleDatabases()`, `getLocations()`, `saveLocations()`, etc.
- Automatic migration from localStorage on first run (App.jsx:75-108)
- All async operations return Promises

**IMPORTANT**: The app automatically migrates data from localStorage to IndexedDB on first load after upgrade. Old localStorage keys are cleared after successful migration.

### Barcode Scanner Architecture

**BarcodeScanner.jsx** uses `@zxing/library`:
- Accesses camera via `navigator.mediaDevices.getUserMedia()`
- Requires HTTPS (except localhost) for camera permissions
- Implements torch/flashlight toggle if device supports it
- **Normalizes scanned codes**: Removes leading zeros using `removeLeadingZeros()` before calling `onScan()`
- Automatically calls `onScan(normalizedArticleNumber)` on successful read
- Cleanup: Stops camera tracks in `useEffect` cleanup

**Mobile Testing Methods**:
1. **Same WiFi**: `npm run dev -- --host` + use Network URL on phone
2. **ngrok tunnel**: `ngrok http 5173` (provides HTTPS for camera access)
3. **Production preview**: `npm run build && npm run preview -- --host`

### Export Functionality

**ExportButtons.jsx** implements two export methods:
- **CSV**: Creates semicolon-separated file with German headers and UTF-8 BOM for Excel compatibility
- **Email**: Opens mailto link with pre-filled German text body and fixed-width formatting

**Default email**: `lager@firma.de` (hardcoded in ExportButtons.jsx:81)

**Note**: PDF export functionality uses jsPDF and jspdf-autotable libraries.

## Mobile-First Design

- **Tailwind CSS** utility classes throughout
- Responsive grid layouts (`grid-cols-2`, `max-w-4xl`)
- Touch-optimized button sizes (`py-4`, `px-6`)
- Fixed overlays for scanner and forms (`fixed`, `z-[50]`, `z-[60]`)
- iOS/Android camera compatibility considerations
- **Numeric keyboards**: `inputMode="numeric"` for article numbers, `inputMode="decimal"` for quantities
- Auto-focus logic: article field for manual entry, quantity field for scanned entries

## Dark Mode Implementation

**Tailwind Dark Mode Strategy**: Uses `class` strategy (not media query)

**Configuration** (`tailwind.config.js`):
```javascript
module.exports = {
  darkMode: 'class',  // CRITICAL: enables class-based dark mode
  // ...
}
```

**Implementation Pattern** (App.jsx:26-44):
1. Load preference from localStorage on mount
2. Apply `dark` class to `document.documentElement`
3. Toggle via burger menu button
4. Persist changes to localStorage

**Dark Mode Classes Applied**:
```javascript
// Example patterns throughout components:
className="bg-gray-50 dark:bg-gray-900"           // Backgrounds
className="text-gray-900 dark:text-white"         // Text
className="bg-yellow-300 dark:bg-gray-800"        // Header
className="border-gray-300 dark:border-gray-600"  // Borders
```

**Important**: After modifying `tailwind.config.js`, restart the dev server for changes to take effect.

**UI Toggle**: Burger menu (☰) in top-right header shows dark/light mode toggle with emoji (🌙/☀️)

## Progressive Web App (PWA) Features

**Manifest** (`public/manifest.json`):
```json
{
  "name": "Lagerist - Materialverwaltung",
  "short_name": "Lagerist",
  "background_color": "#fde047",
  "theme_color": "#fde047",
  "icons": [{"src": "/Lagerist_Logo.png", "sizes": "any", "type": "image/png"}]
}
```

**HTML Integration** (`index.html`):
- Favicon: `/Lagerist_Logo.png`
- Apple touch icon for iOS home screen
- Manifest link
- Theme color meta tag for mobile browsers

**Logo**: `Lagerist_Logo.png` (1MB PNG file in public/ directory)
- Used in header with rounded corners (`rounded-lg`)
- Used as favicon and PWA icon
- Yellow/black color scheme

## Deployment

**GitHub Pages** with custom domain:
- **Live URL**: `https://lagerist.hr-eventtechnik.de`
- **Fallback**: `https://FHorbelt.github.io/Lagerist`
- **CNAME file**: Located in `public/CNAME` (copied to dist/ during build)
- **DNS**: CNAME record pointing `lagerist` to `FHorbelt.github.io`
- **Deploy**: `npm run deploy` (runs build automatically via predeploy hook)
- **Branch**: Deploys to `gh-pages` branch
- **Vite config**: `base: '/'` for custom domain routing

## Important Development Notes

### Camera/HTTPS Requirements
- Camera access requires HTTPS in production
- `vite.config.js` allows ngrok domains (`*.ngrok-free.app`, `*.ngrok.io`)
- Test on localhost or use ngrok for mobile development

### IndexedDB Storage
- App uses IndexedDB for all persistent storage (replaced localStorage)
- No practical size limits (much larger than localStorage's ~5MB)
- Automatic migration from localStorage on first run after upgrade
- Data survives browser cache clearing (unless explicitly deleted)
- Check `dbInitialized` state before any storage operations

### Build Process
- Vite uses `dist/` as output directory
- Build command: `vite build` (standard Vite command)
- Deployment: `gh-pages -d dist` pushes dist/ folder to gh-pages branch
- Tailwind processes via PostCSS (`postcss.config.js`)
- ESLint config uses flat config format (`eslint.config.js`)
- CNAME file is automatically copied from public/ to dist/ during build

### German Localization
- All strings are hardcoded in German
- Date formatting uses `de-DE` locale
- No i18n library - add one if multi-language support needed

## Testing on Mobile Devices

1. Ensure Mac and phone on same WiFi network
2. Check firewall allows port 5173: `/usr/libexec/ApplicationFirewall/socketfilterfw --list`
3. Start with: `npm run dev -- --host`
4. Use Network URL shown in terminal (e.g., `http://192.168.x.x:5173`)
5. If camera issues: verify HTTPS (use ngrok) and browser permissions

## Design & Color Scheme

**Primary Colors**:
- **Custom Accent**: `accent-500` (rgb(193, 218, 81)) - custom brand color defined in tailwind.config.js
- **Accent shades**: accent-50 through accent-900 for variations
- **Dark Gray**: `gray-800` - dark mode header, cards
- **Additional Colors**: Red for close/delete buttons, green for create button, blue for manual entry

**Design Evolution**:
- Originally used yellow-300 (#fde047)
- Updated to custom accent color rgb(193, 218, 81) - a lime/chartreuse shade
- Defined in `tailwind.config.js` as a custom color with full shade range
- All dark mode variants use `dark:` prefix with Tailwind

**Logo Integration**:
- Header: Rounded logo (h-10 w-10) with app title in main header and menu
- Yellow/black color scheme matches overall design

**Animations** (index.css):
- `slideInRight` / `slideOutRight`: Menu slide animations (300ms)
- `fadeIn` / `fadeOut`: Backdrop fade animations (300ms)
- Applied via Tailwind classes: `animate-slideInRight`, `animate-slideOutRight`, etc.
- Used in burger menu for smooth open/close transitions

## Common Modifications

**Update version number**:
- Edit version string in `App.jsx` menu footer (search for "Version 2025")
- Update `InfoReleaseNotes.jsx` with new version and release notes
- Update `CLAUDE.md` with new version number and feature summary

**Change email configuration**:
- Use Email Settings UI in app (burger menu → E-Mail Einstellungen)
- Or edit default in `ExportButtons.jsx` (search for `mailto:`)

**Add barcode types**:
- Modify `BarcodeScanner.jsx` (ZXing supports many formats)

**Manage locations**:
- Use Location Manager UI in app (burger menu → Lagerortverwaltung)
- Or programmatically via `handleCreateLocation()` in App.jsx

**Adjust units**:
- Modify unit dropdown in `EntryForm.jsx` (search for "Einheit")

**Update theme colors**:
- Modify `accent` colors in `tailwind.config.js`
- Update `manifest.json` theme_color and background_color

**Configure exports**:
- Use Export Settings UI in app (burger menu → Exporteinstellungen)
- Toggle CSV/Email buttons visibility and timestamp settings

**Article number normalization**:
- Customize normalization logic in `utils/articleUtils.js`
- Adjust last-N-digits matching by changing the hardcoded `6` in `findArticleByNumber()`

## Troubleshooting & Known Issues

### Dark Mode Not Working
**Symptom**: Toggle button changes text but theme doesn't switch
**Solution**: Restart dev server after modifying `tailwind.config.js`
```bash
# Kill running dev server and restart
npm run dev -- --host
```

### Entry Mode Flow
**Scan mode**: After adding material, scanner automatically reopens
**Manual mode**: After adding material, form automatically reopens with cleared fields
- Controlled by `entryMode` state ('scan' or 'manual')
- Set in `handleScan()` and `handleManualEntry()`
- Manual mode uses `formKey` state to force EntryForm re-render with empty fields
- Applied in `handleAddMaterial()` (App.jsx:246-270)

### Mobile Keyboard Issues
**Issue**: Wrong keyboard appears on mobile
**Solution**: Check `inputMode` attributes:
- Article numbers: `inputMode="numeric"`
- Quantities: `inputMode="decimal"` with `step="0.01"`

### CSV Export Encoding
**Issue**: German umlauts (ä, ö, ü) not displaying in Excel
**Solution**: Already implemented - UTF-8 BOM (`\uFEFF`) prepended to CSV file
- Semicolon (`;`) used as separator for German Excel compatibility

### Large Database Performance (Fixed in 2025.04)
**Previous Issue**: App crashed when viewing databases with 32,000+ articles
**Solution**: Pagination implemented in ArticleDatabaseViewer
- Only 100 articles rendered per page
- Navigation with Previous/Next buttons and page numbers
- Search functionality works across all articles but resets to page 1
- Performance improvement: renders in milliseconds instead of crashing

### CSV Import Headers (Fixed in 2025.04)
**Previous Issue**: CSV files with column headers imported headers as articles
**Solution**: CSV Import Preview Modal with skip lines functionality
- Preview shows first 10 lines before importing
- User can specify number of lines to skip (e.g., 1 for headers)
- Visual indicators show which lines will be imported (green) or skipped (red)
- Format validation helps identify problems before import

### Logo/Icon Updates
When replacing logo:
1. Replace `public/Lagerist_Logo.png`
2. Clear browser cache for favicon update
3. Update `manifest.json` if changing theme colors

### Article Database System
**Multiple Databases**: Users can create multiple article databases and activate/deactivate them
- At least one database must remain active at all times
- Active databases are merged when looking up articles during scanning
- CSV import functionality to populate databases
- Each database tracks its own articles and last modified timestamp
- Managed via burger menu → "Artikeldatenbanken"

### Article Lookup Feature
When scanning a barcode:
- App searches all active article databases for matching `articleNumber`
- Uses intelligent matching via `findArticleByNumber()` (exact match or last 6 digits)
- If found, pre-fills description and suggests location in EntryForm
- Lookup happens in `handleScan()` via `lookupArticle()` function (App.jsx:347-349)
- Articles from all active databases are combined into single array
- Live lookup also works during manual entry - searches as you type

### Location Management System (Version 2025.02+)
**Flexible User-Defined Locations**:
- No hardcoded locations (D10/D90 removed in Version 2025.02)
- Users create/rename/delete locations via LocationManager
- Locations stored in IndexedDB with id, name, createdAt
- Quick location creation during material entry via + button in EntryForm
- Quick location creation when adding articles in ArticleDatabaseViewer
- CSV import auto-creates new locations found in first column
- First created location becomes default for new entries

**Location Usage**:
- EntryForm: Dropdown to select location + inline creation
- ArticleDatabaseViewer: Dropdown for article location + inline creation
- ArticleDatabaseManager: CSV import with auto-location creation
- MaterialsList: Displays location for each material entry
- Export: Location included in CSV and email exports

### Article Number Normalization (Version 2025.03)
**Leading Zeros Removal**:
- All article numbers automatically normalized (leading zeros removed)
- Applies to: barcode scans, manual entry, CSV import
- Consistent formatting across all displays
- Function: `removeLeadingZeros()` in utils/articleUtils.js

**Flexible Search (Version 2025.03)**:
- Search by exact normalized article number
- Or search by last 6 digits for long article numbers
- Makes it easier to find products with very long barcodes
- Function: `findArticleByNumber()` in utils/articleUtils.js

### Export Configuration (Version 2025.02+)
**Export Settings**:
- Toggle visibility of CSV and Email export buttons independently
- Separate timestamp inclusion settings for CSV and email
- Settings persisted in IndexedDB
- Configured via ExportSettings component (burger menu)

**Email Settings**:
- Add/remove email recipients
- Select default recipients (multiple supported)
- Set default message text
- Recipients separated by semicolon in mailto: link
- Configured via EmailSettings component (burger menu)

### Modal Overlays (Version 2025.03)
**No Browser Prompts**:
- All user inputs use styled modal overlays
- Create Job: Modal with input field (App.jsx)
- Add Article: Modal with fields for number, description, location (ArticleDatabaseViewer.jsx)
- Consistent design matching EntryForm pattern
- z-index hierarchy: modals at z-[60], overlays at z-50

### Version History Summary

**Version 2025.07 (November 2025)**:
- Backup & Restore system for all app data (BackupManager component)
- Styled modals replacing all browser alerts/confirms (AlertModal, ConfirmModal)
- Modern toggle switches for all activation options (Export, Email, Database settings)
- Active job list always sorted to top in JobManager
- Menu stays open when switching jobs or dark/light mode
- Improved button layouts (OK/Cancel below inputs instead of beside)
- Compact menu design to fit all items without scrolling
- Reorganized export settings with unified layout
- All delete confirmations use styled danger modals

**Version 2025.06**:
- Menu animation improvements for smoother UX
- Alphabetically grouped email recipients with letter headers
- Fixed: Email settings persist after app restart

**Version 2025.05 (November 2025)**:
- Complete offline functionality via Service Worker
- Progressive Web App (PWA) with full offline support
- Automatic background updates for new versions
- Intelligent caching of all app assets
- Installable on mobile home screens

**Version 2025.04**:
- CSV import preview with first 10 lines display
- Skip lines functionality for CSV headers
- Visual status indicators (green/red/yellow) in preview
- Pagination for ArticleDatabaseViewer (100 articles per page)
- Performance fix: no more crashes with 32,000+ articles
- Enhanced CSV import workflow

**Version 2025.03**:
- Intelligent barcode processing (leading zeros removal)
- Flexible article search (last 6 digits matching)
- Article number normalization in CSV import
- Modal overlays for job and article creation
- Updated InfoReleaseNotes component

**Version 2025.02**:
- Flexible location management system
- Location CRUD operations
- Auto-creation of locations from CSV
- Export settings configuration
- Email settings with recipient management
- Separate timestamp controls for CSV/Email

**Version 2025.01 (Initial)**:
- Core barcode scanning functionality
- Multiple job management
- Article database support
- CSV/Email export
- Dark mode
- PWA support
