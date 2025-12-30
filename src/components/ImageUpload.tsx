import { useCallback, useState } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploadProps {
  onImageSelect: (imageData: string) => void;
  currentImage: string | null;
  onClear: () => void;
}

export function ImageUpload({ onImageSelect, currentImage, onClear }: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageSelect(result);
    };
    reader.readAsDataURL(file);
  }, [onImageSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  if (currentImage) {
    return (
      <div className="relative group animate-scale-in">
        <div className="relative aspect-[3/4] w-full max-w-sm mx-auto rounded-xl overflow-hidden border-2 border-primary/30 glow-primary">
          <img 
            src={currentImage} 
            alt="Uploaded reference" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        <button
          onClick={onClear}
          className="absolute top-3 right-3 p-2 rounded-full bg-destructive/90 text-destructive-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-destructive hover:scale-110"
        >
          <X className="w-4 h-4" />
        </button>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Reference photo uploaded
        </p>
      </div>
    );
  }

  return (
    <label
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={cn(
        "relative flex flex-col items-center justify-center w-full max-w-sm mx-auto aspect-[3/4] rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300",
        isDragging 
          ? "border-primary bg-primary/10 scale-105" 
          : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/30"
      )}
    >
      <input
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
      <div className={cn(
        "flex flex-col items-center gap-4 transition-transform duration-300",
        isDragging ? "scale-110" : ""
      )}>
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
          <div className="relative p-4 rounded-full bg-muted border border-border">
            {isDragging ? (
              <ImageIcon className="w-8 h-8 text-primary" />
            ) : (
              <Upload className="w-8 h-8 text-muted-foreground" />
            )}
          </div>
        </div>
        <div className="text-center px-4">
          <p className="font-medium text-foreground">
            {isDragging ? "Drop your image here" : "Upload reference photo"}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Drag & drop or click to browse
          </p>
        </div>
      </div>
    </label>
  );
}
