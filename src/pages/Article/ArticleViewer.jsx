import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import './ArticleViewer.css';

const ArticleViewer = ({ defaultSlug }) => {
  const params = useParams();
  const slug = params.slug || defaultSlug;
  
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Example auth state
  const isAuthorized = false;

  useEffect(() => {
    if (!slug) return;
    
    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/wiki/articles/${slug}`);
        if (!res.ok) {
          if (res.status === 404) {
            setArticle(null);
            setError(`Article "${slug}" does not exist.`);
            return;
          }
          throw new Error('Failed to fetch article.');
        }
        const data = await res.json();
        setArticle(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticle();
  }, [slug]);

  if (loading) {
    return <div className="viewer-container">Loading...</div>;
  }

  // Pre-process custom [spoiler] tags
  const processMarkdown = (text) => {
    if (!text) return '';
    return text.replace(
      /\[spoiler\]([\s\S]*?)\[\/spoiler\]/gi, 
      '<details class="custom-spoiler"><summary>Spoiler</summary><div class="spoiler-content">$1</div></details>'
    );
  };

  return (
    <div className="viewer-container">
      <div className="article-header">
        <h1 id="firstHeading" className="firstHeading">
          {article ? article.title : slug}
        </h1>
        <div className="article-tools">
          {article && <Link to={`/edit/${slug}`}>Edit</Link>}
          {!article && <Link to={`/create?slug=${slug}`}>Create</Link>}
        </div>
      </div>
      
      <div className="siteSub">From LoreVault, the free encyclopedia</div>

      {error && !article && (
        <div className="article-not-found">
          <p><strong>LoreVault does not have an article with this exact name.</strong></p>
          <p>You can <Link to={`/create?title=${slug}`}>create this page</Link> or <Link to={`/import?q=${slug}`}>search for it on Wikipedia</Link>.</p>
        </div>
      )}

      {article && (
        <div className="markdown-body">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]} 
            rehypePlugins={[rehypeRaw]}
            components={{
              a: ({ node, ...props }) => {
                // If it's an internal link starting with /
                if (props.href && props.href.startsWith('/')) {
                  return <Link to={props.href}>{props.children}</Link>;
                }
                // Otherwise normal external link
                return <a target="_blank" rel="noopener noreferrer" {...props}>{props.children}</a>;
              }
            }}
          >
            {processMarkdown(article.content)}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};

export default ArticleViewer;
