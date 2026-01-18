import React, { useState } from 'react';

// Use relative URL for production, full URL for development
const API_BASE = import.meta.env.DEV ? 'http://localhost:8000/api' : '/api';

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#333',
  },
  buttonGroup: {
    display: 'flex',
    gap: '8px',
  },
  button: {
    backgroundColor: '#2196F3',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '4px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    color: '#333',
    border: '1px solid #ccc',
  },
  tableContainer: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '14px',
  },
  th: {
    backgroundColor: '#f5f5f5',
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#333',
    borderBottom: '2px solid #e0e0e0',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #e0e0e0',
    verticalAlign: 'top',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
  },
  badgeResidential: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
  },
  badgeCommercialOffice: {
    backgroundColor: '#e3f2fd',
    color: '#1565c0',
  },
  badgeCommercialHotel: {
    backgroundColor: '#fff3e0',
    color: '#e65100',
  },
  badgeCommercialMedical: {
    backgroundColor: '#fce4ec',
    color: '#c2185b',
  },
  badgeCommercialRetail: {
    backgroundColor: '#f3e5f5',
    color: '#7b1fa2',
  },
  badgeCommercialWarehouse: {
    backgroundColor: '#efebe9',
    color: '#5d4037',
  },
  badgeMixed: {
    backgroundColor: '#e0f2f1',
    color: '#00695c',
  },
  badgeMisc: {
    backgroundColor: '#f5f5f5',
    color: '#616161',
  },
  confidenceHigh: {
    color: '#2e7d32',
  },
  confidenceMedium: {
    color: '#f57c00',
  },
  confidenceLow: {
    color: '#d32f2f',
  },
  wwrBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  wwrBarBg: {
    width: '60px',
    height: '8px',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  wwrBarFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    borderRadius: '4px',
  },
  reasoning: {
    maxWidth: '300px',
    fontSize: '12px',
    color: '#666',
    lineHeight: '1.4',
  },
  imageButton: {
    backgroundColor: 'transparent',
    border: '1px solid #2196F3',
    color: '#2196F3',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    cursor: 'pointer',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    maxWidth: '90vw',
    maxHeight: '90vh',
    overflow: 'auto',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  modalClose: {
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#666',
  },
  imageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '12px',
  },
  image: {
    width: '100%',
    height: '250px',
    objectFit: 'cover',
    borderRadius: '4px',
  },
  error: {
    color: '#d32f2f',
    fontSize: '12px',
  },
  summary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  summaryLabel: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '4px',
  },
  summaryValue: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#333',
  },
};

export default function ResultsView({ results, jobId, onNewScan }) {
  const [selectedImages, setSelectedImages] = useState(null);

  if (!results || results.length === 0) {
    return (
      <div style={styles.container}>
        <p>No results to display.</p>
      </div>
    );
  }

  const handleDownloadCSV = () => {
    window.open(`${API_BASE}/results/${jobId}`, '_blank');
  };

  const handleDownloadZIP = () => {
    window.open(`${API_BASE}/download/${jobId}/zip`, '_blank');
  };

  const handleViewImages = (imagesFolder, address) => {
    if (imagesFolder) {
      setSelectedImages({ folder: imagesFolder, address });
    }
  };

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'residential':
        return { ...styles.badge, ...styles.badgeResidential };
      case 'commercial-office':
        return { ...styles.badge, ...styles.badgeCommercialOffice };
      case 'commercial-hotel':
        return { ...styles.badge, ...styles.badgeCommercialHotel };
      case 'commercial-medical':
        return { ...styles.badge, ...styles.badgeCommercialMedical };
      case 'commercial-retail':
        return { ...styles.badge, ...styles.badgeCommercialRetail };
      case 'commercial-warehouse':
        return { ...styles.badge, ...styles.badgeCommercialWarehouse };
      case 'mixed':
        return { ...styles.badge, ...styles.badgeMixed };
      default:
        return { ...styles.badge, ...styles.badgeMisc };
    }
  };

  const getConfidenceStyle = (confidence) => {
    switch (confidence) {
      case 'high':
        return styles.confidenceHigh;
      case 'medium':
        return styles.confidenceMedium;
      default:
        return styles.confidenceLow;
    }
  };

  // Calculate summary stats
  const commercialTypes = ['commercial-office', 'commercial-hotel', 'commercial-medical', 'commercial-retail', 'commercial-warehouse'];
  const summary = {
    total: results.length,
    residential: results.filter(r => r.building_type === 'residential').length,
    commercial: results.filter(r => commercialTypes.includes(r.building_type)).length,
    mixed: results.filter(r => r.building_type === 'mixed').length,
    avgWWR: Math.round(
      results
        .filter(r => r.wwr_estimate !== null && r.wwr_estimate !== undefined)
        .reduce((sum, r) => sum + r.wwr_estimate, 0) /
      results.filter(r => r.wwr_estimate !== null && r.wwr_estimate !== undefined).length || 0
    ),
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Analysis Results</h2>
        <div style={styles.buttonGroup}>
          <button
            style={{ ...styles.button, ...styles.buttonSecondary }}
            onClick={onNewScan}
          >
            New Scan
          </button>
          <button style={styles.button} onClick={handleDownloadCSV}>
            📥 Download CSV
          </button>
          <button style={styles.button} onClick={handleDownloadZIP}>
            📦 Download ZIP
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={styles.summary}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Total Buildings</div>
          <div style={styles.summaryValue}>{summary.total}</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Residential</div>
          <div style={{ ...styles.summaryValue, color: '#2e7d32' }}>
            {summary.residential}
          </div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Commercial</div>
          <div style={{ ...styles.summaryValue, color: '#1565c0' }}>
            {summary.commercial}
          </div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Mixed</div>
          <div style={{ ...styles.summaryValue, color: '#00695c' }}>
            {summary.mixed}
          </div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Avg WWR</div>
          <div style={styles.summaryValue}>{summary.avgWWR}%</div>
        </div>
      </div>

      {/* Results Table */}
      <div style={styles.tableContainer}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Address</th>
                <th style={styles.th}>Location</th>
                <th style={styles.th}>Type</th>
                <th style={styles.th}>WWR</th>
                <th style={styles.th}>Confidence</th>
                <th style={styles.th}>Reasoning</th>
                <th style={styles.th}>Images</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result, index) => (
                <tr key={index}>
                  <td style={styles.td}>
                    {result.street_number} {result.street_name}
                    <br />
                    <span style={{ color: '#666', fontSize: '12px' }}>
                      {result.zip_code}
                    </span>
                  </td>
                  <td style={styles.td}>
                    {result.county && result.state
                      ? `${result.county}, ${result.state}`
                      : result.state || '-'}
                  </td>
                  <td style={styles.td}>
                    {result.building_type ? (
                      <span style={getBadgeStyle(result.building_type)}>
                        {result.building_type}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td style={styles.td}>
                    {result.wwr_estimate !== null && result.wwr_estimate !== undefined ? (
                      <div style={styles.wwrBar}>
                        <div style={styles.wwrBarBg}>
                          <div
                            style={{
                              ...styles.wwrBarFill,
                              width: `${result.wwr_estimate}%`,
                            }}
                          ></div>
                        </div>
                        <span>{result.wwr_estimate}%</span>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td style={styles.td}>
                    {result.confidence ? (
                      <span style={getConfidenceStyle(result.confidence)}>
                        {result.confidence}
                      </span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td style={styles.td}>
                    <div style={styles.reasoning}>
                      {result.error ? (
                        <span style={styles.error}>{result.error}</span>
                      ) : (
                        result.reasoning || '-'
                      )}
                    </div>
                  </td>
                  <td style={styles.td}>
                    {result.images_folder ? (
                      <button
                        style={styles.imageButton}
                        onClick={() =>
                          handleViewImages(
                            result.images_folder,
                            `${result.street_number} ${result.street_name}`
                          )
                        }
                      >
                        View
                      </button>
                    ) : (
                      <span style={{ color: '#999', fontSize: '12px' }}>
                        No images
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImages && (
        <div style={styles.modal} onClick={() => setSelectedImages(null)}>
          <div
            style={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h3>{selectedImages.address}</h3>
              <button
                style={styles.modalClose}
                onClick={() => setSelectedImages(null)}
              >
                ✕
              </button>
            </div>
            <div style={styles.imageGrid}>
              {[0, 1, 2, 3].map((i) => (
                <img
                  key={i}
                  src={`${API_BASE}/images/${selectedImages.folder}/streetview_${i}_${i * 90}deg.jpg`}
                  alt={`Street view ${i + 1}`}
                  style={styles.image}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
