import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Layout.css';
import MeiliSearchBox from '../Search/MeiliSearchBox';
import Footer from './Footer';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  // Example auth state - should come from context in a real app
  const isAuthenticated = false;
  const isAdmin = false; // Placeholder

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
              <img src="/erebus-wiki-logo.png" alt="Erebus Wiki" className="site-logo" />
            </Link>
          </div>
          
          <div className="sidebar-portlet">
            <h3>Navigation</h3>
            <div className="portlet-body">
              <ul>
                <li><Link to="/">Main page</Link></li>
                <li><Link to="/boards">Elysium Boards</Link></li>
                <li><Link to="/create">Create article</Link></li>
                {isAdmin && (
                  <li><Link to="/import">Import from Wikipedia</Link></li>
                )}
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
          <Footer />
        </main>
      </div>
    </div>
  );
};

export default Layout;
