import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import ErrorModal from '../../components/Common/ErrorModal';
import './ArticleViewer.css';

const ArticleViewer = ({ defaultSlug }) => {
  const params = useParams();
  const slug = params.slug || defaultSlug;
  const { user, isAdmin } = useAuth();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalError, setModalError] = useState(null);
  const [toc, setToc] = useState([]);

  // Admin notes state
  const [adminNotes, setAdminNotes] = useState([]);
  const [notesOpen, setNotesOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (!slug) return;
    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/wiki/articles/${slug}`);
        setArticle(res.data.article);

        // Extract headings for ToC
        const headings = [];
        const regex = /^(#{2,3})\s+(.+)$/gm;
        let match;
        while ((match = regex.exec(res.data.article.content)) !== null) {
          const level = match[1].length;
          const textContent = match[2];
          const id = textContent.toLowerCase().replace(/[^\w]+/g, '-').replace(/(^-|-$)/g, '');
          headings.push({ level, text: textContent, id });
        }
        setToc(headings);
      } catch (err) {
        if (err.response?.status === 404) {
          setArticle(null);
          setError(`Article "${slug}" does not exist.`);
          return;
        }
        if (err.response?.status === 403) {
          setError('ACCESS DENIED — This article is restricted to administrators.');
          return;
        }
        setModalError(err.message || 'Failed to fetch article.');
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  const fetchAdminNotes = async () => {
    if (!isAdmin || !slug) return;
    try {
      const res = await api.get(`/api/wiki/articles/${slug}/admin-notes`);
      setAdminNotes(res.data.notes || []);
    } catch (_) {}
  };

  useEffect(() => { if (isAdmin && article) fetchAdminNotes(); }, [isAdmin, article]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setSavingNote(true);
    try {
      await api.post(`/api/wiki/articles/${slug}/admin-notes`, { content: newNote });
      setNewNote('');
      fetchAdminNotes();
    } catch (e) {
      setModalError('Failed to save note.');
    } finally {
      setSavingNote(false);
    }
  };

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Delete this admin note?')) return;
    try {
      await api.delete(`/api/wiki/admin-notes/${id}`);
      setAdminNotes(ns => ns.filter(n => n.id !== id));
    } catch (_) {}
  };

  if (loading) return <div className="viewer-container">Loading…</div>;

  const processMarkdown = (text) => {
    if (!text) return '';
    let processed = text.replace(
      /\[spoiler\]([\s\S]*?)\[\/spoiler\]/gi,
      '<details class="custom-spoiler"><summary>Spoiler</summary><div class="spoiler-content">$1</div></details>'
    );
    processed = processed.replace(/\[\[(.*?)\]\]/g, (match, p1) => {
      const linkSlug = p1.trim().replace(/\s+/g, '-');
      return `<a href="/article/${linkSlug}">${p1}</a>`;
    });
    return processed;
  };

  const fmtDate = (ts) => ts ? new Date(ts).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '';

  return (
    <div className="viewer-container">
      <div className="article-header">
        <h1 id="firstHeading" className="firstHeading">
          {article ? article.title : slug}
          {article?.status === 'private' && (
            <span className="private-badge" title="This article is visible to admins only">🔒 Admin Only</span>
          )}
        </h1>
        <div className="article-tools">
          {article && <Link to={`/history/${slug}`}>History</Link>}
          {(user && article) && <Link to={`/edit/${slug}`}>Edit</Link>}
          {!article && user && <Link to={`/create?slug=${slug}`}>Create</Link>}
        </div>
      </div>

      <ErrorModal
        isOpen={!!modalError}
        onClose={() => setModalError(null)}
        title="Article Error"
        error={modalError}
      />

      <div className="siteSub">From Erebus Wiki, the free encyclopedia</div>

      {error && !article && (
        <div className="article-not-found">
          {error.startsWith('ACCESS DENIED') ? (
            <p><strong>🔒 {error}</strong></p>
          ) : (
            <>
              <p><strong>Erebus Wiki does not have an article with this exact name.</strong></p>
              {user && <p>You can <Link to={`/create?title=${slug}`}>create this page</Link>.</p>}
            </>
          )}
        </div>
      )}

      {article && (
        <div className="article-layout">
          <div className="markdown-body">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
              components={{
                h2: ({ node, ...props }) => <h2 id={props.children?.[0]?.toString().toLowerCase().replace(/[^\w]+/g, '-').replace(/(^-|-$)/g, '')} {...props} />,
                h3: ({ node, ...props }) => <h3 id={props.children?.[0]?.toString().toLowerCase().replace(/[^\w]+/g, '-').replace(/(^-|-$)/g, '')} {...props} />,
              }}
            >
              {processMarkdown(article.content)}
            </ReactMarkdown>

            {article.tags && (
              <div className="article-tags">
                <strong>Categories:</strong>
                {article.tags.split(',').map(tag => (
                  <span key={tag.trim()} className="tag-pill">{tag.trim()}</span>
                ))}
              </div>
            )}

            {/* ── Admin Notes Panel ── */}
            {isAdmin && (
              <div className="admin-notes-panel">
                <button
                  className="admin-notes-toggle"
                  onClick={() => setNotesOpen(o => !o)}
                >
                  <span>🗒️ Admin Notes</span>
                  {adminNotes.length > 0 && <span className="admin-notes-count">{adminNotes.length}</span>}
                  <span className="admin-notes-chevron">{notesOpen ? '▲' : '▼'}</span>
                </button>

                {notesOpen && (
                  <div className="admin-notes-body">
                    {adminNotes.length === 0 && (
                      <p className="admin-notes-empty">No admin notes yet.</p>
                    )}
                    {adminNotes.map(note => (
                      <div key={note.id} className="admin-note">
                        <div className="admin-note-header">
                          <strong>{note.author_name}</strong>
                          <span>{fmtDate(note.created_at)}</span>
                          <button className="admin-note-del" onClick={() => handleDeleteNote(note.id)}>✕</button>
                        </div>
                        <p className="admin-note-content">{note.content}</p>
                      </div>
                    ))}

                    <div className="admin-note-new">
                      <textarea
                        value={newNote}
                        onChange={e => setNewNote(e.target.value)}
                        placeholder="Add a private admin note…"
                        rows={3}
                      />
                      <button onClick={handleAddNote} disabled={savingNote || !newNote.trim()}>
                        {savingNote ? 'Saving…' : 'Add Note'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {toc.length > 0 && (
            <div className="article-sidebar">
              <div className="toc-container">
                <div className="toc-title">Contents</div>
                <ul className="toc-list">
                  {toc.map((heading, i) => (
                    <li key={i} className={`toc-item toc-level-${heading.level}`}>
                      <a href={`#${heading.id}`}>{heading.text}</a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ArticleViewer;
