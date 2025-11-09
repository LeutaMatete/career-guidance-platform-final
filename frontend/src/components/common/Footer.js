import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* Main Footer Content */}
        <div className="footer-content">
          {/* Company Info */}
          <div className="footer-section">
            <h3>Career Guidance Platform</h3>
            <p className="footer-description">
              Connecting students with higher education institutions and employment opportunities in Lesotho.
              Our platform provides comprehensive career guidance and seamless application processes.
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="footer-section">
            <h3>Quick Links</h3>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          
          {/* Student Resources */}
          <div className="footer-section">
            <h3>For Students</h3>
            <ul className="footer-links">
              <li><Link to="/student/courses">Browse Courses</Link></li>
              <li><Link to="/student/applications">My Applications</Link></li>
              <li><Link to="/student/jobs">Job Opportunities</Link></li>
              <li><Link to="/student/documents">Upload Documents</Link></li>
            </ul>
          </div>
          
          {/* Institution & Company Resources */}
          <div className="footer-section">
            <h3>For Institutions</h3>
            <ul className="footer-links">
              <li><Link to="/institute/courses">Manage Courses</Link></li>
              <li><Link to="/institute/applications">Student Applications</Link></li>
              <li><Link to="/institute/analytics">Analytics</Link></li>
            </ul>
            
            <h3 style={{ marginTop: '1.5rem' }}>For Companies</h3>
            <ul className="footer-links">
              <li><Link to="/company/jobs">Post Jobs</Link></li>
              <li><Link to="/company/applicants">View Applicants</Link></li>
              <li><Link to="/company/analytics">Analytics</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="footer-bottom">
          <div className="footer-legal">
            <span>&copy; {currentYear} Career Guidance Platform. All rights reserved.</span>
            <div className="footer-privacy">
              <Link to="/privacy-policy">Privacy Policy</Link>
              <Link to="/terms-of-service">Terms of Service</Link>
              <Link to="/cookie-policy">Cookie Policy</Link>
            </div>
          </div>
          
          {/* Contact Information */}
          <div className="footer-contact">
            <div className="contact-item">
              <strong>Email:</strong>
              <a href="mailto:mateteleuta5@gmial.com">mateteleuta5@gmail.com</a>
            </div>
            <div className="contact-item">
              <strong>Phone:</strong>
              <a href="tel:+266 57542819">+266 57542819</a>
            </div>
            <div className="contact-item">
              <strong>Address:</strong>
              <span>Limeko Wing University,Maseru, Lesotho</span>
            </div>
          </div>
          
          {/* Social Links */}
          <div className="footer-social">
            <div className="social-links">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                Twitter
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;