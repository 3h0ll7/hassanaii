// Site content, word for word from the existing pages (Index.tsx / SpotlightHero.tsx).
// Each bilingual field is [English, Arabic].

export type Bilingual = [string, string];

export interface JourneyProject {
  file: string;
  title: string;
  sub: Bilingual;
  desc: Bilingual;
  tags: [string[], string[]];
  cta: Bilingual;
  href: string;
}

export const PROJECTS: JourneyProject[] = [
  {
    file: "digital-nurse.exe",
    title: "Digital Nurse",
    sub: ["Clinical Reference App", "تطبيق مرجعي سريري"],
    desc: [
      "Evidence-based nursing procedures, clinical calculators, and professional healthcare resources. Built for healthcare professionals.",
      "إجراءات تمريضية مبنية على الأدلة، حاسبات سريرية، وموارد رعاية صحية مهنية. مصمم لمتخصصي الرعاية الصحية.",
    ],
    tags: [
      ["Clinical Procedures", "Medical Calculators", "Drug References", "AI Assistant"],
      ["إجراءات سريرية", "حاسبات طبية", "مراجع أدوية", "مساعد ذكي"],
    ],
    cta: ["Explore the App", "استكشف التطبيق"],
    href: "https://digital-nurse-buddy.lovable.app",
  },
  {
    file: "letterboxd.exe",
    title: "Letterboxd",
    sub: ["Cinema Journal", "يوميات السينما"],
    desc: [
      "My curated film journal — Top 100, Beyond Amazing, Space, and more. Cinema is my home, I think I've always lived in it.",
      "يوميات أفلامي المنسّقة — Top 100، Beyond Amazing، Space والمزيد. السينما هي بيتي، وأظن أنني عشت فيها دائماً.",
    ],
    tags: [
      ["Film Lists", "Reviews", "Watchlist", "Cinema"],
      ["قوائم أفلام", "مراجعات", "قائمة مشاهدة", "سينما"],
    ],
    cta: ["View Profile", "عرض الملف"],
    href: "https://boxd.it/7RQST",
  },
  {
    file: "cosmic.exe",
    title: "Cosmic Taxonomy Engine",
    sub: ["AI-Powered Cosmic Explorer", "مستكشف كوني بالذكاء الاصطناعي"],
    desc: [
      "An interactive AI-powered taxonomy engine for exploring exoplanets, stars, nebulae, galaxies, and space missions through cosmic classification and cladistic visualization.",
      "محرك تصنيف تفاعلي بالذكاء الاصطناعي لاستكشاف الكواكب الخارجية والنجوم والسدم والمجرات والمهام الفضائية عبر التصنيف الكوني والتصور التفرعي.",
    ],
    tags: [
      ["Exoplanets", "Stars", "Nebulae", "Galaxies", "Space Missions"],
      ["كواكب خارجية", "نجوم", "سدم", "مجرات", "مهام فضائية"],
    ],
    cta: ["Explore Cosmic Taxonomy", "استكشف التصنيف الكوني"],
    href: "https://cosmic-analysis-astronomical-taxonomic-logic.ai.studio",
  },
  {
    file: "kidinnu.exe",
    title: "Kidinnu",
    sub: ["AI Tools Directory", "دليل أدوات الذكاء الاصطناعي"],
    desc: [
      "More than 200 AI tools carefully categorized by professional fields. From marketing to programming, from medicine to design — you'll find everything you need in one place.",
      "أكثر من 200 أداة ذكاء اصطناعي مصنفة بعناية حسب المجالات المهنية. من التسويق إلى البرمجة، ومن الطب إلى التصميم — ستجد كل ما تحتاجه في مكان واحد.",
    ],
    tags: [
      ["191+ AI Tools", "Curated Directory", "Productivity", "Creativity"],
      ["191+ أداة ذكية", "دليل منسّق", "إنتاجية", "إبداع"],
    ],
    cta: ["Explore Kidinnu", "استكشف Kidinnu"],
    href: "https://kidinnuaitools.lovable.app/",
  },
  {
    file: "scriptforge.exe",
    title: "ScriptForge AI",
    sub: ["AI Video Script Generator", "مولّد نصوص الفيديو بالذكاء الاصطناعي"],
    desc: [
      "Turn any idea into a scroll-stopping video script in seconds. AI agent prompt optimized for YouTube, TikTok, Reels & educational content. Supports English & Arabic.",
      "حوّل أي فكرة إلى نص فيديو جذاب في ثوانٍ. وكيل ذكاء اصطناعي محسّن لليوتيوب وتيك توك والريلز والمحتوى التعليمي. يدعم العربية والإنجليزية.",
    ],
    tags: [
      ["AI Scripts", "YouTube", "TikTok", "Reels"],
      ["نصوص ذكية", "يوتيوب", "تيك توك", "ريلز"],
    ],
    cta: ["Try ScriptForge", "جرّب ScriptForge"],
    href: "https://scriptforgeaii.lovable.app",
  },
];

// [label, shown handle, url, card color, tilt]
export const LINKS: [string, string, string, string, string][] = [
  ["YouTube", "@stai9", "https://youtube.com/@stai9", "#f2c14e", "-3deg"],
  ["X / Twitter", "@3h0ll7", "https://twitter.com/3h0ll7", "#9fd3c7", "2deg"],
  ["Instagram", "@3h0ll", "https://www.instagram.com/3h0ll?igsh=eWNnN2V1YXF5bHpo", "#ef8a62", "-1deg"],
  ["GitHub", "3h0ll7", "https://github.com/3h0ll7", "#e8e1d0", "3deg"],
  ["Facebook", "Hassan Salman", "https://www.facebook.com/share/1SXTmx3Zcj/", "#a9c4f5", "-2deg"],
  ["TikTok", "linktr.ee/3h0ll", "https://linktr.ee/3h0ll", "#f5a9c4", "1deg"],
  ["Letterboxd", "boxd.it/7RQST", "https://boxd.it/7RQST", "#b8e08a", "-3deg"],
];

export const UI = {
  en: {
    name: "Hassan Salman",
    tagline: ["AI & Tech", "Practical AI tools", "Design prompts", "Nurse"],
    cue: "Scroll",
    lang: "عربي",
    soundOff: "Sound: Off",
    soundOn: "Sound: On",
    classic: "Classic",
    scenes: ["Doorway", "Screen tunnel", "Cosmic record", "Circuit signature", "Puppeteer", "The desk"],
  },
  ar: {
    name: "حسن سلمان",
    tagline: ["ذكاء اصطناعي وتقنية", "أدوات ذكاء اصطناعي عملية", "موجّهات تصميم", "ممرض"],
    cue: "مرّر",
    lang: "EN",
    soundOff: "الصوت: مغلق",
    soundOn: "الصوت: مفتوح",
    classic: "الكلاسيكي",
    scenes: ["البوابة", "نفق الشاشات", "الأسطوانة الكونية", "توقيع الدوائر", "محرّك الدمى", "المكتب"],
  },
} as const;

export type Lang = keyof typeof UI;

export const SCENE_IMAGES = [1, 2, 3, 4, 5, 6].map((n) => `/scenes/s${n}.webp`);

export interface Segment {
  img: number;
  len: number; // viewport heights
  z0: number;
  z1: number;
  fx: number;
  fy: number;
  ui: "door" | "proj" | "circuit" | "desk";
  projs?: number[];
  pos?: "" | "at-right" | "at-left";
}

// Scroll journey. The last segment repeats the doorway so the loop back to the top is seamless.
export const SEGMENTS: Segment[] = [
  { img: 0, len: 1.6, z0: 1.0, z1: 1.9, fx: 0.47, fy: 0.5, ui: "door" },
  { img: 1, len: 3.0, z0: 1.0, z1: 1.7, fx: 0.5, fy: 0.5, ui: "proj", projs: [0, 3, 4], pos: "" },
  { img: 2, len: 1.6, z0: 1.15, z1: 1.0, fx: 0.42, fy: 0.5, ui: "proj", projs: [2], pos: "at-right" },
  { img: 3, len: 1.4, z0: 1.0, z1: 1.12, fx: 0.5, fy: 0.5, ui: "circuit" },
  { img: 4, len: 1.6, z0: 1.0, z1: 1.25, fx: 0.5, fy: 0.3, ui: "proj", projs: [1], pos: "at-left" },
  { img: 5, len: 1.6, z0: 1.0, z1: 1.6, fx: 0.62, fy: 0.42, ui: "desk" },
  { img: 0, len: 0.01, z0: 1.0, z1: 1.0, fx: 0.47, fy: 0.5, ui: "door" },
];
