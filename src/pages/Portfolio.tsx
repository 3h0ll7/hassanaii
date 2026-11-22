import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Client, Content, Project, Video } from "@/portfolio/types";
import { UI } from "@/portfolio/ui";
import "@/portfolio/portfolio.css";

/*
 * One-page client portfolio. Every text, number, image and project is read
 * from /public/content/*.json, which Hassan edits from /admin (Sveltia CMS).
 * Empty fields render as a visible dashed placeholder instead of invented data.
 */

const reducedMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

const Ph = ({ children }: { children: ReactNode }) => <span className="ph">{children}</span>;

const Marquee = ({ items, seconds, reverse = false }: { items: ReactNode[]; seconds: number; reverse?: boolean }) => {
  if (!items.length) return null;
  // Repeat so one half is always wider than the screen, then duplicate for a seamless loop.
  let base = items;
  while (base.length < 8) base = base.concat(items);
  return (
    <div className={`marquee${reverse ? " marquee--rev" : ""}`} style={{ ["--dur" as string]: `${seconds}s` }}>
      <div className="marquee__track">
        {base.map((it, i) => i < items.length
          ? <div key={`a${i}`} className="marquee__item">{it}</div>
          : <div key={`a${i}`} className="marquee__item" aria-hidden="true" {...{ inert: "" }}>{it}</div>)}
        {base.map((it, i) => <div key={`b${i}`} className="marquee__item dup" aria-hidden="true" {...{ inert: "" }}>{it}</div>)}
      </div>
    </div>
  );
};

const Arrow = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* Line icons for the stats and the experience list. pathLength="1" lets CSS draw them in. */
const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, pathLength: 1 };
const LineIcons: Record<string, JSX.Element> = {
  time: <><circle cx="12" cy="12" r="8.5" {...line} /><path d="M12 7.5V12l3 2" {...line} /></>,
  brand: <><path d="M3.5 12.6 11.4 4.7a2 2 0 0 1 1.4-.6h5.1a2 2 0 0 1 2 2v5.1a2 2 0 0 1-.6 1.4l-7.9 7.9a2 2 0 0 1-2.8 0l-4.1-4.1a2 2 0 0 1 0-2.8Z" {...line} /><circle cx="16" cy="8" r="1.3" {...line} /></>,
  frame: <><rect x="3.5" y="5" width="17" height="14" rx="2" {...line} /><path d="m3.5 16 5-4.5 4 3.5 2.5-2 5 4" {...line} /><circle cx="15.5" cy="9" r="1.4" {...line} /></>,
  link: <><circle cx="9" cy="12" r="5" {...line} /><circle cx="15" cy="12" r="5" {...line} /></>,
  spark: <><path d="M12 3.5c.6 4.4 2.1 5.9 6.5 6.5-4.4.6-5.9 2.1-6.5 6.5-.6-4.4-2.1-5.9-6.5-6.5 4.4-.6 5.9-2.1 6.5-6.5Z" {...line} /><path d="M18.5 15.5c.2 1.6.8 2.2 2.4 2.4-1.6.2-2.2.8-2.4 2.4-.2-1.6-.8-2.2-2.4-2.4 1.6-.2 2.2-.8 2.4-2.4Z" {...line} /></>,
  pulse: <><path d="M2.5 12.5h4l2-4.5 3.5 9 2.5-6 1.5 1.5h5.5" {...line} /><path d="M2.5 12.5h4l2-4.5 3.5 9 2.5-6 1.5 1.5h5.5" {...line} className="ecg" /></>,
};
const LineIcon = ({ name }: { name?: string }) =>
  name && LineIcons[name] ? <svg className="licon" viewBox="0 0 24 24" aria-hidden="true">{LineIcons[name]}</svg> : null;

/* Counts up from zero the first time the number scrolls into view. */
const CountUp = ({ value }: { value: string }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const m = value.match(/^(\D*)(\d+)(.*)$/);
  const target = m ? parseInt(m[2], 10) : 0;
  const [n, setN] = useState(m ? 0 : target);
  useEffect(() => {
    const el = ref.current;
    if (!m || !el) return;
    if (reducedMotion() || !("IntersectionObserver" in window)) { setN(target); return; }
    let raf = 0;
    const io = new IntersectionObserver(([en]) => {
      if (!en.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now(), dur = 1100 + target * 40;
      const tick = (now: number) => {
        const k = Math.min(1, (now - t0) / dur);
        setN(Math.round(target * (1 - Math.pow(1 - k, 3))));
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io.observe(el);
    return () => { io.disconnect(); cancelAnimationFrame(raf); };
  }, [value]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!m) return <span ref={ref}>{value}</span>;
  return (
    <span ref={ref}>
      <span aria-hidden="true">{m[1]}{n}{m[3]}</span>
      <span className="sr-only">{value}</span>
    </span>
  );
};

const Icons = {
  wa: (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.2 5 5 0 0 0 1 2.7 11.6 11.6 0 0 0 4.5 3.9c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.4-.3Z" /></svg>
  ),
  call: (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z" /></svg>
  ),
  ig: (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.6" /><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.6" /><circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" /></svg>
  ),
  gh: (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5a3.9 3.9 0 0 1 1-2.7 3.6 3.6 0 0 1 .1-2.7s.8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7a3.9 3.9 0 0 1 1 2.7c0 3.9-2.3 4.7-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" /></svg>
  ),
  be: (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M8.2 11.4c.8-.4 1.3-1.1 1.3-2.1C9.5 7.3 8 6.5 6 6.5H1.5v11H6.3c2 0 3.8-1 3.8-3.2 0-1.4-.7-2.5-1.9-2.9ZM3.9 8.4h1.8c.7 0 1.4.2 1.4 1s-.5 1.1-1.3 1.1H3.9V8.4Zm2 7.2h-2v-2.6h2.1c.9 0 1.5.4 1.5 1.3s-.7 1.3-1.6 1.3ZM18.9 9.2c-2.6 0-4.3 1.9-4.3 4.3 0 2.5 1.6 4.3 4.3 4.3 2 0 3.3-.9 4-2.8h-2.1c-.2.7-1.1 1.1-1.8 1.1-1.3 0-2-.8-2-2h6c.2-2.6-1.3-4.9-4.1-4.9Zm-1.9 3.4c.1-1 .8-1.7 1.9-1.7s1.6.6 1.8 1.7H17ZM16.4 6.9h4.8v1.2h-4.8z" /></svg>
  ),
};

/* Cycles through what the product could get: an image, a video, an ad. Static for reduced motion. */
const RotatingWords = ({ words }: { words: readonly string[] }) => {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (reducedMotion() || words.length < 2) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % words.length), 2600);
    return () => window.clearInterval(id);
  }, [words]);
  return (
    <span className="rotor" aria-hidden="true">
      {words.map((w, k) => (
        <span key={w} className={`rotor__word${k === i ? " is-on" : ""}`}>{w}</span>
      ))}
    </span>
  );
};

/* ---------------- Videos ---------------- */

const ratioNum = (r?: string) => {
  const [w, h] = (r || "9/16").split("/").map(Number);
  return w && h ? w / h : 9 / 16;
};

/* Plays its silent loop only while it is on screen, and never for reduced motion or data saver. */
const VideoCard = ({ v, title, label, onOpen, i }: { v: Video; title: string; label: string; onOpen: () => void; i: number }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const el = ref.current;
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData;
    if (!el || reducedMotion() || saveData || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([en]) => {
      if (en.isIntersecting) el.play().then(() => setPlaying(true)).catch(() => {});
      else { el.pause(); setPlaying(false); }
    }, { threshold: 0.55 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <button type="button" className={`vcard${playing ? " is-playing" : ""}`} onClick={onOpen} data-reveal
      style={{ "--i": i, "--r": ratioNum(v.ratio) } as React.CSSProperties}>
      <span className="vcard__media" style={{ aspectRatio: v.ratio || "9/16" }}>
        <img src={v.poster} alt="" loading="lazy" />
        <video ref={ref} src={v.loop} muted loop playsInline preload="none" aria-hidden="true" tabIndex={-1} />
        <span className="vcard__play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5.5v13l10.5-6.5Z" fill="currentColor" /></svg></span>
      </span>
      <span className="vcard__info">
        {v.brand && <span className="vcard__brand"><bdi>{v.brand}</bdi></span>}
        <span className="vcard__title">{title}</span>
      </span>
      <span className="sr-only">{label}</span>
    </button>
  );
};

const VideoViewer = ({ videos, index, setIndex, titleOf, onClose, labels, clientOf }: {
  videos: Video[];
  index: number;
  setIndex: (n: number) => void;
  titleOf: (v: Video) => string;
  onClose: () => void;
  labels: { close: string; prev: string; next: string; store: string; instagram: string };
  clientOf: (v: Video) => Client | undefined;
}) => {
  const closeBtn = useRef<HTMLButtonElement>(null);
  const v = videos[index];
  const brand = clientOf(v);
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    document.body.classList.add("pf-locked");
    closeBtn.current?.focus();
    return () => { document.body.classList.remove("pf-locked"); opener?.focus?.(); };
  }, []);
  useEffect(() => {
    const rtl = document.documentElement.dir === "rtl";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((index + (rtl ? -1 : 1) + videos.length) % videos.length);
      if (e.key === "ArrowLeft") setIndex((index + (rtl ? 1 : -1) + videos.length) % videos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, videos.length, onClose, setIndex]);
  return (
    <div className="vviewer" role="dialog" aria-modal="true" aria-label={titleOf(v)} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="vviewer__top">
        <div className="vviewer__heading">
          <span className="vcard__brand"><bdi>{v.brand}</bdi></span>
          <span className="vviewer__title">{titleOf(v)}</span>
        </div>
        <div className="vviewer__links">
          {brand?.store && <a className="lightbox__link lightbox__link--gold" href={brand.store} target="_blank" rel="noopener noreferrer">{labels.store}</a>}
          {brand?.link && <a className="lightbox__link" href={brand.link} target="_blank" rel="noopener noreferrer">{labels.instagram}</a>}
        </div>
        <button ref={closeBtn} type="button" className="lightbox__close" onClick={onClose} aria-label={labels.close}>×</button>
      </div>
      <div className="vviewer__stage">
        <button type="button" className="vviewer__nav vviewer__nav--prev" onClick={() => setIndex((index - 1 + videos.length) % videos.length)} aria-label={labels.prev}><Arrow /></button>
        <video key={v.src} className="vviewer__video" style={{ aspectRatio: v.ratio || "9/16" }} src={v.src} poster={v.poster} controls autoPlay playsInline />
        <button type="button" className="vviewer__nav vviewer__nav--next" onClick={() => setIndex((index + 1) % videos.length)} aria-label={labels.next}><Arrow /></button>
      </div>
      <div className="vviewer__count" aria-live="polite"><bdi dir="ltr">{index + 1} / {videos.length}</bdi></div>
    </div>
  );
};

/* ---------------- Lightbox ---------------- */

const Lightbox = ({ project, title, onClose, labels, brand, captionOf }: {
  project: Project;
  title: string;
  captionOf: (im: Project["images"][number]) => string;
  onClose: () => void;
  labels: { close: string; prev: string; next: string; store: string; instagram: string };
  brand?: Client;
}) => {
  const imgs = project.images?.length ? project.images : [{ src: project.cover }];
  // consecutive images with the same caption form one set; the chips jump between sets
  const sets = imgs.reduce<{ label: string; start: number }[]>((acc, im, k) => {
    const label = captionOf(im);
    if (label && (!acc.length || acc[acc.length - 1].label !== label)) acc.push({ label, start: k });
    return acc;
  }, []);
  const track = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const [index, setIndex] = useState(0);
  const drag = useRef<{ x: number; start: number; from: number } | null>(null);

  const current = () => (track.current ? Math.round(track.current.scrollLeft / track.current.clientWidth) : 0);
  const go = useCallback((n: number) => {
    const el = track.current;
    if (!el) return;
    const k = Math.max(0, Math.min(imgs.length - 1, n));
    el.scrollTo({ left: k * el.clientWidth, behavior: reducedMotion() ? "auto" : "smooth" });
  }, [imgs.length]);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    document.body.classList.add("pf-locked");
    closeBtn.current?.focus();
    return () => {
      document.body.classList.remove("pf-locked");
      opener?.focus?.();
    };
  }, []);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowRight") go(current() + 1);
    else if (e.key === "ArrowLeft") go(current() - 1);
  };

  return (
    <div className={`lightbox${sets.length > 1 ? " lightbox--sets" : ""}`} role="dialog" aria-modal="true" aria-label={title} onKeyDown={onKey}>
      <div className="lightbox__top">
        <p className="lightbox__title">{title}</p>
        {(brand?.store || brand?.link) && (
          <div className="lightbox__links">
            {brand.store && <a className="lightbox__link lightbox__link--gold" href={brand.store} target="_blank" rel="noopener noreferrer">{labels.store}</a>}
            {brand.link && <a className="lightbox__link" href={brand.link} target="_blank" rel="noopener noreferrer">{labels.instagram}</a>}
          </div>
        )}
        <p className="lightbox__count" aria-live="polite"><bdi dir="ltr">{index + 1} / {imgs.length}</bdi></p>
        <button ref={closeBtn} className="lightbox__close" type="button" aria-label={labels.close} onClick={onClose}>
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>
        </button>
      </div>
      {sets.length > 1 && (
        <div className="lightbox__sets">
          {sets.map((st, k) => {
            const end = sets[k + 1]?.start ?? imgs.length;
            const on = index >= st.start && index < end;
            return (
              <button key={st.label + k} type="button" className={`lightbox__set${on ? " is-on" : ""}`} aria-pressed={on} onClick={() => go(st.start)}
                ref={(el) => { if (on && el) el.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reducedMotion() ? "auto" : "smooth" }); }}>
                {st.label} <span className="lightbox__set-n">{end - st.start}</span>
              </button>
            );
          })}
        </div>
      )}
      <div
        ref={track}
        className="lightbox__track"
        dir="ltr"
        tabIndex={0}
        onScroll={() => requestAnimationFrame(() => setIndex(current()))}
        onPointerDown={(e) => {
          if (e.pointerType !== "mouse" || !track.current) return;
          drag.current = { x: e.clientX, start: track.current.scrollLeft, from: current() };
          track.current.classList.add("dragging");
          track.current.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (drag.current && track.current) track.current.scrollLeft = drag.current.start - (e.clientX - drag.current.x);
        }}
        onPointerUp={(e) => {
          if (!drag.current || !track.current) return;
          const dx = e.clientX - drag.current.x;
          track.current.classList.remove("dragging");
          go(Math.abs(dx) > 60 ? drag.current.from + (dx < 0 ? 1 : -1) : drag.current.from);
          drag.current = null;
        }}
      >
        {imgs.map((im, k) => (
          <div className="slide" key={im.src + k}>
            <img src={im.src} alt={`${title}${captionOf(im) ? ` — ${captionOf(im)}` : ""} — ${k + 1}`} loading={k > 1 ? "lazy" : undefined} draggable={false} />
          </div>
        ))}
      </div>
      <button className="lightbox__nav lightbox__nav--prev" type="button" aria-label={labels.prev} disabled={index === 0} onClick={() => go(current() - 1)}>
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <button className="lightbox__nav lightbox__nav--next" type="button" aria-label={labels.next} disabled={index >= imgs.length - 1} onClick={() => go(current() + 1)}>
        <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    </div>
  );
};

/* ---------------- Page ---------------- */

const Portfolio = () => {
  const { language, toggleLanguage } = useLanguage();
  const u = UI[language];
  const [data, setData] = useState<Content | null>(null);
  const [failed, setFailed] = useState(false);
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState<number | null>(null);
  const [videoOpen, setVideoOpen] = useState<number | null>(null);

  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const header = useRef<HTMLElement>(null);
  const bigName = useRef<HTMLSpanElement>(null);

  const t = useCallback(<T extends object>(obj: T | undefined, key: string): string =>
    (obj as Record<string, string> | undefined)?.[`${key}_${language}`] ?? "", [language]);

  /* load content */
  useEffect(() => {
    Promise.all(["settings", "work", "services", "expertise"].map((f) =>
      fetch(`/content/${f}.json`, { cache: "no-cache" }).then((r) => {
        if (!r.ok) throw new Error(`${f}.json ${r.status}`);
        return r.json();
      }),
    ))
      // videos are optional: the page still loads if the file is missing
      .then(async ([settings, work, services, expertise]) => {
        const videos = await fetch("/content/videos.json", { cache: "no-cache" }).then((r) => (r.ok ? r.json() : undefined)).catch(() => undefined);
        setData({ settings, work, services: services.services, expertise, videos });
      })
      .catch((err) => { console.error("Portfolio content failed to load", err); setFailed(true); });
  }, []);

  /* title */
  useEffect(() => {
    if (data) document.title = `${t(data.settings, "name")} — ${t(data.settings, "role")}`;
  }, [data, t]);

  /* scroll progress, header state, drifting name */
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        if (bar.current) bar.current.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
        header.current?.classList.toggle("scrolled", scrollY > innerHeight * 0.6);
        if (!reducedMotion() && bigName.current) {
          const p = Math.min(scrollY / innerHeight, 1.2);
          const dir = document.documentElement.dir === "rtl" ? 1 : -1;
          bigName.current.style.setProperty("--drift", `${dir * p * 14}vw`);
        }
        ticking = false;
      });
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => removeEventListener("scroll", onScroll);
  }, [data]);

  /* reveal on scroll */
  useEffect(() => {
    const els = root.current?.querySelectorAll<HTMLElement>("[data-reveal]:not(.in)");
    if (!els?.length) return;
    if (reducedMotion() || !("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("in"));
      return;
    }
    const io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [data, language, filter]);

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth" });

  const cats = useMemo(
    () => (data ? data.work.categories.filter((c) => data.work.projects.some((p) => p.category === c.id || p.tags?.includes(c.id))) : []),
    [data],
  );

  if (failed) {
    return <div className="pf" style={{ display: "grid", placeItems: "center", padding: "2rem" }}>
      <p>{language === "ar" ? "تعذّر تحميل المحتوى. حدّث الصفحة." : "The content could not load. Refresh the page."}</p>
    </div>;
  }
  if (!data) return <div className="pf" aria-busy="true" />;

  const s = data.settings;
  const { projects, posters, clients } = data.work;
  const adList = data.videos?.videos || [];
  const motionList = data.videos?.motion || [];
  const videoList = [...adList, ...motionList];
  const catLabel = (id: string) => t(data.work.categories.find((c) => c.id === id), "label");
  const inCat = (p: Project, id: string) => p.category === id || !!p.tags?.includes(id);
  const hasWork = (id: string) => projects.some((p) => inCat(p, id));
  const digits = (v: string) => String(v).replace(/[^\d+]/g, "");
  const ig = s.instagram?.replace(/^@/, "");

  // Numbers come from the dashboard or are counted from the site's own lists. Empty ones are hidden.
  const counts: Record<string, number> = {
    clients: data.work.clients?.length || 0,
    projects: projects.length,
    partners: data.expertise?.partners?.length || 0,
  };
  const stats = (s.stats || [])
    .map((st) => ({ ...st, value: st.source ? String(counts[st.source] || "") : String(st.value || "").trim() }))
    .filter((st) => st.value);
  const experience = (s.experience || []).filter((x) => t(x, "title"));

  // Instagram is the main way to reach Hassan. WhatsApp, phone and Behance appear only once filled in.
  const contactItems = [
    { href: ig && `https://ig.me/m/${ig}`, label: u.dm, icon: Icons.ig, sub: ig && `@${ig}`, primary: true, show: !!ig },
    { href: s.github, label: u.github, icon: Icons.gh, sub: s.github?.replace(/^https?:\/\/(www\.)?/, ""), show: !!s.github },
    { href: s.whatsapp && `https://wa.me/${digits(s.whatsapp).replace(/^\+/, "")}`, label: u.whatsapp, icon: Icons.wa, sub: s.whatsapp, show: !!s.whatsapp },
    { href: s.phone && `tel:${digits(s.phone)}`, label: u.call, icon: Icons.call, sub: s.phone, show: !!s.phone },
    { href: s.behance, label: u.behance, icon: Icons.be, sub: "", show: !!s.behance },
  ].filter((c) => c.show);

  const activeFilter = cats.some((c) => c.id === filter) ? filter : "all";
  const visible = projects.map((p, i) => ({ p, i })).filter(({ p }) => activeFilter === "all" || inCat(p, activeFilter));

  return (
    <div className="pf" ref={root}>
      <div className="progress" aria-hidden="true"><span ref={bar} /></div>

      <header className="bar" ref={header}>
        <a className="bar__name" href="#top">{t(s, "name")}</a>
        <nav className="bar__nav" aria-label={u.navWork}>
          <a href="#work">{u.navWork}</a>
          <a href="#services">{u.navServices}</a>
          <a href="#expertise">{u.navExpertise}</a>
          <a href="#about">{u.navAbout}</a>
          <a href="#contact">{u.navContact}</a>
        </nav>
        <button className="bar__lang" type="button" aria-label={u.langLabel} onClick={toggleLanguage}>{u.langBtn}</button>
      </header>

      <main id="top">
        {/* 1. Hero */}
        <section className="hero" aria-labelledby="heroHeadline">
          <div className="hero__name" aria-hidden="true"><span ref={bigName}>{t(s, "name")}</span></div>
          <div className="hero__photo">
            {s.photo
              ? <img src={s.photo} alt={t(s, "name")} fetchPriority="high" />
              : <div className="arch">{u.ph.photo}</div>}
          </div>
          <div className="hero__text">
            <p className="hero__meta"><span>{t(s, "role")}</span><span className="sep" aria-hidden="true" /><span>{t(s, "city")}</span></p>
            <h1 className="hero__headline" id="heroHeadline">{t(s, "headline")}</h1>
            <div className="hero__cta">
              <a className="btn btn--gold" href="#contact">{u.ctaContact}</a>
              <a className="btn btn--line" href="#work">{u.ctaWork}</a>
            </div>
          </div>
        </section>


        {/* Posters: straight after the hero, the work speaks first */}
        <section className="posters" aria-label={u.postersTitle}>
          <Marquee
            seconds={70}
            items={posters.map((p, i) => <div className="poster" key={i}><img src={p.src} alt="" loading="lazy" /></div>)}
          />
        </section>

        {/* 3. Clients */}
        {clients.length > 0 && (
          <section className="clients" aria-labelledby="clientsTitle">
            <h2 className="clients__title" id="clientsTitle">{u.clientsTitle}</h2>
            <div className="clients__rows">
              <Marquee
                seconds={36}
                items={clients.map((c, i) => {
                  const inner = c.logo
                    ? <><img src={c.logo} alt="" loading="lazy" /><span className="logo__name">{c.name}</span></>
                    : c.name ? <span className="logo__name">{c.name}</span> : <Ph>{u.ph.logo}</Ph>;
                  return c.link
                    ? <a className="logo" key={i} href={c.link} target="_blank" rel="noopener noreferrer">{inner}</a>
                    : <div className="logo" key={i}>{inner}</div>;
                })}
              />
            </div>
          </section>
        )}

        {/* 4. Work */}
        <section className="work" id="work" aria-labelledby="workTitle">
          <div className="section-head" data-reveal>
            <h2 id="workTitle">{u.workTitle}</h2>
            <div className="filters" role="toolbar" aria-label={u.filterLabel}>
              <button className="chip" type="button" aria-pressed={activeFilter === "all"} onClick={() => setFilter("all")}>{u.all}</button>
              {cats.map((c) => (
                <button key={c.id} className="chip" type="button" aria-pressed={activeFilter === c.id} onClick={() => setFilter(c.id)}>
                  {t(c, "label")}
                </button>
              ))}
            </div>
          </div>
          <div className="work__grid">
            {visible.map(({ p, i }) => (
              <button key={p.title_en + i} className="card" type="button" data-reveal onClick={() => setOpen(i)}>
                <div className="card__media">
                  <img src={p.cover} alt="" loading="lazy" style={{ objectPosition: p.focus || "50% 50%" }} />
                  <span className="card__count">{u.images(p.images?.length || 1)}</span>
                </div>
                <div className="card__info">
                  <h3 className="card__title">{t(p, "title")}</h3>
                  <span className="card__meta">
                    {p.brand || <Ph>{u.ph.brand}</Ph>}
                    <span className="sep-v" aria-hidden="true" />
                    {catLabel(p.category)}
                  </span>
                </div>
                <p className="card__summary">{t(p, "summary")}</p>
              </button>
            ))}
          </div>
          {visible.length === 0 && <p className="work__empty">{u.empty}</p>}
        </section>

        {/* Stats: after the work, where they back it up */}
        <section className="stats" aria-label={u.navAbout} data-reveal>
          {stats.map((st, i) => (
            <div className="stat" key={i} style={{ "--i": i } as React.CSSProperties}>
              <span className="stat__icon"><LineIcon name={st.icon} /></span>
              <span className="stat__value"><CountUp value={st.value} /></span>
              <span className="stat__label">{t(st, "label")}</span>
            </div>
          ))}
        </section>

        {/* 6. Services */}
        <section className="services" id="services" aria-labelledby="servicesTitle">
          <div className="section-head" data-reveal><h2 id="servicesTitle">{u.servicesTitle}</h2></div>
          <div className="services__grid">
            {data.services.map((sv, i) => (
              <button
                key={i}
                className="service"
                type="button"
                data-reveal
                onClick={() => {
                  if (hasWork(sv.category)) { setFilter(sv.category); scrollTo("work"); }
                  else if (sv.category === "video" && videoList.length) scrollTo("videos");
                  else scrollTo("contact");
                }}
              >
                <span className="service__title">{t(sv, "title")}</span>
                <span className="service__text">{t(sv, "text")}</span>
                <span className="service__go">{hasWork(sv.category) ? u.seeWork : sv.category === "video" && videoList.length ? u.seeVideos : u.askSample} <Arrow /></span>
              </button>
            ))}
          </div>
        </section>

        {/* Artificial Intelligence expertise */}
        <section className="expertise" id="expertise" aria-labelledby="expertiseTitle">
          <div className="section-head section-head--stack" data-reveal>
            <h2 id="expertiseTitle">{u.expertiseTitle}</h2>
            <p className="section-lead">{t(data.expertise, "intro")}</p>
          </div>
          <div className="expertise__grid">
            {data.expertise.groups.map((g, i) => (
              <article className="xp" key={i} data-reveal>
                <div className="xp__media"><img src={g.image} alt="" loading="lazy" /></div>
                <div className="xp__body">
                  <h3 className="xp__title">{t(g, "title")}</h3>
                  <p className="xp__text">{t(g, "text")}</p>
                  <ul className="xp__tools" dir="ltr">
                    {g.tools.split(",").map((tool) => tool.trim()).filter(Boolean).map((tool) => <li key={tool}>{tool}</li>)}
                  </ul>
                  {g.link && t(g, "link") && (
                    g.link.startsWith("#")
                      ? <a className="xp__link" href={g.link} onClick={(e) => { e.preventDefault(); scrollTo(g.link.slice(1)); }}>{t(g, "link")} <Arrow /></a>
                      : g.link.startsWith("/")
                      ? <Link className="xp__link" to={g.link}>{t(g, "link")} <Arrow /></Link>
                      : <a className="xp__link" href={g.link} target="_blank" rel="noopener noreferrer">{t(g, "link")} <Arrow /></a>
                  )}
                </div>
              </article>
            ))}
            <article className="xp xp--partners" data-reveal>
              <div className="xp__media"><img src={data.expertise.partners_image} alt="" loading="lazy" /></div>
              <div className="xp__body">
                <h3 className="xp__title">{t(data.expertise, "partners_title")}</h3>
                <p className="xp__text">{t(data.expertise, "partners_text")}</p>
                <ul className="partners">
                  {data.expertise.partners.map((p) => {
                    const inner = <><span className="partner__name">{p.name}</span>{t(p, "note") && <span className="partner__note">{t(p, "note")}</span>}</>;
                    return (
                      <li key={p.name}>
                        {p.link
                          ? <a className="partner" href={p.link} target="_blank" rel="noopener noreferrer">{inner}<Arrow /></a>
                          : <span className="partner">{inner}</span>}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </article>
          </div>
        </section>

        {/* 7. About */}
        <section className="about" id="about" aria-labelledby="aboutTitle">
          <div className="section-head" data-reveal><h2 id="aboutTitle">{u.aboutTitle}</h2></div>
          <div className="about__body">
            <figure className="about__photo" data-reveal>
              {s.about_photo ? <img src={s.about_photo} alt={t(s, "name")} loading="lazy" /> : <div className="ph about__ph">{u.ph.photo}</div>}
            </figure>
            <div className="about__text">
              <p className="about__bio" data-reveal>{t(s, "about")}</p>
              <ol className="about__exp" data-reveal>
                {experience.map((x, i) => (
                  <li className="exp" key={i} style={{ "--i": i } as React.CSSProperties}>
                    <span className="exp__icon"><LineIcon name={x.icon} /></span>
                    <span className="exp__body">
                      <span className="exp__head">
                        <span className="exp__title">{t(x, "title")}</span>
                        {x.years ? <span className="exp__years">{x.years}</span> : null}
                      </span>
                      {t(x, "place") ? <span className="exp__place">{t(x, "place")}</span> : null}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Videos: the last thing to see before getting in touch */}
        {videoList.length > 0 && (
          <section className="videos" id="videos" aria-labelledby="videosTitle">
            <div className="section-head section-head--stack" data-reveal>
              <h2 id="videosTitle">{t(data.videos, "title")}</h2>
              {t(data.videos, "intro") && <p className="videos__intro">{t(data.videos, "intro")}</p>}
            </div>
            <div className="videos__row">
              {adList.map((v, i) => (
                <VideoCard key={v.src} v={v} i={i} title={t(v, "title")} label={u.play} onOpen={() => setVideoOpen(i)} />
              ))}
            </div>
            {motionList.length > 0 && (
              <div className="videos__motion" id="motion">
                <div className="videos__subhead" data-reveal>
                  <h3>{t(data.videos, "motion_title")}</h3>
                  {t(data.videos, "motion_intro") && <p className="videos__intro">{t(data.videos, "motion_intro")}</p>}
                  {data.videos?.motion_link && t(data.videos, "motion_link") && (
                    <a className="xp__link" href={data.videos.motion_link} target="_blank" rel="noopener noreferrer">{t(data.videos, "motion_link")} <Arrow /></a>
                  )}
                </div>
                {/* widescreen pieces first; on phones the vertical ones become a swipe row under them */}
                <div className="videos__row videos__row--motion">
                  {motionList.map((v, i) => ({ v, i })).filter(({ v }) => ratioNum(v.ratio) >= 1).map(({ v, i }) => (
                    <VideoCard key={v.src} v={v} i={i} title={t(v, "title")} label={u.play} onOpen={() => setVideoOpen(adList.length + i)} />
                  ))}
                  <div className="motion-tall">
                    {motionList.map((v, i) => ({ v, i })).filter(({ v }) => ratioNum(v.ratio) < 1).map(({ v, i }) => (
                      <VideoCard key={v.src} v={v} i={i} title={t(v, "title")} label={u.play} onOpen={() => setVideoOpen(adList.length + i)} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {/* 8. Contact */}
        <section className="contact" id="contact" aria-labelledby="contactTitle">
          <div className="contact__bg" aria-hidden="true" style={{ backgroundImage: s.contact_photo ? `url("${encodeURI(s.contact_photo)}")` : "none" }} />
          <h2 className="contact__title" id="contactTitle" data-reveal>
            <span className="sr-only">{u.contactTitle} {u.contactWords.join("، ")}</span>
            <span aria-hidden="true">{u.contactTitle}</span>
            <RotatingWords words={u.contactWords} />
          </h2>
          <p className="contact__lead" data-reveal>{u.contactLead}</p>
          <div className="contact__links" data-reveal>
            {contactItems.map((c) => (
              <div className="contact__item" key={c.label}>
                <a className={`btn ${c.primary ? "btn--gold" : "btn--line"}`} href={c.href} target="_blank" rel="noopener noreferrer">{c.icon}{c.label}</a>
                {c.sub ? <small>{c.sub}</small> : null}
              </div>
            ))}
            {contactItems.length === 0 && <Ph>{u.ph.whatsapp}</Ph>}
          </div>
        </section>
      </main>

      {/* 9. Footer */}
      <footer className="foot">
        <span>{t(s, "name")}</span>
        <span className="foot__links">
          {ig && <a className="foot__link" href={`https://instagram.com/${ig}`} target="_blank" rel="noopener noreferrer">{u.instagram} <bdi dir="ltr">@{ig}</bdi></a>}
          {s.github && <a className="foot__link" href={s.github} target="_blank" rel="noopener noreferrer">{u.github}</a>}
          <Link to="/space" className="foot__link">{u.apps}</Link>
        </span>
        <span>{t(s, "copyright")} {new Date().getFullYear()}</span>
      </footer>

      {videoOpen !== null && videoList[videoOpen] && (
        <VideoViewer
          videos={videoList}
          index={videoOpen}
          setIndex={setVideoOpen}
          titleOf={(v) => t(v, "title")}
          onClose={() => setVideoOpen(null)}
          labels={{ close: u.close, prev: u.prev, next: u.next, store: u.store, instagram: u.instagram }}
          clientOf={(v) => clients.find((c) => c.name === v.brand)}
        />
      )}

      {open !== null && projects[open] && (
        <Lightbox
          project={projects[open]}
          title={t(projects[open], "title")}
          onClose={() => setOpen(null)}
          labels={{ close: u.close, prev: u.prev, next: u.next, store: u.store, instagram: u.instagram }}
          captionOf={(im) => t(im, "caption")}
          brand={projects[open].brand ? clients.find((c) => c.name === projects[open].brand) : undefined}
        />
      )}
    </div>
  );
};

export default Portfolio;
