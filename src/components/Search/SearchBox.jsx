import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import './SearchBox.css';

const SearchBox = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [hasFocus, setHasFocus] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await api.get(`/api/wiki/search?q=${encodeURIComponent(query)}`);
        setResults(res.data.results || []);
      } catch (err) {
        console.error('Search error:', err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(searchTimeoutRef.current);
  }, [query]);

  const handleResultClick = (slug) => {
    navigate(`/article/${slug}`);
    setHasFocus(false);
    setQuery('');
  };

  return (
    <div 
      className="native-search-container"
      onFocus={() => setHasFocus(true)}
      onBlur={() => setTimeout(() => setHasFocus(false), 200)}
    >
      <input
        type="search"
        className="native-search-input"
        placeholder="Search lore..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      
      {hasFocus && query.length > 0 && (
        <div className="native-search-dropdown">
          {isSearching && results.length === 0 ? (
            <div className="search-status">Searching...</div>
          ) : results.length > 0 ? (
            <ul className="search-hits-list">
              {results.map((hit) => (
                <li 
                  key={hit.id} 
                  className="search-hit-item"
                  onClick={() => handleResultClick(hit.slug)}
                >
                  <div className="search-hit-title">{hit.title}</div>
                  <div className="search-hit-snippet">
                    {hit.snippet.substring(0, 100)}{hit.snippet.length > 100 ? '...' : ''}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="search-status">No results found for "{query}"</div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBox;
