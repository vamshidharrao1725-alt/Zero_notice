import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Activity, Users, Zap, LayoutDashboard } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');
    
    if (!token) {
      navigate('/login');
    } else {
      setUsername(storedUsername || 'User');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div className="app-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <LayoutDashboard size={28} />
          <span>NexusApp</span>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          <LogOut size={18} />
          Logout
        </button>
      </nav>

      <main className="dashboard-content">
        <div className="welcome-header">
          <h2>Welcome back, {username}! 👋</h2>
          <p>Here's what's happening with your projects today.</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card glass-card">
            <div className="stat-icon">
              <Activity size={24} />
            </div>
            <div className="stat-info">
              <h3>Active Sessions</h3>
              <div className="value">1,234</div>
            </div>
          </div>
          
          <div className="stat-card glass-card">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-info">
              <h3>Total Users</h3>
              <div className="value">8,549</div>
            </div>
          </div>

          <div className="stat-card glass-card">
            <div className="stat-icon">
              <Zap size={24} />
            </div>
            <div className="stat-info">
              <h3>System Status</h3>
              <div className="value" style={{color: '#34d399'}}>Online</div>
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1rem', fontSize: '1.25rem' }}>Recent Activity</h3>
          <p style={{ color: 'var(--text-muted)' }}>
            This is a protected dashboard page. You can only see this if you are logged in.
            The frontend is built with React + Vite and the backend is running FastAPI.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Home;
