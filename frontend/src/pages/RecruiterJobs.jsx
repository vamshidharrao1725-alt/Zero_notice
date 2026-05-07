import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Search, ArrowRight } from 'lucide-react';

const RecruiterJobs = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [jobs, setJobs] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState({ location: '', salary_range: '', status: '' });
  const [newJob, setNewJob] = useState({ title: '', description: '', location: '', salary_range: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    if (!token || !storedUserId || role !== 'RECRUITER') {
      navigate('/dashboard');
      return;
    }
    setUserId(storedUserId);
    loadJobs();
    searchCandidates();
  }, [navigate]);

  const loadJobs = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/jobs');
      if (!response.ok) return;
      const data = await response.json();
      setJobs(data);
    } catch (err) {
      console.error(err);
    }
  };

  const searchCandidates = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery.location) params.append('location', searchQuery.location);
      if (searchQuery.salary_range) params.append('salary_range', searchQuery.salary_range);
      if (searchQuery.status) params.append('status', searchQuery.status);
      const response = await fetch(`http://localhost:8000/api/candidates?${params.toString()}`);
      if (!response.ok) return;
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    setFeedback('');
    if (!newJob.title || !newJob.description || !newJob.location || !newJob.salary_range) {
      setFeedback('Please complete all job fields before posting.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newJob, recruiter_id: Number(userId) }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Failed to post job.');
      }
      setFeedback('Job posted successfully.');
      setNewJob({ title: '', description: '', location: '', salary_range: '' });
      loadJobs();
    } catch (err) {
      setFeedback(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <Briefcase size={28} />
          <span>Recruiter Hub</span>
        </div>
        <button onClick={() => navigate('/dashboard')} className="btn-logout">
          Back to Dashboard
        </button>
      </nav>

      <main className="dashboard-content">
        <div className="welcome-header">
          <h2>Recruiter Job Posting</h2>
          <p>Post urgent roles anytime, then search active candidates who are ready to join immediately.</p>
        </div>

        <section className="glass-card section-card">
          <h3>Post a new job</h3>
          <form onSubmit={handlePostJob} className="job-form">
            <div className="form-group">
              <label>Job title</label>
              <input value={newJob.title} onChange={(e) => setNewJob({ ...newJob, title: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input value={newJob.location} onChange={(e) => setNewJob({ ...newJob, location: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Salary range</label>
              <input value={newJob.salary_range} onChange={(e) => setNewJob({ ...newJob, salary_range: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea value={newJob.description} onChange={(e) => setNewJob({ ...newJob, description: e.target.value })} required />
            </div>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Posting...' : 'Post Job'} <ArrowRight size={18} />
            </button>
          </form>
          {feedback && <div className="info-message">{feedback}</div>}
        </section>

        <section className="glass-card section-card">
          <h3>Candidate search</h3>
          <div className="search-grid">
            <input
              placeholder="Location"
              value={searchQuery.location}
              onChange={(e) => setSearchQuery({ ...searchQuery, location: e.target.value })}
            />
            <input
              placeholder="Salary range"
              value={searchQuery.salary_range}
              onChange={(e) => setSearchQuery({ ...searchQuery, salary_range: e.target.value })}
            />
            <select
              value={searchQuery.status}
              onChange={(e) => setSearchQuery({ ...searchQuery, status: e.target.value })}
            >
              <option value="">Any status</option>
              <option value="Immediate Joiner">Immediate Joiner</option>
              <option value="Actively Looking">Actively Looking</option>
              <option value="Placed but Open">Placed but Open</option>
            </select>
            <button type="button" className="btn-primary" onClick={searchCandidates}>
              Search
            </button>
          </div>
          <div className="list-grid">
            {searchResults.length === 0 ? (
              <p>No active candidates found.</p>
            ) : (
              searchResults.map((candidate) => (
                <div className="item-card" key={candidate.id}>
                  <div className="item-header">
                    <h4>{candidate.full_name || 'Candidate'}</h4>
                    <span>{candidate.location || 'Unknown location'}</span>
                  </div>
                  <p>{candidate.status}</p>
                  <p>{candidate.expected_salary || 'Salary not set'}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="glass-card section-card">
          <h3>Your Posted Jobs</h3>
          <div className="list-grid">
            {jobs.length === 0 ? (
              <p>No active jobs posted yet.</p>
            ) : (
              jobs.map((job) => (
                <div className="item-card" key={job.id}>
                  <div className="item-header">
                    <h4>{job.title}</h4>
                    <span>{job.location}</span>
                  </div>
                  <p>{job.description}</p>
                  <div className="item-meta">
                    <span>{job.salary_range}</span>
                    <span>{job.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default RecruiterJobs;
