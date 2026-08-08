import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Layout.css';
import MeiliSearchBox from '../Search/MeiliSearchBox';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Example auth state - should come from context in a real app
  const isAuthenticated = false;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/import?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="layout-container">
      <div className="top-personal-tools">
        <ul>
          {isAuthenticated ? (
            <>
              <li><Link to="/journal">My journal</Link></li>
              <li><Link to="/logout">Log out</Link></li>
            </>
          ) : (
            <>
              <li><Link to="/login">Not logged in</Link></li>
              <li><Link to="/login">Log in</Link></li>
            </>
          )}
        </ul>
      </div>

      <div className="wiki-wrapper">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <Link to="/">
              <div className="logo-placeholder">WIKI</div>
            </Link>
          </div>
          
          <div className="sidebar-portlet">
            <h3>Navigation</h3>
            <div className="portlet-body">
              <ul>
                <li><Link to="/">Main page</Link></li>
                <li><Link to="/boards">Boards</Link></li>
                <li><Link to="/create">Create article</Link></li>
                <li><Link to="/import">Import from Wikipedia</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="sidebar-portlet">
            <h3>Search</h3>
            <div className="portlet-body">
              <MeiliSearchBox />
            </div>
          </div>
        </aside>

        <main className="content-area">
          <div className="content-inner">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
