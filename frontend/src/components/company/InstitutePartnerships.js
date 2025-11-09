import React, { useState, useEffect } from 'react';
import { companyService } from '../../services/companyService';

const InstitutePartnerships = () => {
  const [graduates, setGraduates] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [partnerships, setPartnerships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('graduates');
  const [filters, setFilters] = useState({
    skills: [],
    courseTypes: [],
    institutions: [],
    experienceLevel: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [gradsData, instData, partsData] = await Promise.all([
        companyService.getQualifiedGraduates(filters),
        companyService.getInstitutions(),
        companyService.getPartnerships()
      ]);
      
      setGraduates(gradsData.graduates || []);
      setInstitutions(instData.institutions || []);
      setPartnerships(partsData.partnerships || []);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePartnershipRequest = async (institutionId, type) => {
    const description = prompt(`Enter description for ${type} partnership:`);
    const benefits = prompt('Enter proposed benefits:');

    if (description && benefits) {
      try {
        await companyService.createPartnershipRequest({
          institutionId,
          partnershipType: type,
          description,
          proposedBenefits: benefits
        });
        alert('Partnership request sent successfully!');
        loadData();
      } catch (error) {
        console.error('Error creating partnership request:', error);
        alert('Failed to send partnership request');
      }
    }
  };

  const handleSkillAnalysis = async (courseId) => {
    try {
      const analysis = await companyService.analyzeSkillAlignment(courseId);
      alert(`Skill alignment score: ${analysis.alignmentScore}%`);
      // You could display this in a modal with more details
    } catch (error) {
      console.error('Error analyzing skills:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading partnership data...</div>;
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Institute Partnerships</h1>
        <p>Connect with educational institutions and recruit qualified graduates</p>
      </div>

      <div className="partnerships-tabs">
        <button 
          className={`tab-button ${activeTab === 'graduates' ? 'active' : ''}`}
          onClick={() => setActiveTab('graduates')}
        >
          Qualified Graduates
        </button>
        <button 
          className={`tab-button ${activeTab === 'institutions' ? 'active' : ''}`}
          onClick={() => setActiveTab('institutions')}
        >
          Institutions
        </button>
        <button 
          className={`tab-button ${activeTab === 'partnerships' ? 'active' : ''}`}
          onClick={() => setActiveTab('partnerships')}
        >
          Active Partnerships
        </button>
      </div>

      <div className="tab-content">
        {/* Qualified Graduates Tab */}
        {activeTab === 'graduates' && (
          <div className="graduates-section">
            <div className="filters-section">
              <h3>Filter Graduates</h3>
              <div className="filter-controls">
                <select 
                  value={filters.experienceLevel} 
                  onChange={(e) => setFilters({...filters, experienceLevel: e.target.value})}
                >
                  <option value="">All Experience Levels</option>
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior</option>
                </select>
              </div>
            </div>

            <div className="graduates-list">
              <h3>Qualified Graduates ({graduates.length})</h3>
              
              {graduates.length === 0 ? (
                <div className="empty-state">
                  <p>No graduates found matching your criteria.</p>
                </div>
              ) : (
                graduates.map(graduate => (
                  <div key={graduate.studentId} className="graduate-card">
                    <div className="graduate-info">
                      <h4>{graduate.studentName}</h4>
                      <p><strong>Course:</strong> {graduate.courseName}</p>
                      <p><strong>Institution:</strong> {graduate.institutionName}</p>
                      <p><strong>Skills:</strong> {graduate.skills.join(', ')}</p>
                      
                      <div className="match-score">
                        <span className={`score-badge ${graduate.matchLevel}`}>
                          Match: {graduate.matchScore}%
                        </span>
                      </div>
                    </div>

                    <div className="graduate-actions">
                      <button className="btn btn-primary">
                        Contact
                      </button>
                      <button className="btn btn-outline">
                        View Profile
                      </button>
                      <button 
                        className="btn btn-secondary"
                        onClick={() => handleSkillAnalysis(graduate.courseId)}
                      >
                        Analyze Skills
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Institutions Tab */}
        {activeTab === 'institutions' && (
          <div className="institutions-section">
            <h3>Educational Institutions</h3>
            
            <div className="institutions-grid">
              {institutions.map(institution => (
                <div key={institution.id} className="institution-card">
                  <div className="institution-header">
                    <h4>{institution.name}</h4>
                    <span className="institution-type">{institution.type}</span>
                  </div>
                  
                  <div className="institution-details">
                    <p><strong>Courses:</strong> {institution.courseCount}</p>
                    <p><strong>Graduates:</strong> {institution.graduateCount}</p>
                    <p><strong>Focus Areas:</strong> {institution.focusAreas?.join(', ')}</p>
                  </div>

                  <div className="partnership-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={() => handlePartnershipRequest(institution.id, 'internship')}
                    >
                      Internship Program
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => handlePartnershipRequest(institution.id, 'placement')}
                    >
                      Campus Placement
                    </button>
                    <button 
                      className="btn btn-outline"
                      onClick={() => handlePartnershipRequest(institution.id, 'curriculum')}
                    >
                      Curriculum Input
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Partnerships Tab */}
        {activeTab === 'partnerships' && (
          <div className="partnerships-section">
            <h3>Active Partnerships</h3>
            
            {partnerships.length === 0 ? (
              <div className="empty-state">
                <p>No active partnerships yet.</p>
              </div>
            ) : (
              <div className="partnerships-list">
                {partnerships.map(partnership => (
                  <div key={partnership.id} className="partnership-card">
                    <div className="partnership-header">
                      <h4>{partnership.institutionName}</h4>
                      <span className={`status-badge ${partnership.status}`}>
                        {partnership.status}
                      </span>
                    </div>
                    
                    <div className="partnership-details">
                      <p><strong>Type:</strong> {partnership.partnershipType}</p>
                      <p><strong>Description:</strong> {partnership.description}</p>
                      <p><strong>Started:</strong> {new Date(partnership.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="partnership-benefits">
                      <strong>Benefits:</strong>
                      <p>{partnership.proposedBenefits}</p>
                    </div>

                    <div className="partnership-actions">
                      <button className="btn btn-outline">
                        View Details
                      </button>
                      {partnership.status === 'pending' && (
                        <button className="btn btn-warning">
                          Cancel Request
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstitutePartnerships;