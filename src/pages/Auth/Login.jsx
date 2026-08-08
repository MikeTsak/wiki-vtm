import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    // Simulate login for now - connects to Vampire Platform ecosystem
    if (username && password) {
      console.log('Logging in to Vampire Platform:', username);
      navigate('/');
    } else {
      setError('Please enter your username and password.');
    }
  };

  return (
    <div className="login-page">
      <h1>Log in</h1>
      
      {error && <div className="error-banner">{error}</div>}
      
      <div className="login-box">
        <p className="login-intro">You must be logged in to edit pages or access private lore.</p>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input 
              type="text" 
              id="username" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              placeholder="Enter your username"
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
            />
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-primary">Log in</button>
            <a href="#" className="forgot-password">Help with logging in</a>
          </div>
        </form>
      </div>
      
      <div className="login-footer">
        <p>Don't have an account? <a href="#">Join LoreVault</a></p>
      </div>
    </div>
  );
};

export default Login;
