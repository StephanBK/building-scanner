import React from 'react';

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    padding: '32px',
    border: '1px solid #e5e7eb',
    animation: 'slideUp 0.3s ease-out',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '24px',
  },
  spinnerContainer: {
    width: '48px',
    height: '48px',
    position: 'relative',
  },
  spinnerOuter: {
    position: 'absolute',
    width: '48px',
    height: '48px',
    border: '3px solid #e5e7eb',
    borderTop: '3px solid #3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  spinnerInner: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    width: '32px',
    height: '32px',
    border: '3px solid #e5e7eb',
    borderTop: '3px solid #8b5cf6',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite reverse',
  },
  completedIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
  },
  titleGroup: {
    flex: 1,
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '4px',
  },
  jobId: {
    fontSize: '13px',
    color: '#6b7280',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '9999px',
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  statusPending: {
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    color: '#92400e',
  },
  statusProcessing: {
    background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
    color: '#1e40af',
  },
  statusCompleted: {
    background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
    color: '#065f46',
  },
  statusFailed: {
    background: 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
    color: '#991b1b',
  },
  progressSection: {
    marginBottom: '24px',
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
    fontSize: '14px',
  },
  progressLabel: {
    color: '#374151',
    fontWeight: '500',
  },
  progressPercent: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  progressBar: {
    height: '12px',
    background: '#e5e7eb',
    borderRadius: '9999px',
    overflow: 'hidden',
    position: 'relative',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
    borderRadius: '9999px',
    transition: 'width 0.5s ease-out',
    position: 'relative',
  },
  progressShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
    animation: 'shimmer 1.5s infinite',
  },
  progressStats: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '12px',
  },
  progressStat: {
    textAlign: 'center',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '2px',
  },
  currentAddress: {
    padding: '16px',
    background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
  },
  currentLabel: {
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontWeight: '500',
  },
  currentValue: {
    fontSize: '15px',
    color: '#1f2937',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  pulsingDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#3b82f6',
    animation: 'pulse 1.5s infinite',
  },
  error: {
    marginTop: '20px',
    padding: '16px',
    background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
    borderRadius: '12px',
    border: '1px solid #fecaca',
    color: '#991b1b',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  estimatedTime: {
    marginTop: '20px',
    textAlign: 'center',
    padding: '12px',
    background: '#f9fafb',
    borderRadius: '8px',
    fontSize: '13px',
    color: '#6b7280',
  },
};

const spinnerKeyframes = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(0.8); }
  }
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
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

  const remaining = total_addresses - processed_addresses;
  const estimatedSeconds = remaining * 30; // ~30 seconds per building
  const estimatedMinutes = Math.ceil(estimatedSeconds / 60);

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
  const isCompleted = status === 'completed';

  return (
    <div style={styles.container}>
      <style>{spinnerKeyframes}</style>
      <div style={styles.card}>
        <div style={styles.header}>
          {isProcessing ? (
            <div style={styles.spinnerContainer}>
              <div style={styles.spinnerOuter}></div>
              <div style={styles.spinnerInner}></div>
            </div>
          ) : isCompleted ? (
            <div style={styles.completedIcon}>✓</div>
          ) : null}

          <div style={styles.titleGroup}>
            <div style={styles.title}>
              {isCompleted ? 'Analysis Complete!' : 'Analyzing Buildings...'}
            </div>
            <div style={styles.jobId}>Job ID: {job_id}</div>
          </div>

          <span style={getStatusBadgeStyle()}>
            {status === 'processing' && <span style={styles.pulsingDot}></span>}
            {status}
          </span>
        </div>

        <div style={styles.progressSection}>
          <div style={styles.progressHeader}>
            <span style={styles.progressLabel}>Progress</span>
            <span style={styles.progressPercent}>{progress}%</span>
          </div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${progress}%` }}>
              {isProcessing && <div style={styles.progressShimmer}></div>}
            </div>
          </div>
          <div style={styles.progressStats}>
            <div style={styles.progressStat}>
              <div style={styles.statValue}>{processed_addresses}</div>
              <div style={styles.statLabel}>Completed</div>
            </div>
            <div style={styles.progressStat}>
              <div style={styles.statValue}>{remaining}</div>
              <div style={styles.statLabel}>Remaining</div>
            </div>
            <div style={styles.progressStat}>
              <div style={styles.statValue}>{total_addresses}</div>
              <div style={styles.statLabel}>Total</div>
            </div>
          </div>
        </div>

        {current_address && isProcessing && (
          <div style={styles.currentAddress}>
            <div style={styles.currentLabel}>Currently Analyzing</div>
            <div style={styles.currentValue}>
              <span style={styles.pulsingDot}></span>
              {current_address}
            </div>
          </div>
        )}

        {isProcessing && remaining > 0 && (
          <div style={styles.estimatedTime}>
            ⏱️ Estimated time remaining: ~{estimatedMinutes} minute{estimatedMinutes !== 1 ? 's' : ''}
          </div>
        )}

        {error && (
          <div style={styles.error}>
            <span>⚠️</span>
            <div>
              <strong>Error: </strong>
              {error}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
