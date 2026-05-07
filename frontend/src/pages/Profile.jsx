import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Link2, Mail, ArrowRight, MapPin, User } from 'lucide-react';

const Profile = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState('CANDIDATE');
  const [profile, setProfile] = useState({
    full_name: '',
    linkedin_url: '',
    last_company: '',
    company_email: '',
    last_working_day: '',
    expected_salary: '',
    location: '',
    status: 'Immediate Joiner',
    is_active: false,
    company_name: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedRole = localStorage.getItem('role');
    const savedUserId = localStorage.getItem('userId');

    if (!token || !savedUserId) {
      navigate('/login');
      return;
    }
    setRole(savedRole || 'CANDIDATE');
    setUserId(savedUserId);
    loadProfile(savedUserId);
  }, [navigate]);

  const loadProfile = async (id) => {
    try {
      const response = await fetch(`http://localhost:8000/api/profile/${id}`);
      if (!response.ok) return;
      const data = await response.json();
      setProfile({
        ...profile,
        ...data,
        status: data.status || 'Immediate Joiner',
        is_active: data.is_active || false,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`http://localhost:8000/api/profile/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Unable to update profile');
      setMessage('Profile updated successfully.');
      navigate('/dashboard');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/verify-email/${userId}`, {
        method: 'POST',
      });
      const data = await response.json();
      setMessage(data.message);
    } catch (err) {
      setMessage('Email verification failed.');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box glass-card profile-box">
        <div className="auth-header">
          <h1>Complete your profile</h1>
          <p>
            {role === 'RECRUITER'
              ? 'Recruiters can post jobs any time. Fill your profile so candidates can trust your opportunities.'
              : 'Activate your profile to appear in candidate searches and find zero-notice roles quickly.'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="full_name">Full name</label>
            <div className="input-icon-wrapper">
              <User className="input-icon" />
              <input
                id="full_name"
                type="text"
                className="form-input"
                placeholder="Your full name"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="linkedin_url">LinkedIn URL</label>
            <div className="input-icon-wrapper">
              <Link2 className="input-icon" />
              <input
                id="linkedin_url"
                type="url"
                className="form-input"
                placeholder="Optional LinkedIn profile"
                value={profile.linkedin_url}
                onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })}
              />
            </div>
          </div>

          {role === 'CANDIDATE' && (
            <>
              <div className="form-group">
                <label htmlFor="company_email">Company email for verification</label>
                <div className="input-icon-wrapper">
                  <Mail className="input-icon" />
                  <input
                    id="company_email"
                    type="email"
                    className="form-input"
                    placeholder="example@company.com"
                    value={profile.company_email}
                    onChange={(e) => setProfile({ ...profile, company_email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="last_company">Last company</label>
                <div className="input-icon-wrapper">
                  <MapPin className="input-icon" />
                  <input
                    id="last_company"
                    type="text"
                    className="form-input"
                    placeholder="Most recent employer"
                    value={profile.last_company}
                    onChange={(e) => setProfile({ ...profile, last_company: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="status">Current status</label>
                <select
                  id="status"
                  className="form-input"
                  value={profile.status}
                  onChange={(e) => setProfile({ ...profile, status: e.target.value })}
                >
                  <option>Immediate Joiner</option>
                  <option>Actively Looking</option>
                  <option>Placed but Open</option>
                </select>
              </div>

              <div className="form-group toggle-group">
                <label>
                  <input
                    type="checkbox"
                    checked={profile.is_active}
                    onChange={(e) => setProfile({ ...profile, is_active: e.target.checked })}
                  />
                  Activate profile for recruiter search
                </label>
              </div>
            </>
          )}

          {role === 'RECRUITER' && (
            <div className="form-group">
              <label htmlFor="company_name">Company name</label>
              <input
                id="company_name"
                type="text"
                className="form-input"
                placeholder="Company or recruiting firm"
                value={profile.company_name}
                onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
              />
            </div>
          )}

          {message && <div className="info-message">{message}</div>}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save profile'} <ArrowRight size={18} />
          </button>
        </form>

        {role === 'CANDIDATE' && (
          <button className="btn-secondary" style={{ marginTop: '1rem' }} onClick={handleVerify}>
            Verify company email
          </button>
        )}
      </div>
    </div>
  );
};

export default Profile;
