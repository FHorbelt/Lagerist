export default function ExportButtons({ materials, jobName, exportSettings, emailSettings }) {
  const {
    showCsvExport = true,
    showEmailExport = true,
    csvIncludeTimestamp = false,
    emailIncludeTimestamp = false
  } = exportSettings || {};

  const {
    recipients = [],
    defaultRecipients = [],
    defaultMessage = ''
  } = emailSettings || {};

  const sanitizeFilename = (name) => {
    return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  };

  const exportToCSV = () => {
    if (materials.length === 0) {
      alert('Keine Daten zum Exportieren vorhanden');
      return;
    }

    const headers = csvIncludeTimestamp
      ? ['Lagerort', 'Artikelnummer', 'Menge', 'Einheit', 'Bezeichnung', 'Zeitstempel']
      : ['Lagerort', 'Artikelnummer', 'Menge', 'Einheit', 'Bezeichnung'];

    const rows = materials.map(m => {
      const row = [
        m.location,
        m.articleNumber,
        m.quantity,
        m.unit,
        m.description || ''
      ];
      if (csvIncludeTimestamp) {
        row.push(new Date(m.timestamp).toLocaleString('de-DE'));
      }
      return row;
    });

    let csvContent = headers.join(';') + '\n';
    rows.forEach(row => {
      csvContent += row.join(';') + '\n';
    });

    // Add BOM for proper Excel UTF-8 encoding
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    const filename = jobName
      ? `${sanitizeFilename(jobName)}_${new Date().toISOString().split('T')[0]}.csv`
      : `materialentnahme_${new Date().toISOString().split('T')[0]}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sendEmail = () => {
    if (materials.length === 0) {
      alert('Keine Daten zum Versenden vorhanden');
      return;
    }

    const subject = jobName
      ? `${jobName} - ${new Date().toLocaleDateString('de-DE')}`
      : `Materialentnahme - ${new Date().toLocaleDateString('de-DE')}`;

    // Get default recipients
    const defaultRecipientEmails = recipients
      .filter(r => defaultRecipients.includes(r.id))
      .map(r => r.email);

    // Create HTML email body with table
    let htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; font-size: 14px; color: #333; }
    .message { margin-bottom: 20px; }
    .header { margin-bottom: 20px; }
    .header h2 { margin: 0 0 10px 0; color: #2c3e50; }
    .header p { margin: 5px 0; color: #555; }
    table { border-collapse: collapse; width: 100%; max-width: 900px; margin: 20px 0; }
    th { background-color: #c1da51; color: #000; padding: 12px 8px; text-align: left; font-weight: bold; border: 1px solid #a8c43f; }
    td { padding: 10px 8px; border: 1px solid #ddd; }
    tr:nth-child(even) { background-color: #f9f9f9; }
    tr:hover { background-color: #f0f0f0; }
    .footer { margin-top: 20px; color: #777; font-size: 12px; }
    .summary { margin: 20px 0; font-weight: bold; }
  </style>
</head>
<body>${defaultMessage ? `
  <div class="message">
    <p>${defaultMessage.replace(/\n/g, '<br>')}</p>
  </div>` : ''}
  <div class="header">
    <h2>${jobName || 'MATERIALENTNAHME'}</h2>
    <p><strong>Datum:</strong> ${new Date().toLocaleString('de-DE')}</p>
    <p><strong>Einträge:</strong> ${materials.length}</p>
  </div>

  <table>
    <thead>
      <tr>
        <th>Lagerort</th>
        <th>Artikelnummer</th>
        <th>Menge</th>
        <th>Einheit</th>
        <th>Bezeichnung</th>${emailIncludeTimestamp ? '\n        <th>Zeitstempel</th>' : ''}
      </tr>
    </thead>
    <tbody>
${materials.map(m => `      <tr>
        <td>${m.location}</td>
        <td>${m.articleNumber}</td>
        <td>${m.quantity}</td>
        <td>${m.unit}</td>
        <td>${m.description || '-'}</td>${emailIncludeTimestamp ? `\n        <td>${new Date(m.timestamp).toLocaleString('de-DE')}</td>` : ''}
      </tr>`).join('\n')}
    </tbody>
  </table>

  <div class="summary">
    Gesamt: ${materials.length} ${materials.length === 1 ? 'Eintrag' : 'Einträge'}
  </div>
</body>
</html>`;

    // Build mailto link with default recipients or empty
    // Use semicolon as separator for better compatibility with email clients
    const recipientString = defaultRecipientEmails.length > 0 ? defaultRecipientEmails.join(';') : '';
    const mailtoLink = `mailto:${recipientString}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(htmlBody)}`;
    window.location.href = mailtoLink;
  };

  if (materials.length === 0) {
    return null;
  }

  // Don't show export section if both options are disabled
  if (!showCsvExport && !showEmailExport) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Export / Versenden:</div>

      <div className="grid grid-cols-1 gap-3">
        {showCsvExport && (
          <button
            onClick={exportToCSV}
            className="w-full px-6 py-3 bg-accent-500 text-white rounded-lg hover:bg-accent-600 transition-colors font-semibold shadow-md flex items-center justify-center gap-2"
          >
            <span>📊</span>
            <span>CSV exportieren</span>
          </button>
        )}

        {showEmailExport && (
          <button
            onClick={sendEmail}
            className="w-full px-6 py-3 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors font-semibold shadow-md flex items-center justify-center gap-2 border-3"
            style={{ borderWidth: '3px', borderColor: 'rgb(193, 218, 81)' }}
          >
            <span>📧</span>
            <span>Per E-Mail senden</span>
          </button>
        )}
      </div>
    </div>
  );
}
