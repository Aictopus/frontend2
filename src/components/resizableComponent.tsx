import React, { useRef, useEffect, useState, useContext } from 'react';
import { useNode } from '@craftjs/core';
import { ResizableBox } from 'react-resizable';
import 'react-resizable/css/styles.css';
import { useCodeGenerationContext } from '@/hooks/useCodeGenerationContext';
import { PreviewContext } from '@/components/wrapper';

const GRID_SIZE = 40; // Size of each grid cell in pixels

export const ResizableComponent = ({id = '1', width = 'auto', height = 'auto', children }) => {
  const { connectors: { connect, drag }, actions: { setProp } } = useNode();
  const containerRef = useRef(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const { selectedId, setSelectedId } = useCodeGenerationContext();
  const { isPreview } = useContext(PreviewContext);

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
    if (!isPreview) {
      setSelectedId(id);
    }
  };

  const snapToGrid = (size) => {
    return {
      width: Math.round(size.width / GRID_SIZE) * GRID_SIZE,
      height: Math.round(size.height / GRID_SIZE) * GRID_SIZE
    };
  };

  return (
    <div
      ref={containerRef}
      style={{
        display: 'inline-block',
        verticalAlign: 'top',
        margin: isPreview ? '0' : '5px',
        maxWidth: '100%',
        maxHeight: '100%',
      }}
    >
      {containerSize.width > 0 && containerSize.height > 0 && (
        <ResizableBox
          width={pixelWidth}
          height={pixelHeight}
          minConstraints={[GRID_SIZE, GRID_SIZE]}
          maxConstraints={[containerSize.width, containerSize.height]}
          onResize={(e, { size }) => {
            if (!isPreview) {
              const snappedSize = snapToGrid(size);
              setProp(props => {
                props.width = `${snappedSize.width}px`;
                props.height = `${snappedSize.height}px`;
              });
            }
          }}
          resizeHandles={isPreview ? [] : ['se']}
          draggableOpts={{ grid: [GRID_SIZE, GRID_SIZE], disabled: isPreview }}
        >
          <div
            ref={(ref) => connect(drag(ref)) as any}
            style={{
              width: '100%',
              height: '100%',
              border: isPreview ? 'none' : (selectedId === id ? '2px solid #e6f7ff' : '1px solid #ccc'),
              padding: '5px',
              boxSizing: 'border-box',
              overflow: 'hidden'
            }}
            onClick={handleClick}
          >
            {typeof children === 'string' ? children : React.Children.map(children, child => child)}
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
  },
  related: {
    toolbar: ResizableSettings,
  },
};