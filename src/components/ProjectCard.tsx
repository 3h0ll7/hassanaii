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
}

const ProjectCard = ({ icon, title, subtitle, description, tags, ctaLabel, ctaIcon, href }: ProjectCardProps) => {
  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-8 max-w-md w-full shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[hsl(75,60%,85%)] flex items-center justify-center text-2xl">
            {icon}
          </div>
          <div>
            <h3 className="font-display text-lg font-bold tracking-wide uppercase text-foreground">
              {title}
            </h3>
            <p className="text-xs tracking-[0.15em] uppercase text-muted-foreground">
              {subtitle}
            </p>
          </div>
        </div>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground transition-colors mt-1"
        >
          <ExternalLink size={20} />
        </a>
      </div>

      {/* Description */}
      <p className="text-muted-foreground text-base leading-relaxed mb-6 font-display">
        {description}
      </p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-display"
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
        className="inline-flex items-center gap-2 text-foreground font-display text-base font-semibold hover:opacity-70 transition-opacity"
      >
        {ctaIcon && <span className="text-lg">{ctaIcon}</span>}
        {ctaLabel}
      </a>
    </div>
  );
};

export default ProjectCard;
