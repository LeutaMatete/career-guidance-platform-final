import React, { useState, useEffect, useRef } from 'react';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';

const Documents = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState({
    transcripts: [],
    certificates: [],
    identification: [],
    other: []
  });
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newDocument, setNewDocument] = useState({
    name: '',
    type: 'transcripts',
    file: null
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError('');
      const profileData = await studentService.getProfile();
      // Ensure the documents structure is always correct and safe
      setDocuments({
        transcripts: Array.isArray(profileData.documents?.transcripts) ? profileData.documents.transcripts : [],
        certificates: Array.isArray(profileData.documents?.certificates) ? profileData.documents.certificates : [],
        identification: Array.isArray(profileData.documents?.identification) ? profileData.documents.identification : [],
        other: Array.isArray(profileData.documents?.other) ? profileData.documents.other : [],
      });
    } catch (error) {
      console.error('Error loading documents:', error);
      setError('Failed to load documents');
      // Set default safe structure on error
      setDocuments({
        transcripts: [],
        certificates: [],
        identification: [],
        other: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewDocument({
        ...newDocument,
        file: file,
        name: file.name
      });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!newDocument.file) {
      setError('Please select a file to upload');
      return;
    }

    if (!newDocument.name.trim()) {
      setError('Please provide a document name');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      // Read the file as a Data URL
      const fileReader = new FileReader();
      fileReader.onload = async (event) => {
        const fileDataUrl = event.target.result;

        try {
          // Send the data URL, name, and type to the backend via the service
          await studentService.uploadDocument({
            name: newDocument.name,
            type: newDocument.type,
            dataUrl: fileDataUrl
          });

          setSuccess('Document uploaded successfully!');
          setNewDocument({ name: '', type: 'transcripts', file: null }); // Reset form
          fileInputRef.current.value = ''; // Clear file input
          await loadDocuments(); // Reload documents to reflect the new one
        } catch (uploadError) {
          setError(uploadError.message || 'Failed to upload document');
        } finally {
          setUploading(false);
        }
      };
      fileReader.onerror = () => {
        setError('Failed to read the file');
        setUploading(false);
      };
      fileReader.readAsDataURL(newDocument.file); // Start reading the file

    } catch (readError) {
      console.error("Error reading file:", readError);
      setError('Failed to read the file');
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (documentType, documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      // This requires a custom API call or a more complex frontend update logic
      // Let's assume the backend handles deletion by type and index for this example
      // Or update the profile to remove the doc from the array
      const currentProfile = await studentService.getProfile();
      const currentDocs = currentProfile.documents || {
        transcripts: [],
        certificates: [],
        identification: [],
        other: []
      };

      if (currentDocs[documentType] && Array.isArray(currentDocs[documentType])) {
        const updatedDocs = {
          ...currentDocs,
          [documentType]: currentDocs[documentType].filter(doc => doc.id !== documentId)
        };

        // Update the profile with the new documents object
        await studentService.updateProfile({ ...currentProfile, documents: updatedDocs });
        setSuccess('Document deleted successfully');
        await loadDocuments(); // Reload to update the UI
      } else {
         setError('Document type not found or invalid.');
      }
    } catch (error) {
      setError('Failed to delete document');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading documents...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Documents</h1>
        <p>Upload and manage your academic documents</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success">
          {success}
        </div>
      )}

      {/* Upload Form */}
      <div className="card">
        <h3>Upload New Document</h3>
        <form onSubmit={handleUpload} className="upload-form">
          <div className="form-group">
            <label>Document Type</label>
            <select
              value={newDocument.type}
              onChange={(e) => setNewDocument({...newDocument, type: e.target.value})}
              className="form-control"
            >
              <option value="transcripts">Academic Transcripts</option>
              <option value="certificates">Certificates</option>
              <option value="identification">Identification</option>
              <option value="other">Other Documents</option>
            </select>
          </div>

          <div className="form-group">
            <label>File</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label>Document Name</label>
            <input
              type="text"
              value={newDocument.name}
              onChange={(e) => setNewDocument({...newDocument, name: e.target.value})}
              className="form-control"
              placeholder="Enter document name"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </form>
      </div>

      {/* Documents List */}
      <div className="card">
          <h3>Manage Documents</h3>
          {Object.entries(documents).map(([docType, docList]) => (
            <div key={docType} className="document-category-section">
              <h4>{docType.charAt(0).toUpperCase() + docType.slice(1)} ({docList.length})</h4>
              {docList.length === 0 ? (
                <p>No {docType} uploaded yet.</p>
              ) : (
                <div className="documents-list">
                  {docList.map((doc) => (
                    <div key={doc.id} className="document-item">
                      <div className="document-info">
                        <strong>{doc.name}</strong>
                        <span>{doc.type}</span>
                        <small>Uploaded: {new Date(doc.uploadedAt?.toDate?.() || doc.uploadedAt).toLocaleDateString()}</small>
                      </div>
                      <div className="document-actions">
                        <button
                          className="btn btn-outline"
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          View
                        </button>
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDeleteDocument(docType, doc.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
    </div>
  );
};

export default Documents;