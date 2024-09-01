import React, { useRef, useEffect, useState, useContext } from 'react';
import { useNode } from '@craftjs/core';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { CodeGenerationContext } from '@/app/page';

export const ResizableComponent = ({ id = '1', width = 'auto', height = 'auto', children }) => {
  const { connectors: { connect, drag }, actions: { setProp } } = useNode();
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const { selectedId, setSelectedId } = useContext(CodeGenerationContext);

  useEffect(() => {
    if (containerRef.current) {
      const updateSize = () => {
        const { offsetWidth, offsetHeight } = containerRef.current.parentElement;
        setContainerSize({ width: offsetWidth, height: offsetHeight });
      };
      updateSize();
      window.addEventListener('resize', updateSize);
      return () => window.removeEventListener('resize', updateSize);
    }
  }, []);

  const getPixelValue = (value, dimension) => {
    if (typeof value === 'string' && value.endsWith('%')) {
      return (parseInt(value) / 100) * containerSize[dimension];
    }
    return parseInt(value) || (dimension === 'width' ? 100 : 50); // Default sizes
  };

  const pixelWidth = getPixelValue(width, 'width');
  const pixelHeight = getPixelValue(height, 'height');

  const handleClick = () => {
    setSelectedId(id);
  };

  return (
    <div 
      ref={containerRef} 
      style={{ 
        display: 'inline-block',
        verticalAlign: 'top',
        margin: '5px',
        maxWidth: '100%',
        maxHeight: '100%',
      }}
    >
      {containerSize.width > 0 && containerSize.height > 0 && (
        <ResizableBox
          width={pixelWidth}
          height={pixelHeight}
          minConstraints={[50, 30]}
          onResize={(e, { size }) => {
            setProp(props => {
              props.width = `${size.width}px`;
              props.height = `${size.height}px`;
            });
          }}
          resizeHandles={['se']}
        >
          <div 
            ref={(ref) => connect(drag(ref)) as any}
            style={{
              width: '100%',
              height: '100%',
              border: '1px solid #ccc',
              // padding: '5px',
              boxSizing: 'border-box',
              overflow: 'hidden',
              cursor: 'pointer',
              backgroundColor: selectedId === id ? '#e6f7ff' : 'transparent',
            }}
            onClick={handleClick}
          >
            {React.Children.map(children, child =>
              React.cloneElement(child, { id: id })
            )}
          </div>
        </ResizableBox>
      )}
    </div>
  );
};

// ResizableSettings component remains the same
export const ResizableSettings = () => {
  // ... (unchanged)
};

ResizableComponent.craft = {
  props: {
    width: '100%',
    height: '100%',
    id: '1'
  },
  related: {
    toolbar: ResizableSettings,
  },
};