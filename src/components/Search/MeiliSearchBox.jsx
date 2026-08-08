import React, { useState, useEffect } from 'react';
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import { InstantSearch, Hits, Configure, Highlight, useSearchBox } from 'react-instantsearch';
import { useNavigate } from 'react-router-dom';
import './MeiliSearchBox.css';

const searchClient = instantMeiliSearch(
  import.meta.env.VITE_MEILI_HOST || 'http://127.0.0.1:7700',
  import.meta.env.VITE_MEILI_SEARCH_KEY || 'attlarp-secret-master-key-123'
).searchClient;

const Hit = ({ hit }) => {
  const navigate = useNavigate();

  return (
    <div 
      className="search-hit" 
      onClick={() => navigate(`/article/${hit.slug}`)}
    >
      <div className="search-hit-title">
        <Highlight attribute="title" hit={hit} />
      </div>
      <div className="search-hit-snippet">
        <Highlight attribute="content" hit={hit} />
      </div>
    </div>
  );
};

const CustomSearchBox = ({ setHasQuery }) => {
  const { query, refine } = useSearchBox();

  useEffect(() => {
    setHasQuery(query.length > 0);
  }, [query, setHasQuery]);

  return (
    <input
      type="search"
      className="meili-search-input"
      placeholder="Search lore..."
      value={query}
      onChange={(event) => refine(event.currentTarget.value)}
    />
  );
};

const MeiliSearchBox = () => {
  const [hasFocus, setHasFocus] = useState(false);
  const [hasQuery, setHasQuery] = useState(false);

  return (
    <div 
      className="meili-search-container"
      onFocus={() => setHasFocus(true)}
      onBlur={(e) => {
        setTimeout(() => setHasFocus(false), 200);
      }}
    >
      <InstantSearch indexName="wiki_articles" searchClient={searchClient}>
        <Configure hitsPerPage={5} attributesToSnippet={['content:30']} snippetEllipsisText="..." />
        
        <CustomSearchBox setHasQuery={setHasQuery} />
        
        {hasFocus && hasQuery && (
          <div className="meili-hits-dropdown">
            <Hits hitComponent={Hit} classNames={{ list: 'meili-hits-list', item: 'meili-hits-item' }} />
          </div>
        )}
      </InstantSearch>
    </div>
  );
};

export default MeiliSearchBox;
