import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Layout.css';
import SearchBox from '../Search/SearchBox';
import Footer from './Footer';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [suggestions, setSuggestions] = useState({ recent: [], public: [], forYou: [] });

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await api.get('/api/wiki/sidebar-suggestions');
        setSuggestions(res.data);
      } catch (err) {
        console.error('Failed to fetch sidebar suggestions', err);
      }
    };
    fetchSuggestions();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="layout-container">
      <div className="top-personal-tools">
        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          ☰
        </button>
        <ul>
          {user ? (
            <>
              <li><span className="nav-username">🧛 {user.display_name || user.username}</span></li>
              {isAdmin && <span className="nav-admin-badge">Admin</span>}
              <li><Link to="/journal">My Journal</Link></li>
              <li><button className="nav-logout-btn" onClick={handleLogout}>Log out</button></li>
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
        <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
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
                <li><Link to="/timeline">📅 Chronicle</Link></li>
                <li><Link to="/boards">Elysium Boards</Link></li>
                {user && <li><Link to="/journal">📒 My Journal</Link></li>}
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
              <SearchBox />
            </div>
          </div>

          <div className="sidebar-portlet">
            <h3>Recently Added</h3>
            <div className="portlet-body">
              <ul>
                {suggestions.recent.map(article => (
                  <li key={article.id}>
                    <Link to={`/article/${article.slug}`}>{article.title}</Link>
                    {article.status === 'private' && <span className="nav-private-dot" title="Admin only">🔒</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="sidebar-portlet">
            <h3>General Public</h3>
            <div className="portlet-body">
              <ul>
                {suggestions.public.map(article => (
                  <li key={article.id}><Link to={`/article/${article.slug}`}>{article.title}</Link></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="sidebar-portlet">
            <h3>For You</h3>
            <div className="portlet-body">
              <ul>
                {suggestions.forYou.map(article => (
                  <li key={article.id}><Link to={`/article/${article.slug}`}>{article.title}</Link></li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {isMobileMenuOpen && (
          <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
        )}

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
