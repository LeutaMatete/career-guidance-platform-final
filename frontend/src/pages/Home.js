import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/home.css'; // Link to your home-specific CSS file

const Home = () => {
  return (
    <div className="home-page">
      <section className="hero-section">
        <h1 className="hero-title">Career Guidance Platform</h1>
        <p className="hero-subtitle">
          Discover your path to success with our comprehensive career guidance system
        </p>
        <div className="hero-actions">
          <Link to="/login" className="btn-primary">Get Started</Link>
          <Link to="/register" className="btn-outline">Create Account</Link>
        </div>
      </section>

      <section className="features-section">
        <div className="feature-card">
          <h3>For Students</h3>
          <p>Find the right courses and institutions that match your qualifications and career goals</p>
          <Link to="/register?role=student" className="btn-outline">Join as Student</Link>
        </div>
        <div className="feature-card">
          <h3>For Institutions</h3>
          <p>Manage courses, review applications, and connect with qualified students</p>
          <Link to="/register?role=institute" className="btn-outline">Join as Institution</Link>
        </div>
        <div className="feature-card">
          <h3>For Companies</h3>
          <p>Post jobs and find qualified candidates from our pool of talented students</p>
          <Link to="/register?role=company" className="btn-outline">Join as Company</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
