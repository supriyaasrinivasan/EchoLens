import React from 'react';
import KnowledgeMapFallback from './KnowledgeMapFallback';

/**
 * KnowledgeMap Component
 * 
 * Currently using fallback visualization to avoid React Suspense errors
 * with dynamic imports. The fallback provides a clean grid-based visualization.
 * 
 * Future enhancement: Implement proper lazy loading with Suspense boundary
 * for the full 3D force graph visualization.
 */

const KnowledgeMap = ({ memories }) => {
  // Use fallback visualization for stability
  return <KnowledgeMapFallback memories={memories} />;
};

export default KnowledgeMap;
