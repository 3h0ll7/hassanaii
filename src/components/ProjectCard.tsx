import { ExternalLink } from "lucide-react";

interface ProjectCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  ctaLabel: string;
  ctaIcon?: React.ReactNode;
  href: string;
  iconBg?: string;
  cardBg?: string;
  cardText?: string;
}

const ProjectCard = ({ icon, title, subtitle, description, tags, ctaLabel, ctaIcon, href, iconBg = "hsl(210, 52%, 91%)", cardBg, cardText }: ProjectCardProps) => {
  const hasCustomBg = !!cardBg;
  return (
    <div
      className={`rounded-2xl border p-5 md:p-8 max-w-md w-full shadow-sm hover:shadow-md transition-shadow duration-300 ${hasCustomBg ? 'border-white/15' : 'border-border bg-card/80 backdrop-blur-sm'}`}
      style={hasCustomBg ? { backgroundColor: cardBg } : undefined}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: hasCustomBg ? 'rgba(255,255,255,0.2)' : iconBg }}>
            {icon}
          </div>
          <div>
            <h3 className={`font-display text-lg font-bold tracking-wide uppercase ${hasCustomBg ? 'text-white' : 'text-foreground'}`}>
              {title}
            </h3>
            <p className={`text-xs tracking-[0.15em] uppercase ${hasCustomBg ? 'text-white/70' : 'text-muted-foreground'}`}>
              {subtitle}
            </p>
          </div>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={`transition-colors mt-1 ${hasCustomBg ? 'text-white/70 hover:text-white' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <ExternalLink size={20} />
        </a>
      </div>

      {/* Description */}
      <p className={`text-base leading-relaxed mb-6 font-display ${hasCustomBg ? 'text-white/85' : 'text-muted-foreground'}`}>
        {description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tags.map((tag) => (
          <span
            key={tag}
            className={`px-4 py-2 rounded-full text-sm font-display ${hasCustomBg ? 'bg-white/15 text-white' : 'bg-secondary text-secondary-foreground'}`}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* CTA */}
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 font-display text-base font-semibold hover:opacity-70 transition-opacity ${hasCustomBg ? 'text-white' : 'text-foreground'}`}
      >
        {ctaIcon && <span className="text-lg">{ctaIcon}</span>}
        {ctaLabel}
      </a>
    </div>
  );
};

export default ProjectCard;
