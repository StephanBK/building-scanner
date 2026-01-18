import React, { useState, useRef } from 'react';

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
  dropzone: {
    border: '2px dashed #d1d5db',
    borderRadius: '12px',
    padding: '48px 32px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    background: 'linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)',
  },
  dropzoneActive: {
    border: '2px dashed #3b82f6',
    background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
    transform: 'scale(1.01)',
  },
  dropzoneHasFile: {
    border: '2px solid #10b981',
    background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
  },
  dropzoneError: {
    border: '2px dashed #ef4444',
    background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
  },
  iconContainer: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)',
  },
  iconContainerSuccess: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)',
  },
  icon: {
    fontSize: '32px',
    filter: 'brightness(0) invert(1)',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '20px',
  },
  browseLink: {
    color: '#3b82f6',
    fontWeight: '500',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  fileInfo: {
    marginTop: '20px',
    padding: '16px',
    background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    border: '1px solid #a7f3d0',
    animation: 'slideUp 0.2s ease-out',
  },
  fileDetails: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  fileIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '8px',
    background: '#10b981',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '18px',
  },
  fileName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#065f46',
  },
  fileSize: {
    fontSize: '12px',
    color: '#059669',
  },
  removeButton: {
    background: 'white',
    border: '1px solid #d1d5db',
    color: '#6b7280',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '8px 12px',
    borderRadius: '8px',
    transition: 'all 0.2s',
  },
  error: {
    marginTop: '16px',
    padding: '14px 16px',
    background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
    borderRadius: '10px',
    color: '#991b1b',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: '1px solid #fecaca',
    animation: 'slideUp 0.2s ease-out',
  },
  button: {
    width: '100%',
    marginTop: '20px',
    padding: '16px 24px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    color: 'white',
    boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)',
  },
  buttonDisabled: {
    background: '#e5e7eb',
    color: '#9ca3af',
    cursor: 'not-allowed',
    boxShadow: 'none',
  },
  buttonHover: {
    transform: 'translateY(-1px)',
    boxShadow: '0 6px 20px 0 rgba(59, 130, 246, 0.5)',
  },
  format: {
    marginTop: '24px',
    padding: '20px',
    background: '#f9fafb',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
  },
  formatHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '12px',
  },
  formatTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  formatBadge: {
    fontSize: '11px',
    fontWeight: '500',
    padding: '2px 8px',
    borderRadius: '9999px',
    background: '#dbeafe',
    color: '#1e40af',
  },
  formatCode: {
    fontFamily: "'SF Mono', 'Monaco', 'Inconsolata', monospace",
    fontSize: '13px',
    background: '#1f2937',
    color: '#10b981',
    padding: '16px',
    borderRadius: '8px',
    whiteSpace: 'pre',
    overflow: 'auto',
    lineHeight: '1.5',
  },
  formatNote: {
    marginTop: '12px',
    fontSize: '12px',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginTop: '24px',
  },
  feature: {
    textAlign: 'center',
    padding: '16px 12px',
    background: '#f9fafb',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
  },
  featureIcon: {
    fontSize: '24px',
    marginBottom: '8px',
  },
  featureText: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: '500',
  },
};

export default function FileUpload({ onUpload, isUploading }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);

    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileSelect = (e) => {
    setError(null);
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setFile(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = () => {
    if (file && onUpload) {
      onUpload(file);
    }
  };

  const handleClick = () => {
    if (!file && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div
          style={{
            ...styles.dropzone,
            ...(isDragging ? styles.dropzoneActive : {}),
            ...(file ? styles.dropzoneHasFile : {}),
            ...(error ? styles.dropzoneError : {}),
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div style={{
            ...styles.iconContainer,
            ...(file ? styles.iconContainerSuccess : {}),
          }}>
            <span style={styles.icon}>{file ? '✓' : '📁'}</span>
          </div>
          <div style={styles.title}>
            {file ? 'File Ready for Analysis' : 'Drop your CSV file here'}
          </div>
          <div style={styles.subtitle}>
            {file ? (
              'Click "Start Analysis" to begin processing'
            ) : (
              <>or <span style={styles.browseLink}>browse</span> to select</>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        {file && (
          <div style={styles.fileInfo}>
            <div style={styles.fileDetails}>
              <div style={styles.fileIcon}>📄</div>
              <div>
                <div style={styles.fileName}>{file.name}</div>
                <div style={styles.fileSize}>{formatFileSize(file.size)}</div>
              </div>
            </div>
            <button
              style={styles.removeButton}
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFile();
              }}
            >
              ✕
            </button>
          </div>
        )}

        {error && (
          <div style={styles.error}>
            <span>⚠️</span>
            {error}
          </div>
        )}

        {file && (
          <button
            style={{
              ...styles.button,
              ...(isUploading ? styles.buttonDisabled : {}),
            }}
            onClick={handleUpload}
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
                Processing...
              </>
            ) : (
              <>
                <span>🚀</span>
                Start Analysis
              </>
            )}
          </button>
        )}

        <div style={styles.format}>
          <div style={styles.formatHeader}>
            <span style={styles.formatTitle}>Expected CSV Format</span>
            <span style={styles.formatBadge}>Flexible parsing</span>
          </div>
          <div style={styles.formatCode}>
{`street_number,street_name,zip_code
350,5th Avenue,10118
1600,Pennsylvania Avenue,20500`}
          </div>
          <div style={styles.formatNote}>
            <span>💡</span>
            Our AI can handle various column names and formats
          </div>
        </div>

        <div style={styles.features}>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>🤖</div>
            <div style={styles.featureText}>AI-Powered<br/>Parsing</div>
          </div>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>📊</div>
            <div style={styles.featureText}>Up to 100<br/>Buildings</div>
          </div>
          <div style={styles.feature}>
            <div style={styles.featureIcon}>⬇️</div>
            <div style={styles.featureText}>Export<br/>Results</div>
          </div>
        </div>
      </div>
    </div>
  );
}
