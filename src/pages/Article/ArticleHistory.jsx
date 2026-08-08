import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import ErrorModal from '../../components/Common/ErrorModal';
import './ArticleViewer.css';

const ArticleHistory = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalError, setModalError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get(`/api/wiki/articles/${slug}/history`);
        setHistory(res.data.history);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setError(`Article "${slug}" does not exist.`);
        } else {
          setError(err.message || 'Failed to fetch history.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [slug]);

  const handleRollback = async (versionId) => {
    if (!window.confirm("Are you sure you want to rollback to this version? Current changes will be overwritten!")) return;
    
    try {
      await api.post(`/api/wiki/articles/${slug}/rollback`, { version_id: versionId });
      alert('Rollback successful!');
      navigate(`/article/${slug}`);
    } catch (err) {
      setModalError(err.response?.data?.error || err.message || 'Rollback failed.');
    }
  };

  if (loading) return <div className="viewer-container">Loading history...</div>;
  if (error) return <div className="viewer-container error-banner">{error}</div>;

  return (
    <div className="viewer-container">
      <div className="article-header">
        <h1 id="firstHeading" className="firstHeading">History: {slug}</h1>
        <div className="article-tools">
          <Link to={`/article/${slug}`}>Back to Article</Link>
        </div>
      </div>

      <ErrorModal
        isOpen={!!modalError}
        onClose={() => setModalError(null)}
        title="Rollback Error"
        error={modalError}
      />

      <div style={{ marginTop: '24px' }}>
        {history.length === 0 ? (
          <p>No history available.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '12px' }}>Date</th>
                <th style={{ padding: '12px' }}>Editor</th>
                <th style={{ padding: '12px' }}>Summary</th>
                <th style={{ padding: '12px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {history.map((ver, idx) => (
                <tr key={ver.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px' }}>{new Date(ver.created_at).toLocaleString()}</td>
                  <td style={{ padding: '12px' }}>{ver.editor_name || 'Unknown'}</td>
                  <td style={{ padding: '12px' }}>{ver.edit_summary || 'Update'}</td>
                  <td style={{ padding: '12px' }}>
                    {idx > 0 && (
                      <button 
                        className="btn-primary" 
                        style={{ padding: '4px 12px', fontSize: '0.85em' }}
                        onClick={() => handleRollback(ver.id)}
                      >
                        Revert to this
                      </button>
                    )}
                    {idx === 0 && <span style={{ color: 'var(--text-muted)' }}>(Current)</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ArticleHistory;
