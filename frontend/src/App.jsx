import React, { useState, useEffect, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import ProcessingStatus from './components/ProcessingStatus';
import ResultsView from './components/ResultsView';
import HowItWorks from './components/HowItWorks';

// Use relative URL for production, full URL for development
const API_BASE = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api';

const styles = {
  app: {
    minHeight: '100vh',
  },
  header: {
    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #6366f1 100%)',
    padding: '0',
    position: 'relative',
    overflow: 'hidden',
  },
  headerBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px 24px',
    position: 'relative',
    zIndex: 1,
  },
  headerTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '32px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  logoIcon: {
    width: '48px',
    height: '48px',
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    backdropFilter: 'blur(10px)',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'white',
    letterSpacing: '-0.5px',
  },
  tagline: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: '2px',
  },
  nav: {
    display: 'flex',
    gap: '8px',
  },
  navLink: {
    padding: '8px 16px',
    background: 'rgba(255, 255, 255, 0.1)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '8px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textDecoration: 'none',
  },
  hero: {
    textAlign: 'center',
    paddingBottom: '48px',
  },
  heroTitle: {
    fontSize: '42px',
    fontWeight: '800',
    color: 'white',
    marginBottom: '16px',
    letterSpacing: '-1px',
    lineHeight: '1.1',
  },
  heroSubtitle: {
    fontSize: '18px',
    color: 'rgba(255, 255, 255, 0.9)',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: '1.6',
  },
  stats: {
    display: 'flex',
    justifyContent: 'center',
    gap: '48px',
    marginTop: '32px',
  },
  stat: {
    textAlign: 'center',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: 'white',
  },
  statLabel: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: '4px',
  },
  main: {
    padding: '0 24px 48px',
    marginTop: '-24px',
    position: 'relative',
    zIndex: 2,
  },
  error: {
    maxWidth: '600px',
    margin: '0 auto 20px',
    padding: '16px 20px',
    background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
    borderRadius: '12px',
    border: '1px solid #fecaca',
    color: '#991b1b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    animation: 'slideUp 0.3s ease-out',
  },
  errorText: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
  },
  dismissBtn: {
    background: 'none',
    border: 'none',
    color: '#991b1b',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '18px',
  },
  footer: {
    textAlign: 'center',
    padding: '24px',
    color: 'var(--gray-500)',
    fontSize: '13px',
    borderTop: '1px solid var(--gray-200)',
    background: 'white',
  },
};

function App() {
  const [view, setView] = useState('upload');
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [jobStatus, setJobStatus] = useState(null);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

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
      intervalId = setInterval(pollStatus, 2000);
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
        <div style={styles.headerBg}></div>
        <div style={styles.headerContent}>
          <div style={styles.headerTop}>
            <div style={styles.logo}>
              <div style={styles.logoIcon}>🏢</div>
              <div>
                <div style={styles.logoText}>Building Scanner</div>
                <div style={styles.tagline}>AI-Powered Building Analysis</div>
              </div>
            </div>
            <nav style={styles.nav}>
              <button
                style={styles.navLink}
                onClick={() => setShowHowItWorks(!showHowItWorks)}
              >
                {showHowItWorks ? '← Back' : 'How It Works'}
              </button>
            </nav>
          </div>

          {!showHowItWorks && view === 'upload' && (
            <div style={styles.hero}>
              <h1 style={styles.heroTitle}>
                Analyze Buildings<br />with AI Vision
              </h1>
              <p style={styles.heroSubtitle}>
                Upload a list of addresses and let our AI classify building types
                and estimate window-to-wall ratios using street-level imagery.
              </p>
              <div style={styles.stats}>
                <div style={styles.stat}>
                  <div style={styles.statValue}>8</div>
                  <div style={styles.statLabel}>Building Types</div>
                </div>
                <div style={styles.stat}>
                  <div style={styles.statValue}>4</div>
                  <div style={styles.statLabel}>Street Views</div>
                </div>
                <div style={styles.stat}>
                  <div style={styles.statValue}>~30s</div>
                  <div style={styles.statLabel}>Per Building</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main style={styles.main}>
        {error && (
          <div style={styles.error}>
            <span style={styles.errorText}>
              <span>⚠️</span>
              <strong>Error:</strong> {error}
            </span>
            <button
              onClick={() => setError(null)}
              style={styles.dismissBtn}
            >
              ×
            </button>
          </div>
        )}

        {showHowItWorks ? (
          <HowItWorks />
        ) : (
          <>
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
          </>
        )}
      </main>

      <footer style={styles.footer}>
        Powered by OpenAI Vision & Google Street View • Built with React & FastAPI
      </footer>
    </div>
  );
}

export default App;
