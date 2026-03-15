import React, { useEffect, useRef } from 'react';

const COLORS = ['#a855f7','#3b82f6','#22c55e','#f59e0b','#ef4444','#ec4899','#06b6d4','#8b5cf6'];

const ConfettiCelebration = ({ active, onComplete, count = 80 }) => {
  const pieces = useRef([]);

  useEffect(() => {
    if (!active) return;
    pieces.current = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * window.innerWidth,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: Math.random() * 8 + 6,
      duration: Math.random() * 2 + 2,
      delay: Math.random() * 1.5,
      shape: Math.random() > 0.5 ? 'circle' : 'rect',
    }));
    const timer = setTimeout(() => onComplete?.(), 4500);
    return () => clearTimeout(timer);
  }, [active, count, onComplete]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      {pieces.current.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: p.x,
            top: -20,
            width: p.size,
            height: p.shape === 'rect' ? p.size * 0.4 : p.size,
            backgroundColor: p.color,
            borderRadius: p.shape === 'circle' ? '50%' : '2px',
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiCelebration;
