import { useState, useRef, useCallback, useEffect } from 'react';

export function useResizable({ direction = 'horizontal', initialSize = 300, minSize = 150, maxSize = 800 }) {
  const [size, setSize] = useState(initialSize);
  const isDragging = useRef(false);
  const startPos = useRef(0);
  const startSize = useRef(0);

  const onMouseDown = useCallback((e) => {
    isDragging.current = true;
    startPos.current = direction === 'horizontal' ? e.clientX : e.clientY;
    startSize.current = size;
    document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  }, [size, direction]);

  useEffect(() => {
    const onMouseMove = (e) => {
      if (!isDragging.current) return;
      const diff = direction === 'horizontal'
        ? e.clientX - startPos.current
        : e.clientY - startPos.current;
      const newSize = Math.min(maxSize, Math.max(minSize, startSize.current + diff));
      setSize(newSize);
    };

    const onMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [direction, minSize, maxSize]);

  return { size, onMouseDown };
}
