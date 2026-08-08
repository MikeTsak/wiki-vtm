import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import './BoardMembersModal.css';

export default function BoardMembersModal({ isOpen, onClose, boardId }) {
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
      setSearchQuery('');
      setSearchResults([]);
    }
  }, [isOpen, boardId]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      const delayDebounceFn = setTimeout(() => {
        searchUsers(searchQuery);
      }, 500);
      return () => clearTimeout(delayDebounceFn);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/wiki/elysium-boards/${boardId}/members`);
      setMembers(res.data.members || []);
    } catch (e) {
      console.error('Failed to fetch members:', e);
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query) => {
    setSearchLoading(true);
    try {
      const res = await api.get(`/api/users/search?q=${encodeURIComponent(query)}`);
      // Filter out existing members from search results
      const existingIds = new Set(members.map(m => m.id));
      const filtered = (res.data.users || []).filter(u => !existingIds.has(u.id));
      setSearchResults(filtered);
    } catch (e) {
      console.error('Search failed:', e);
    } finally {
      setSearchLoading(false);
    }
  };

  const addMember = async (userId) => {
    try {
      await api.post(`/api/wiki/elysium-boards/${boardId}/members`, { userId });
      setSearchQuery('');
      fetchMembers();
    } catch (e) {
      console.error('Failed to add member:', e);
      alert('Failed to add member. Make sure you are the owner.');
    }
  };

  const removeMember = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    try {
      await api.delete(`/api/wiki/elysium-boards/${boardId}/members/${userId}`);
      fetchMembers();
    } catch (e) {
      console.error('Failed to remove member:', e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="bm-modal-overlay" onClick={onClose}>
      <div className="bm-modal-content" onClick={e => e.stopPropagation()}>
        <div className="bm-modal-header">
          <h2>Manage Board Members</h2>
          <button className="bm-close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="bm-search-section">
          <input 
            type="text" 
            className="bm-search-input"
            placeholder="Search users by name or email to add..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchLoading && <div className="bm-search-loading">Searching...</div>}
          
          {searchResults.length > 0 && (
            <div className="bm-search-results">
              {searchResults.map(user => (
                <div key={user.id} className="bm-search-item">
                  <div className="bm-user-info">
                    <span className="bm-user-name">{user.display_name}</span>
                    <span className="bm-user-email">{user.email}</span>
                  </div>
                  <button className="bm-add-btn" onClick={() => addMember(user.id)}>Add</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bm-members-list">
          <h3>Current Members</h3>
          {loading ? (
            <div className="bm-empty">Loading members...</div>
          ) : members.length === 0 ? (
            <div className="bm-empty">No additional members added yet.</div>
          ) : (
            members.map(member => (
              <div key={member.id} className="bm-member-item">
                <div className="bm-user-info">
                  <span className="bm-user-name">{member.display_name}</span>
                  <span className="bm-user-email">{member.email}</span>
                </div>
                <button className="bm-remove-btn" onClick={() => removeMember(member.id)}>Remove</button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
