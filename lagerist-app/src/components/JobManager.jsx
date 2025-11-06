import { useState } from 'react';

export default function JobManager({ jobs, currentJobId, onSelectJob, onCreateJob, onDeleteJob, onRenameJob }) {
  const [showJobList, setShowJobList] = useState(false);
  const [newJobName, setNewJobName] = useState('');
  const [renamingJobId, setRenamingJobId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  const currentJob = jobs.find(j => j.id === currentJobId);

  const handleCreateJob = () => {
    if (!newJobName.trim()) {
      alert('Bitte geben Sie einen Namen ein');
      return;
    }
    onCreateJob(newJobName.trim());
    setNewJobName('');
  };

  const handleRename = (jobId) => {
    if (!renameValue.trim()) {
      alert('Bitte geben Sie einen Namen ein');
      return;
    }
    onRenameJob(jobId, renameValue.trim());
    setRenamingJobId(null);
    setRenameValue('');
  };

  const startRename = (job) => {
    setRenamingJobId(job.id);
    setRenameValue(job.name);
  };

  if (!showJobList) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-1">Aktuelle Auftragsliste:</p>
            <p className="text-lg font-bold text-gray-800">{currentJob?.name || 'Keine Auftragsliste'}</p>
            <p className="text-xs text-gray-500 mt-1">
              {currentJob ? `${currentJob.materials.length} Einträge` : '0 Einträge'}
            </p>
          </div>
          <button
            onClick={() => setShowJobList(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold"
          >
            Aufträge verwalten
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Auftrags-verwaltung</h2>
            <button
              onClick={() => setShowJobList(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* Create New Job */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newJobName}
              onChange={(e) => setNewJobName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleCreateJob()}
              placeholder="Name für neue Auftragsliste..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleCreateJob}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              + Neu
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {jobs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg mb-2">Keine Auftragslisten vorhanden</p>
              <p className="text-sm">Erstellen Sie eine neue Liste, um zu beginnen</p>
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className={`border rounded-lg p-4 transition-all ${
                    job.id === currentJobId
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {renamingJobId === job.id ? (
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleRename(job.id)}
                        className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleRename(job.id)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      >
                        OK
                      </button>
                      <button
                        onClick={() => setRenamingJobId(null)}
                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                      >
                        Abbrechen
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800">{job.name}</h3>
                        <p className="text-sm text-gray-600">
                          {job.materials.length} Einträge • Erstellt: {new Date(job.createdAt).toLocaleDateString('de-DE')}
                        </p>
                        {job.lastModified && (
                          <p className="text-xs text-gray-500">
                            Zuletzt geändert: {new Date(job.lastModified).toLocaleString('de-DE')}
                          </p>
                        )}
                      </div>
                      {job.id === currentJobId && (
                        <span className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded font-semibold">
                          Aktiv
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {job.id !== currentJobId && (
                      <button
                        onClick={() => {
                          onSelectJob(job.id);
                          setShowJobList(false);
                        }}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm font-semibold"
                      >
                        Laden
                      </button>
                    )}
                    <button
                      onClick={() => startRename(job)}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
                    >
                      Umbenennen
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Auftragsliste "${job.name}" wirklich löschen?`)) {
                          onDeleteJob(job.id);
                        }
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm"
                    >
                      Löschen
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={() => setShowJobList(false)}
            className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}
