import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import './Timeline.css';

const CATEGORIES = ['General', 'Political', 'Conflict', 'Social', 'Mystery', 'Death', 'Domain'];

const CategoryDot = ({ category }) => {
  const colors = {
    General: '#888',
    Political: '#d4a84b',
    Conflict: '#c0392b',
    Social: '#8e44ad',
    Mystery: '#2980b9',
    Death: '#2c3e50',
    Domain: '#27ae60',
  };
  return <span className="tl-dot" style={{ background: colors[category] || '#888' }} title={category} />;
};

const empty = () => ({ title: '', date_label: '', description: '', article_slug: '', category: 'General', sort_order: 0 });

export default function Timeline() {
  const { user, isAdmin } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | 'new' | event object
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/wiki/timeline');
      setEvents(res.data.events || []);
    } catch (e) {
      setError('Failed to load timeline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const startNew = () => { setForm(empty()); setEditing('new'); };
  const startEdit = (ev) => { setForm({ ...ev }); setEditing(ev); };
  const cancelEdit = () => { setEditing(null); setForm(empty()); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing === 'new') {
        await api.post('/api/wiki/timeline', form);
      } else {
        await api.put(`/api/wiki/timeline/${editing.id}`, form);
      }
      await fetchEvents();
      cancelEdit();
    } catch (e) {
      setError(e.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await api.delete(`/api/wiki/timeline/${id}`);
      setEvents(ev => ev.filter(e => e.id !== id));
    } catch (e) {
      setError('Delete failed');
    }
  };

  return (
    <div className="tl-page">
      <div className="tl-header">
        <h1 className="tl-title">Chronicle of Erebus</h1>
        <p className="tl-subtitle">A record of events in the Domain</p>
        {isAdmin && (
          <button className="tl-btn-add" onClick={startNew}>+ Add Event</button>
        )}
      </div>

      {error && <div className="tl-error">{error} <button onClick={() => setError(null)}>✕</button></div>}

      {/* Category legend */}
      <div className="tl-legend">
        {CATEGORIES.map(cat => (
          <span key={cat} className="tl-legend-item">
            <CategoryDot category={cat} /> {cat}
          </span>
        ))}
      </div>

      {loading ? (
        <div className="tl-loading">Loading chronicle…</div>
      ) : events.length === 0 ? (
        <div className="tl-empty">
          <p>No events recorded yet.</p>
          {isAdmin && <button className="tl-btn-add" onClick={startNew}>Record the first event</button>}
        </div>
      ) : (
        <div className="tl-track">
          <div className="tl-line" />
          {events.map((ev, idx) => (
            <div key={ev.id} className={`tl-event ${idx % 2 === 0 ? 'tl-left' : 'tl-right'}`}>
              <div className="tl-connector">
                <CategoryDot category={ev.category} />
              </div>
              <div className="tl-card">
                <div className="tl-card-date">{ev.date_label}</div>
                <h3 className="tl-card-title">
                  {ev.article_slug
                    ? <Link to={`/article/${ev.article_slug}`}>{ev.title}</Link>
                    : ev.title
                  }
                </h3>
                {ev.category && <span className="tl-card-category">{ev.category}</span>}
                {ev.description && <p className="tl-card-desc">{ev.description}</p>}
                {isAdmin && (
                  <div className="tl-card-actions">
                    <button onClick={() => startEdit(ev)}>Edit</button>
                    <button className="danger" onClick={() => handleDelete(ev.id)}>Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin modal */}
      {editing && (
        <div className="tl-modal-backdrop" onClick={cancelEdit}>
          <div className="tl-modal" onClick={e => e.stopPropagation()}>
            <h2>{editing === 'new' ? 'Add Event' : 'Edit Event'}</h2>
            <label>Date / Era *
              <input value={form.date_label} onChange={e => setForm(f => ({ ...f, date_label: e.target.value }))} placeholder="e.g. Autumn 2025 / Domain Year 3" />
            </label>
            <label>Title *
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Event title" />
            </label>
            <label>Category
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </label>
            <label>Description
              <textarea rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of the event…" />
            </label>
            <label>Link to Article (slug)
              <input value={form.article_slug} onChange={e => setForm(f => ({ ...f, article_slug: e.target.value }))} placeholder="e.g. malkavian" />
            </label>
            <label>Sort Order
              <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))} />
            </label>
            <div className="tl-modal-actions">
              <button onClick={cancelEdit}>Cancel</button>
              <button className="primary" onClick={handleSave} disabled={saving || !form.title || !form.date_label}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
