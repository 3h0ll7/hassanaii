import { useState, useEffect, useCallback, useRef } from "react";

interface Position {
  x: number;
  y: number;
}

interface Trail {
  id: number;
  x: number;
  y: number;
  opacity: number;
}

export const useSpotlightCursor = (delay: number = 0.1) => {
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 });
  const [smoothPosition, setSmoothPosition] = useState<Position>({ x: 0, y: 0 });
  const [trails, setTrails] = useState<Trail[]>([]);
  const [velocity, setVelocity] = useState(0);
  const lastPosition = useRef<Position>({ x: 0, y: 0 });
  const trailId = useRef(0);
  const animationFrame = useRef<number>();

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const newPos = { x: e.clientX, y: e.clientY };
    
    // Calculate velocity
    const dx = newPos.x - lastPosition.current.x;
    const dy = newPos.y - lastPosition.current.y;
    const speed = Math.sqrt(dx * dx + dy * dy);
    setVelocity(speed);
    
    // Add trail when moving fast
    if (speed > 15) {
      trailId.current += 1;
      setTrails(prev => [
        ...prev.slice(-5),
        { id: trailId.current, x: newPos.x, y: newPos.y, opacity: 0.6 }
      ]);
    }
    
    lastPosition.current = newPos;
    setMousePosition(newPos);
  }, []);

  // Smooth position interpolation
  useEffect(() => {
    const animate = () => {
      setSmoothPosition(prev => ({
        x: prev.x + (mousePosition.x - prev.x) * delay,
        y: prev.y + (mousePosition.y - prev.y) * delay
      }));
      animationFrame.current = requestAnimationFrame(animate);
    };
    
    animationFrame.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [mousePosition, delay]);

  // Fade out trails
  useEffect(() => {
    if (trails.length === 0) return;
    
    const interval = setInterval(() => {
      setTrails(prev => 
        prev
          .map(t => ({ ...t, opacity: t.opacity - 0.1 }))
          .filter(t => t.opacity > 0)
      );
    }, 50);
    
    return () => clearInterval(interval);
  }, [trails.length]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  // Check if cursor is over an element
  const isOverElement = useCallback((elementRef: React.RefObject<HTMLElement>) => {
    if (!elementRef.current) return false;
    const rect = elementRef.current.getBoundingClientRect();
    const spotlightRadius = 120;
    
    // Check if spotlight circle overlaps with element
    const closestX = Math.max(rect.left, Math.min(smoothPosition.x, rect.right));
    const closestY = Math.max(rect.top, Math.min(smoothPosition.y, rect.bottom));
    const distanceX = smoothPosition.x - closestX;
    const distanceY = smoothPosition.y - closestY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
    
    return distance < spotlightRadius;
  }, [smoothPosition]);

  return {
    mousePosition,
    smoothPosition,
    trails,
    velocity,
    isOverElement
  };
};
