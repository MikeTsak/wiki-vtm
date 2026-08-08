import React, { useEffect, useState, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import SEO from '../../components/Common/SEO';
import './LoreGraph.css';

const LoreGraph = () => {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth - 300, height: window.innerHeight - 80 });
  const containerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const res = await api.get('/api/wiki/graph');
        setGraphData(res.data);
      } catch (err) {
        setError('Failed to load lore graph data.');
      } finally {
        setLoading(false);
      }
    };
    fetchGraphData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) return <div className="graph-loading">Loading Lore Graph...</div>;
  if (error) return <div className="graph-error">{error}</div>;

  return (
    <div className="lore-graph-container" ref={containerRef}>
      <SEO title="Lore Graph" description="Explore the connections in the Erebus Wiki." />
      <div className="graph-overlay">
        <h2>Interactive Lore Graph</h2>
        <p>Click a node to navigate to the article. Scroll to zoom, drag to pan.</p>
      </div>
      <ForceGraph2D
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel="name"
        nodeColor={() => '#8b1a1a'}
        nodeRelSize={6}
        linkColor={() => 'rgba(212, 168, 75, 0.4)'}
        linkWidth={1.5}
        onNodeClick={(node) => navigate(`/article/${node.id}`)}
        backgroundColor="#0a0604"
      />
    </div>
  );
};

export default LoreGraph;
