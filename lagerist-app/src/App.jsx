import { useState, useEffect } from 'react';
import BarcodeScanner from './components/BarcodeScanner';
import EntryForm from './components/EntryForm';
import MaterialsList from './components/MaterialsList';
import ExportButtons from './components/ExportButtons';
import JobManager from './components/JobManager';

const STORAGE_KEY_JOBS = 'lagerist_jobs';
const STORAGE_KEY_CURRENT_JOB = 'lagerist_current_job_id';

function App() {
  const [jobs, setJobs] = useState([]);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedArticle, setScannedArticle] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Get current job's materials
  const currentJob = jobs.find(j => j.id === currentJobId);
  const materials = currentJob?.materials || [];

  // Load jobs from localStorage on mount
  useEffect(() => {
    const createDefaultJob = () => {
      const defaultJob = {
        id: Date.now().toString(),
        name: `Auftragsliste ${new Date().toLocaleDateString('de-DE')}`,
        materials: [],
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };
      setJobs([defaultJob]);
      setCurrentJobId(defaultJob.id);
    };

    try {
      const storedJobs = localStorage.getItem(STORAGE_KEY_JOBS);
      const storedCurrentJobId = localStorage.getItem(STORAGE_KEY_CURRENT_JOB);

      if (storedJobs) {
        const parsed = JSON.parse(storedJobs);
        setJobs(parsed);

        if (storedCurrentJobId && parsed.some(j => j.id === storedCurrentJobId)) {
          setCurrentJobId(storedCurrentJobId);
        } else if (parsed.length > 0) {
          setCurrentJobId(parsed[0].id);
        } else {
          // Create default job if none exist
          createDefaultJob();
        }
      } else {
        // Create default job if no data exists
        createDefaultJob();
      }
    } catch (e) {
      console.error('Failed to load stored jobs:', e);
      createDefaultJob();
    }
  }, []);

  // Save jobs to localStorage whenever they change
  useEffect(() => {
    if (jobs.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(jobs));
      } catch (e) {
        console.error('Failed to save jobs:', e);
        alert('Warnung: Daten konnten nicht gespeichert werden. Möglicherweise ist der Speicher voll.');
      }
    }
  }, [jobs]);

  // Save current job ID
  useEffect(() => {
    if (currentJobId) {
      localStorage.setItem(STORAGE_KEY_CURRENT_JOB, currentJobId);
    }
  }, [currentJobId]);

  const handleScan = (articleNumber) => {
    setScannedArticle(articleNumber);
    setIsScanning(false);
    setShowForm(true);
  };

  const updateCurrentJob = (updater) => {
    setJobs(prevJobs => prevJobs.map(job => {
      if (job.id === currentJobId) {
        const updated = updater(job);
        return {
          ...updated,
          lastModified: new Date().toISOString()
        };
      }
      return job;
    }));
  };

  const handleAddMaterial = (material) => {
    updateCurrentJob(job => ({
      ...job,
      materials: [...job.materials, material]
    }));
    setShowForm(false);
    setScannedArticle(null);
    // Automatically reopen scanner for next scan
    setTimeout(() => setIsScanning(true), 100);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setScannedArticle(null);
  };

  const handleDeleteMaterial = (index) => {
    if (window.confirm('Möchten Sie diesen Eintrag wirklich löschen?')) {
      updateCurrentJob(job => ({
        ...job,
        materials: job.materials.filter((_, i) => i !== index)
      }));
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Möchten Sie wirklich alle Einträge löschen?')) {
      updateCurrentJob(job => ({
        ...job,
        materials: []
      }));
    }
  };

  const handleCreateJob = (name) => {
    const newJob = {
      id: Date.now().toString(),
      name,
      materials: [],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    setJobs(prev => [...prev, newJob]);
    setCurrentJobId(newJob.id);
  };

  const handleSelectJob = (jobId) => {
    setCurrentJobId(jobId);
  };

  const handleDeleteJob = (jobId) => {
    const updatedJobs = jobs.filter(j => j.id !== jobId);
    setJobs(updatedJobs);

    if (jobId === currentJobId) {
      if (updatedJobs.length > 0) {
        setCurrentJobId(updatedJobs[0].id);
      } else {
        // Create new default job
        const defaultJob = {
          id: Date.now().toString(),
          name: `Auftragsliste ${new Date().toLocaleDateString('de-DE')}`,
          materials: [],
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
        };
        setJobs([defaultJob]);
        setCurrentJobId(defaultJob.id);
      }
    }
  };

  const handleRenameJob = (jobId, newName) => {
    setJobs(prevJobs => prevJobs.map(job =>
      job.id === jobId ? { ...job, name: newName, lastModified: new Date().toISOString() } : job
    ));
  };

  const handleManualEntry = () => {
    const articleNumber = prompt('Bitte Artikelnummer eingeben:');
    if (articleNumber && articleNumber.trim()) {
      setScannedArticle(articleNumber.trim());
      setShowForm(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">Lagerist</h1>
          <p className="text-sm opacity-90">Materialentnahmen erfassen</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Job Manager */}
        <JobManager
          jobs={jobs}
          currentJobId={currentJobId}
          onSelectJob={handleSelectJob}
          onCreateJob={handleCreateJob}
          onDeleteJob={handleDeleteJob}
          onRenameJob={handleRenameJob}
        />

        {/* Action Buttons */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <button
            onClick={() => setIsScanning(true)}
            className="px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md flex items-center justify-center gap-2"
          >
            <span className="text-2xl">📷</span>
            <span>Barcode scannen</span>
          </button>

          <button
            onClick={handleManualEntry}
            className="px-6 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold shadow-md flex items-center justify-center gap-2"
          >
            <span className="text-2xl">⌨️</span>
            <span>Manuell eingeben</span>
          </button>
        </div>

        {/* Materials List */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Erfasste Materialien</h2>
            {materials.length > 0 && (
              <button
                onClick={handleClearAll}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
              >
                Alle löschen
              </button>
            )}
          </div>
          <MaterialsList materials={materials} onDelete={handleDeleteMaterial} />
        </div>

        {/* Export Buttons */}
        {materials.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <ExportButtons materials={materials} jobName={currentJob?.name} />
          </div>
        )}
      </main>

      {/* Scanner Overlay */}
      {isScanning && (
        <>
          <BarcodeScanner onScan={handleScan} isActive={isScanning} />
          <button
            onClick={() => setIsScanning(false)}
            className="fixed top-4 right-4 z-[60] px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold shadow-lg"
          >
            Abbrechen
          </button>
        </>
      )}

      {/* Entry Form */}
      {showForm && scannedArticle && (
        <EntryForm
          articleNumber={scannedArticle}
          onSubmit={handleAddMaterial}
          onCancel={handleCancelForm}
        />
      )}

      {/* Footer */}
      <footer className="container mx-auto px-4 py-6 text-center text-gray-500 text-sm">
        <p>Lagerist - Materialverwaltung © 2025</p>
        <p className="mt-1">Alle Auftragslisten werden sicher im Browser gespeichert</p>
        <p className="text-xs mt-1 opacity-75">Tipp: Exportieren Sie wichtige Listen regelmäßig als Backup</p>
      </footer>
    </div>
  );
}

export default App;
