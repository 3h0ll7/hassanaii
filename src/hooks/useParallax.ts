import { useState, useEffect } from "react";

export const useParallax = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getParallaxStyle = (speed: number = 0.5, direction: "up" | "down" = "up") => {
    const offset = direction === "up" ? -scrollY * speed : scrollY * speed;
    return {
      transform: `translateY(${offset}px)`,
    };
  };

  const getParallaxOpacity = (fadeStart: number = 100, fadeEnd: number = 300) => {
    const opacity = Math.max(0, Math.min(1, 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart)));
    return { opacity };
  };

  const getParallaxScale = (baseScale: number = 1, scaleSpeed: number = 0.0005) => {
    const scale = baseScale + scrollY * scaleSpeed;
    return { transform: `scale(${Math.min(scale, 1.3)})` };
  };

  return { scrollY, getParallaxStyle, getParallaxOpacity, getParallaxScale };
};
