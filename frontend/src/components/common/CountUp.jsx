import { useEffect, useRef, useState } from 'react';

const CountUp = ({ end = 0, duration = 1.5, prefix = '', suffix = '', decimals = 0, className = '' }) => {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    const numEnd = typeof end === 'string' ? parseFloat(end) || 0 : (end || 0);
    if (isNaN(numEnd)) return;
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    startRef.current = null;

    const animate = (timestamp) => {
      if (!startRef.current) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = numEnd * eased;
      setValue(parseFloat(current.toFixed(decimals)));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => { if (frameRef.current) cancelAnimationFrame(frameRef.current); };
  }, [end, duration, decimals]);

  return (
    <span className={className}>
      {prefix}{decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString()}{suffix}
    </span>
  );
};

export default CountUp;
