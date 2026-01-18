import React, { useState } from 'react';

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
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  titleIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
  },
  buttonGroup: {
    display: 'flex',
    gap: '10px',
  },
  button: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
  },
  buttonPrimary: {
    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
    color: 'white',
    boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)',
  },
  buttonSecondary: {
    background: 'white',
    color: '#374151',
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  buttonSuccess: {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: 'white',
    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.3)',
  },
  summary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
    marginBottom: '24px',
  },
  summaryCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    transition: 'all 0.2s',
  },
  summaryIcon: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    marginBottom: '12px',
  },
  summaryLabel: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '4px',
  },
  summaryValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
  },
  tableContainer: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
  },
  tableHeader: {
    padding: '16px 20px',
    background: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tableTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151',
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
    background: '#f9fafb',
    padding: '14px 16px',
    textAlign: 'left',
    fontWeight: '600',
    color: '#374151',
    borderBottom: '1px solid #e5e7eb',
    whiteSpace: 'nowrap',
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  td: {
    padding: '16px',
    borderBottom: '1px solid #f3f4f6',
    verticalAlign: 'top',
  },
  trHover: {
    transition: 'background 0.2s',
  },
  addressCell: {
    fontWeight: '500',
    color: '#1f2937',
  },
  addressZip: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '2px',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    borderRadius: '9999px',
    fontSize: '12px',
    fontWeight: '600',
  },
  badgeResidential: {
    background: '#dcfce7',
    color: '#166534',
  },
  badgeCommercialOffice: {
    background: '#dbeafe',
    color: '#1e40af',
  },
  badgeCommercialHotel: {
    background: '#fef3c7',
    color: '#92400e',
  },
  badgeCommercialMedical: {
    background: '#fce7f3',
    color: '#9d174d',
  },
  badgeCommercialRetail: {
    background: '#f3e8ff',
    color: '#7c3aed',
  },
  badgeCommercialWarehouse: {
    background: '#e5e7eb',
    color: '#374151',
  },
  badgeMixed: {
    background: '#ccfbf1',
    color: '#0f766e',
  },
  badgeMisc: {
    background: '#f3f4f6',
    color: '#4b5563',
  },
  wwrContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  wwrBar: {
    width: '60px',
    height: '8px',
    background: '#e5e7eb',
    borderRadius: '9999px',
    overflow: 'hidden',
  },
  wwrFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
    borderRadius: '9999px',
  },
  wwrValue: {
    fontWeight: '600',
    color: '#1f2937',
    minWidth: '36px',
  },
  confidenceHigh: {
    color: '#059669',
    fontWeight: '600',
  },
  confidenceMedium: {
    color: '#d97706',
    fontWeight: '600',
  },
  confidenceLow: {
    color: '#dc2626',
    fontWeight: '600',
  },
  reasoning: {
    maxWidth: '280px',
    fontSize: '13px',
    color: '#6b7280',
    lineHeight: '1.5',
  },
  imageButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    background: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '6px',
    color: '#2563eb',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  noImages: {
    fontSize: '12px',
    color: '#9ca3af',
  },
  error: {
    color: '#dc2626',
    fontSize: '12px',
    background: '#fef2f2',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '900px',
    maxHeight: '90vh',
    overflow: 'auto',
    width: '100%',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '16px',
    borderBottom: '1px solid #e5e7eb',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
  },
  modalClose: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    background: '#f3f4f6',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#6b7280',
    transition: 'all 0.2s',
  },
  imageGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px',
  },
  image: {
    width: '100%',
    height: '220px',
    objectFit: 'cover',
    borderRadius: '10px',
    border: '1px solid #e5e7eb',
  },
};

const typeIcons = {
  'residential': '🏠',
  'commercial-office': '🏢',
  'commercial-hotel': '🏨',
  'commercial-medical': '🏥',
  'commercial-retail': '🏪',
  'commercial-warehouse': '🏭',
  'mixed': '🏗️',
  'misc': '🏛️',
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
    const badgeStyles = {
      'residential': styles.badgeResidential,
      'commercial-office': styles.badgeCommercialOffice,
      'commercial-hotel': styles.badgeCommercialHotel,
      'commercial-medical': styles.badgeCommercialMedical,
      'commercial-retail': styles.badgeCommercialRetail,
      'commercial-warehouse': styles.badgeCommercialWarehouse,
      'mixed': styles.badgeMixed,
    };
    return { ...styles.badge, ...(badgeStyles[type] || styles.badgeMisc) };
  };

  const getConfidenceStyle = (confidence) => {
    switch (confidence) {
      case 'high': return styles.confidenceHigh;
      case 'medium': return styles.confidenceMedium;
      default: return styles.confidenceLow;
    }
  };

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
        <div style={styles.titleGroup}>
          <div style={styles.titleIcon}>✓</div>
          <div>
            <div style={styles.title}>Analysis Results</div>
            <div style={styles.subtitle}>{results.length} buildings analyzed</div>
          </div>
        </div>
        <div style={styles.buttonGroup}>
          <button
            style={{ ...styles.button, ...styles.buttonSecondary }}
            onClick={onNewScan}
          >
            ← New Scan
          </button>
          <button
            style={{ ...styles.button, ...styles.buttonPrimary }}
            onClick={handleDownloadCSV}
          >
            📄 CSV
          </button>
          <button
            style={{ ...styles.button, ...styles.buttonSuccess }}
            onClick={handleDownloadZIP}
          >
            📦 ZIP
          </button>
        </div>
      </div>

      <div style={styles.summary}>
        <div style={styles.summaryCard}>
          <div style={{ ...styles.summaryIcon, background: '#dbeafe' }}>🏢</div>
          <div style={styles.summaryLabel}>Total Buildings</div>
          <div style={styles.summaryValue}>{summary.total}</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={{ ...styles.summaryIcon, background: '#dcfce7' }}>🏠</div>
          <div style={styles.summaryLabel}>Residential</div>
          <div style={{ ...styles.summaryValue, color: '#16a34a' }}>{summary.residential}</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={{ ...styles.summaryIcon, background: '#dbeafe' }}>🏢</div>
          <div style={styles.summaryLabel}>Commercial</div>
          <div style={{ ...styles.summaryValue, color: '#2563eb' }}>{summary.commercial}</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={{ ...styles.summaryIcon, background: '#ccfbf1' }}>🏗️</div>
          <div style={styles.summaryLabel}>Mixed Use</div>
          <div style={{ ...styles.summaryValue, color: '#0d9488' }}>{summary.mixed}</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={{ ...styles.summaryIcon, background: '#fef3c7' }}>🪟</div>
          <div style={styles.summaryLabel}>Avg WWR</div>
          <div style={styles.summaryValue}>{summary.avgWWR}%</div>
        </div>
      </div>

      <div style={styles.tableContainer}>
        <div style={styles.tableHeader}>
          <span style={styles.tableTitle}>Building Details</span>
        </div>
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
                <tr key={index} style={styles.trHover}>
                  <td style={styles.td}>
                    <div style={styles.addressCell}>
                      {result.street_number} {result.street_name}
                    </div>
                    <div style={styles.addressZip}>{result.zip_code}</div>
                  </td>
                  <td style={styles.td}>
                    {result.county && result.state
                      ? `${result.county}, ${result.state}`
                      : result.state || '-'}
                  </td>
                  <td style={styles.td}>
                    {result.building_type ? (
                      <span style={getBadgeStyle(result.building_type)}>
                        {typeIcons[result.building_type] || '🏛️'} {result.building_type}
                      </span>
                    ) : '-'}
                  </td>
                  <td style={styles.td}>
                    {result.wwr_estimate !== null && result.wwr_estimate !== undefined ? (
                      <div style={styles.wwrContainer}>
                        <div style={styles.wwrBar}>
                          <div style={{ ...styles.wwrFill, width: `${result.wwr_estimate}%` }}></div>
                        </div>
                        <span style={styles.wwrValue}>{result.wwr_estimate}%</span>
                      </div>
                    ) : '-'}
                  </td>
                  <td style={styles.td}>
                    {result.confidence ? (
                      <span style={getConfidenceStyle(result.confidence)}>
                        {result.confidence === 'high' && '● '}
                        {result.confidence === 'medium' && '◐ '}
                        {result.confidence === 'low' && '○ '}
                        {result.confidence}
                      </span>
                    ) : '-'}
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
                        🖼️ View
                      </button>
                    ) : (
                      <span style={styles.noImages}>No images</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedImages && (
        <div style={styles.modal} onClick={() => setSelectedImages(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>📍 {selectedImages.address}</h3>
              <button style={styles.modalClose} onClick={() => setSelectedImages(null)}>
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
