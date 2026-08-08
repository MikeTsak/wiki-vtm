import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import SEO from '../../components/Common/SEO';
import './Journal.css';

export default function Journal() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // full entry data
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/login');
  }, [user, authLoading]);

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/wiki/journal');
      setEntries(res.data.entries || []);
    } catch (e) {
      setError('Failed to load journal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user) fetchEntries(); }, [user]);

  const openEntry = async (id) => {
    try {
      const res = await api.get(`/api/wiki/journal/${id}`);
      setSelected(res.data.entry);
      setEditing(false);
    } catch (e) {
      setError('Failed to load entry.');
    }
  };

  const startNew = () => {
    setSelected(null);
    setForm({ title: '', content: '' });
    setEditing(true);
    setPreview(false);
  };

  const startEdit = () => {
    setForm({ title: selected.title, content: selected.content || '' });
    setEditing(true);
    setPreview(false);
  };

  const cancelEdit = () => {
    if (selected) { setEditing(false); }
    else { setEditing(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { title: form.title || 'Untitled Entry', content: form.content };
      if (selected) payload.id = selected.id;
      const res = await api.post('/api/wiki/journal', payload);
      await fetchEntries();
      const updated = await api.get(`/api/wiki/journal/${res.data.id}`);
      setSelected(updated.data.entry);
      setEditing(false);
    } catch (e) {
      setError(e.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this journal entry?')) return;
    try {
      await api.delete(`/api/wiki/journal/${id}`);
      setSelected(null);
      setEditing(false);
      fetchEntries();
    } catch (e) {
      setError('Delete failed');
    }
  };

  const fmt = (ts) => new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  if (authLoading) return <div className="jnl-page">Loading…</div>;
  if (!user) return null;

  return (
    <div className="jnl-page">
      <SEO title="My Journal" noindex={true} />
      {/* ── Sidebar ── */}
      <aside className="jnl-sidebar">
        <div className="jnl-sidebar-header">
          <h2><i className="fa-solid fa-book" style={{ marginRight: '8px' }}></i> My Journal</h2>
          <button className="jnl-btn-new" onClick={startNew}>+ New Entry</button>
        </div>
        {loading ? (
          <p className="jnl-loading">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="jnl-empty-list">No entries yet.<br/>Start your chronicle.</p>
        ) : (
          <ul className="jnl-list">
            {entries.map(e => (
              <li
                key={e.id}
                className={`jnl-list-item ${selected?.id === e.id ? 'active' : ''}`}
                onClick={() => openEntry(e.id)}
              >
                <div className="jnl-item-title">{e.title}</div>
                <div className="jnl-item-date">{fmt(e.updated_at)}</div>
              </li>
            ))}
          </ul>
        )}
      </aside>

      {/* ── Main panel ── */}
      <main className="jnl-main">
        {error && (
          <div className="jnl-error">{error} <button onClick={() => setError(null)}><i className="fa-solid fa-xmark"></i></button></div>
        )}

        {!editing && !selected && (
          <div className="jnl-welcome">
            <div className="jnl-welcome-icon"><i className="fa-solid fa-book"></i></div>
            <h2>Your Private Journal</h2>
            <p>These pages are for your eyes only — personal reflections, character thoughts, and secret lore.</p>
            <button className="jnl-btn-new large" onClick={startNew}>Begin Writing</button>
          </div>
        )}

        {!editing && selected && (
          <div className="jnl-viewer">
            <div className="jnl-viewer-header">
              <h1 className="jnl-viewer-title">{selected.title}</h1>
              <div className="jnl-viewer-meta">
                <span>Last updated {fmt(selected.updated_at)}</span>
                <div className="jnl-viewer-actions">
                  <button onClick={startEdit}>Edit</button>
                  <button className="danger" onClick={() => handleDelete(selected.id)}>Delete</button>
                </div>
              </div>
            </div>
            <div className="jnl-content markdown-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{selected.content || '_Nothing written yet._'}</ReactMarkdown>
            </div>
          </div>
        )}

        {editing && (
          <div className="jnl-editor">
            <div className="jnl-editor-toolbar">
              <input
                className="jnl-title-input"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Entry title…"
              />
              <div className="jnl-editor-actions">
                <button onClick={() => setPreview(p => !p)} className={preview ? 'active' : ''}>
                  {preview ? 'Edit' : 'Preview'}
                </button>
                <button onClick={cancelEdit}>Cancel</button>
                <button className="primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>

            {preview ? (
              <div className="jnl-preview markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.content || '_Nothing written yet._'}</ReactMarkdown>
              </div>
            ) : (
              <textarea
                className="jnl-textarea"
                value={form.content}
                onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                placeholder="Write your thoughts… (Markdown supported)"
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
