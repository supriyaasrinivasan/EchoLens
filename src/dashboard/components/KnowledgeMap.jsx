import React, { useRef, useEffect } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

const KnowledgeMap = ({ memories }) => {
  const graphRef = useRef();

  // Transform memories into graph data
  const graphData = React.useMemo(() => {
    const nodes = [];
    const links = [];
    const tagMap = new Map();

    // Create nodes for each memory
    memories.forEach((memory, idx) => {
      nodes.push({
        id: `memory-${idx}`,
        name: memory.title,
        val: memory.visits * 2, // Size based on visits
        type: 'memory',
        color: getColorByActivity(memory),
        memory: memory
      });

      // Create tag nodes and links
      memory.tags.forEach(tag => {
        if (!tagMap.has(tag)) {
          tagMap.set(tag, {
            id: `tag-${tag}`,
            name: tag,
            val: 5,
            type: 'tag',
            color: '#3b82f6'
          });
        }
        
        links.push({
          source: `memory-${idx}`,
          target: `tag-${tag}`,
          value: 1
        });
      });
    });

    // Add all tag nodes
    tagMap.forEach(tag => nodes.push(tag));

    return { nodes, links };
  }, [memories]);

  const getColorByActivity = (memory) => {
    const daysSinceVisit = (Date.now() - memory.lastVisit) / (1000 * 60 * 60 * 24);
    
    if (daysSinceVisit < 1) return '#6366f1'; // Recent - purple
    if (daysSinceVisit < 7) return '#3b82f6'; // This week - blue
    if (daysSinceVisit < 30) return '#06b6d4'; // This month - cyan
    return '#64748b'; // Older - gray
  };

  const handleNodeClick = (node) => {
    if (node.type === 'memory') {
      window.open(node.memory.url, '_blank');
    }
  };

  const handleNodeHover = (node) => {
    if (graphRef.current) {
      const canvas = graphRef.current.canvas();
      if (canvas) {
        canvas.style.cursor = node ? 'pointer' : 'default';
      }
    }
  };

  useEffect(() => {
    if (graphRef.current) {
      // Zoom to fit
      graphRef.current.zoomToFit(400);
    }
  }, [graphData]);

  if (memories.length === 0) {
    return (
      <div className="empty-map">
        <div className="empty-icon">🌌</div>
        <h3>No memories to map yet</h3>
        <p>Start browsing to see your knowledge constellation</p>
      </div>
    );
  }

  return (
    <div className="knowledge-map-container">
      <div className="map-legend">
        <div className="legend-item">
          <div className="legend-color" style={{background: '#6366f1'}}></div>
          <span>Recent (Today)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{background: '#3b82f6'}}></div>
          <span>This Week</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{background: '#06b6d4'}}></div>
          <span>This Month</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{background: '#64748b'}}></div>
          <span>Older</span>
        </div>
      </div>

      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        nodeLabel="name"
        nodeVal="val"
        nodeColor="color"
        linkWidth={1}
        linkColor={() => 'rgba(99, 102, 241, 0.2)'}
        backgroundColor="#0a0e27"
        onNodeClick={handleNodeClick}
        onNodeHover={handleNodeHover}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name;
          const fontSize = 12/globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          
          // Draw node
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.val, 0, 2 * Math.PI);
          ctx.fillStyle = node.color;
          ctx.fill();
          
          // Draw glow effect
          ctx.shadowColor = node.color;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
          
          // Draw label
          if (globalScale > 1) {
            ctx.fillStyle = '#f1f5f9';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(label.substring(0, 30), node.x, node.y + node.val + 10);
          }
        }}
        cooldownTicks={100}
        onEngineStop={() => graphRef.current?.zoomToFit(400)}
      />
    </div>
  );
};

export default KnowledgeMap;
