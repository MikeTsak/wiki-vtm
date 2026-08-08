import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import './WikipediaImport.css';

const WikipediaImport = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [importing, setImporting] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSearch = async (searchQuery) => {
    if (!searchQuery) return;
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/wiki/external/wikipedia/search?q=${encodeURIComponent(searchQuery)}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      setError('Failed to search Wikipedia. ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleImport = async (title) => {
    setImporting(title);
    setError(null);
    try {
      // 1. Fetch from Wikipedia
      const res = await fetch(`/api/wiki/external/wikipedia/fetch?title=${encodeURIComponent(title)}`);
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      
      // 2. Add source attribution
      const finalContent = `> *Imported from Wikipedia article: [${data.title}](https://en.wikipedia.org/wiki/${encodeURIComponent(data.title.replace(/ /g, '_'))})*\n\n${data.content}`;
      
      // 3. Save to local wiki (as draft, author can edit before publishing)
      const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/(^_|_$)/g, '');
      
      // Redirect to editor with pre-filled content
      // Note: Passing huge state via react-router state can be tricky, 
      // but we'll try to pass it so the editor can pick it up.
      navigate(`/create?title=${encodeURIComponent(data.title)}&slug=${encodeURIComponent(slug)}`, {
        state: { importedContent: finalContent }
      });
      
    } catch (err) {
      setError('Failed to import article. ' + err.message);
      setImporting(false);
    }
  };

  return (
    <div className="import-page">
      <h1 className="firstHeading">Import from Wikipedia</h1>
      
      <div className="import-intro">
        Search for real-world Wikipedia articles and import their contents directly into the LoreVault database as a new draft.
      </div>
      
      <form onSubmit={onSubmit} className="import-search-form">
        <input 
          type="text" 
          value={query} 
          onChange={(e) => setQuery(e.target.value)} 
          placeholder="Search Wikipedia..." 
          className="search-input-large"
        />
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>
      
      {error && <div className="error-banner">{error}</div>}
      
      <div className="search-results">
        {results.length > 0 ? (
          <ul className="results-list">
            {results.map((title) => (
              <li key={title} className="result-item">
                <span className="result-title">{title}</span>
                <div className="result-actions">
                  <a href={`https://en.wikipedia.org/wiki/${encodeURIComponent(title.replace(/ /g, '_'))}`} target="_blank" rel="noreferrer" className="btn-outline">View on Wiki</a>
                  <button 
                    onClick={() => handleImport(title)} 
                    className="btn-primary"
                    disabled={importing !== false}
                  >
                    {importing === title ? 'Importing...' : 'Import to LoreVault'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : query && !loading ? (
          <p>No results found for "{query}".</p>
        ) : null}
      </div>
    </div>
  );
};

export default WikipediaImport;
