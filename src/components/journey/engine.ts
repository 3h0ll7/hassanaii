import { PROJECTS, SCENE_IMAGES, SEGMENTS, UI, type Lang, type Segment } from "./content";

// Scroll-driven WebGL stage: draws two scene images at once and blends them with a
// noise dissolve, RGB split and row glitch while the visitor scrolls between scenes.

const VS = `attribute vec2 p; varying vec2 v; void main(){ v = p*0.5+0.5; gl_Position = vec4(p,0.,1.); }`;
const FS = `precision highp float; varying vec2 v;
  uniform sampler2D t0, t1; uniform vec2 res, s0, s1, f0, f1, mouse; uniform float z0, z1, mixv, glitch, time;
  float h(float n){ return fract(sin(n)*43758.5453); }
  float h2(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
    return mix(mix(h2(i),h2(i+vec2(1,0)),f.x), mix(h2(i+vec2(0,1)),h2(i+vec2(1,1)),f.x), f.y); }
  vec2 cover(vec2 uv, vec2 img, vec2 focus, float z){
    float ra = res.x/res.y, ia = img.x/img.y;
    vec2 sc = ra > ia ? vec2(1., ia/ra) : vec2(ra/ia, 1.);
    vec2 hs = sc/z*0.5;
    vec2 c = clamp(focus + mouse*0.012/z, hs, 1.-hs);
    vec2 o = (uv-0.5)*sc/z + c;
    return vec2(o.x, 1.-o.y);
  }
  vec3 samp(sampler2D t, vec2 uv, vec2 img, vec2 focus, float z, float split){
    vec2 c = cover(uv, img, focus, z);
    float r = texture2D(t, c + vec2(split,0.)).r, g = texture2D(t, c).g, b = texture2D(t, c - vec2(split,0.)).b;
    return vec3(r,g,b);
  }
  void main(){
    vec2 uv = v;
    float row = floor(uv.y*28.) + floor(time*24.);
    float blk = step(1.-glitch*0.55, h(row));
    uv.x += (h(row*1.7)-0.5)*0.18*glitch*blk;
    float split = 0.002 + glitch*0.018;
    vec3 a = samp(t0, uv, s0, f0, z0, split);
    vec3 b = samp(t1, uv, s1, f1, z1, split);
    float n = noise(uv*vec2(10.,6.) + time*0.2)*0.7 + noise(uv*40.)*0.3;
    float e = mixv*1.3-0.15;
    float k = smoothstep(e-0.12, e+0.12, n);
    vec3 col = mix(b, a, k);
    float edge = (1.-abs(k*2.-1.)) * step(0.001, mixv) * step(mixv, 0.999);
    col += vec3(1.,.85,.6)*edge*0.6;
    col *= 0.92 + 0.08*sin(gl_FragCoord.y*1.6);
    col += (h2(gl_FragCoord.xy+time)-0.5)*0.05;
    vec2 q = v-0.5; col *= 1.-dot(q,q)*0.9;
    gl_FragColor = vec4(col,1.);
  }`;

const TRANS = 0.55; // viewport heights spent transitioning at the end of each segment
const TOTAL = SEGMENTS.reduce((a, s) => a + s.len, 0);
const GLYPHS = "▓▒░█<>/\\=+*#01";

// Within a fly-through segment: which project, and how far along its flight (0..1).
function flight(seg: Segment, t: number) {
  const n = seg.projs?.length || 1;
  const usable = 1 - Math.min(TRANS, seg.len * 0.5) / seg.len;
  const tt = Math.min(t / usable, 0.9999);
  const k = Math.min(n - 1, Math.floor(tt * n));
  return { k, u: tt * n - k };
}
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

const esc = (s: string) =>
  s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);

export interface JourneyHandle {
  setLang: (lang: Lang) => void;
  destroy: () => void;
}

export function startJourney(root: HTMLElement, initialLang: Lang): JourneyHandle {
  let lang: Lang = initialLang;
  let alive = true;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const q = <T extends HTMLElement = HTMLElement>(s: string) => root.querySelector(s) as T;
  const scenes = Array.from(root.querySelectorAll<HTMLElement>(".scene"));
  const ticks = Array.from(root.querySelectorAll<HTMLElement>(".j-ticks i"));
  const projScene = q(".s-proj");
  const win = q(".j-win");
  let curKey = "";

  // ---------- Text ----------
  function scramble(el: HTMLElement, text: string) {
    if (reduce) { el.textContent = text; return; }
    const start = performance.now();
    const dur = 380;
    const step = (now: number) => {
      if (!alive) return;
      const p = Math.min(1, (now - start) / dur);
      const n = Math.floor(p * text.length);
      let out = text.slice(0, n);
      for (let i = n; i < text.length; i++) out += text[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      el.textContent = out;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function applyLang() {
    const d = UI[lang];
    q("#j-name").textContent = d.name;
    q("#j-tagline").innerHTML = d.tagline.map((t) => `<span>${esc(t)}</span>`).join("");
    q("#j-cue").textContent = d.cue;
    q("#j-lang").textContent = d.lang;
    q("#j-classic").textContent = d.classic;
    q("#j-sound").textContent = audio.on ? d.soundOn : d.soundOff;
    curKey = "";
  }

  function showProject(k: number) {
    const p = PROJECTS[k];
    const i = lang === "en" ? 0 : 1;
    q("#j-win-title").textContent = p.file;
    q("#j-proj-id").textContent = "PROJECT_0" + (k + 1);
    q("#j-proj-count").textContent = "0" + (k + 1) + " / 0" + PROJECTS.length;
    scramble(q("#j-proj-name"), p.title);
    q("#j-proj-sub").textContent = p.sub[i];
    q("#j-proj-desc").textContent = p.desc[i];
    q("#j-proj-tags").innerHTML = p.tags[i].map((t) => `<span>${esc(t)}</span>`).join("");
    const cta = q<HTMLAnchorElement>("#j-proj-cta");
    cta.textContent = p.cta[i];
    cta.href = p.href;
  }

  // ---------- Audio: generated hum + channel-change click ----------
  const audio: { on: boolean; ctx: AudioContext | null; gain: GainNode | null } = { on: false, ctx: null, gain: null };
  function setSound(on: boolean) {
    audio.on = on;
    if (on && !audio.ctx) {
      const AC =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AC) {
        const ctx: AudioContext = new AC();
        const g = ctx.createGain();
        g.gain.value = 0;
        g.connect(ctx.destination);
        [55, 110.4, 165.2].forEach((f, i) => {
          const o = ctx.createOscillator();
          o.type = i ? "sine" : "triangle";
          o.frequency.value = f;
          const og = ctx.createGain();
          og.gain.value = [0.05, 0.02, 0.008][i];
          o.connect(og).connect(g);
          o.start();
        });
        audio.ctx = ctx;
        audio.gain = g;
      }
    }
    if (audio.ctx) {
      audio.ctx.resume();
      audio.gain!.gain.setTargetAtTime(on ? 1 : 0, audio.ctx.currentTime, 0.3);
    }
    const btn = q("#j-sound");
    btn.setAttribute("aria-pressed", String(on));
    btn.textContent = on ? UI[lang].soundOn : UI[lang].soundOff;
  }
  function click() {
    if (!audio.on || !audio.ctx) return;
    const ctx = audio.ctx;
    const n = Math.floor(ctx.sampleRate * 0.06);
    const b = ctx.createBuffer(1, n, ctx.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n) * 0.35;
    const s = ctx.createBufferSource();
    s.buffer = b;
    s.connect(ctx.destination);
    s.start();
  }
  const onSound = () => setSound(!audio.on);
  q("#j-sound").addEventListener("click", onSound);

  // ---------- WebGL ----------
  const canvas = q<HTMLCanvasElement>("#j-stage");
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false }) as WebGLRenderingContext | null;
  const loc: Record<string, WebGLUniformLocation | null> = {};
  const texs: WebGLTexture[] = [];
  const sizes: [number, number][] = [];
  let ready = false;

  function compile(type: number, src: string) {
    const s = gl!.createShader(type)!;
    gl!.shaderSource(s, src);
    gl!.compileShader(s);
    if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) throw new Error(gl!.getShaderInfoLog(s) || "shader error");
    return s;
  }
  function initGL() {
    const prog = gl!.createProgram()!;
    gl!.attachShader(prog, compile(gl!.VERTEX_SHADER, VS));
    gl!.attachShader(prog, compile(gl!.FRAGMENT_SHADER, FS));
    gl!.linkProgram(prog);
    gl!.useProgram(prog);
    const buf = gl!.createBuffer();
    gl!.bindBuffer(gl!.ARRAY_BUFFER, buf);
    gl!.bufferData(gl!.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl!.STATIC_DRAW);
    const p = gl!.getAttribLocation(prog, "p");
    gl!.enableVertexAttribArray(p);
    gl!.vertexAttribPointer(p, 2, gl!.FLOAT, false, 0, 0);
    ["t0", "t1", "res", "s0", "s1", "f0", "f1", "mouse", "z0", "z1", "mixv", "glitch", "time"].forEach(
      (n) => (loc[n] = gl!.getUniformLocation(prog, n)),
    );
    gl!.uniform1i(loc.t0, 0);
    gl!.uniform1i(loc.t1, 1);
  }
  function makeTex(img: HTMLImageElement) {
    const t = gl!.createTexture()!;
    gl!.bindTexture(gl!.TEXTURE_2D, t);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MAG_FILTER, gl!.LINEAR);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE);
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE);
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGB, gl!.RGB, gl!.UNSIGNED_BYTE, img);
    return t;
  }
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(innerWidth * dpr);
    canvas.height = Math.round(innerHeight * dpr);
    if (gl) gl.viewport(0, 0, canvas.width, canvas.height);
    q("#j-track").style.height = `${(TOTAL + 1) * 100}vh`;
  }

  // ---------- Scroll mapping ----------
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  const onMove = (e: PointerEvent) => {
    mouse.tx = (e.clientX / innerWidth - 0.5) * 2;
    mouse.ty = (e.clientY / innerHeight - 0.5) * 2;
  };
  addEventListener("pointermove", onMove, { passive: true });

  function state() {
    const p = scrollY / innerHeight;
    let acc = 0;
    for (let i = 0; i < SEGMENTS.length; i++) {
      const s = SEGMENTS[i];
      if (p < acc + s.len || i === SEGMENTS.length - 1) {
        const local = Math.min(Math.max(p - acc, 0), s.len);
        const tr = Math.min(TRANS, s.len * 0.5);
        const mixv = i < SEGMENTS.length - 1 ? Math.min(Math.max((local - (s.len - tr)) / tr, 0), 1) : 0;
        return { i, t: local / s.len, mixv };
      }
      acc += s.len;
    }
    return { i: 0, t: 0, mixv: 0 };
  }

  let glitchKick = 0;
  function update() {
    const st = state();
    if (st.i === SEGMENTS.length - 1) { scrollTo(0, 0); return null; } // loop back to the doorway
    const si = st.mixv > 0.5 ? st.i + 1 : st.i;
    const seg = SEGMENTS[si] || SEGMENTS[0];
    const sceneIdx = si % 6;
    let projK = -1;
    if (seg.ui === "proj" && seg.projs) {
      if (si === st.i) projK = seg.projs[flight(seg, st.t).k];
      else projK = seg.projs[0];
    }
    const key = `${lang}|${sceneIdx}|${projK}`;
    if (key !== curKey) {
      const prev = curKey;
      curKey = key;
      scenes.forEach((s) => s.classList.toggle("on", s.dataset.ui === seg.ui));
      projScene.classList.toggle("at-right", seg.pos === "at-right");
      projScene.classList.toggle("at-left", seg.pos === "at-left");
      if (projK >= 0) showProject(projK);
      ticks.forEach((t, k) => t.classList.toggle("on", k <= sceneIdx));
      q("#j-scene").textContent = String(sceneIdx + 1).padStart(2, "0") + " · " + UI[lang].scenes[sceneIdx];
      if (prev && prev.split("|")[0] === lang) {
        click();
        if (projK >= 0) glitchKick = 0.8;
      }
    }
    return st;
  }

  let raf = 0;
  function frame(now: number) {
    if (!alive) return;
    const st = update();
    if (st && ready && gl) {
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      const a = SEGMENTS[st.i];
      const b = SEGMENTS[Math.min(st.i + 1, SEGMENTS.length - 1)];
      const ease = (x: number) => x * x * (3 - 2 * x);
      let za = a.z0 + (a.z1 - a.z0) * ease(Math.min(st.t, 1));
      if (a.fly) {
        // Accelerate down the tunnel toward the end screen; the card grows out of it on arrival.
        const { u } = flight(a, st.t);
        const f = clamp01(u / 0.72);
        za = Math.exp(Math.log(a.fly) * f * f);
        const c = clamp01((u - 0.5) / 0.26);
        const grow = 1 - Math.pow(1 - c, 3);
        win.style.transform = `scale(${(0.18 + 0.82 * grow).toFixed(4)})`;
        win.style.opacity = String(clamp01(c * 2.5) * (1 - clamp01(st.mixv * 2)));
        win.style.filter = c < 1 ? `blur(${((1 - c) * 6).toFixed(2)}px)` : "";
      } else if (win.style.transform) {
        win.style.transform = ""; win.style.opacity = ""; win.style.filter = "";
      }
      glitchKick *= 0.9;
      const g = reduce ? 0 : Math.min(1, Math.sin(Math.PI * st.mixv) * 0.9 + glitchKick + (Math.random() < 0.01 ? 0.25 : 0));
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texs[a.img]);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, texs[b.img]);
      gl.uniform2f(loc.res, canvas.width, canvas.height);
      gl.uniform2f(loc.s0, sizes[a.img][0], sizes[a.img][1]);
      gl.uniform2f(loc.s1, sizes[b.img][0], sizes[b.img][1]);
      gl.uniform2f(loc.f0, a.fx, a.fy);
      gl.uniform2f(loc.f1, b.fx, b.fy);
      gl.uniform2f(loc.mouse, reduce ? 0 : mouse.x, reduce ? 0 : mouse.y);
      gl.uniform1f(loc.z0, za);
      gl.uniform1f(loc.z1, b.z0);
      gl.uniform1f(loc.mixv, st.mixv);
      gl.uniform1f(loc.glitch, g);
      gl.uniform1f(loc.time, now / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    raf = requestAnimationFrame(frame);
  }

  // ---------- Boot ----------
  const boot = q("#j-boot");
  const finish = () => boot.classList.add("gone");
  const bootTimer = window.setTimeout(finish, 9000); // never trap the page behind the loader
  let done = 0;
  const imgs: HTMLImageElement[] = [];
  SCENE_IMAGES.forEach((src, i) => {
    const im = new Image();
    im.decoding = "async";
    im.onload = im.onerror = () => {
      if (!alive) return;
      done++;
      const pct = Math.round((done / SCENE_IMAGES.length) * 100);
      q("#j-boot-pct").textContent = pct + "%";
      q("#j-boot-bar").style.width = pct + "%";
      if (done === SCENE_IMAGES.length) {
        try {
          if (gl) {
            initGL();
            imgs.forEach((m, k) => {
              texs[k] = makeTex(m);
              sizes[k] = [m.naturalWidth || 16, m.naturalHeight || 9];
            });
            ready = true;
          }
        } catch (e) {
          console.error(e);
        }
        window.setTimeout(finish, 250);
      }
    };
    im.src = src;
    imgs[i] = im;
  });

  addEventListener("resize", resize);
  resize();
  applyLang();
  update();
  raf = requestAnimationFrame(frame);

  return {
    setLang(next: Lang) {
      lang = next;
      applyLang();
      update();
    },
    destroy() {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(bootTimer);
      removeEventListener("resize", resize);
      removeEventListener("pointermove", onMove);
      q("#j-sound")?.removeEventListener("click", onSound);
      audio.ctx?.close();
      if (gl) texs.forEach((t) => gl.deleteTexture(t));
    },
  };
}
