import React from 'react';

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    padding: '40px',
    border: '1px solid #e5e7eb',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '16px',
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: '40px',
  },
  flowContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  step: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '24px',
    position: 'relative',
  },
  stepLeft: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: '60px',
  },
  stepNumber: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: '700',
    color: 'white',
    flexShrink: 0,
    position: 'relative',
    zIndex: 2,
  },
  stepLine: {
    width: '3px',
    height: '100%',
    minHeight: '80px',
    background: 'linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%)',
    opacity: 0.3,
    marginTop: '-4px',
  },
  stepContent: {
    flex: 1,
    paddingBottom: '32px',
  },
  stepTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  stepDescription: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.6',
    marginBottom: '16px',
  },
  techBox: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '12px',
    background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
    borderRadius: '10px',
    padding: '12px 16px',
    fontSize: '13px',
    border: '1px solid #e5e7eb',
  },
  techIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    background: 'white',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  techInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  techName: {
    fontWeight: '600',
    color: '#374151',
  },
  techDesc: {
    color: '#6b7280',
    fontSize: '12px',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '12px',
    marginTop: '12px',
  },
  detailItem: {
    background: '#f9fafb',
    borderRadius: '8px',
    padding: '12px',
    textAlign: 'center',
    border: '1px solid #e5e7eb',
  },
  detailIcon: {
    fontSize: '20px',
    marginBottom: '4px',
  },
  detailLabel: {
    fontSize: '12px',
    color: '#6b7280',
  },
  detailValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  outputSection: {
    marginTop: '32px',
    padding: '24px',
    background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
    borderRadius: '12px',
    border: '1px solid #a7f3d0',
  },
  outputTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#065f46',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  outputGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
  },
  outputItem: {
    background: 'white',
    borderRadius: '10px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  outputLabel: {
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  outputValue: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1f2937',
  },
  buildingTypes: {
    marginTop: '40px',
    padding: '24px',
    background: '#f9fafb',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
  },
  typesTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '16px',
    textAlign: 'center',
  },
  typesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '10px',
  },
  typeTag: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
  },
};

const stepColors = [
  'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
  'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
];

const buildingTypes = [
  { name: 'Residential', icon: '🏠', color: '#dcfce7', textColor: '#166534' },
  { name: 'Office', icon: '🏢', color: '#dbeafe', textColor: '#1e40af' },
  { name: 'Hotel', icon: '🏨', color: '#fef3c7', textColor: '#92400e' },
  { name: 'Medical', icon: '🏥', color: '#fce7f3', textColor: '#9d174d' },
  { name: 'Retail', icon: '🏪', color: '#f3e8ff', textColor: '#7c3aed' },
  { name: 'Warehouse', icon: '🏭', color: '#e5e7eb', textColor: '#374151' },
  { name: 'Mixed Use', icon: '🏗️', color: '#ccfbf1', textColor: '#0f766e' },
  { name: 'Misc', icon: '🏛️', color: '#f3f4f6', textColor: '#4b5563' },
];

export default function HowItWorks() {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>How Building Scanner Works</h2>
        <p style={styles.subtitle}>
          A step-by-step breakdown of the AI-powered analysis pipeline
        </p>

        <div style={styles.flowContainer}>
          {/* Step 1: CSV Upload */}
          <div style={styles.step}>
            <div style={styles.stepLeft}>
              <div style={{ ...styles.stepNumber, background: stepColors[0] }}>1</div>
              <div style={styles.stepLine}></div>
            </div>
            <div style={styles.stepContent}>
              <h3 style={styles.stepTitle}>
                <span>📄</span> CSV Upload & Parsing
              </h3>
              <p style={styles.stepDescription}>
                Upload a CSV file with building addresses. Our AI parser handles messy formats,
                different column names, and various address styles automatically.
              </p>
              <div style={styles.techBox}>
                <div style={styles.techIcon}>🤖</div>
                <div style={styles.techInfo}>
                  <span style={styles.techName}>GPT-4o-mini</span>
                  <span style={styles.techDesc}>Smart CSV parsing</span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Street View Images */}
          <div style={styles.step}>
            <div style={styles.stepLeft}>
              <div style={{ ...styles.stepNumber, background: stepColors[1] }}>2</div>
              <div style={styles.stepLine}></div>
            </div>
            <div style={styles.stepContent}>
              <h3 style={styles.stepTitle}>
                <span>📸</span> Fetch Street View Images
              </h3>
              <p style={styles.stepDescription}>
                For each address, we capture 4 street-level images from different angles
                (0°, 90°, 180°, 270°) to get a complete view of the building facade.
              </p>
              <div style={styles.techBox}>
                <div style={styles.techIcon}>🗺️</div>
                <div style={styles.techInfo}>
                  <span style={styles.techName}>Google Street View API</span>
                  <span style={styles.techDesc}>High-quality imagery</span>
                </div>
              </div>
              <div style={styles.detailsGrid}>
                <div style={styles.detailItem}>
                  <div style={styles.detailIcon}>🖼️</div>
                  <div style={styles.detailValue}>4 Images</div>
                  <div style={styles.detailLabel}>Per building</div>
                </div>
                <div style={styles.detailItem}>
                  <div style={styles.detailIcon}>🔄</div>
                  <div style={styles.detailValue}>360°</div>
                  <div style={styles.detailLabel}>Coverage</div>
                </div>
                <div style={styles.detailItem}>
                  <div style={styles.detailIcon}>📐</div>
                  <div style={styles.detailValue}>640×480</div>
                  <div style={styles.detailLabel}>Resolution</div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Web Search */}
          <div style={styles.step}>
            <div style={styles.stepLeft}>
              <div style={{ ...styles.stepNumber, background: stepColors[2] }}>3</div>
              <div style={styles.stepLine}></div>
            </div>
            <div style={styles.stepContent}>
              <h3 style={styles.stepTitle}>
                <span>🔍</span> Contextual Web Search
              </h3>
              <p style={styles.stepDescription}>
                We search for each address with keywords like "rent", "for lease", "apartments",
                and "office space" to gather context about the building's use.
              </p>
              <div style={styles.techBox}>
                <div style={styles.techIcon}>🔎</div>
                <div style={styles.techInfo}>
                  <span style={styles.techName}>Google Custom Search API</span>
                  <span style={styles.techDesc}>Building context</span>
                </div>
              </div>
              <div style={styles.detailsGrid}>
                <div style={styles.detailItem}>
                  <div style={styles.detailIcon}>📝</div>
                  <div style={styles.detailValue}>6 Queries</div>
                  <div style={styles.detailLabel}>Per address</div>
                </div>
                <div style={styles.detailItem}>
                  <div style={styles.detailIcon}>📊</div>
                  <div style={styles.detailValue}>Snippets</div>
                  <div style={styles.detailLabel}>Extracted</div>
                </div>
              </div>
            </div>
          </div>

          {/* Step 4: AI Vision Analysis */}
          <div style={styles.step}>
            <div style={styles.stepLeft}>
              <div style={{ ...styles.stepNumber, background: stepColors[3] }}>4</div>
            </div>
            <div style={styles.stepContent}>
              <h3 style={styles.stepTitle}>
                <span>🧠</span> AI Vision Analysis
              </h3>
              <p style={styles.stepDescription}>
                OpenAI's GPT-4o Vision analyzes the images and search context to classify
                the building type and estimate the window-to-wall ratio (WWR).
              </p>
              <div style={styles.techBox}>
                <div style={styles.techIcon}>👁️</div>
                <div style={styles.techInfo}>
                  <span style={styles.techName}>GPT-4o Vision</span>
                  <span style={styles.techDesc}>Multi-image analysis</span>
                </div>
              </div>
              <div style={styles.detailsGrid}>
                <div style={styles.detailItem}>
                  <div style={styles.detailIcon}>🏷️</div>
                  <div style={styles.detailValue}>Type</div>
                  <div style={styles.detailLabel}>Classification</div>
                </div>
                <div style={styles.detailItem}>
                  <div style={styles.detailIcon}>🪟</div>
                  <div style={styles.detailValue}>WWR %</div>
                  <div style={styles.detailLabel}>Window ratio</div>
                </div>
                <div style={styles.detailItem}>
                  <div style={styles.detailIcon}>📈</div>
                  <div style={styles.detailValue}>Confidence</div>
                  <div style={styles.detailLabel}>Score</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div style={styles.outputSection}>
          <h3 style={styles.outputTitle}>
            <span>✅</span> Output Results
          </h3>
          <div style={styles.outputGrid}>
            <div style={styles.outputItem}>
              <div style={styles.outputLabel}>Building Type</div>
              <div style={styles.outputValue}>e.g., "commercial-office"</div>
            </div>
            <div style={styles.outputItem}>
              <div style={styles.outputLabel}>Window-to-Wall Ratio</div>
              <div style={styles.outputValue}>e.g., 45%</div>
            </div>
            <div style={styles.outputItem}>
              <div style={styles.outputLabel}>Confidence Level</div>
              <div style={styles.outputValue}>High / Medium / Low</div>
            </div>
            <div style={styles.outputItem}>
              <div style={styles.outputLabel}>AI Reasoning</div>
              <div style={styles.outputValue}>Explanation text</div>
            </div>
          </div>
        </div>

        {/* Building Types */}
        <div style={styles.buildingTypes}>
          <h3 style={styles.typesTitle}>Building Classification Categories</h3>
          <div style={styles.typesGrid}>
            {buildingTypes.map((type) => (
              <div
                key={type.name}
                style={{
                  ...styles.typeTag,
                  background: type.color,
                  color: type.textColor,
                }}
              >
                <span>{type.icon}</span>
                <span>{type.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
