import { useState, useEffect } from "react";
import { Menu, X, ShoppingBag, Instagram, Youtube, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import portraitCasual from "@/assets/portrait-casual.png";
import portraitIronman from "@/assets/portrait-ironman.jpg";

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showIronMan, setShowIronMan] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Decorative background shapes */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-muted/50 rounded-full blur-3xl animate-morph opacity-60" />
      <div className="absolute top-20 right-0 w-96 h-96 bg-muted/40 rounded-full blur-3xl animate-morph opacity-50" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-muted/30 rounded-full blur-3xl animate-morph opacity-40" style={{ animationDelay: "4s" }} />
      
      {/* Subtle line patterns */}
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0,400 Q400,300 800,450 T1600,400" fill="none" stroke="currentColor" strokeWidth="1" className="text-border" />
        <path d="M0,500 Q300,400 600,550 T1200,500" fill="none" stroke="currentColor" strokeWidth="1" className="text-border" />
        <path d="M200,0 Q350,400 200,800" fill="none" stroke="currentColor" strokeWidth="1" className="text-border" />
      </svg>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 p-4 md:p-6">
        <div className="flex items-center justify-between">
          {/* Logo / Name */}
          <div className={`transition-all duration-700 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}>
            <h2 className="font-display text-2xl md:text-3xl tracking-wider">
              <span className="font-normal">STARK</span>
              <span className="font-bold"> INDUSTRIES</span>
            </h2>
          </div>

          {/* Center Logo */}
          <div className={`absolute left-1/2 -translate-x-1/2 transition-all duration-700 delay-100 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}>
            <div className="text-3xl md:text-4xl font-display font-bold">
              L7
            </div>
          </div>

          {/* Right side buttons */}
          <div className={`flex items-center gap-3 transition-all duration-700 delay-200 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}>
            <Button variant="lime" size="default" className="gap-2">
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">STORE</span>
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-background/98 backdrop-blur-sm animate-fade-up">
          <nav className="flex flex-col items-center justify-center h-full gap-8">
            {["HOME", "ABOUT", "PORTFOLIO", "CONTACT"].map((item, i) => (
              <a 
                key={item}
                href="#"
                className="font-display text-4xl md:text-6xl tracking-wider hover:text-lime transition-colors"
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
        {/* Name above portrait */}
        <div className={`text-center mb-6 transition-all duration-1000 delay-300 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-wider">
            <span className="font-normal">TONY</span>
            <span className="font-bold"> STARK</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-base tracking-[0.3em] uppercase mt-2">
            GENIUS • BILLIONAIRE • PHILANTHROPIST
          </p>
        </div>

        {/* Portrait with overlay effect */}
        <div 
          className={`relative w-full max-w-md md:max-w-lg lg:max-w-xl cursor-pointer transition-all duration-1000 delay-500 ${isLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
          onMouseEnter={() => setShowIronMan(true)}
          onMouseLeave={() => setShowIronMan(false)}
          onClick={() => setShowIronMan(!showIronMan)}
        >
          {/* Helmet wireframe overlay */}
          <div className="absolute inset-0 helmet-overlay opacity-30 z-10 pointer-events-none" />
          
          {/* Casual portrait */}
          <img 
            src={portraitCasual} 
            alt="Portrait" 
            className={`w-full h-auto transition-opacity duration-500 ${showIronMan ? "opacity-0" : "opacity-100"}`}
          />
          
          {/* Iron Man portrait overlay */}
          <img 
            src={portraitIronman} 
            alt="Iron Man" 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${showIronMan ? "opacity-100" : "opacity-0"}`}
          />

          {/* Tap to transform indicator */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-lime text-foreground px-3 py-2 rounded-lg text-sm font-medium">
            <span className="hidden sm:inline">TAP TO TRANSFORM</span>
            <span className="sm:hidden">TAP</span>
            <div className="w-5 h-5 border-2 border-foreground rounded flex items-center justify-center">
              <div className="w-2 h-2 bg-foreground rounded-sm" />
            </div>
          </div>
        </div>

        {/* Stats / Info cards */}
        <div className={`flex flex-wrap justify-center gap-4 mt-8 transition-all duration-1000 delay-700 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="border border-border rounded-lg p-4 bg-card/50 backdrop-blur-sm text-center min-w-[140px]">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Iron Man Suits</p>
            <p className="font-display text-3xl mt-1">85+</p>
          </div>
          <div className="border border-border rounded-lg p-4 bg-card/50 backdrop-blur-sm text-center min-w-[140px]">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Avenger Since</p>
            <p className="font-display text-3xl mt-1">2008</p>
          </div>
          <div className="border border-border rounded-lg p-4 bg-card/50 backdrop-blur-sm text-center min-w-[140px]">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Arc Reactors</p>
            <p className="font-display text-3xl mt-1">∞</p>
          </div>
        </div>
      </main>

      {/* Footer / Social links */}
      <footer className={`fixed bottom-0 left-0 right-0 p-4 md:p-6 z-30 transition-all duration-1000 delay-1000 ${isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
              <Youtube className="w-5 h-5" />
            </a>
          </div>
          
          <p className="text-xs text-muted-foreground uppercase tracking-wider">
            © 2024 All Rights Reserved
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
