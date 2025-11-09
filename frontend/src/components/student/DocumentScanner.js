import React, { useState, useRef } from 'react';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';

const DocumentScanner = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [suggestedCourses, setSuggestedCourses] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [documentType, setDocumentType] = useState('transcript');
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError('');
      setSuccess('');
      setScanResult(null);
      setSuggestedCourses([]);
    }
  };

  const handleScan = async () => {
    if (!selectedFile) {
      setError('Please select a document to scan');
      return;
    }

    try {
      setScanning(true);
      setError('');
      setSuccess('');

      // Simulate document upload and scanning
      const formData = new FormData();
      formData.append('documentFile', selectedFile);
      formData.append('documentType', documentType);

      // In real app, this would scan the document and return results
      const result = await studentService.scanDocument({
        documentType,
        documentFile: selectedFile
      });

      setScanResult(result.scanResult);
      setSuggestedCourses(result.qualifiedCourses);
      setSuccess('Document scanned successfully! Course suggestions generated.');
    } catch (error) {
      console.error('Error scanning document:', error);
      setError('Failed to scan document: ' + (error.response?.data?.message || error.message));
    } finally {
      setScanning(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      setError('Please select a document to upload');
      return;
    }

    try {
      setScanning(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('documentFile', selectedFile);
      formData.append('documentType', documentType);

      await studentService.uploadDocument(formData);
      setSuccess('Document uploaded successfully! Processing for course suggestions...');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      setError('Failed to upload document: ' + (error.response?.data?.message || error.message));
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Document Scanner</h1>
        <p>Upload your academic documents to get personalized course suggestions</p>
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

      <div className="document-scanner-container">
        {/* Upload Section */}
        <div className="upload-section">
          <div className="upload-header">
            <h3>Upload Academic Document</h3>
            <p>Upload your transcript, certificates, or other academic documents</p>
          </div>
          
          <div className="upload-form">
            <div className="form-group">
              <label htmlFor="documentType">Document Type</label>
              <select
                id="documentType"
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="form-control"
              >
                <option value="transcript">Academic Transcript</option>
                <option value="certificate">Certificate</option>
                <option value="diploma">Diploma</option>
                <option value="other">Other Academic Document</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="documentFile">Select Document</label>
              <input
                type="file"
                id="documentFile"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                ref={fileInputRef}
                className="form-control"
              />
            </div>
            
            {selectedFile && (
              <div className="selected-file">
                <strong>Selected:</strong> {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
              </div>
            )}
            
            <div className="action-buttons">
              <button 
                onClick={handleFileUpload}
                disabled={scanning || !selectedFile}
                className="btn btn-primary"
              >
                {scanning ? 'Uploading...' : 'Upload Document'}
              </button>
              <button 
                onClick={handleScan}
                disabled={scanning || !selectedFile}
                className="btn btn-outline"
              >
                {scanning ? 'Scanning...' : 'Scan & Get Suggestions'}
              </button>
            </div>
          </div>
        </div>

        {/* Scan Results */}
        {scanResult && (
          <div className="scan-results">
            <h3>Document Analysis Results</h3>
            <div className="results-grid">
              <div className="result-card">
                <h4>Education Level</h4>
                <p>{scanResult.educationLevel}</p>
              </div>
              <div className="result-card">
                <h4>GPA</h4>
                <p>{scanResult.gpa}</p>
              </div>
              <div className="result-card">
                <h4>Subjects ({scanResult.subjects.length})</h4>
                <p>{scanResult.subjects.join(', ')}</p>
              </div>
            </div>
            
            <div className="subject-grades">
              <h4>Subject Grades</h4>
              <div className="grades-grid">
                {Object.entries(scanResult.subjectGrades).map(([subject, grade]) => (
                  <div key={subject} className="grade-item">
                    <span className="subject-name">{subject}</span>
                    <span className="grade-value">{grade}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Suggested Courses */}
        {suggestedCourses.length > 0 && (
          <div className="suggested-courses">
            <h3>Recommended Courses for You</h3>
            <p>Based on your academic performance, here are courses you may qualify for:</p>
            
            <div className="courses-grid">
              {suggestedCourses.map((course) => (
                <div key={course.id} className="course-card">
                  <h4>{course.name}</h4>
                  <p><strong>Institution:</strong> {course.institutionName}</p>
                  <p><strong>Faculty:</strong> {course.faculty}</p>
                  <p><strong>Duration:</strong> {course.duration}</p>
                  <p><strong>Requirements:</strong> {course.requirements?.requiredSubjects?.join(', ') || 'None specified'}</p>
                  <button className="btn btn-primary">
                    Apply Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Previous Documents */}
        <div className="previous-documents">
          <h3>Previously Uploaded Documents</h3>
          <p>Manage your uploaded academic documents</p>
          {/* This would show previously uploaded documents */}
        </div>
      </div>
    </div>
  );
};

export default DocumentScanner;