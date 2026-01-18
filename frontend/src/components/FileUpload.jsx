import React, { useState, useRef } from 'react';

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px',
  },
  dropzone: {
    border: '2px dashed #ccc',
    borderRadius: '8px',
    padding: '40px',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backgroundColor: '#fafafa',
  },
  dropzoneActive: {
    border: '2px dashed #2196F3',
    backgroundColor: '#e3f2fd',
  },
  dropzoneError: {
    border: '2px dashed #f44336',
    backgroundColor: '#ffebee',
  },
  icon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#333',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '16px',
  },
  button: {
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '500',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },
  fileInfo: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#e8f5e9',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  fileName: {
    fontSize: '14px',
    color: '#2e7d32',
    fontWeight: '500',
  },
  removeButton: {
    background: 'none',
    border: 'none',
    color: '#666',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '4px 8px',
  },
  error: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#ffebee',
    borderRadius: '4px',
    color: '#c62828',
    fontSize: '14px',
  },
  format: {
    marginTop: '24px',
    padding: '16px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
  },
  formatTitle: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#333',
  },
  formatCode: {
    fontFamily: 'monospace',
    fontSize: '12px',
    backgroundColor: '#f5f5f5',
    padding: '8px',
    borderRadius: '4px',
    whiteSpace: 'pre',
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

  return (
    <div style={styles.container}>
      <div
        style={{
          ...styles.dropzone,
          ...(isDragging ? styles.dropzoneActive : {}),
          ...(error ? styles.dropzoneError : {}),
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div style={styles.icon}>📁</div>
        <div style={styles.title}>
          {file ? 'File Ready' : 'Drag & Drop CSV File'}
        </div>
        <div style={styles.subtitle}>
          {file ? 'Click "Start Analysis" to begin' : 'or click to browse'}
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
          <span style={styles.fileName}>📄 {file.name}</span>
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

      {error && <div style={styles.error}>{error}</div>}

      {file && (
        <button
          style={{
            ...styles.button,
            ...(isUploading ? styles.buttonDisabled : {}),
            width: '100%',
            marginTop: '16px',
          }}
          onClick={handleUpload}
          disabled={isUploading}
        >
          {isUploading ? 'Uploading...' : 'Start Analysis'}
        </button>
      )}

      <div style={styles.format}>
        <div style={styles.formatTitle}>Expected CSV Format:</div>
        <div style={styles.formatCode}>
{`street_number,street_name,zip_code
350,5th Avenue,10118
1600,Pennsylvania Avenue,20500`}
        </div>
      </div>
    </div>
  );
}
