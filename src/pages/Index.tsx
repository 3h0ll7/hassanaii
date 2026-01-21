import { useState, useEffect, useRef } from "react";
import { Menu, X, ShoppingBag, Instagram, Youtube, Twitter, Github, Facebook, Heart, Stethoscope, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useParallax } from "@/hooks/useParallax";
import portraitCasual from "@/assets/portrait-casual.png";
import portraitIronman from "@/assets/portrait-ironman.jpg";

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showIronMan, setShowIronMan] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlayingSound, setIsPlayingSound] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { scrollY, getParallaxStyle, getParallaxOpacity, getParallaxScale } = useParallax();

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const playTransformSound = async () => {
    if (isPlayingSound) return;
    
    setIsPlayingSound(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/iron-man-sfx`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Sound request failed: ${response.status}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      audioRef.current = new Audio(audioUrl);
      audioRef.current.volume = 0.7;
      await audioRef.current.play();
    } catch (error) {
      console.error("Error playing sound:", error);
    } finally {
      setIsPlayingSound(false);
    }
  };

  const handleTransform = () => {
    setShowIronMan(!showIronMan);
    if (!showIronMan) {
      playTransformSound();
    }
  };

  return (
    <div className={`min-h-[200vh] overflow-x-hidden relative transition-all duration-700 ${showIronMan ? "bg-[#0a0a0a]" : "bg-background"}`}>
      
      {/* Dynamic background effects - changes when Iron Man is shown */}
      <div className={`fixed inset-0 transition-opacity duration-700 ${showIronMan ? "opacity-100" : "opacity-0"}`}>
        {/* Red glow effects for Iron Man mode - with parallax */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-600/30 rounded-full blur-[120px] animate-pulse" style={getParallaxStyle(0.3)} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-amber-500/25 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "0.5s", ...getParallaxStyle(0.2, "down") }} />
        <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-red-500/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: "1s", ...getParallaxStyle(0.15) }} />
        
        {/* Arc reactor glow in center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]">
          <div className="absolute inset-0 bg-cyan-400/10 rounded-full blur-[100px] animate-ping" style={{ animationDuration: "2s" }} />
          <div className="absolute inset-[100px] bg-cyan-300/15 rounded-full blur-[60px] animate-pulse" />
        </div>
        
        {/* Particle lines */}
        <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="url(#redGradient)" strokeWidth="1" className="animate-pulse" />
          <line x1="20%" y1="0" x2="80%" y2="100%" stroke="url(#goldGradient)" strokeWidth="0.5" className="animate-pulse" style={{ animationDelay: "0.3s" }} />
          <line x1="80%" y1="0" x2="20%" y2="100%" stroke="url(#goldGradient)" strokeWidth="0.5" className="animate-pulse" style={{ animationDelay: "0.6s" }} />
          <defs>
            <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="transparent" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Normal mode decorative shapes - with parallax */}
      <div className={`fixed inset-0 transition-opacity duration-700 pointer-events-none ${showIronMan ? "opacity-0" : "opacity-100"}`}>
        <div className="absolute top-0 left-0 w-80 h-80 bg-muted/50 rounded-full blur-3xl animate-morph opacity-60" style={getParallaxStyle(0.4)} />
        <div className="absolute top-20 right-0 w-96 h-96 bg-muted/40 rounded-full blur-3xl animate-morph opacity-50" style={{ animationDelay: "2s", ...getParallaxStyle(0.25, "down") }} />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-muted/30 rounded-full blur-3xl animate-morph opacity-40" style={{ animationDelay: "4s", ...getParallaxStyle(0.15) }} />
        
        {/* Subtle line patterns */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,400 Q400,300 800,450 T1600,400" fill="none" stroke="currentColor" strokeWidth="1" className="text-border" />
          <path d="M0,500 Q300,400 600,550 T1200,500" fill="none" stroke="currentColor" strokeWidth="1" className="text-border" />
          <path d="M200,0 Q350,400 200,800" fill="none" stroke="currentColor" strokeWidth="1" className="text-border" />
        </svg>
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6">
        <div className="flex items-center justify-between">
          {/* Logo / Name */}
          <div className={`transition-all duration-700 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}>
            <h2 className={`font-display text-2xl md:text-3xl tracking-wider transition-colors duration-500 ${showIronMan ? "text-white" : "text-foreground"}`}>
              <span className="font-normal">𝓗𝓪𝓼𝓼𝓪𝓷</span>
            </h2>
          </div>


          {/* Right side buttons */}
          <div className={`flex items-center gap-3 transition-all duration-700 delay-200 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}>
            <Button variant={showIronMan ? "destructive" : "lime"} size="default" className={`gap-2 transition-all duration-500 ${showIronMan ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}>
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">STORE</span>
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`transition-colors duration-500 ${showIronMan ? "border-white/30 text-white hover:bg-white/10" : ""}`}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className={`fixed inset-0 z-40 backdrop-blur-sm animate-fade-up ${showIronMan ? "bg-black/98" : "bg-background/98"}`}>
          <nav className="flex flex-col items-center justify-center h-full gap-8">
            {["HOME", "ABOUT", "PORTFOLIO", "CONTACT"].map((item, i) => (
              <a 
                key={item}
                href="#"
                className={`font-display text-4xl md:text-6xl tracking-wider transition-colors ${showIronMan ? "text-white hover:text-red-500" : "hover:text-lime"}`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-24 pb-12">
        {/* Name above portrait - with parallax fade and scale */}
        <div 
          className={`text-center mb-6 transition-all duration-1000 delay-300 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          style={{ 
            ...getParallaxStyle(0.5), 
            ...getParallaxOpacity(50, 400),
          }}
        >
          <h1 
            className={`font-display text-5xl md:text-7xl lg:text-8xl tracking-wider transition-colors duration-500 ${showIronMan ? "text-white" : "text-foreground"}`}
            style={getParallaxScale(1, 0.0003)}
          >
            <span className="font-normal">𝓗𝓪𝓼𝓼𝓪𝓷</span>
          </h1>
          <p className={`text-sm md:text-base tracking-[0.3em] uppercase mt-2 transition-colors duration-500 ${showIronMan ? "text-red-400" : "text-muted-foreground"}`}>
            {showIronMan ? "I AM IRON MAN" : "AI & TECH 🧠🤖 • NURSE"}
          </p>
          <p className={`text-xs md:text-sm tracking-wide mt-3 max-w-md mx-auto transition-colors duration-500 ${showIronMan ? "text-white/70" : "text-muted-foreground"}`}>
            Practical AI tools | Design | Prompts | Tutorials | Experiments
          </p>
        </div>

        {/* Portrait with overlay effect - with parallax */}
        <div 
          className={`relative w-full max-w-md md:max-w-lg lg:max-w-xl cursor-pointer transition-all duration-1000 delay-500 ${isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"} ${showIronMan ? "scale-105" : "scale-100"}`}
          onClick={handleTransform}
          style={getParallaxStyle(0.2)}
        >
          {/* Glowing ring effect for Iron Man mode */}
          <div className={`absolute -inset-4 rounded-full transition-all duration-700 ${showIronMan ? "opacity-100" : "opacity-0"}`}>
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-amber-500 to-red-500 rounded-full blur-xl animate-pulse" />
            <div className="absolute inset-2 bg-gradient-to-r from-cyan-400 to-cyan-600 rounded-full blur-lg animate-ping opacity-30" style={{ animationDuration: "2s" }} />
          </div>
          
          {/* Helmet wireframe overlay - only in normal mode */}
          <div className={`absolute inset-0 helmet-overlay z-10 pointer-events-none transition-opacity duration-500 ${showIronMan ? "opacity-0" : "opacity-30"}`} />
          
          {/* Casual portrait */}
          <img 
            src={portraitCasual} 
            alt="Hassan Salman" 
            className={`relative w-full h-auto transition-all duration-700 ${showIronMan ? "opacity-0 scale-95 blur-sm" : "opacity-100 scale-100 blur-0"}`}
          />
          
          {/* Iron Man portrait overlay */}
          <img 
            src={portraitIronman} 
            alt="Iron Man" 
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ${showIronMan ? "opacity-100 scale-100 blur-0" : "opacity-0 scale-110 blur-sm"}`}
          />

          {/* Tap to transform indicator */}
          <div className={`absolute bottom-4 right-4 flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-500 ${showIronMan ? "bg-red-600 text-white" : "bg-lime text-foreground"}`}>
            <span className="hidden sm:inline">{showIronMan ? "TAP TO REVERT" : "TAP TO TRANSFORM"}</span>
            <span className="sm:hidden">TAP</span>
            <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-colors duration-500 ${showIronMan ? "border-white" : "border-foreground"}`}>
              <div className={`w-2 h-2 rounded-sm transition-colors duration-500 ${showIronMan ? "bg-white" : "bg-foreground"}`} />
            </div>
          </div>
        </div>

        {/* Featured Project - Digital Nurse - with parallax */}
        <div 
          className={`mt-12 w-full max-w-2xl transition-all duration-1000 delay-700 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          style={getParallaxStyle(-0.1, "down")}
        >
          <a 
            href="https://digital-nurse-buddy.lovable.app/home" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`group relative block overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] ${showIronMan ? "border-cyan-500/40 bg-gradient-to-br from-cyan-950/40 to-red-950/30" : "border-border bg-gradient-to-br from-card/80 to-muted/50"}`}
          >
            {/* Glow effect */}
            <div className={`absolute -inset-1 rounded-2xl blur-xl transition-opacity duration-500 group-hover:opacity-100 ${showIronMan ? "bg-cyan-500/20 opacity-50" : "bg-lime/20 opacity-0"}`} />
            
            <div className="relative p-6 md:p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-xl transition-colors duration-500 ${showIronMan ? "bg-cyan-500/20" : "bg-lime/20"}`}>
                    <Stethoscope className={`w-6 h-6 transition-colors duration-500 ${showIronMan ? "text-cyan-400" : "text-lime-foreground"}`} />
                  </div>
                  <div>
                    <h3 className={`font-display text-xl md:text-2xl tracking-wide transition-colors duration-500 ${showIronMan ? "text-white" : "text-foreground"}`}>
                      Digital Nurse
                    </h3>
                    <p className={`text-xs uppercase tracking-wider transition-colors duration-500 ${showIronMan ? "text-cyan-400" : "text-muted-foreground"}`}>
                      Clinical Reference App
                    </p>
                  </div>
                </div>
                <ExternalLink className={`w-5 h-5 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 ${showIronMan ? "text-white/50 group-hover:text-cyan-400" : "text-muted-foreground group-hover:text-foreground"}`} />
              </div>

              {/* Description */}
              <p className={`text-sm md:text-base leading-relaxed mb-6 transition-colors duration-500 ${showIronMan ? "text-white/70" : "text-muted-foreground"}`}>
                Evidence-based nursing procedures, clinical calculators, and professional healthcare resources. Built for healthcare professionals.
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {["Clinical Procedures", "Medical Calculators", "Drug References", "AI Assistant"].map((feature) => (
                  <span 
                    key={feature}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-500 ${showIronMan ? "bg-white/10 text-white/80" : "bg-muted text-muted-foreground"}`}
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* CTA */}
              <div className={`mt-6 flex items-center gap-2 text-sm font-medium transition-colors duration-500 ${showIronMan ? "text-cyan-400" : "text-lime-foreground"}`}>
                <Heart className="w-4 h-4" />
                <span>Explore the App</span>
              </div>
            </div>
          </a>
        </div>

        {/* Stats / Info cards */}
        <div className={`flex flex-wrap justify-center gap-4 mt-8 transition-all duration-1000 delay-900 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <a 
            href="https://kidinnu.netlify.app/" 
            target="_blank" 
            rel="noopener noreferrer"
            className={`border rounded-lg p-4 backdrop-blur-sm text-center min-w-[140px] transition-all duration-500 hover:scale-105 ${showIronMan ? "border-red-500/30 bg-red-950/30 hover:border-red-500/60" : "border-border bg-card/50 hover:border-lime/50"}`}
          >
            <p className={`text-xs uppercase tracking-wider transition-colors duration-500 ${showIronMan ? "text-red-400" : "text-muted-foreground"}`}>Kidinnu AI</p>
            <p className={`font-display text-3xl mt-1 transition-colors duration-500 ${showIronMan ? "text-white" : "text-foreground"}`}>🧠</p>
          </a>
          <div className={`border rounded-lg p-4 backdrop-blur-sm text-center min-w-[140px] transition-all duration-500 ${showIronMan ? "border-amber-500/30 bg-amber-950/30" : "border-border bg-card/50"}`}>
            <p className={`text-xs uppercase tracking-wider transition-colors duration-500 ${showIronMan ? "text-amber-400" : "text-muted-foreground"}`}>Tutorials</p>
            <p className={`font-display text-3xl mt-1 transition-colors duration-500 ${showIronMan ? "text-white" : "text-foreground"}`}>📚</p>
          </div>
          <div className={`border rounded-lg p-4 backdrop-blur-sm text-center min-w-[140px] transition-all duration-500 ${showIronMan ? "border-cyan-500/30 bg-cyan-950/30" : "border-border bg-card/50"}`}>
            <p className={`text-xs uppercase tracking-wider transition-colors duration-500 ${showIronMan ? "text-cyan-400" : "text-muted-foreground"}`}>Nurse</p>
            <p className={`font-display text-3xl mt-1 transition-colors duration-500 ${showIronMan ? "text-white" : "text-foreground"}`}>💉</p>
          </div>
        </div>
      </main>

      {/* Footer / Social links */}
      <footer className={`fixed bottom-0 left-0 right-0 p-4 md:p-6 z-30 transition-all duration-1000 delay-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="https://instagram.com/3h0ll" target="_blank" rel="noopener noreferrer" className={`transition-colors duration-500 ${showIronMan ? "text-white/60 hover:text-red-500" : "text-muted-foreground hover:text-foreground"}`}>
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://twitter.com/3h0ll7" target="_blank" rel="noopener noreferrer" className={`transition-colors duration-500 ${showIronMan ? "text-white/60 hover:text-red-500" : "text-muted-foreground hover:text-foreground"}`}>
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://youtube.com/@stai9" target="_blank" rel="noopener noreferrer" className={`transition-colors duration-500 ${showIronMan ? "text-white/60 hover:text-red-500" : "text-muted-foreground hover:text-foreground"}`}>
              <Youtube className="w-5 h-5" />
            </a>
            <a href="https://github.com/3h0ll7" target="_blank" rel="noopener noreferrer" className={`transition-colors duration-500 ${showIronMan ? "text-white/60 hover:text-red-500" : "text-muted-foreground hover:text-foreground"}`}>
              <Github className="w-5 h-5" />
            </a>
            <a href="https://www.facebook.com/share/1SXTmx3Zcj/" target="_blank" rel="noopener noreferrer" className={`transition-colors duration-500 ${showIronMan ? "text-white/60 hover:text-red-500" : "text-muted-foreground hover:text-foreground"}`}>
              <Facebook className="w-5 h-5" />
            </a>
          </div>
          
          <p className={`text-xs uppercase tracking-wider transition-colors duration-500 ${showIronMan ? "text-white/40" : "text-muted-foreground"}`}>
            © 2025 Hassan Salman
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
