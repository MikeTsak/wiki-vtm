import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import ErrorModal from '../../components/Common/ErrorModal';
import SEO from '../../components/Common/SEO';
import ArticleHistory from '../../components/Wiki/ArticleHistory';
import { processWikiMarkdown } from '../../utils/wikiMarkdown';
import AdsterraBanner from '../../components/Common/AdsterraBanner';
import './ArticleViewer.css';

const extractNodeText = (node) => {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractNodeText).join('');
  if (node.props && node.props.children) return extractNodeText(node.props.children);
  return '';
};

const toHeadingId = (str) =>
  String(str || '')
    .toLowerCase()
    .replace(/:[\p{L}0-9_]+:/gu, '')
    .replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, '$1')
    .replace(/[^\p{L}0-9]+/gu, '-')
    .replace(/(^-|-$)/g, '');

const cleanHeadingText = (str) =>
  String(str || '')
    .replace(/:[\p{L}0-9_]+:/gu, '')
    .replace(/\[\[(?:[^|\]]*\|)?([^\]]+)\]\]/g, '$1')
    .replace(/[*_`#]/g, '')
    .trim();

const ArticleViewer = ({ defaultSlug }) => {
  const params = useParams();
  const slug = params.slug || defaultSlug;
  const navigate = useNavigate();
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

  // Tab state
  const [activeTab, setActiveTab] = useState('read');

  useEffect(() => {
    if (!slug) return;
    const fetchArticle = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/api/wiki/articles/${slug}`);
        let content = res.data.article.content;
        let infobox = null;
        const ibxMatch = content.match(/\[INFOBOX\](.*?)\[\/INFOBOX\]/s);
        if (ibxMatch) {
          try {
            infobox = JSON.parse(ibxMatch[1]);
          } catch(e) {}
          content = content.replace(/\[INFOBOX\](.*?)\[\/INFOBOX\]/s, '').trim();
        }

        setArticle({ ...res.data.article, content, infobox });

        // Extract headings for ToC
        const headings = [];
        const regex = /^(#{2,3})\s+(.+)$/gm;
        let match;
        while ((match = regex.exec(content)) !== null) {
          const level = match[1].length;
          const rawHeading = match[2];
          const cleanText = cleanHeadingText(rawHeading);
          const id = toHeadingId(rawHeading);
          if (cleanText) {
            headings.push({ level, text: cleanText, id });
          }
        }
        setToc(headings);
      } catch (err) {
        if (err.response?.status === 404) {
          setArticle(null);
          setError(`Article "${slug}" does not exist.`);
          return;
        }
        if (err.response?.status === 403) {
          setError('ACCESS DENIED: This article is restricted to administrators.');
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

  const handleContentClick = useCallback((e) => {
    const link = e.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href');
    if (href && href.startsWith('/article/')) {
      e.preventDefault();
      navigate(href);
    }
  }, [navigate]);

  if (loading) return <div className="viewer-container">Loading…</div>;

  const processMarkdown = (text) => processWikiMarkdown(text);

  const fmtDate = (ts) => ts ? new Date(ts).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' }) : '';

  return (
    <div className="viewer-container">
      <SEO 
        title={article ? article.title : slug} 
        description={article ? article.content.replace(/[#*_~`\[\]()]/g, '').substring(0, 160) + '...' : ''}
        article={true}
      />

      <ErrorModal
        isOpen={!!modalError}
        onClose={() => setModalError(null)}
        title="Article Error"
        error={modalError}
      />

      {error && !article && (
        <div className="article-not-found">
          {error.startsWith('ACCESS DENIED') ? (
            <p><strong><i className="fa-solid fa-lock" style={{ marginRight: '5px' }}></i> {error}</strong></p>
          ) : (
            <div className="not-found-box">
              <p><strong>Το Erebus Wiki δεν διαθέτει ακόμα άρθρο με τον τίτλο "{slug}".</strong></p>
              <p style={{ marginTop: '12px' }}>
                <Link to={`/create?title=${encodeURIComponent(slug)}`} className="btn-create-article">
                  <i className="fa-solid fa-pen-to-square" style={{ marginRight: '6px' }}></i> Δημιουργία της σελίδας
                </Link>
              </p>
            </div>
          )}
        </div>
      )}

      {article && (
        <div className="article-page-layout">
          {/* Desktop Left Skyscraper Ad */}
          <aside className="article-gutter-ad article-gutter-left" aria-label="Advertisement">
            <div className="article-gutter-sticky">
              <AdsterraBanner adKey="ddc18f1b4a8a6dd43b7a93d73c129bb8" width={160} height={600} />
            </div>
          </aside>

          {/* Main Article Content */}
          <div className="article-main-column">
            {/* Mobile Top Ad */}
            <div className="article-mobile-ad article-mobile-top" aria-label="Advertisement">
              <AdsterraBanner adKey="9d189d3847aa7621a217714bdf23b4fe" width={320} height={50} />
            </div>

            <div className="article-header">
              <h1 id="firstHeading" className="firstHeading">
                {article.title}
                {article.status === 'private' && (
                  <span className="private-badge" title="This article is visible to admins only"><i className="fa-solid fa-lock" style={{ marginRight: '5px' }}></i> Admin Only</span>
                )}
              </h1>
              <div className="article-tabs">
                <button className={`tab-btn ${activeTab === 'read' ? 'active' : ''}`} onClick={() => setActiveTab('read')}>Read</button>
                <button className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>History</button>
              </div>
            </div>

            <div className="siteSub">From Erebus Wiki, the free encyclopedia</div>

            <div className="article-layout">
              {activeTab === 'history' ? (
                <div style={{ flex: 1, minWidth: 0 }}>
                  <ArticleHistory slug={slug} onRevert={() => window.location.reload()} />
                </div>
              ) : (
                <div className="markdown-body" onClick={handleContentClick}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      h2: ({ node, ...props }) => <h2 id={toHeadingId(extractNodeText(props.children))} {...props} />,
                      h3: ({ node, ...props }) => <h3 id={toHeadingId(extractNodeText(props.children))} {...props} />,
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
                        <span><i className="fa-solid fa-clipboard" style={{ marginRight: '5px' }}></i> Admin Notes</span>
                        {adminNotes.length > 0 && <span className="admin-notes-count">{adminNotes.length}</span>}
                        <span className="admin-notes-chevron">{notesOpen ? <i className="fa-solid fa-chevron-up"></i> : <i className="fa-solid fa-chevron-down"></i>}</span>
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
                                <button className="admin-note-del" onClick={() => handleDeleteNote(note.id)}><i className="fa-solid fa-xmark"></i></button>
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
              )}

              {(toc.length > 0 || article.infobox) && (
                <div className="article-sidebar">
                  {article.infobox && (
                    <aside className="infobox">
                      <div className="infobox-title">{article.title}</div>
                      {article.infobox.image && (
                        <img src={article.infobox.image} className="infobox-image" alt={article.infobox.caption || article.title} />
                      )}
                      {article.infobox.caption && <div className="infobox-caption">{article.infobox.caption}</div>}
                      {article.infobox.fields && article.infobox.fields.length > 0 && (
                        <div className="infobox-content">
                          <table>
                            <tbody>
                              {article.infobox.fields.map((f, i) => (
                                <tr key={i}>
                                  <th>{f.key}</th>
                                  <td>{f.value}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </aside>
                  )}

                  {toc.length > 0 && (
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
                  )}
                </div>
              )}
            </div>

            {/* Mobile Bottom Ad */}
            <div className="article-mobile-ad article-mobile-bottom" aria-label="Advertisement">
              <AdsterraBanner adKey="0ceb033e24e9ee12e9c25715806625f1" width={300} height={250} />
            </div>
          </div>

          {/* Desktop Right Skyscraper Ad */}
          <aside className="article-gutter-ad article-gutter-right" aria-label="Advertisement">
            <div className="article-gutter-sticky">
              <AdsterraBanner adKey="4b156de36dae03b65add64dcf8b6fa52" width={160} height={300} />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default ArticleViewer;
