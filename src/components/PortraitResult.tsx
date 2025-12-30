import { Download } from "lucide-react";
import { Button } from "./ui/button";

interface PortraitResultProps {
  casualImage: string | null;
  ironManImage: string | null;
  isLoading: boolean;
}

export function PortraitResult({ casualImage, ironManImage, isLoading }: PortraitResultProps) {
  const handleDownload = (imageData: string, filename: string) => {
    const link = document.createElement("a");
    link.href = imageData;
    link.download = filename;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
        {[1, 2].map((i) => (
          <div 
            key={i} 
            className="aspect-[3/4] rounded-xl bg-muted/50 border border-border overflow-hidden animate-pulse"
            style={{ animationDelay: `${i * 0.2}s` }}
          >
            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full animate-pulse" />
                <div className="relative w-16 h-16 rounded-full border-4 border-primary/30 border-t-primary animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground">
                {i === 1 ? "Generating casual portrait..." : "Generating Iron Man suit..."}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!casualImage && !ironManImage) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
      {casualImage && (
        <div className="group relative animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-border hover:border-primary/50 transition-colors duration-300 shadow-lg">
            <img 
              src={casualImage} 
              alt="Casual portrait" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
              <Button 
                variant="secondary" 
                size="sm"
                onClick={() => handleDownload(casualImage, "casual-portrait.png")}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>
          <p className="text-center text-sm font-medium text-muted-foreground mt-3">
            Casual Portrait
          </p>
        </div>
      )}
      
      {ironManImage && (
        <div className="group relative animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-primary/30 glow-primary transition-all duration-300 hover:border-primary/60 shadow-lg">
            <img 
              src={ironManImage} 
              alt="Iron Man portrait" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
              <Button 
                variant="hero" 
                size="sm"
                onClick={() => handleDownload(ironManImage, "ironman-portrait.png")}
                className="gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          </div>
          <p className="text-center text-sm font-medium mt-3">
            <span className="text-gradient">Iron Man Suit</span>
          </p>
        </div>
      )}
    </div>
  );
}
