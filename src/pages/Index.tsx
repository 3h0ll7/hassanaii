import { useState } from "react";
import { Sparkles, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/ImageUpload";
import { PortraitResult } from "@/components/PortraitResult";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [casualImage, setCasualImage] = useState<string | null>(null);
  const [ironManImage, setIronManImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!uploadedImage) {
      toast.error("Please upload a reference photo first");
      return;
    }

    setIsGenerating(true);
    setCasualImage(null);
    setIronManImage(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-portraits", {
        body: { imageBase64: uploadedImage },
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setCasualImage(data.casualImage);
      setIronManImage(data.ironManImage);
      toast.success("Portraits generated successfully!");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate portraits");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setUploadedImage(null);
    setCasualImage(null);
    setIronManImage(null);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background effects */}
      <div className="absolute inset-0 bg-glow opacity-50" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
        {/* Header */}
        <header className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border mb-6 animate-fade-in">
            <Zap className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-muted-foreground">AI-Powered Portrait Transformation</span>
          </div>
          
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <span className="text-foreground">Become</span>
            <br />
            <span className="text-gradient">Iron Man</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: "0.2s" }}>
            Upload your photo and watch AI transform you into the iconic armored Avenger
          </p>
        </header>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-12 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          {[
            { icon: Shield, label: "Identity Preserved", desc: "Your face stays the same" },
            { icon: Sparkles, label: "Studio Quality", desc: "Professional lighting" },
            { icon: Zap, label: "Instant Results", desc: "AI-powered generation" },
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
              <feature.icon className="w-5 h-5 text-primary shrink-0" />
              <div>
                <p className="font-medium text-sm text-foreground">{feature.label}</p>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="space-y-8">
          {/* Upload section */}
          <section className="animate-slide-up" style={{ animationDelay: "0.4s" }}>
            <ImageUpload 
              onImageSelect={setUploadedImage}
              currentImage={uploadedImage}
              onClear={handleClear}
            />
          </section>

          {/* Generate button */}
          {uploadedImage && !casualImage && !ironManImage && (
            <div className="flex justify-center animate-scale-in">
              <Button 
                variant="hero" 
                size="xl"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="min-w-[200px]"
              >
                {isGenerating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Transform
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Results */}
          <section>
            <PortraitResult 
              casualImage={casualImage}
              ironManImage={ironManImage}
              isLoading={isGenerating}
            />
          </section>

          {/* Reset button when results are shown */}
          {(casualImage || ironManImage) && !isGenerating && (
            <div className="flex justify-center gap-4 animate-fade-in">
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleClear}
              >
                Try Another Photo
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 pt-8 border-t border-border/50">
          <p className="text-sm text-muted-foreground">
            Powered by AI • Your photos are processed securely
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
