import * as THREE from "three";
import { PROJECTS, STOP_COUNT, type PlanetLook } from "./content";

// ---------- Shaders ----------
const NOISE = /* glsl */ `
  float hash(vec3 p){ p = fract(p*0.3183099+0.1); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
  float vnoise(vec3 x){
    vec3 i = floor(x); vec3 f = fract(x); f = f*f*(3.0-2.0*f);
    return mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),
                   mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
               mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),
                   mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
  }
  float fbm(vec3 p){
    float a = 0.5; float s = 0.0;
    for(int i=0;i<5;i++){ s += a*vnoise(p); p = p*2.03+vec3(1.7,9.2,3.1); a *= 0.5; }
    return s;
  }
`;

const BODY_VERT = /* glsl */ `
  varying vec3 vObj; varying vec3 vN; varying vec3 vW;
  void main(){
    vObj = position;
    vN = normalize(mat3(modelMatrix)*normal);
    vec4 w = modelMatrix*vec4(position,1.0);
    vW = w.xyz;
    gl_Position = projectionMatrix*viewMatrix*w;
  }
`;

const PLANET_FRAG = /* glsl */ `
  uniform vec3 uC1; uniform vec3 uC2; uniform vec3 uC3; uniform vec3 uAtmo; uniform vec3 uLight;
  uniform float uType; uniform float uTime; uniform float uSeed;
  varying vec3 vObj; varying vec3 vN; varying vec3 vW;
  ${NOISE}
  void main(){
    vec3 p = normalize(vObj);
    vec3 col;
    if(uType < 0.5){
      float h = fbm(p*2.2+uSeed);
      float h2 = fbm(p*6.0+uSeed*2.0);
      float t = smoothstep(0.32,0.72,h*0.75+h2*0.25);
      col = mix(uC1,uC2,smoothstep(0.0,0.55,t));
      col = mix(col,uC3,smoothstep(0.62,1.0,t));
      float cl = fbm(p*3.5+vec3(uTime*0.02,0.0,uSeed*3.0));
      col = mix(col,vec3(1.0),smoothstep(0.56,0.8,cl)*0.5);
    } else {
      float w = fbm(p*vec3(1.5,6.0,1.5)+uSeed);
      float b = sin(p.y*14.0+w*5.0+uSeed)*0.5+0.5;
      float b2 = fbm(vec3(p.x*2.0+uTime*0.01,p.y*18.0,p.z*2.0)+uSeed);
      col = mix(uC1,uC2,b);
      col = mix(col,uC3,smoothstep(0.5,0.9,b2)*0.7);
    }
    vec3 N = normalize(vN);
    vec3 V = normalize(cameraPosition-vW);
    float lit = smoothstep(-0.15,0.6,dot(N,uLight));
    float fres = pow(1.0-max(dot(N,V),0.0),3.0);
    vec3 c = col*(0.035+lit*1.05)+uAtmo*fres*(0.12+lit*0.9);
    gl_FragColor = vec4(c,1.0);
    #include <colorspace_fragment>
  }
`;

const ATMO_FRAG = /* glsl */ `
  uniform vec3 uAtmo; uniform vec3 uLight;
  varying vec3 vObj; varying vec3 vN; varying vec3 vW;
  void main(){
    vec3 N = normalize(vN);
    vec3 V = normalize(cameraPosition-vW);
    float a = pow(clamp(-dot(N,V)/0.55,0.0,1.0),3.0);
    float lit = smoothstep(-0.5,0.5,dot(N,uLight));
    gl_FragColor = vec4(uAtmo*a*(0.15+lit*0.85),1.0);
    #include <colorspace_fragment>
  }
`;

const RING_FRAG = /* glsl */ `
  uniform vec3 uC2; uniform vec3 uC3; uniform float uInner; uniform float uOuter;
  varying vec3 vObj;
  float h1(float n){ return fract(sin(n*12.9898)*43758.5453); }
  void main(){
    float t = (length(vObj.xy)-uInner)/(uOuter-uInner);
    float x = t*46.0; float i = floor(x); float f = fract(x);
    float band = mix(h1(i),h1(i+1.0),smoothstep(0.0,1.0,f));
    float edge = smoothstep(0.0,0.06,t)*smoothstep(1.0,0.9,t);
    vec3 c = mix(uC2,uC3,band);
    gl_FragColor = vec4(c,(0.15+band*0.6)*edge);
    #include <colorspace_fragment>
  }
`;

const POINT_VERT = /* glsl */ `
  attribute float aSize; attribute float aPhase; attribute vec3 aColor;
  uniform float uTime; uniform float uScale; uniform float uAttenuate; uniform float uTwinkle;
  varying vec3 vColor;
  void main(){
    vColor = aColor;
    vec4 mv = modelViewMatrix*vec4(position,1.0);
    float tw = 1.0+uTwinkle*0.45*sin(uTime*(0.6+aPhase*0.25)+aPhase*6.2831);
    float size = aSize*tw*uScale;
    if(uAttenuate > 0.5) size *= 120.0/max(-mv.z,1.0);
    gl_PointSize = size;
    gl_Position = projectionMatrix*mv;
  }
`;

const POINT_FRAG = /* glsl */ `
  varying vec3 vColor; uniform float uOpacity;
  void main(){
    float d = length(gl_PointCoord-0.5);
    float a = smoothstep(0.5,0.0,d);
    gl_FragColor = vec4(vColor,a*a*uOpacity);
    #include <colorspace_fragment>
  }
`;

const NEBULA_FRAG = /* glsl */ `
  varying vec3 vObj;
  ${NOISE}
  void main(){
    vec3 d = normalize(vObj);
    float n = fbm(d*1.7+3.0);
    float n2 = fbm(d*3.4+11.0);
    float n3 = fbm(d*2.4-7.0);
    vec3 c = vec3(0.012,0.014,0.04);
    c += vec3(0.16,0.07,0.34)*smoothstep(0.46,0.82,n)*0.55;
    c += vec3(0.03,0.2,0.32)*smoothstep(0.5,0.85,n2)*0.4;
    c += vec3(0.34,0.08,0.22)*smoothstep(0.58,0.9,n3)*0.25;
    gl_FragColor = vec4(c,1.0);
    #include <colorspace_fragment>
  }
`;

// ---------- Helpers ----------
const LIGHT = new THREE.Vector3(-0.62, 0.42, 0.66).normalize();
const SPACING = 160;

function mulberry(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function smoother(x: number) {
  const t = Math.min(1, Math.max(0, x));
  return t * t * t * (t * (t * 6 - 15) + 10);
}

export interface SpaceHandle {
  setTarget(progress: number): void;
  dispose(): void;
}

export interface SpaceOptions {
  onFrame(progress: number): void;
  reducedMotion: boolean;
}

export function createSpace(canvas: HTMLCanvasElement, opts: SpaceOptions): SpaceHandle {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  const coarse = matchMedia("(pointer: coarse)").matches;
  const pixelRatio = Math.min(devicePixelRatio || 1, coarse ? 1.5 : 2);
  renderer.setPixelRatio(pixelRatio);
  renderer.setClearColor(0x03040b, 1);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2400);
  const disposables: { dispose(): void }[] = [];
  const timeUniforms: { value: number }[] = [];
  const spinners: { obj: THREE.Object3D; speed: number }[] = [];
  const orbiters: { obj: THREE.Object3D; r: number; speed: number; phase: number; tilt: number }[] = [];

  const track = <T extends { dispose(): void }>(x: T) => {
    disposables.push(x);
    return x;
  };

  const sphereHi = track(new THREE.SphereGeometry(1, 96, 64));
  const sphereLo = track(new THREE.SphereGeometry(1, 32, 24));

  function planetMaterial(look: Pick<PlanetLook, "kind" | "colors" | "atmosphere">, seed: number) {
    const uTime = { value: 0 };
    timeUniforms.push(uTime);
    return track(
      new THREE.ShaderMaterial({
        vertexShader: BODY_VERT,
        fragmentShader: PLANET_FRAG,
        uniforms: {
          uC1: { value: new THREE.Color(look.colors[0]) },
          uC2: { value: new THREE.Color(look.colors[1]) },
          uC3: { value: new THREE.Color(look.colors[2]) },
          uAtmo: { value: new THREE.Color(look.atmosphere) },
          uLight: { value: LIGHT },
          uType: { value: look.kind === "gas" ? 1 : 0 },
          uTime,
          uSeed: { value: seed },
        },
      }),
    );
  }

  function addAtmosphere(parent: THREE.Object3D, radius: number, color: string, scale = 1.18) {
    const mat = track(
      new THREE.ShaderMaterial({
        vertexShader: BODY_VERT,
        fragmentShader: ATMO_FRAG,
        uniforms: { uAtmo: { value: new THREE.Color(color) }, uLight: { value: LIGHT } },
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
        depthWrite: false,
      }),
    );
    const mesh = new THREE.Mesh(sphereLo, mat);
    mesh.scale.setScalar(radius * scale);
    parent.add(mesh);
  }

  function addMoon(group: THREE.Group, r: number, orbit: number, speed: number, phase: number, tilt: number, colors: [string, string, string]) {
    const mat = planetMaterial({ kind: "terrain", colors, atmosphere: colors[2] }, phase * 10 + 3);
    const moon = new THREE.Mesh(sphereLo, mat);
    moon.scale.setScalar(r);
    group.add(moon);
    orbiters.push({ obj: moon, r: orbit, speed, phase, tilt });
  }

  // ---------- Bodies ----------
  const bodies: { pos: THREE.Vector3; radius: number }[] = [];

  PROJECTS.forEach((project, idx) => {
    const k = idx + 1;
    const look = project.look;
    const side = k % 2 === 1 ? -1 : 1;
    const pos = new THREE.Vector3(side * 12, Math.sin(k * 1.7) * 14, -k * SPACING);
    bodies.push({ pos, radius: look.radius });

    const group = new THREE.Group();
    group.position.copy(pos);
    scene.add(group);

    const planet = new THREE.Mesh(sphereHi, planetMaterial(look, k * 7.3));
    planet.scale.setScalar(look.radius);
    planet.rotation.z = 0.2 + idx * 0.07;
    group.add(planet);
    spinners.push({ obj: planet, speed: look.kind === "gas" ? 0.05 : 0.03 });
    addAtmosphere(group, look.radius, look.atmosphere);

    const R = look.radius;
    if (look.extra === "moon") {
      addMoon(group, R * 0.16, R * 2.0, 0.22, 0.4, 0.25, ["#30343c", "#8a9099", "#e6eaf0"]);
    } else if (look.extra === "moons") {
      addMoon(group, R * 0.13, R * 1.8, 0.26, 1.2, 0.2, ["#3c2a52", "#a57be0", "#f3dcff"]);
      addMoon(group, R * 0.09, R * 2.4, -0.17, 3.6, -0.35, ["#33303a", "#8d8799", "#eeeaf5"]);
    } else if (look.extra === "trio") {
      addMoon(group, R * 0.12, R * 1.75, 0.24, 0.0, 0.3, ["#5a2a00", "#ff8a1f", "#ffd9a8"]);
      addMoon(group, R * 0.12, R * 2.1, 0.19, 2.1, 0.3, ["#0b4a22", "#2edc6e", "#c9ffd9"]);
      addMoon(group, R * 0.12, R * 2.45, 0.15, 4.2, 0.3, ["#0c3c58", "#4fc3f7", "#d6f2ff"]);
    } else if (look.extra === "rings") {
      const inner = R * 1.45;
      const outer = R * 2.35;
      const geo = track(new THREE.RingGeometry(inner, outer, 160, 1));
      const mat = track(
        new THREE.ShaderMaterial({
          vertexShader: BODY_VERT,
          fragmentShader: RING_FRAG,
          uniforms: {
            uC2: { value: new THREE.Color(look.colors[1]) },
            uC3: { value: new THREE.Color(look.colors[2]) },
            uInner: { value: inner },
            uOuter: { value: outer },
          },
          side: THREE.DoubleSide,
          transparent: true,
          depthWrite: false,
        }),
      );
      const ring = new THREE.Mesh(geo, mat);
      ring.rotation.set(-Math.PI / 2 + 0.38, 0.22, 0);
      group.add(ring);
    } else if (look.extra === "swarm") {
      // A belt of small satellites: one for each cluster of tools in the directory.
      const count = 220;
      const rand = mulberry(41);
      const positions = new Float32Array(count * 3);
      const sizes = new Float32Array(count);
      const phases = new Float32Array(count);
      const colors = new Float32Array(count * 3);
      const c = new THREE.Color();
      for (let i = 0; i < count; i++) {
        const a = rand() * Math.PI * 2;
        const rr = R * (1.55 + rand() * 0.9);
        positions.set([Math.cos(a) * rr, (rand() - 0.5) * R * 0.22, Math.sin(a) * rr], i * 3);
        sizes[i] = 1.2 + rand() * 2.4;
        phases[i] = rand();
        c.set(rand() > 0.5 ? look.colors[2] : look.atmosphere);
        colors.set([c.r, c.g, c.b], i * 3);
      }
      const belt = makePoints(positions, sizes, phases, colors, true, 1);
      belt.rotation.set(0.32, 0, 0.18);
      group.add(belt);
      spinners.push({ obj: belt, speed: 0.06 });
    } else if (look.extra === "orbits") {
      // Three crossed orbits with an electron each, like an atom.
      const torus = track(new THREE.TorusGeometry(R * 1.9, 0.025, 8, 160));
      const lineMat = track(new THREE.MeshBasicMaterial({ color: look.atmosphere, transparent: true, opacity: 0.55 }));
      [0, 1, 2].forEach((i) => {
        const tilt = (i * Math.PI) / 3;
        const holder = new THREE.Group();
        holder.rotation.set(Math.PI / 2 - 0.35, 0, tilt);
        holder.add(new THREE.Mesh(torus, lineMat));
        const electron = new THREE.Mesh(sphereLo, track(new THREE.MeshBasicMaterial({ color: look.colors[2] })));
        electron.scale.setScalar(R * 0.07);
        holder.add(electron);
        group.add(holder);
        orbiters.push({ obj: electron, r: R * 1.9, speed: 0.5 + i * 0.12, phase: i * 2.1, tilt: -999 });
      });
    }
  });

  // Opening shot: the camera lifts off over the limb of a large dark world.
  const HOME_R = 60;
  const homeLook = { kind: "terrain" as const, colors: ["#04101f", "#0f3a5c", "#9fd0e8"] as [string, string, string], atmosphere: "#5aa9ff" };
  const home = new THREE.Mesh(sphereHi, planetMaterial(homeLook, 2.4));
  home.scale.setScalar(HOME_R);
  home.position.set(0, -63, -5);
  scene.add(home);
  spinners.push({ obj: home, speed: 0.006 });
  addAtmosphere(home, 1, homeLook.atmosphere, 1.05);

  // Closing shot: a spiral galaxy behind the links.
  const GALAXY_POS = new THREE.Vector3(0, -14, -(STOP_COUNT - 1) * SPACING - 140);
  {
    const count = coarse ? 9000 : 16000;
    const rand = mulberry(7);
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const core = new THREE.Color("#ffd9a0");
    const arm = new THREE.Color("#6f8cff");
    const pink = new THREE.Color("#ff7ad9");
    const c = new THREE.Color();
    for (let i = 0; i < count; i++) {
      const t = Math.pow(rand(), 1.6);
      const r = 3 + t * 44;
      const branch = (i % 3) * ((Math.PI * 2) / 3);
      const angle = branch + r * 0.11;
      const spread = (0.6 + t * 4.5) * Math.pow(rand(), 2) * (rand() < 0.5 ? -1 : 1);
      const spreadZ = (0.6 + t * 4.5) * Math.pow(rand(), 2) * (rand() < 0.5 ? -1 : 1);
      positions.set(
        [Math.cos(angle) * r + spread, (rand() - 0.5) * (3.2 - t * 2.4), Math.sin(angle) * r + spreadZ],
        i * 3,
      );
      sizes[i] = 0.8 + rand() * 2.1;
      phases[i] = rand();
      c.copy(core).lerp(rand() > 0.82 ? pink : arm, Math.min(1, t * 1.5));
      colors.set([c.r, c.g, c.b], i * 3);
    }
    const galaxy = makePoints(positions, sizes, phases, colors, true, 0.78);
    galaxy.position.copy(GALAXY_POS);
    galaxy.rotation.set(0.5, 0, 0.18);
    scene.add(galaxy);
    spinners.push({ obj: galaxy, speed: 0.02 });
  }

  // ---------- Sky ----------
  const sky = new THREE.Group();
  scene.add(sky);
  {
    const nebula = new THREE.Mesh(
      sphereLo,
      track(new THREE.ShaderMaterial({ vertexShader: BODY_VERT, fragmentShader: NEBULA_FRAG, side: THREE.BackSide, depthWrite: false })),
    );
    nebula.scale.setScalar(1800);
    nebula.renderOrder = -2;
    sky.add(nebula);

    const count = coarse ? 3500 : 6500;
    const rand = mulberry(99);
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const palette = ["#ffffff", "#cfe0ff", "#ffe9c9", "#b9c8ff", "#ffd0e6"].map((h) => new THREE.Color(h));
    for (let i = 0; i < count; i++) {
      const u = rand() * 2 - 1;
      const a = rand() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      positions.set([Math.cos(a) * s * 900, u * 900, Math.sin(a) * s * 900], i * 3);
      sizes[i] = 0.9 + Math.pow(rand(), 5) * 3.6;
      phases[i] = rand();
      const c = palette[Math.floor(rand() * palette.length)];
      const dim = 0.45 + rand() * 0.55;
      colors.set([c.r * dim, c.g * dim, c.b * dim], i * 3);
    }
    const stars = makePoints(positions, sizes, phases, colors, false, 1);
    stars.renderOrder = -1;
    sky.add(stars);
  }

  // Dust close to the flight path, for a sense of speed.
  {
    const count = coarse ? 900 : 1800;
    const rand = mulberry(5);
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const phases = new Float32Array(count);
    const colors = new Float32Array(count * 3);
    const length = (STOP_COUNT - 1) * SPACING + 160;
    for (let i = 0; i < count; i++) {
      const a = rand() * Math.PI * 2;
      const r = 6 + rand() * 60;
      positions.set([Math.cos(a) * r, Math.sin(a) * r * 0.7, 60 - rand() * length], i * 3);
      sizes[i] = 0.5 + rand() * 1.1;
      phases[i] = rand();
      const v = 0.5 + rand() * 0.5;
      colors.set([v * 0.8, v * 0.9, v], i * 3);
    }
    scene.add(makePoints(positions, sizes, phases, colors, true, 0.7));
  }

  function makePoints(
    positions: Float32Array,
    sizes: Float32Array,
    phases: Float32Array,
    colors: Float32Array,
    attenuate: boolean,
    opacity: number,
  ) {
    const geo = track(new THREE.BufferGeometry());
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    const uTime = { value: 0 };
    timeUniforms.push(uTime);
    const mat = track(
      new THREE.ShaderMaterial({
        vertexShader: POINT_VERT,
        fragmentShader: POINT_FRAG,
        uniforms: {
          uTime,
          uScale: { value: pixelRatio },
          uAttenuate: { value: attenuate ? 1 : 0 },
          uTwinkle: { value: opts.reducedMotion ? 0 : 1 },
          uOpacity: { value: opacity },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    );
    const points = new THREE.Points(geo, mat);
    points.frustumCulled = false;
    return points;
  }

  // ---------- Camera path ----------
  const camPositions: THREE.Vector3[] = [];
  const camTargets: THREE.Vector3[] = [];
  let curve = new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(0, 0, -1)]);

  function layout() {
    const w = canvas.clientWidth || innerWidth;
    const h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false);
    const aspect = w / h;
    camera.aspect = aspect;
    camera.fov = aspect < 0.8 ? 58 : 50;
    camera.updateProjectionMatrix();
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const portrait = aspect < 0.9;

    camPositions.length = 0;
    camTargets.length = 0;
    camPositions.push(new THREE.Vector3(0, 2, 42));
    camTargets.push(new THREE.Vector3(0, 4, -SPACING));

    bodies.forEach((body, idx) => {
      const side = (idx + 1) % 2 === 1 ? -1 : 1;
      const r = body.radius;
      if (portrait) {
        // Planet in the upper part of the screen, card below.
        const d = Math.max(r * 3.4, r / (0.6 * tanHalf * aspect));
        const drop = 0.42 * d * tanHalf;
        camPositions.push(new THREE.Vector3(body.pos.x, body.pos.y - drop, body.pos.z + d));
        camTargets.push(new THREE.Vector3(body.pos.x, body.pos.y - drop, body.pos.z));
      } else {
        // Planet on one side of the screen, card on the other.
        const d = r * 3.5;
        const shift = Math.min(r * 1.5, 0.46 * d * tanHalf * aspect);
        const x = body.pos.x - side * shift;
        camPositions.push(new THREE.Vector3(x, body.pos.y + r * 0.35, body.pos.z + d));
        camTargets.push(new THREE.Vector3(x, body.pos.y, body.pos.z));
      }
    });

    const far = portrait ? 120 : 72;
    camPositions.push(new THREE.Vector3(GALAXY_POS.x, GALAXY_POS.y + far * 0.42, GALAXY_POS.z + far));
    camTargets.push(new THREE.Vector3(GALAXY_POS.x, GALAXY_POS.y + (portrait ? -6 : 9), GALAXY_POS.z));

    curve = new THREE.CatmullRomCurve3(camPositions, false, "centripetal");
  }

  // ---------- Loop ----------
  let target = 0;
  let current = 0;
  let raf = 0;
  let last = performance.now();
  let elapsed = 0;
  const pointer = new THREE.Vector2();
  const sway = new THREE.Vector2();
  const tmpTarget = new THREE.Vector3();
  const tmpPos = new THREE.Vector3();
  const last_ = STOP_COUNT - 1;

  function frame(now: number) {
    raf = requestAnimationFrame(frame);
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    if (!opts.reducedMotion) elapsed += dt;

    current = opts.reducedMotion ? target : current + (target - current) * (1 - Math.exp(-dt * 4.5));
    const clamped = Math.min(last_, Math.max(0, current));
    const i = Math.min(last_ - 1, Math.floor(clamped));
    const e = smoother((clamped - i - 0.14) / 0.72);

    curve.getPoint((i + e) / last_, tmpPos);
    tmpTarget.copy(camTargets[i]).lerp(camTargets[i + 1], e);

    sway.lerp(pointer, 1 - Math.exp(-dt * 3));
    camera.position.copy(tmpPos);
    camera.lookAt(tmpTarget);
    if (!opts.reducedMotion) {
      camera.translateX(sway.x * 0.9);
      camera.translateY(sway.y * 0.6);
      camera.lookAt(tmpTarget);
    }
    sky.position.copy(camera.position);

    for (const u of timeUniforms) u.value = elapsed;
    for (const s of spinners) s.obj.rotation.y = elapsed * s.speed;
    for (const o of orbiters) {
      const a = o.phase + elapsed * o.speed;
      if (o.tilt === -999) o.obj.position.set(Math.cos(a) * o.r, Math.sin(a) * o.r, 0);
      else o.obj.position.set(Math.cos(a) * o.r, Math.sin(a) * o.r * Math.sin(o.tilt), Math.sin(a) * o.r * Math.cos(o.tilt));
    }

    renderer.render(scene, camera);
    opts.onFrame(clamped);
  }

  const onPointer = (ev: PointerEvent) => {
    if (ev.pointerType === "touch") return;
    pointer.set((ev.clientX / innerWidth) * 2 - 1, -((ev.clientY / innerHeight) * 2 - 1));
  };
  const onResize = () => layout();
  addEventListener("pointermove", onPointer, { passive: true });
  addEventListener("resize", onResize);

  layout();
  raf = requestAnimationFrame(frame);

  return {
    setTarget(progress: number) {
      target = progress;
    },
    dispose() {
      cancelAnimationFrame(raf);
      removeEventListener("pointermove", onPointer);
      removeEventListener("resize", onResize);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
    },
  };
}
