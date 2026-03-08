import React, { useState, useEffect } from 'react';

export default function DocumentStorage({ user }) {
  const [documents, setDocuments] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeTab, setActiveTab] = useState('documents');

  // Load documents from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(`threviaDocuments_${user?.id}`);
    if (stored) {
      setDocuments(JSON.parse(stored));
    }
  }, [user?.id]);

  // Save documents to localStorage
  const saveDocuments = (docs) => {
    localStorage.setItem(`threviaDocuments_${user?.id}`, JSON.stringify(docs));
    setDocuments(docs);
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onload = (e) => {
      const newDoc = {
        id: Date.now(),
        name: file.name,
        type: file.type,
        size: file.size,
        data: e.target?.result,
        uploadedAt: new Date().toLocaleString(),
      };

      saveDocuments([newDoc, ...documents]);
      setSelectedFile(null);
      event.target.value = '';
    };

    reader.onprogress = (e) => {
      const progress = (e.loaded / e.total) * 100;
      setUploadProgress(progress);
    };

    reader.readAsDataURL(file);
  };

  // Download document
  const downloadDocument = (doc) => {
    const link = document.createElement('a');
    link.href = doc.data;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Delete document
  const deleteDocument = (id) => {
    if (confirm('Are you sure you want to delete this document?')) {
      saveDocuments(documents.filter((doc) => doc.id !== id));
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Get file icon
  const getFileIcon = (type) => {
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('image')) return 'IMG';
    if (type.includes('document') || type.includes('word')) return 'DOC';
    if (type.includes('sheet') || type.includes('excel')) return 'XLS';
    if (type.includes('presentation')) return 'PPT';
    if (type.includes('video')) return 'VID';
    if (type.includes('audio')) return 'AUD';
    return 'FILE';
  };

  const M = {
    wrap: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: 'transparent',
      color: '#10223a',
      fontFamily: "'Manrope', sans-serif",
    },
    header: {
      padding: '18px',
      borderBottom: '1px solid rgba(16,34,58,0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: 30,
      fontWeight: 700,
      margin: 0,
      color: '#0f2540',
      fontFamily: "'Space Grotesk', sans-serif",
    },
    tabs: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px',
      padding: '12px 18px',
      borderBottom: '1px solid rgba(16,34,58,0.1)',
    },
    tab: {
      padding: '9px 14px',
      borderRadius: '999px',
      border: '1px solid rgba(16,34,58,0.12)',
      background: 'rgba(255,255,255,0.72)',
      color: 'rgba(16,34,58,0.66)',
      cursor: 'pointer',
      fontSize: 12.5,
      fontWeight: 600,
    },
    tabActive: {
      background: 'rgba(10,158,159,0.12)',
      color: '#0a9e9f',
      borderColor: 'rgba(10,158,159,0.4)',
    },
    content: {
      flex: 1,
      overflow: 'auto',
      padding: '18px',
    },
    uploadArea: {
      border: '2px dashed rgba(16,34,58,0.24)',
      borderRadius: '14px',
      padding: '32px 24px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s',
      marginBottom: '24px',
      background: 'rgba(255,255,255,0.78)',
    },
    uploadIcon: {
      width: 78,
      height: 78,
      margin: '0 auto 12px',
      borderRadius: '20px',
      border: '1px solid rgba(16,34,58,0.16)',
      background: 'rgba(255,255,255,0.92)',
      fontSize: 12,
      fontWeight: 700,
      letterSpacing: '1px',
      display: 'grid',
      placeItems: 'center',
      color: '#0f2540',
      fontFamily: "'Space Grotesk', sans-serif",
    },
    uploadText: {
      fontSize: 14,
      color: 'rgba(16,34,58,0.75)',
      margin: '8px 0',
    },
    uploadHint: {
      fontSize: 12,
      color: 'rgba(16,34,58,0.58)',
      marginTop: '8px',
    },
    documentList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
      gap: '16px',
    },
    documentCard: {
      background: 'rgba(255,255,255,0.78)',
      border: '1px solid rgba(16,34,58,0.14)',
      borderRadius: '14px',
      padding: '16px',
      transition: 'all 0.2s',
    },
    documentCardHover: {
      borderColor: 'rgba(10,158,159,0.45)',
      background: 'rgba(10,158,159,0.12)',
    },
    documentIcon: {
      width: 46,
      height: 46,
      borderRadius: '12px',
      border: '1px solid rgba(16,34,58,0.14)',
      background: 'rgba(255,255,255,0.9)',
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: '.5px',
      display: 'grid',
      placeItems: 'center',
      color: '#0f2540',
      fontFamily: "'Space Grotesk', sans-serif",
      marginBottom: '12px',
    },
    documentName: {
      fontSize: 14,
      fontWeight: 600,
      marginBottom: '8px',
      wordBreak: 'break-word',
    },
    documentMeta: {
      fontSize: 11,
      color: 'rgba(16,34,58,0.58)',
      marginBottom: '12px',
      lineHeight: 1.4,
    },
    documentActions: {
      display: 'flex',
      gap: '8px',
    },
    button: {
      flex: 1,
      padding: '8px 12px',
      borderRadius: '6px',
      border: 'none',
      fontSize: 11,
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    downloadBtn: {
      background: 'rgba(12,123,198,0.18)',
      color: '#0d7ec7',
      border: '1px solid rgba(12,123,198,0.3)',
    },
    deleteBtn: {
      background: 'rgba(191,84,63,0.12)',
      color: '#b0523d',
      border: '1px solid rgba(191,84,63,0.3)',
    },
    emptyState: {
      textAlign: 'center',
      padding: '48px 24px',
      color: 'rgba(16,34,58,0.56)',
    },
    emptyIcon: {
      width: 96,
      height: 96,
      margin: '0 auto 16px',
      borderRadius: '24px',
      border: '1px solid rgba(16,34,58,0.14)',
      background: 'rgba(255,255,255,0.9)',
      fontSize: 13,
      fontWeight: 700,
      letterSpacing: '1px',
      display: 'grid',
      placeItems: 'center',
      color: '#0f2540',
      fontFamily: "'Space Grotesk', sans-serif",
    },
    stats: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '16px',
      marginBottom: '24px',
    },
    statCard: {
      background: 'rgba(255,255,255,0.78)',
      border: '1px solid rgba(16,34,58,0.14)',
      borderRadius: '10px',
      padding: '16px',
      textAlign: 'center',
    },
    statValue: {
      fontSize: 24,
      fontWeight: 700,
      color: '#0a9e9f',
      marginBottom: '4px',
      fontFamily: "'Space Grotesk', sans-serif",
    },
    statLabel: {
      fontSize: 12,
      color: 'rgba(16,34,58,0.6)',
    },
  };

  const calculateTotalSize = () => {
    return documents.reduce((sum, doc) => sum + doc.size, 0);
  };

  return (
    <div style={M.wrap}>
      {/* Header */}
      <div style={M.header}>
        <h1 style={M.title}>My Documents</h1>
        <div style={{ fontSize: 12, color: 'rgba(16,34,58,0.58)' }}>
          {documents.length} document{documents.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Tabs */}
      <div style={M.tabs}>
        <button
          style={{
            ...M.tab,
            ...(activeTab === 'documents' ? M.tabActive : {}),
          }}
          onClick={() => setActiveTab('documents')}
        >
          Documents
        </button>
        <button
          style={{
            ...M.tab,
            ...(activeTab === 'upload' ? M.tabActive : {}),
          }}
          onClick={() => setActiveTab('upload')}
        >
          Upload
        </button>
        <button
          style={{
            ...M.tab,
            ...(activeTab === 'stats' ? M.tabActive : {}),
          }}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
      </div>

      {/* Content */}
      <div style={M.content}>
        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div>
            <label style={M.uploadArea} onDrop={(e) => {
              e.preventDefault();
              const files = e.dataTransfer.files;
              if (files.length > 0) {
                const input = document.createElement('input');
                input.type = 'file';
                const file = files[0];
                // Simulate file selection
                const event = { target: { files: [file] } };
                handleFileUpload(event);
              }
            }} onDragOver={(e) => e.preventDefault()}>
              <div style={M.uploadIcon}>UPLOAD</div>
              <div style={M.uploadText}>
                Drag and drop your files here or click to select
              </div>
              <div style={M.uploadHint}>
                PDF, Images, Documents (Max 10MB)
              </div>
              <input
                type="file"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              />
            </label>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div>
                <div style={{ marginBottom: '8px', fontSize: 12 }}>
                  Uploading... {Math.round(uploadProgress)}%
                </div>
                <div
                  style={{
                    height: '6px',
                    background: 'rgba(16,34,58,0.1)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #0a9e9f, #0d7ec7)',
                      width: `${uploadProgress}%`,
                      transition: 'width 0.2s',
                    }}
                  />
                </div>
              </div>
            )}

            {documents.length > 0 && (
              <div style={{ marginTop: '32px' }}>
                <h3 style={{ fontSize: 14, marginBottom: '16px' }}>
                  Recent Uploads
                </h3>
                <div style={M.documentList}>
                  {documents.slice(0, 3).map((doc) => (
                    <div key={doc.id} style={M.documentCard}>
                      <div style={M.documentIcon}>
                        {getFileIcon(doc.type)}
                      </div>
                      <div style={M.documentName}>{doc.name}</div>
                      <div style={M.documentMeta}>
                        {formatFileSize(doc.size)} • {doc.uploadedAt}
                      </div>
                      <div style={M.documentActions}>
                        <button
                          style={{ ...M.button, ...M.downloadBtn }}
                          onClick={() => downloadDocument(doc)}
                        >
                          Download
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div>
            {documents.length === 0 ? (
              <div style={M.emptyState}>
                <div style={M.emptyIcon}>EMPTY</div>
                <div>No documents yet</div>
                <div style={{ fontSize: 12, marginTop: '8px' }}>
                  Upload your first document to get started
                </div>
              </div>
            ) : (
              <div>
                <div
                  style={{
                    marginBottom: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <h3 style={{ fontSize: 14, margin: 0 }}>
                    All Documents ({documents.length})
                  </h3>
                  <button
                    onClick={() => setActiveTab('upload')}
                    style={{
                      padding: '6px 12px',
                      fontSize: 11,
                      borderRadius: '6px',
                      border: '1px solid rgba(12,123,198,0.3)',
                      background: 'rgba(12,123,198,0.18)',
                      color: '#0d7ec7',
                      cursor: 'pointer',
                    }}
                  >
                    Upload New
                  </button>
                </div>
                <div style={M.documentList}>
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      style={M.documentCard}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(10,158,159,0.45)';
                        e.currentTarget.style.background = 'rgba(10,158,159,0.12)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(16,34,58,0.14)';
                        e.currentTarget.style.background = 'rgba(255,255,255,0.78)';
                      }}
                    >
                      <div style={M.documentIcon}>
                        {getFileIcon(doc.type)}
                      </div>
                      <div style={M.documentName}>{doc.name}</div>
                      <div style={M.documentMeta}>
                        {formatFileSize(doc.size)} • {doc.uploadedAt}
                      </div>
                      <div style={M.documentActions}>
                        <button
                          style={{ ...M.button, ...M.downloadBtn }}
                          onClick={() => downloadDocument(doc)}
                        >
                          Download
                        </button>
                        <button
                          style={{ ...M.button, ...M.deleteBtn }}
                          onClick={() => deleteDocument(doc.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'stats' && (
          <div>
            <div style={M.stats}>
              <div style={M.statCard}>
                <div style={M.statValue}>{documents.length}</div>
                <div style={M.statLabel}>Total Documents</div>
              </div>
              <div style={M.statCard}>
                <div style={M.statValue}>
                  {(calculateTotalSize() / (1024 * 1024)).toFixed(1)}
                </div>
                <div style={M.statLabel}>Total Storage (MB)</div>
              </div>
              <div style={M.statCard}>
                <div style={M.statValue}>10</div>
                <div style={M.statLabel}>Storage Limit (MB)</div>
              </div>
              <div style={M.statCard}>
                <div style={M.statValue}>
                  {(
                    ((10 - calculateTotalSize() / (1024 * 1024)) / 10) *
                    100
                  ).toFixed(0)}
                </div>
                <div style={M.statLabel}>Available (%)</div>
              </div>
            </div>

            <h3 style={{ fontSize: 14, marginBottom: '16px' }}>
              Supported File Types
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '12px',
              }}
            >
              {[
                { icon: 'PDF', name: 'PDF' },
                { icon: 'IMG', name: 'Images' },
                { icon: 'DOC', name: 'Documents' },
                { icon: 'XLS', name: 'Spreadsheets' },
                { icon: 'PPT', name: 'Presentations' },
              ].map((type) => (
                <div
                  key={type.name}
                  style={{
                    background: 'rgba(255,255,255,0.78)',
                    border: '1px solid rgba(16,34,58,0.14)',
                    borderRadius: '8px',
                    padding: '12px',
                    textAlign: 'center',
                    fontSize: 12,
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: '4px' }}>
                    {type.icon}
                  </div>
                  {type.name}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
