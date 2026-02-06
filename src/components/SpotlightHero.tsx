import { useState, useEffect, useRef, useCallback } from "react";
import { Instagram } from "lucide-react";
import portraitCasual from "@/assets/portrait-casual.png";
import portraitIronman from "@/assets/portrait-ironman.jpg";

interface MousePosition {
  x: number;
  y: number;
}

interface Echo {
  id: number;
  x: number;
  y: number;
  opacity: number;
}

const SpotlightHero = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState<MousePosition>({ x: 0.5, y: 0.5 });
  const [smoothPos, setSmoothPos] = useState<MousePosition>({ x: 0.5, y: 0.5 });
  const [velocity, setVelocity] = useState(0);
  const [echoes, setEchoes] = useState<Echo[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const lastPosRef = useRef<MousePosition>({ x: 0.5, y: 0.5 });
  const echoIdRef = useRef(0);
  const animationRef = useRef<number>();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Smooth cursor following with delay
  useEffect(() => {
    const animate = () => {
      setSmoothPos(prev => {
        const dx = mousePos.x - prev.x;
        const dy = mousePos.y - prev.y;
        const easing = 0.08; // Lower = more delay
        return {
          x: prev.x + dx * easing,
          y: prev.y + dy * easing
        };
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [mousePos]);

  // Calculate velocity for echo effect
  useEffect(() => {
    const dx = smoothPos.x - lastPosRef.current.x;
    const dy = smoothPos.y - lastPosRef.current.y;
    const speed = Math.sqrt(dx * dx + dy * dy) * 100;
    setVelocity(speed);

    // Create echo if moving fast enough
    if (speed > 0.3 && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const newEcho: Echo = {
        id: echoIdRef.current++,
        x: smoothPos.x * rect.width,
        y: smoothPos.y * rect.height,
        opacity: Math.min(speed * 0.5, 0.6)
      };
      setEchoes(prev => [...prev.slice(-8), newEcho]);
    }

    lastPosRef.current = { ...smoothPos };
  }, [smoothPos]);

  // Fade out echoes
  useEffect(() => {
    if (echoes.length === 0) return;
    const timeout = setTimeout(() => {
      setEchoes(prev => 
        prev.map(e => ({ ...e, opacity: e.opacity * 0.85 }))
            .filter(e => e.opacity > 0.02)
      );
    }, 50);
    return () => clearTimeout(timeout);
  }, [echoes]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePos({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) });
  }, []);

  // Parallax offsets (opposite to cursor movement)
  const parallaxX = (0.5 - smoothPos.x) * 20;
  const parallaxY = (0.5 - smoothPos.y) * 20;

  // Calculate if elements are inside spotlight for text inversion
  const spotlightRadius = 120;
  const spotlightCenterX = containerRef.current ? smoothPos.x * containerRef.current.offsetWidth : 0;
  const spotlightCenterY = containerRef.current ? smoothPos.y * containerRef.current.offsetHeight : 0;

  const isInSpotlight = (elementX: number, elementY: number, padding = 50) => {
    const dx = elementX - spotlightCenterX;
    const dy = elementY - spotlightCenterY;
    return Math.sqrt(dx * dx + dy * dy) < spotlightRadius + padding;
  };

  // Element positions (approximate)
  const nameInSpotlight = isInSpotlight(100, 100, 100);
  const navInSpotlight = isInSpotlight(containerRef.current?.offsetWidth || 0 - 100, 50, 80);
  const socialInSpotlight = isInSpotlight(
    (containerRef.current?.offsetWidth || 0) - 50,
    (containerRef.current?.offsetHeight || 0) - 50,
    80
  );

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-screen overflow-hidden bg-white cursor-none"
    >
      {/* Animated Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none transition-transform duration-300"
        style={{
          transform: `translate(${parallaxX * 0.5}px, ${parallaxY * 0.5}px)`,
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Base Image (visible everywhere) */}
      <div className="absolute inset-0">
        <img
          src={portraitCasual}
          alt="Hassan"
          className="w-full h-full object-cover object-center"
          style={{
            transform: `translate(${parallaxX * 0.3}px, ${parallaxY * 0.3}px) scale(1.05)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
      </div>

      {/* Revealed Image (only visible through spotlight) */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          clipPath: `circle(${spotlightRadius}px at ${smoothPos.x * 100}% ${smoothPos.y * 100}%)`,
          transition: 'clip-path 0.05s ease-out'
        }}
      >
        <img
          src={portraitIronman}
          alt="Hassan Alternate"
          className="w-full h-full object-cover object-center"
          style={{
            transform: `translate(${parallaxX * 0.3}px, ${parallaxY * 0.3}px) scale(1.05)`,
            transition: 'transform 0.3s ease-out'
          }}
        />
        {/* Spotlight inner glow */}
        <div 
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at ${smoothPos.x * 100}% ${smoothPos.y * 100}%, transparent 0%, transparent 70%, rgba(255,255,255,0.1) 100%)`
          }}
        />
      </div>

      {/* Echo trails */}
      {echoes.map(echo => (
        <div
          key={echo.id}
          className="absolute pointer-events-none rounded-full border-2 border-white/30"
          style={{
            left: echo.x - spotlightRadius,
            top: echo.y - spotlightRadius,
            width: spotlightRadius * 2,
            height: spotlightRadius * 2,
            opacity: echo.opacity,
            transform: 'scale(0.8)',
            transition: 'opacity 0.1s ease-out'
          }}
        />
      ))}

      {/* Spotlight cursor */}
      <div
        className="absolute pointer-events-none rounded-full border-2 border-white/50 mix-blend-difference"
        style={{
          left: `calc(${smoothPos.x * 100}% - ${spotlightRadius}px)`,
          top: `calc(${smoothPos.y * 100}% - ${spotlightRadius}px)`,
          width: spotlightRadius * 2,
          height: spotlightRadius * 2,
          boxShadow: '0 0 60px rgba(255,255,255,0.3), inset 0 0 60px rgba(255,255,255,0.1)'
        }}
      />

      {/* Name - Top Left */}
      <div 
        className={`absolute top-8 left-8 md:top-12 md:left-12 z-20 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
        style={{
          transform: `translate(${parallaxX * -0.8}px, ${parallaxY * -0.8}px)`
        }}
      >
        <h1 
          className={`font-serif text-4xl md:text-6xl lg:text-7xl leading-none tracking-tight transition-colors duration-300 ${nameInSpotlight ? 'text-white' : 'text-foreground'}`}
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          <span className="block">𝓗𝓪𝓼𝓼𝓪𝓷</span>
          <span className="block text-3xl md:text-5xl lg:text-6xl mt-1 font-light italic">𝓼𝓪𝓵𝓶𝓪𝓷</span>
        </h1>
      </div>

      {/* Navigation - Top Right */}
      <div 
        className={`absolute top-8 right-8 md:top-12 md:right-12 z-20 transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
        style={{
          transform: `translate(${parallaxX * -0.8}px, ${parallaxY * -0.8}px)`
        }}
      >
        <a 
          href="#records"
          className={`font-serif text-sm md:text-base tracking-widest uppercase transition-colors duration-300 hover:opacity-70 ${navInSpotlight ? 'text-white' : 'text-foreground'}`}
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          F1 Records
        </a>
      </div>

      {/* Social Icons - Bottom Right */}
      <div 
        className={`absolute bottom-8 right-8 md:bottom-12 md:right-12 z-20 flex flex-col gap-4 transition-all duration-1000 delay-400 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{
          transform: `translate(${parallaxX * -0.6}px, ${parallaxY * -0.6}px)`
        }}
      >
        <a 
          href="https://instagram.com/3h0ll" 
          target="_blank" 
          rel="noopener noreferrer"
          className={`transition-colors duration-300 hover:opacity-70 ${socialInSpotlight ? 'text-white' : 'text-foreground'}`}
        >
          <Instagram className="w-6 h-6" fill="currentColor" />
        </a>
        <a 
          href="https://twitter.com/3h0ll7" 
          target="_blank" 
          rel="noopener noreferrer"
          className={`transition-colors duration-300 hover:opacity-70 ${socialInSpotlight ? 'text-white' : 'text-foreground'}`}
        >
          <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>
      </div>

      {/* Subtle vignette overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/20 via-transparent to-white/30" />
    </div>
  );
};

export default SpotlightHero;
