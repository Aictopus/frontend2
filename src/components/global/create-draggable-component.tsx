import React from 'react';
import { useNode } from '@craftjs/core';

const createDraggableComponent = (Component: React.ComponentType<any>, isDroppable = false) => {
  const DraggableComponent = React.forwardRef((props: any, ref: React.Ref<HTMLElement>) => {
    const { connectors: { connect, drag } } = useNode();
    const elementRef = React.useRef<HTMLElement>(null);

    React.useImperativeHandle(ref, () => elementRef.current!);

    React.useEffect(() => {
      if (elementRef.current) {
        connect(isDroppable ? drag(elementRef.current) : elementRef.current);
      }
    }, [connect, drag, isDroppable]);

    return <Component ref={elementRef} {...props} />;
  });

  // Preserve the original component's name for Craft.js
  const originalName = Component.displayName || Component.name || 'Component';
  DraggableComponent.displayName = originalName;

  // Add a property to indicate it's a draggable version
  (DraggableComponent as any).isDraggableVersion = true;

  return DraggableComponent;
};

export default createDraggableComponent;