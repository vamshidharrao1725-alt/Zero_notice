import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, LayoutDashboard, Briefcase, Search, CheckCircle, MapPin, DollarSign, Users } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('User');
  const [role, setRole] = useState('CANDIDATE');
  const [userId, setUserId] = useState(null);
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState({ location: '', salary_range: '', status: '' });
  const [newJob, setNewJob] = useState({ title: '', description: '', location: '', salary_range: '' });
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    const storedRole = localStorage.getItem('role');
    const storedUserId = localStorage.getItem('userId');

    if (!token || !storedUserId) {
      navigate('/login');
      return;
    }

    setUsername(storedUsername || 'User');
    setRole(storedRole || 'CANDIDATE');
    setUserId(storedUserId);
    loadProfile(storedUserId);
    loadJobs();
    if (storedRole === 'RECRUITER') {
      searchCandidates();
    }
  }, [navigate]);

  const loadProfile = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/profile/${id}`);
      if (!response.ok) return;
      const data = await response.json();
      setProfile(data);
    } catch (err) {
      console.error(err);
    }
  };

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

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handlePostJob = async (e) => {
    e.preventDefault();
    if (!newJob.title || !newJob.description || !newJob.location || !newJob.salary_range) {
      setFeedback('Please fill all job fields.');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newJob, recruiter_id: userId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Job post failed.');

      setFeedback('Job posted successfully.');
      setNewJob({ title: '', description: '', location: '', salary_range: '' });
      loadJobs();
      searchCandidates();
    } catch (err) {
      setFeedback(err.message);
    }
  };

  const handleApply = (job) => {
    alert(`Applied to ${job.title} at ${job.location}. Recruiter will contact you if they are interested.`);
  };

  return (
    <div className="app-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <LayoutDashboard size={28} />
          <span>Zero Notice</span>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          <LogOut size={18} />
          Logout
        </button>
      </nav>

      <main className="dashboard-content">
        <div className="welcome-header">
          <h2>Welcome back, {username}! 👋</h2>
          <p>Your role is <strong>{role}</strong>. {role === 'CANDIDATE' ? 'Keep your profile active to appear in recruiter searches.' : 'Recruiters can post urgent roles and find ready-to-join candidates.'}</p>
        </div>

        {profile && role === 'CANDIDATE' && (
          <div className="stats-grid">
            <div className="stat-card glass-card">
              <div className="stat-icon"><CheckCircle size={24} /></div>
              <div className="stat-info">
                <h3>Status</h3>
                <div className="value">{profile.status || 'Immediate Joiner'}</div>
              </div>
            </div>
            <div className="stat-card glass-card">
              <div className="stat-icon"><MapPin size={24} /></div>
              <div className="stat-info">
                <h3>Location</h3>
                <div className="value">{profile.location || 'Unknown'}</div>
              </div>
            </div>
            <div className="stat-card glass-card">
              <div className="stat-icon"><DollarSign size={24} /></div>
              <div className="stat-info">
                <h3>Salary</h3>
                <div className="value">{profile.expected_salary || 'Not set'}</div>
              </div>
            </div>
          </div>
        )}

        {role === 'CANDIDATE' && (
          <section className="glass-card section-card">
            <h3>Open Jobs</h3>
            <p>Only active roles that match your search and availability are shown.</p>
            <div className="list-grid">
              {jobs.length === 0 ? (
                <p>No jobs available right now. Check back frequently.</p>
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
                      <button className="btn-secondary" onClick={() => handleApply(job)}>Apply</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {role === 'RECRUITER' && (
          <>
            <section className="glass-card section-card">
              <h3>Post a Job</h3>
              <form onSubmit={handlePostJob} className="job-form">
                <div className="form-group">
                  <label>Title</label>
                  <input value={newJob.title} onChange={(e) => setNewJob({ ...newJob, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <input value={newJob.location} onChange={(e) => setNewJob({ ...newJob, location: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Salary Range</label>
                  <input value={newJob.salary_range} onChange={(e) => setNewJob({ ...newJob, salary_range: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea value={newJob.description} onChange={(e) => setNewJob({ ...newJob, description: e.target.value })} required />
                </div>
                <button type="submit" className="btn-primary">Post Job</button>
              </form>
            </section>

            <section className="glass-card section-card">
              <h3>Search Candidates</h3>
              <div className="search-grid">
                <input placeholder="Location" value={searchQuery.location} onChange={(e) => setSearchQuery({ ...searchQuery, location: e.target.value })} />
                <input placeholder="Salary range" value={searchQuery.salary_range} onChange={(e) => setSearchQuery({ ...searchQuery, salary_range: e.target.value })} />
                <select value={searchQuery.status} onChange={(e) => setSearchQuery({ ...searchQuery, status: e.target.value })}>
                  <option value="">Any status</option>
                  <option value="Immediate Joiner">Immediate Joiner</option>
                  <option value="Actively Looking">Actively Looking</option>
                  <option value="Placed but Open">Placed but Open</option>
                </select>
                <button type="button" className="btn-primary" onClick={searchCandidates}>Search</button>
              </div>
              <div className="list-grid">
                {searchResults.length === 0 ? (
                  <p>No active candidates found. Try adjusting filters.</p>
                ) : (
                  searchResults.map((candidate) => (
                    <div className="item-card" key={candidate.id}>
                      <div className="item-header">
                        <h4>{candidate.full_name}</h4>
                        <span>{candidate.location}</span>
                      </div>
                      <p>{candidate.status} · {candidate.expected_salary || 'Salary not set'}</p>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        )}

        {feedback && <div className="info-message">{feedback}</div>}
      </main>
    </div>
  );
};

export default Home;
