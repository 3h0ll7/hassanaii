import { useRef, useEffect, useState } from "react";
import { useSpotlightCursor } from "@/hooks/useSpotlightCursor";
import portraitNatural from "@/assets/portrait-natural.png";
import portraitCyborg from "@/assets/portrait-cyborg.png";

// SVG Icons as components for solid, filled versions
const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
);

const XTwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

interface SpotlightHeroProps {
  name?: { first: string; last: string };
  instagramUrl?: string;
  twitterUrl?: string;
}

export default function SpotlightHero({
  name = { first: "HASSAN", last: "SALMAN" },
  instagramUrl = "https://instagram.com/3h0ll",
  twitterUrl = "https://x.com/3h0ll"
}: SpotlightHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLAnchorElement>(null);
  const socialRef = useRef<HTMLDivElement>(null);
  
  const { smoothPosition, trails, isOverElement } = useSpotlightCursor(0.08);
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });
  const [isNameInverted, setIsNameInverted] = useState(false);
  const [isNavInverted, setIsNavInverted] = useState(false);
  const [isSocialInverted, setIsSocialInverted] = useState(false);

  // Parallax effect
  useEffect(() => {
    if (typeof window === "undefined") return;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const offsetX = (smoothPosition.x - centerX) / centerX * -15;
    const offsetY = (smoothPosition.y - centerY) / centerY * -15;
    setParallaxOffset({ x: offsetX, y: offsetY });
  }, [smoothPosition]);

  // Check text inversion
  useEffect(() => {
    setIsNameInverted(isOverElement(nameRef));
    setIsNavInverted(isOverElement(navRef));
    setIsSocialInverted(isOverElement(socialRef));
  }, [smoothPosition, isOverElement]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-white cursor-none"
    >
      {/* Animated Grid Background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
          transform: `translate(${parallaxOffset.x * 0.3}px, ${parallaxOffset.y * 0.3}px)`,
          transition: 'transform 0.3s ease-out'
        }}
      />

      {/* Base Portrait Layer (Natural) */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `translate(${parallaxOffset.x}px, ${parallaxOffset.y}px)`,
          transition: 'transform 0.3s ease-out'
        }}
      >
        <img
          src={portraitNatural}
          alt="Portrait"
          className="w-auto h-full max-h-screen object-cover"
          style={{ maxWidth: 'none' }}
        />
      </div>

      {/* Cyborg Layer (Revealed by spotlight) */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{
          clipPath: `circle(120px at ${smoothPosition.x}px ${smoothPosition.y}px)`,
          transform: `translate(${parallaxOffset.x}px, ${parallaxOffset.y}px)`,
          transition: 'clip-path 0.05s ease-out, transform 0.3s ease-out'
        }}
      >
        <img
          src={portraitCyborg}
          alt="Portrait Alternate"
          className="w-auto h-full max-h-screen object-cover"
          style={{ maxWidth: 'none' }}
        />
      </div>

      {/* Trail echoes */}
      {trails.map((trail) => (
        <div
          key={trail.id}
          className="absolute pointer-events-none rounded-full"
          style={{
            left: trail.x - 80,
            top: trail.y - 80,
            width: 160,
            height: 160,
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            opacity: trail.opacity,
            transition: 'opacity 0.1s ease-out'
          }}
        />
      ))}

      {/* Spotlight cursor */}
      <div
        className="fixed pointer-events-none rounded-full border-2 border-white/30 mix-blend-difference"
        style={{
          left: smoothPosition.x - 120,
          top: smoothPosition.y - 120,
          width: 240,
          height: 240,
          boxShadow: '0 0 60px rgba(255,255,255,0.1), inset 0 0 60px rgba(255,255,255,0.05)',
          transition: 'left 0.05s ease-out, top 0.05s ease-out'
        }}
      />

      {/* Name - Top Left */}
      <div 
        ref={nameRef}
        className="absolute top-8 left-8 md:top-12 md:left-12 z-20"
        style={{
          transform: `translate(${parallaxOffset.x * -0.5}px, ${parallaxOffset.y * -0.5}px)`,
          transition: 'transform 0.3s ease-out, color 0.3s ease-out'
        }}
      >
        <h1 
          className="font-serif leading-[0.85] tracking-tight"
          style={{ 
            fontFamily: "'Playfair Display', serif",
            color: isNameInverted ? '#ffffff' : '#0a0a0a',
            transition: 'color 0.3s ease-out'
          }}
        >
          <span className="block text-4xl md:text-6xl lg:text-7xl font-medium">
            {name.first}
          </span>
          <span className="block text-4xl md:text-6xl lg:text-7xl font-medium">
            {name.last}
          </span>
        </h1>
      </div>

      {/* F1 Records - Top Right */}
      <a
        ref={navRef}
        href="#f1-records"
        className="absolute top-8 right-8 md:top-12 md:right-12 z-20 font-serif text-lg md:text-xl tracking-wide hover:opacity-70 transition-opacity"
        style={{ 
          fontFamily: "'Playfair Display', serif",
          color: isNavInverted ? '#ffffff' : '#0a0a0a',
          transform: `translate(${parallaxOffset.x * -0.5}px, ${parallaxOffset.y * -0.5}px)`,
          transition: 'transform 0.3s ease-out, color 0.3s ease-out'
        }}
      >
        F1 Records
      </a>

      {/* Social Links - Bottom Right */}
      <div 
        ref={socialRef}
        className="absolute bottom-8 right-8 md:bottom-12 md:right-12 z-20 flex gap-5"
        style={{
          transform: `translate(${parallaxOffset.x * -0.5}px, ${parallaxOffset.y * -0.5}px)`,
          transition: 'transform 0.3s ease-out'
        }}
      >
        <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-70 transition-opacity"
          style={{ 
            color: isSocialInverted ? '#ffffff' : '#0a0a0a',
            transition: 'color 0.3s ease-out'
          }}
        >
          <InstagramIcon className="w-6 h-6 md:w-7 md:h-7" />
        </a>
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:opacity-70 transition-opacity"
          style={{ 
            color: isSocialInverted ? '#ffffff' : '#0a0a0a',
            transition: 'color 0.3s ease-out'
          }}
        >
          <XTwitterIcon className="w-6 h-6 md:w-7 md:h-7" />
        </a>
      </div>
    </div>
  );
}
