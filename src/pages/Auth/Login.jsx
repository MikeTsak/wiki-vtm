import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already logged in, redirect
  const from = location.state?.from || '/';
  if (user) { navigate(from, { replace: true }); return null; }

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) { setError('Please enter your username and password.'); return; }
    setLoading(true);
    setError('');
    try {
      await login(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <h1>Log in to Erebus Wiki</h1>

      {error && <div className="error-banner">{error}</div>}

      <div className="login-box">
        <p className="login-intro">Use your Vampire Platform credentials to access private lore, edit articles, and keep your journal.</p>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Signing in…' : 'Log in'}
            </button>
          </div>
        </form>
      </div>

      <div className="login-footer">
        <p>Your account is shared with the main Vampire Platform.</p>
      </div>
    </div>
  );
};

export default Login;
