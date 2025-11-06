import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function ExportButtons({ materials, jobName }) {
  const sanitizeFilename = (name) => {
    return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  };

  const exportToCSV = () => {
    if (materials.length === 0) {
      alert('Keine Daten zum Exportieren vorhanden');
      return;
    }

    const headers = ['Artikelnummer', 'Menge', 'Lagerort', 'Zeitstempel'];
    const rows = materials.map(m => [
      m.articleNumber,
      `${m.quantity} ${m.unit}`,
      m.location,
      new Date(m.timestamp).toLocaleString('de-DE')
    ]);

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

  const exportToPDF = () => {
    if (materials.length === 0) {
      alert('Keine Daten zum Exportieren vorhanden');
      return;
    }

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(jobName || 'Materialentnahme', 14, 20);

    // Date
    doc.setFontSize(11);
    doc.text(`Datum: ${new Date().toLocaleDateString('de-DE')}`, 14, 28);

    // Table
    const tableData = materials.map(m => [
      m.articleNumber,
      `${m.quantity} ${m.unit}`,
      m.location,
      new Date(m.timestamp).toLocaleString('de-DE')
    ]);

    doc.autoTable({
      startY: 35,
      head: [['Artikelnummer', 'Menge', 'Lagerort', 'Zeitstempel']],
      body: tableData,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [59, 130, 246] }
    });

    // Summary
    const finalY = doc.lastAutoTable.finalY || 35;
    doc.setFontSize(10);
    doc.text(`Gesamt: ${materials.length} Einträge`, 14, finalY + 10);

    const pdfFilename = jobName
      ? `${sanitizeFilename(jobName)}_${new Date().toISOString().split('T')[0]}.pdf`
      : `materialentnahme_${new Date().toISOString().split('T')[0]}.pdf`;

    doc.save(pdfFilename);
  };

  const sendEmail = () => {
    if (materials.length === 0) {
      alert('Keine Daten zum Versenden vorhanden');
      return;
    }

    const subject = jobName
      ? `${jobName} - ${new Date().toLocaleDateString('de-DE')}`
      : `Materialentnahme - ${new Date().toLocaleDateString('de-DE')}`;

    let body = '';

    // Header section
    if (jobName) {
      body += `${jobName}\n`;
    } else {
      body += 'MATERIALENTNAHME\n';
    }
    body += `Datum: ${new Date().toLocaleString('de-DE')}\n`;
    body += `Einträge: ${materials.length}\n`;
    body += '\n';

    // Fixed-width columns for better alignment
    body += 'Artikelnummer     Menge            Lagerort\n';
    body += '-'.repeat(50) + '\n';

    materials.forEach(m => {
      const articleNum = m.articleNumber.padEnd(17, ' ');
      const quantity = `${m.quantity} ${m.unit}`.padEnd(16, ' ');
      const location = m.location;
      body += `${articleNum} ${quantity} ${location}\n`;
    });

    body += '\n';
    body += `Gesamt: ${materials.length} ${materials.length === 1 ? 'Eintrag' : 'Einträge'}\n`;
    body += '\n';
    body += 'Erstellt mit Lagerist Web-App';

    const mailtoLink = `mailto:lager@firma.de?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  };

  if (materials.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="text-sm font-semibold text-gray-700 mb-2">Export / Versenden:</div>

      <div className="grid grid-cols-1 gap-3">
        <button
          onClick={exportToCSV}
          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-md flex items-center justify-center gap-2"
        >
          <span>📊</span>
          <span>CSV exportieren</span>
        </button>

        <button
          onClick={exportToPDF}
          className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-md flex items-center justify-center gap-2"
        >
          <span>📄</span>
          <span>PDF exportieren</span>
        </button>

        <button
          onClick={sendEmail}
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md flex items-center justify-center gap-2"
        >
          <span>📧</span>
          <span>Per E-Mail senden</span>
        </button>
      </div>
    </div>
  );
}
