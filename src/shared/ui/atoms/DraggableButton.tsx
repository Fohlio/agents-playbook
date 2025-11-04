'use client';

import { useState, useRef, useEffect, useCallback, ReactNode } from 'react';

interface DraggableButtonProps {
  children: ReactNode;
  defaultX?: number;
  defaultY?: number;
}

export function DraggableButton({ children, defaultX, defaultY }: DraggableButtonProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  // Set initial position
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPosition({
        x: defaultX ?? window.innerWidth - 120,
        y: defaultY ?? window.innerHeight - 120,
      });
    }
  }, [defaultX, defaultY]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start drag if not clicking the button or its children
    const target = e.target as HTMLElement;
    const isButton = target.tagName === 'BUTTON' ||
                     target.closest('button') !== null ||
                     target.hasAttribute('data-no-drag');

    if (isButton) {
      return;
    }

    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={ref}
      className="fixed z-50 flex flex-col items-center gap-1"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Drag handle - visible grip */}
      <div
        onMouseDown={handleMouseDown}
        className="flex gap-0.5 px-2 py-1 rounded-t-lg bg-black/10 hover:bg-black/20 transition-colors"
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        title="Drag to move"
      >
        <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
        <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
        <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
      </div>
      {children}
    </div>
  );
}
