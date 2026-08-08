import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ErrorModal from '../components/Common/ErrorModal';
import './ElysiumBoards.css';

export default function ElysiumBoards() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalError, setModalError] = useState(null);
  
  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newBoardVisibility, setNewBoardVisibility] = useState('public');
  const [isCreating, setIsCreating] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const res = await api.get('/api/wiki/elysium-boards');
      setBoards(res.data.boards);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch boards:', err);
      setError('Failed to load boards. Please try again later.');
      setModalError(err);
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setNewBoardTitle('');
    setNewBoardVisibility('public');
    setShowCreateModal(true);
  };

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    setIsCreating(true);
    try {
      const res = await api.post('/api/wiki/elysium-boards', { 
        title: newBoardTitle, 
        visibility: newBoardVisibility,
        data: { nodes: [], edges: [] } 
      });
      setShowCreateModal(false);
      navigate(`/boards/${res.data.id}`);
    } catch (error) {
      console.error('Failed to create board:', error);
      setModalError(error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="elysium-boards-container">
      <div className="boards-header">
        <h1>Elysium Boards</h1>
        <p>Visual corkboards for brainstorming and mapping connections.</p>
        <button className="create-board-btn" onClick={openCreateModal}>
          + Create New Board
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Loading boards...</div>
      ) : boards.length === 0 ? (
        <div className="empty-state">
          No boards found. Create one to get started!
        </div>
      ) : (
        <div className="boards-grid">
          {boards.map(board => (
            <Link to={`/boards/${board.id}`} key={board.id} className="board-card">
              <div className="board-card-content">
                <h3>{board.title}</h3>
                <div className="board-meta">
                  Last updated: {new Date(board.updated_at).toLocaleDateString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <ErrorModal 
        isOpen={!!modalError} 
        onClose={() => setModalError(null)} 
        title="Board Error"
        error={modalError} 
      />

      {/* Create Board Modal */}
      {showCreateModal && (
        <div className="eb-modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="eb-modal-content" onClick={e => e.stopPropagation()}>
            <h2>Create New Board</h2>
            <form onSubmit={handleCreateBoard}>
              <div className="eb-form-group">
                <label>Board Title</label>
                <input 
                  type="text" 
                  value={newBoardTitle} 
                  onChange={e => setNewBoardTitle(e.target.value)} 
                  placeholder="e.g. Campaign Plot Hook"
                  autoFocus
                  required
                />
              </div>

              <div className="eb-form-group">
                <label>Visibility</label>
                <div className="eb-radio-group">
                  <label className={`eb-radio-option ${newBoardVisibility === 'public' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="visibility" 
                      value="public"
                      checked={newBoardVisibility === 'public'}
                      onChange={e => setNewBoardVisibility(e.target.value)}
                    />
                    <div className="eb-radio-content">
                      <span className="eb-radio-title">Public</span>
                      <span className="eb-radio-desc">Anyone can view this board</span>
                    </div>
                  </label>
                  
                  <label className={`eb-radio-option ${newBoardVisibility === 'private' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="visibility" 
                      value="private"
                      checked={newBoardVisibility === 'private'}
                      onChange={e => setNewBoardVisibility(e.target.value)}
                    />
                    <div className="eb-radio-content">
                      <span className="eb-radio-title">Private</span>
                      <span className="eb-radio-desc">Anyone with the link can view</span>
                    </div>
                  </label>

                  <label className={`eb-radio-option ${newBoardVisibility === 'personal' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="visibility" 
                      value="personal"
                      checked={newBoardVisibility === 'personal'}
                      onChange={e => setNewBoardVisibility(e.target.value)}
                    />
                    <div className="eb-radio-content">
                      <span className="eb-radio-title">Personal</span>
                      <span className="eb-radio-desc">For your eyes only</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="eb-modal-actions">
                <button type="button" className="eb-btn-cancel" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="eb-btn-submit" disabled={isCreating || !newBoardTitle.trim()}>
                  {isCreating ? 'Creating...' : 'Create Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
