import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ReactFlow,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  useViewport,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import PostItNode from '../components/Boards/PostItNode';
import BoardMembersModal from '../components/Boards/BoardMembersModal';
import ErrorModal from '../components/Common/ErrorModal';
import api from '../utils/api';
import './ElysiumBoardView.css';

const CorkboardBackground = () => {
  const { x, y, zoom } = useViewport();
  const size = 40 * zoom;
  
  return (
    <div 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        backgroundColor: '#ba8c53',
        backgroundImage: `
          radial-gradient(circle at 100% 50%, transparent 20%, rgba(255,255,255,.3) 21%, rgba(255,255,255,.3) 34%, transparent 35%, transparent),
          radial-gradient(circle at 0% 50%, transparent 20%, rgba(255,255,255,.3) 21%, rgba(255,255,255,.3) 34%, transparent 35%, transparent),
          radial-gradient(circle at 50% 0%, rgba(0,0,0,.1) 10%, transparent 11%, transparent),
          radial-gradient(circle at 50% 100%, rgba(0,0,0,.1) 10%, transparent 11%, transparent)
        `,
        backgroundSize: `${size}px ${size}px`,
        backgroundPosition: `${x}px ${y}px`,
        boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6)',
        pointerEvents: 'none'
      }}
    />
  );
};

const nodeTypes = {
  postit: PostItNode,
};

export default function ElysiumBoardView() {
  const { id } = useParams();
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [boardTitle, setBoardTitle] = useState('Loading...');
  
  // Autosave state
  const [saveStatus, setSaveStatus] = useState(''); // 'saving', 'saved', 'error', ''
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [boardError, setBoardError] = useState(null);
  
  // Member management state
  const [isOwner, setIsOwner] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  
  // Ref to track if we have mounted/loaded
  const isMounted = useRef(false);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    isMounted.current = true;
    fetchBoard();
    return () => { isMounted.current = false; };
  }, [id]);

  const updateNodeData = useCallback((nodeId, newData) => {
    setNodes((nds) => nds.map(n => {
      if (n.id === nodeId) {
        return { ...n, data: { ...n.data, ...newData } };
      }
      return n;
    }));
  }, []);

  const fetchBoard = async () => {
    try {
      const res = await api.get(`/api/wiki/elysium-boards/${id}`);
      const data = res.data;
      if (!data || !data.board) {
        throw new Error(data?.error || 'Board data is missing from response');
      }
      setBoardTitle(data.board.title);
      setIsOwner(!!data.isOwner);
      if (data.board.data) {
        const parsedData = typeof data.board.data === 'string' ? JSON.parse(data.board.data) : data.board.data;
        
        // Inject onChange handler into loaded nodes
        const loadedNodes = (parsedData.nodes || []).map(node => ({
          ...node,
          data: {
            ...node.data,
            onChangeData: (newData) => updateNodeData(node.id, newData)
          }
        }));
        
        setNodes(loadedNodes);
        setEdges(parsedData.edges || []);
      }
      // Give a tiny delay before enabling autosave so initial render doesn't trigger it
      setTimeout(() => {
        if (isMounted.current) setIsInitialLoad(false);
      }, 500);
    } catch (error) {
      console.error('Failed to fetch board:', error);
      if (isMounted.current) {
        setBoardTitle('Error loading board');
        setBoardError(error);
      }
    }
  };

  // The actual save function
  const performSave = async (currentTitle, currentNodes, currentEdges) => {
    if (!isMounted.current) return;
    setSaveStatus('saving');
    try {
      const dataToSave = { nodes: currentNodes, edges: currentEdges };
      await api.put(`/api/wiki/elysium-boards/${id}`, { 
        title: currentTitle, 
        data: dataToSave 
      });
      if (isMounted.current) setSaveStatus('saved');
    } catch (error) {
      console.error('Failed to save board:', error);
      if (isMounted.current) setSaveStatus('error');
    }
  };

  // Auto-save effect
  useEffect(() => {
    if (isInitialLoad) return;
    
    // Clear previous timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus(''); // clear saved status when editing starts
    
    // Set a new timeout
    saveTimeoutRef.current = setTimeout(() => {
      performSave(boardTitle, nodes, edges);
    }, 1500); // 1.5 second debounce
    
    return () => clearTimeout(saveTimeoutRef.current);
  }, [nodes, edges, boardTitle, isInitialLoad]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (params) => {
      // Style the edge like a red string with shadow
      const edge = {
        ...params,
        type: 'default',
        style: { 
          stroke: '#c80000', 
          strokeWidth: 4, 
          filter: 'drop-shadow(2px 3px 2px rgba(0,0,0,0.5))' 
        },
        animated: false
      };
      setEdges((eds) => addEdge(edge, eds));
    },
    []
  );

  const addPostIt = () => {
    const nodeId = `postit-${Date.now()}`;
    const newNode = {
      id: nodeId,
      type: 'postit',
      position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
      data: { 
        text: '',
        color: ['#fef3bd', '#ffcce6', '#ccffcc', '#cceeff'][Math.floor(Math.random() * 4)],
        onChangeData: (newData) => updateNodeData(nodeId, newData)
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="board-view-container">
      <div className="board-toolbar">
        <div className="toolbar-left">
          <Link to="/boards" className="back-link">← Back</Link>
          <input 
            type="text" 
            className="board-title-input" 
            value={boardTitle} 
            onChange={(e) => setBoardTitle(e.target.value)} 
          />
        </div>
        <div className="toolbar-right">
          <div className={`save-status ${saveStatus}`}>
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'saved' && 'Changes saved'}
            {saveStatus === 'error' && 'Failed to save'}
          </div>
          {isOwner && (
            <button onClick={() => setShowMembersModal(true)} className="toolbar-btn share-btn">Share / Members</button>
          )}
          <button onClick={addPostIt} className="toolbar-btn primary-btn">+ Add Post-It</button>
        </div>
      </div>

      <ErrorModal 
        isOpen={!!boardError} 
        onClose={() => setBoardError(null)} 
        title="Failed to Load Board"
        error={boardError} 
      />

      <BoardMembersModal 
        isOpen={showMembersModal} 
        onClose={() => setShowMembersModal(false)} 
        boardId={id} 
      />

      <div className="board-canvas-wrapper">
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            connectionMode="loose"
            connectionRadius={50}
            fitView
          >
            <CorkboardBackground />
            <Controls />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    </div>
  );
}
