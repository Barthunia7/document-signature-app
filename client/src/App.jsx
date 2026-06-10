import React, { useState, useEffect } from 'react';
import DocumentPreview from './components/DocumentPreview'; 
import PdfEditor from './PdfEditor'; 

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [selectedFileUrl, setSelectedFileUrl] = useState(null);

    useEffect(() => {
    fetch('http://localhost:5000/api/documents') 
      .then((res) => res.json())
      .then((data) => {
        // If the backend returns an empty array, inject a mock document for local testing
        if (!data || data.length === 0) {
          setDocuments([{ id: 'mock_1', name: 'Sample_Contract_Day6.pdf', url: '#' }]);
        } else {
          setDocuments(data);
        }
      })
      .catch((err) => {
        console.error("Error fetching files:", err);
        // Fallback in case the backend server is offline entirely
        setDocuments([{ id: 'mock_1', name: 'Sample_Contract_Day6.pdf', url: '#' }]);
      });
  }, []);

  return (
    <div style={{ display: 'flex', gap: '40px', padding: '20px', color: '#fff' }}>
      
      {/* Left Column: The Dashboard List */}
      <div style={{ flex: 1 }}>
        <h2>Your Dashboard Documents</h2>
        {documents.length === 0 ? (
          <p style={{ color: '#aaa' }}>No documents found or loading...</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {documents.map((file) => (
              <li 
                key={file.id || file._id} // Flexible handle for database IDs
                onClick={() => setSelectedFileUrl(file.url)}
                style={{ 
                  padding: '12px', 
                  border: '1px solid #333', 
                  margin: '8px 0', 
                  cursor: 'pointer', 
                  background: selectedFileUrl === file.url ? '#007bff' : '#2a2a2a',
                  color: '#fff',
                  borderRadius: '6px',
                  transition: 'background 0.2s'
                }}
              >
                📄 {file.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Right Column: The PDF Interactive Workspace */}
      <div style={{ flex: 2 }}>
        <h2>Workspace Preview</h2>
        {selectedFileUrl ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Integrated Day 6 PDF Editor Tool Layer */}
            <PdfEditor fileUrl={selectedFileUrl} />
            
            {/* Standard Visual Preview Layer underneath */}
            <DocumentPreview fileUrl={selectedFileUrl} />
          </div>
        ) : (
          <div style={{ 
            border: '2px dashed #444', 
            padding: '40px', 
            textAlign: 'center', 
            color: '#aaa',
            borderRadius: '8px' 
          }}>
            Select a document from the left panel to begin adding signature fields.
          </div>
        )}
      </div>

    </div>
  );
}
