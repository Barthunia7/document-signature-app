import React, { useState, useEffect } from 'react';
import DocumentPreview from './components/DocumentPreview'; // Import the preview component you just made

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [selectedFileUrl, setSelectedFileUrl] = useState(null);

  // Fetch the files from the backend API as soon as this page opens
 useEffect(() => {
  fetch('http://localhost:5000/api/documents') //  Explicit backend URL
    .then((res) => res.json())
    .then((data) => setDocuments(data))
    .catch((err) => console.error("Error fetching files:", err));
}, []);
  return (
    <div style={{ display: 'flex', gap: '40px', padding: '20px' }}>
      {/* Left Column: The Dashboard List */}
      <div style={{ flex: 1 }}>
        <h2>Your Dashboard Documents</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {documents.map((file) => (
            <li 
              key={file.id} 
              onClick={() => setSelectedFileUrl(file.url)}
              style={{ padding: '10px', border: '1px solid #ddd', margin: '5px 0', cursor: 'pointer', background: '#f9f9f9' }}
            >
              📄 {file.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Right Column: The Preview Window */}
      <div style={{ flex: 1 }}>
        <DocumentPreview fileUrl={selectedFileUrl} />
      </div>
    </div>
  );
}
