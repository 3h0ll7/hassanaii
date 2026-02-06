import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Design works imports
import portraitWoman from "@/assets/design-works/portrait-woman.png";
import googleNanoPoster from "@/assets/design-works/google-nano-poster.png";
import retroIllustration from "@/assets/design-works/retro-illustration.jpg";
import adeleCollage from "@/assets/design-works/adele-collage.webp";
import lotusFlower from "@/assets/design-works/lotus-flower.png";
import redPhone from "@/assets/design-works/red-phone.png";
import cyberWings from "@/assets/design-works/cyber-wings.png";
import silverNecklace from "@/assets/design-works/silver-necklace.jpeg";
import kibbehFood from "@/assets/design-works/kibbeh-food.png";
import cyborgFace from "@/assets/design-works/cyborg-face.png";

interface DesignGalleryProps {
  showIronMan: boolean;
}

const designWorks = [
  { id: 1, image: cyborgFace, title: "Cyborg Portrait", category: "AI Art" },
  { id: 2, image: cyberWings, title: "Cyber Wings", category: "Digital Art" },
  { id: 3, image: portraitWoman, title: "Elegant Portrait", category: "Photography" },
  { id: 4, image: googleNanoPoster, title: "Google Nano Pro", category: "Poster Design" },
  { id: 5, image: adeleCollage, title: "Adele Collage", category: "Collage Art" },
  { id: 6, image: lotusFlower, title: "Lotus Bloom", category: "Fine Art" },
  { id: 7, image: redPhone, title: "Vintage Phone", category: "Product Photography" },
  { id: 8, image: silverNecklace, title: "Silver Jewelry", category: "Product Photography" },
  { id: 9, image: kibbehFood, title: "Kibbeh Deconstructed", category: "Food Art" },
  { id: 10, image: retroIllustration, title: "Retro Illustration", category: "Illustration" },
];

const DesignGallery = ({ showIronMan }: DesignGalleryProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
      
      // Calculate active index based on scroll position
      const itemWidth = 420;
      const newIndex = Math.round(scrollLeft / itemWidth);
      setActiveIndex(newIndex);
    }
  };

  useEffect(() => {
    checkScroll();
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScroll);
      return () => scrollContainer.removeEventListener("scroll", checkScroll);
    }
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 420;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="w-full py-16 md:py-24 overflow-hidden">

      {/* Gallery Container */}
      <div className="relative">
        {/* Navigation Arrows */}
        <button
          onClick={() => scroll("left")}
          className={`absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full backdrop-blur-md transition-all duration-300 ${
            canScrollLeft 
              ? showIronMan 
                ? "bg-white/10 hover:bg-white/20 text-white opacity-100" 
                : "bg-black/10 hover:bg-black/20 text-foreground opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <button
          onClick={() => scroll("right")}
          className={`absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full backdrop-blur-md transition-all duration-300 ${
            canScrollRight 
              ? showIronMan 
                ? "bg-white/10 hover:bg-white/20 text-white opacity-100" 
                : "bg-black/10 hover:bg-black/20 text-foreground opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Scrollable Gallery */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide px-4 md:px-8 pb-4 snap-x snap-mandatory"
          style={{ 
            scrollbarWidth: "none", 
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch"
          }}
        >
          {/* Left spacer for first item centering */}
          <div className="flex-shrink-0 w-[calc(50vw-200px)] md:w-[calc(50vw-220px)]" />

          {designWorks.map((work, index) => (
            <div
              key={work.id}
              className={`group relative flex-shrink-0 w-[320px] md:w-[400px] aspect-[3/4] rounded-2xl overflow-hidden snap-center transition-all duration-500 ${
                index === activeIndex ? "scale-100" : "scale-95 opacity-80"
              }`}
              style={{
                perspective: "1000px",
                transform: index === activeIndex ? "rotateY(0deg)" : index < activeIndex ? "rotateY(5deg)" : "rotateY(-5deg)"
              }}
            >
              {/* Holographic border effect */}
              <div className={`absolute -inset-[2px] rounded-2xl z-0 transition-opacity duration-500 ${showIronMan ? "holographic-border" : "holographic-border"}`} />
              
              {/* Glass card background */}
              <div className={`absolute inset-0 rounded-2xl z-0 ${showIronMan ? "glass-card-dark" : "glass-card"}`} />
              
              {/* Image */}
              <img
                src={work.image}
                alt={work.title}
                className="absolute inset-0 w-full h-full object-cover rounded-2xl transition-transform duration-700 group-hover:scale-110"
              />

              {/* Gradient overlay */}
              <div className={`absolute inset-0 rounded-2xl transition-opacity duration-500 ${
                showIronMan 
                  ? "bg-gradient-to-t from-black/90 via-black/20 to-transparent" 
                  : "bg-gradient-to-t from-black/70 via-transparent to-transparent"
              }`} />

              {/* Holographic shimmer on hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 holographic" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium mb-3 backdrop-blur-sm ${
                  showIronMan 
                    ? "bg-amber-500/30 text-amber-200 border border-amber-500/30" 
                    : "bg-white/20 text-white border border-white/30"
                }`}>
                  {work.category}
                </span>
                <h3 className="font-display text-xl md:text-2xl text-white tracking-wide">
                  {work.title}
                </h3>
              </div>

              {/* Number indicator */}
              <div className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold backdrop-blur-sm ${
                showIronMan 
                  ? "bg-white/10 text-white border border-white/20" 
                  : "bg-black/20 text-white border border-white/20"
              }`}>
                {String(index + 1).padStart(2, '0')}
              </div>
            </div>
          ))}

          {/* Right spacer for last item centering */}
          <div className="flex-shrink-0 w-[calc(50vw-200px)] md:w-[calc(50vw-220px)]" />
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-8">
          {designWorks.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (scrollRef.current) {
                  const itemWidth = 420;
                  scrollRef.current.scrollTo({
                    left: itemWidth * index,
                    behavior: "smooth"
                  });
                }
              }}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === activeIndex 
                  ? showIronMan 
                    ? "w-8 bg-amber-400" 
                    : "w-8 bg-lime"
                  : showIronMan 
                    ? "bg-white/30 hover:bg-white/50" 
                    : "bg-foreground/30 hover:bg-foreground/50"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DesignGallery;
