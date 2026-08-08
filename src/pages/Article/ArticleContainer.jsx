import React from 'react';
import { Outlet, useParams, Link, useLocation } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';

const ArticleContainer = () => {
  const params = useParams();
  const location = useLocation();
  const { user } = useAuth();
  
  // React Router v6 doesn't pass child params to layout components by default.
  // Extract slug from the pathname: /article/Foo, /edit/Foo, /history/Foo
  const pathParts = location.pathname.split('/');
  const extractedSlug = pathParts.length >= 3 ? pathParts[2] : null;
  const slug = params.slug || extractedSlug || (location.pathname === '/' ? 'Main_Page' : null);

  const isView = location.pathname.startsWith('/article') || location.pathname === '/';
  const isEdit = location.pathname.startsWith('/edit');
  const isHistory = location.pathname.startsWith('/history');

  return (
    <div className="article-container-wrapper">
      {slug ? (
        <div className="wiki-tabs">
          {isView ? <span className="tab-active">Article</span> : <Link to={`/article/${slug}`}>Article</Link>}
          
          {user && (
            <>
              {isHistory ? <span className="tab-active">View history</span> : <Link to={`/history/${slug}`}>View history</Link>}
              {isEdit ? <span className="tab-active">Edit</span> : <Link to={`/edit/${slug}`}>Edit</Link>}
            </>
          )}
        </div>
      ) : (
        <div className="wiki-tabs">
          <span className="tab-active">Create</span>
        </div>
      )}
      
      <div className="article-content-wrapper">
        <Outlet />
      </div>
    </div>
  );
};

export default ArticleContainer;
