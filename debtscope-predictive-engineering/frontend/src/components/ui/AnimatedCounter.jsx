import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'motion/react';

/**
 * AnimatedCounter
 * Renders an animated numerical counter with spring physics and tabular numerals.
 */
export default function AnimatedCounter({
  value = 0,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}) {
  const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  const spring = useSpring(0, {
    mass: 0.8,
    stiffness: 75,
    damping: 15,
  });

  const display = useTransform(spring, (current) => {
    return `${prefix}${current.toFixed(decimals)}${suffix}`;
  });

  const [displayValue, setDisplayValue] = useState(`${prefix}${numericValue.toFixed(decimals)}${suffix}`);

  useEffect(() => {
    spring.set(numericValue);
  }, [numericValue, spring]);

  useEffect(() => {
    const unsubscribe = display.on('change', (latest) => {
      setDisplayValue(latest);
    });
    return () => unsubscribe();
  }, [display]);

  return (
    <span className={`font-mono tabular-nums select-none ${className}`}>
      {displayValue}
    </span>
  );
}
