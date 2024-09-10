import React from 'react';

const ContextMenu = ({ x, y, onGenerateVariants, isGenerating }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: y,
        left: x,
        backgroundColor: 'white',
        boxShadow: '0px 0px 10px rgba(0,0,0,0.1)',
        borderRadius: '4px',
        padding: '8px',
        zIndex: 1000,
      }}
    >
      <button
        onClick={onGenerateVariants}
        disabled={isGenerating}
        style={{
          backgroundColor: isGenerating ? '#ccc' : '#007bff',
          color: 'white',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '4px',
          cursor: isGenerating ? 'not-allowed' : 'pointer',
        }}
      >
        Generate Variants
      </button>
    </div>
  );
};

export default ContextMenu;