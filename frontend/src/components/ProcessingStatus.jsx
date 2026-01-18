import React from 'react';

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '20px',
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '3px solid #e0e0e0',
    borderTop: '3px solid #2196F3',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginRight: '12px',
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
  },
  progressContainer: {
    marginBottom: '16px',
  },
  progressBar: {
    height: '8px',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: '4px',
    transition: 'width 0.3s ease',
  },
  progressText: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '8px',
    fontSize: '14px',
    color: '#666',
  },
  currentAddress: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    fontSize: '14px',
  },
  currentLabel: {
    color: '#666',
    marginBottom: '4px',
  },
  currentValue: {
    color: '#333',
    fontWeight: '500',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  statusPending: {
    backgroundColor: '#fff3e0',
    color: '#e65100',
  },
  statusProcessing: {
    backgroundColor: '#e3f2fd',
    color: '#1565c0',
  },
  statusCompleted: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
  },
  statusFailed: {
    backgroundColor: '#ffebee',
    color: '#c62828',
  },
  error: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#ffebee',
    borderRadius: '4px',
    color: '#c62828',
    fontSize: '14px',
  },
};

// CSS keyframes for spinner
const spinnerKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

export default function ProcessingStatus({ jobStatus }) {
  if (!jobStatus) return null;

  const {
    job_id,
    status,
    total_addresses,
    processed_addresses,
    current_address,
    error,
  } = jobStatus;

  const progress = total_addresses > 0
    ? Math.round((processed_addresses / total_addresses) * 100)
    : 0;

  const getStatusBadgeStyle = () => {
    switch (status) {
      case 'pending':
        return { ...styles.statusBadge, ...styles.statusPending };
      case 'processing':
        return { ...styles.statusBadge, ...styles.statusProcessing };
      case 'completed':
        return { ...styles.statusBadge, ...styles.statusCompleted };
      case 'failed':
        return { ...styles.statusBadge, ...styles.statusFailed };
      default:
        return styles.statusBadge;
    }
  };

  const isProcessing = status === 'processing' || status === 'pending';

  return (
    <div style={styles.container}>
      <style>{spinnerKeyframes}</style>
      <div style={styles.card}>
        <div style={styles.header}>
          {isProcessing && <div style={styles.spinner}></div>}
          <div style={styles.title}>
            {status === 'completed' ? '✅ Analysis Complete' : 'Analyzing Buildings'}
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <span style={getStatusBadgeStyle()}>{status}</span>
          <span style={{ marginLeft: '12px', fontSize: '14px', color: '#666' }}>
            Job ID: {job_id}
          </span>
        </div>

        <div style={styles.progressContainer}>
          <div style={styles.progressBar}>
            <div
              style={{
                ...styles.progressFill,
                width: `${progress}%`,
              }}
            ></div>
          </div>
          <div style={styles.progressText}>
            <span>{processed_addresses} of {total_addresses} addresses processed</span>
            <span>{progress}%</span>
          </div>
        </div>

        {current_address && isProcessing && (
          <div style={styles.currentAddress}>
            <div style={styles.currentLabel}>Currently processing:</div>
            <div style={styles.currentValue}>{current_address}</div>
          </div>
        )}

        {error && (
          <div style={styles.error}>
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>
    </div>
  );
}
