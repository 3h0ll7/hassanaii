import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LINKS, PROJECTS, STOP_COUNT, UI } from "@/space/content";
import { createSpace, type SpaceHandle } from "@/space/scene";
import { createSound } from "@/space/sound";
import "@/space/space.css";

const LAST = STOP_COUNT - 1;

const Space = () => {
  const { language, toggleLanguage } = useLanguage();
  const d = UI[language];
  const li = language === "en" ? 0 : 1;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stopRefs = useRef<(HTMLElement | null)[]>([]);
  const dotRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const cueRef = useRef<HTMLDivElement>(null);
  const soundRef = useRef<ReturnType<typeof createSound>>();
  const [webgl, setWebgl] = useState(true);
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    let active = -1;
    const onFrame = (p: number) => {
      stopRefs.current.forEach((el, k) => {
        if (!el) return;
        const dist = p - k;
        const o = Math.min(1, Math.max(0, 1.55 - Math.abs(dist) * 3.6));
        el.style.opacity = o.toFixed(3);
        el.style.transform = `translate3d(0, ${(-dist * 70).toFixed(1)}px, 0)`;
        el.style.pointerEvents = o > 0.6 ? "auto" : "none";
      });
      const near = Math.round(p);
      if (near !== active) {
        active = near;
        dotRefs.current.forEach((el, k) => el?.setAttribute("aria-current", k === near ? "true" : "false"));
      }
      if (cueRef.current) cueRef.current.style.opacity = Math.max(0, 1 - p * 4).toFixed(2);
    };

    let handle: SpaceHandle | undefined;
    try {
      handle = createSpace(canvas, { onFrame, reducedMotion });
    } catch {
      setWebgl(false);
      return;
    }

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      handle!.setTarget(max > 0 ? (scrollY / max) * LAST : 0);
    };
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      removeEventListener("scroll", onScroll);
      handle?.dispose();
    };
  }, []);

  useEffect(() => {
    const sound = createSound();
    soundRef.current = sound;
    const events = ["pointerdown", "keydown", "touchstart", "wheel"] as const;
    const unlock = () => {
      sound.unlock();
      events.forEach((e) => removeEventListener(e, unlock));
    };
    events.forEach((e) => addEventListener(e, unlock, { passive: true }));
    return () => {
      events.forEach((e) => removeEventListener(e, unlock));
      sound.dispose();
    };
  }, []);

  const goTo = (k: number) => {
    const max = document.documentElement.scrollHeight - innerHeight;
    scrollTo({ top: (k / LAST) * max, behavior: "smooth" });
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    soundRef.current?.set(next);
  };

  const stopLabels = [d.start, ...PROJECTS.map((p) => p.title), d.links];
  const setStop = (k: number) => (el: HTMLElement | null) => {
    stopRefs.current[k] = el;
  };

  return (
    <div className={`space${webgl ? "" : " no-webgl"}`}>
      <canvas ref={canvasRef} className="space-canvas" aria-hidden="true" />
      <div className="space-vignette" aria-hidden="true" />

      <header className="space-bar">
        <button className="space-brand" onClick={() => goTo(0)}>
          {d.name}
        </button>
        <div className="space-controls">
          <button onClick={toggleSound} aria-pressed={soundOn}>
            {soundOn ? d.soundOn : d.soundOff}
          </button>
          <button onClick={toggleLanguage}>{d.lang}</button>
        </div>
      </header>

      <nav className="space-dots" aria-label={d.projects}>
        {stopLabels.map((label, k) => (
          <button
            key={label}
            ref={(el) => {
              dotRefs.current[k] = el;
            }}
            onClick={() => goTo(k)}
            aria-label={label}
          >
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <main className="space-stops">
        <section ref={setStop(0)} className="stop stop-intro" onFocus={() => goTo(0)}>
          <div className="intro">
            <h1>{d.name}</h1>
            <ul className="intro-tags">
              {d.tagline.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
        </section>

        {PROJECTS.map((p, idx) => {
          const k = idx + 1;
          return (
            <section
              key={p.title}
              ref={setStop(k)}
              className={`stop stop-project ${k % 2 === 1 ? "card-right" : "card-left"}`}
              style={{ "--accent": p.look.atmosphere } as CSSProperties}
              onFocus={() => goTo(k)}
            >
              <article className="card">
                <p className="card-index">
                  {String(k).padStart(2, "0")} / {String(PROJECTS.length).padStart(2, "0")}
                </p>
                <h2>{p.title}</h2>
                <p className="card-sub">{p.sub[li]}</p>
                <p className="card-desc">{p.desc[li]}</p>
                <ul className="card-tags">
                  {p.tags[li].map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <a className="card-cta" href={p.href} target="_blank" rel="noopener noreferrer">
                  {p.cta[li]}
                  <span aria-hidden="true">{language === "en" ? "→" : "←"}</span>
                </a>
              </article>
            </section>
          );
        })}

        <section ref={setStop(LAST)} className="stop stop-links" onFocus={() => goTo(LAST)}>
          <div className="links">
            <h2>{d.links}</h2>
            <ul>
              {LINKS.map(([label, handle, url]) => (
                <li key={url}>
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <span className="link-label">{label}</span>
                    <span className="link-handle" dir="ltr">
                      {handle}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <p className="signature" dir="ltr">
              {d.signature}
            </p>
          </div>
        </section>
      </main>

      <div ref={cueRef} className="space-cue" aria-hidden="true">
        <span>{d.cue}</span>
        <i />
      </div>

      <div className="space-scroll" style={{ height: `${LAST * 150 + 100}vh` }} aria-hidden="true" />
    </div>
  );
};

export default Space;
