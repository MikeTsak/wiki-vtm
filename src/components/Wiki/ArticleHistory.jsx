import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import './ArticleHistory.css';

const ArticleHistory = ({ slug, onRevert }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewingVersion, setViewingVersion] = useState(null);
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/api/wiki/articles/${slug}/history`);
        setHistory(res.data.history);
      } catch (err) {
        setError('Failed to load history.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [slug]);

  const handleRollback = async (versionId) => {
    if (!window.confirm('Are you sure you want to revert to this version?')) return;
    try {
      await api.post(`/api/wiki/articles/${slug}/rollback`, { version_id: versionId });
      onRevert();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to rollback');
    }
  };

  if (loading) return <div className="history-loading">Loading history...</div>;
  if (error) return <div className="history-error">{error}</div>;

  return (
    <div className="article-history">
      <div className="history-list">
        <h3>Revision History</h3>
        {history.length === 0 ? (
          <p>No history available.</p>
        ) : (
          <ul>
            {history.map((rev) => (
              <li key={rev.id} className="history-item">
                <div className="history-meta">
                  <strong>{rev.editor_name}</strong> 
                  <span className="history-date">
                    {new Date(rev.created_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                <div className="history-summary">{rev.edit_summary}</div>
                <div className="history-actions">
                  <button className="btn-outline" onClick={() => setViewingVersion(rev)}>View</button>
                  {isAdmin && (
                    <button className="btn-secondary" onClick={() => handleRollback(rev.id)}>Revert Here</button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {viewingVersion && (
        <div className="history-viewer">
          <div className="history-viewer-header">
            <h4>Viewing Version from {new Date(viewingVersion.created_at).toLocaleString()}</h4>
            <button className="btn-outline" onClick={() => setViewingVersion(null)}><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="markdown-body history-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
              {viewingVersion.content}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArticleHistory;
