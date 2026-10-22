import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { LINKS } from "@/components/journey/content";
import { startJourney, type JourneyHandle } from "@/components/journey/engine";
import "@/components/journey/journey.css";

// Home page: a scroll journey through six retro-computing scenes.
// The previous home page stays available at /classic.
const Journey = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<JourneyHandle | null>(null);
  const { language, toggleLanguage } = useLanguage();

  useEffect(() => {
    if (!rootRef.current) return;
    handleRef.current = startJourney(rootRef.current, language);
    return () => {
      handleRef.current?.destroy();
      handleRef.current = null;
    };
    // The engine is started once; language changes go through setLang below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    handleRef.current?.setLang(language);
  }, [language]);

  return (
    <div className="journey" ref={rootRef}>
      <canvas id="j-stage" aria-hidden="true" />
      <div id="j-track" />

      <div className="j-hud">
        <section className="scene s-door" data-ui="door">
          <div />
          <h1 id="j-name">Hassan Salman</h1>
          <div className="row">
            <div className="j-tagline" id="j-tagline" />
            <div className="j-cue" id="j-cue">Scroll</div>
          </div>
        </section>

        <section className="scene s-proj" data-ui="proj">
          <div className="j-win" role="group" aria-live="polite">
            <div className="j-win-bar">
              <span id="j-win-title">project.exe</span>
              <span className="j-win-btns"><i /><i /><i /></span>
            </div>
            <div className="j-win-body">
              <div className="j-proj-top">
                <span id="j-proj-id">PROJECT_01</span>
                <span id="j-proj-count">01 / 05</span>
              </div>
              <div className="j-proj-name" id="j-proj-name" />
              <div className="j-proj-sub" id="j-proj-sub" />
              <p className="j-proj-desc" id="j-proj-desc" />
              <div className="j-proj-tags" id="j-proj-tags" />
              <a className="j-cta" id="j-proj-cta" href="#" target="_blank" rel="noopener noreferrer" />
            </div>
          </div>
        </section>

        <section className="scene s-circuit" data-ui="circuit">
          <div className="j-sig">
            <div className="j-sig-ar" lang="ar">حسن</div>
            <div className="j-sig-en">HASSAN</div>
          </div>
        </section>

        <section className="scene s-desk" data-ui="desk">
          <div className="j-panel">
            <div className="j-tags">
              {LINKS.map(([label, handle, url, color, tilt]) => (
                <a
                  key={url}
                  className="j-tag"
                  style={{ background: color, ["--r" as string]: tilt }}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <small>{label}</small>
                  {handle}
                </a>
              ))}
            </div>
          </div>
        </section>

        <div className="j-bar">
          <div className="j-mark">hassan.exe</div>
          <div className="j-ctrls">
            <Link className="j-chip" id="j-classic" to="/classic">Classic</Link>
            <button className="j-chip" id="j-lang" type="button" aria-label="Switch language" onClick={toggleLanguage}>
              عربي
            </button>
            <button className="j-chip" id="j-sound" type="button" aria-pressed="false">Sound: Off</button>
          </div>
        </div>

        <div className="j-meter">
          <span className="j-lbl" id="j-scene" />
          <span className="j-ticks"><i /><i /><i /><i /><i /><i /></span>
        </div>
      </div>

      <div id="j-boot" role="status">
        <div className="j-boot-box">
          <pre>{"HASSAN BIOS v1.0\nMEMORY TEST ........ OK\nLOADING SCENES"}</pre>
          <div className="j-boot-pct" id="j-boot-pct">0%</div>
          <div className="j-boot-bar"><i id="j-boot-bar" /></div>
        </div>
      </div>
    </div>
  );
};

export default Journey;
