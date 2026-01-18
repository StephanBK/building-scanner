import React, { useState, useEffect, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import ProcessingStatus from './components/ProcessingStatus';
import ResultsView from './components/ResultsView';

// Use relative URL for production, full URL for development
const API_BASE = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api';

const styles = {
  app: {
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #e0e0e0',
    padding: '16px 24px',
    marginBottom: '24px',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logoIcon: {
    fontSize: '28px',
  },
  logoText: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
  },
  main: {
    padding: '0 24px 24px',
  },
  error: {
    maxWidth: '600px',
    margin: '20px auto',
    padding: '16px',
    backgroundColor: '#ffebee',
    borderRadius: '8px',
    color: '#c62828',
    textAlign: 'center',
  },
};

function App() {
  const [view, setView] = useState('upload'); // 'upload', 'processing', 'results'
  const [isUploading, setIsUploading] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  // Poll for job status
  const pollStatus = useCallback(async () => {
    if (!jobId) return;

    try {
      const response = await fetch(`${API_BASE}/status/${jobId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch job status');
      }

      const status = await response.json();
      setJobStatus(status);

      if (status.status === 'completed') {
        // Fetch full results
        const resultsResponse = await fetch(`${API_BASE}/results/${jobId}/json`);
        if (resultsResponse.ok) {
          const resultsData = await resultsResponse.json();
          setResults(resultsData.results);
          setView('results');
        }
      } else if (status.status === 'failed') {
        setError(status.error || 'Job failed');
        setView('upload');
      }
    } catch (err) {
      console.error('Error polling status:', err);
      setError(err.message);
    }
  }, [jobId]);

  useEffect(() => {
    let intervalId;

    if (view === 'processing' && jobId) {
      // Poll every 2 seconds
      intervalId = setInterval(pollStatus, 2000);
      // Also poll immediately
      pollStatus();
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [view, jobId, pollStatus]);

  const handleUpload = async (file) => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Upload failed');
      }

      const data = await response.json();
      setJobId(data.job_id);
      setView('processing');
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleNewScan = () => {
    setView('upload');
    setJobId(null);
    setJobStatus(null);
    setResults(null);
    setError(null);
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <span style={styles.logoIcon}>🏢</span>
            <div>
              <div style={styles.logoText}>Building Scanner</div>
              <div style={styles.subtitle}>
                Analyze buildings using AI vision
              </div>
            </div>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {error && (
          <div style={styles.error}>
            <strong>Error:</strong> {error}
            <button
              onClick={() => setError(null)}
              style={{
                marginLeft: '12px',
                background: 'none',
                border: 'none',
                color: '#c62828',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              Dismiss
            </button>
          </div>
        )}

        {view === 'upload' && (
          <FileUpload onUpload={handleUpload} isUploading={isUploading} />
        )}

        {view === 'processing' && (
          <ProcessingStatus jobStatus={jobStatus} />
        )}

        {view === 'results' && (
          <ResultsView
            results={results}
            jobId={jobId}
            onNewScan={handleNewScan}
          />
        )}
      </main>
    </div>
  );
}

export default App;
