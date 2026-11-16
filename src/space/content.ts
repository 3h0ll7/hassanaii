// Site content, word for word from the previous site (journey + classic pages).
// Each bilingual field is [English, Arabic].

export type Bilingual = [string, string];
export type Lang = "en" | "ar";

export interface PlanetLook {
  kind: "terrain" | "gas";
  radius: number;
  colors: [string, string, string]; // dark, mid, highlight
  atmosphere: string;
  extra: "moon" | "trio" | "rings" | "swarm" | "moons" | "orbits";
}

export interface SpaceProject {
  title: string;
  sub: Bilingual;
  desc: Bilingual;
  tags: [string[], string[]];
  cta: Bilingual;
  href: string;
  look: PlanetLook;
}

export const PROJECTS: SpaceProject[] = [
  {
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
    look: {
      kind: "terrain",
      radius: 5,
      colors: ["#062b47", "#0e8fc4", "#dff6ff"],
      atmosphere: "#4cc9ff",
      extra: "moon",
    },
  },
  {
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
    look: {
      kind: "terrain",
      radius: 4.4,
      colors: ["#08261a", "#1f8a4c", "#c9eb9c"],
      atmosphere: "#6fe3a0",
      extra: "trio",
    },
  },
  {
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
    look: {
      kind: "gas",
      radius: 5.2,
      colors: ["#0c1030", "#3848b8", "#c3b5ff"],
      atmosphere: "#8fa0ff",
      extra: "rings",
    },
  },
  {
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
    look: {
      kind: "terrain",
      radius: 4.8,
      colors: ["#3a1c05", "#d98a1a", "#ffe6ad"],
      atmosphere: "#ffc56b",
      extra: "swarm",
    },
  },
  {
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
    look: {
      kind: "gas",
      radius: 5.6,
      colors: ["#1c0b3a", "#7b3fe4", "#f3c2ff"],
      atmosphere: "#b48cff",
      extra: "moons",
    },
  },
  {
    title: "Physics 6th Scientific 3D",
    sub: ["Interactive 3D Physics Book", "كتاب فيزياء تفاعلي ثلاثي الأبعاد"],
    desc: [
      "Iraq's complete 6th scientific grade physics textbook as a 3D book: 9 chapters and 81 lessons where students predict, experiment by hand, then solve the book's examples step by step. With end-of-chapter quizzes, progress tracking, search, and 360° rotation.",
      "كتاب فيزياء السادس العلمي في العراق كاملاً بصيغة كتاب ثلاثي الأبعاد: 9 فصول و81 درساً يتنبّأ فيها الطالب، ثم يجرّب بيده، ثم يحل أمثلة الكتاب خطوة بخطوة. مع اختبارات نهاية الفصول وحفظ التقدم والبحث ودوران 360°.",
    ],
    tags: [
      ["9 Chapters", "3D Experiments", "Chapter Quizzes", "Solved Examples"],
      ["9 فصول", "تجارب ثلاثية الأبعاد", "اختبارات الفصول", "أمثلة محلولة"],
    ],
    cta: ["Open the Book", "افتح الكتاب"],
    href: "https://physics3d6th.lovable.app",
    look: {
      kind: "terrain",
      radius: 4.2,
      colors: ["#070d24", "#24408f", "#a9caff"],
      atmosphere: "#7fb0ff",
      extra: "orbits",
    },
  },
];

// [label, shown handle, url]
export const LINKS: [string, string, string][] = [
  ["Instagram", "@3h0ll", "https://www.instagram.com/3h0ll?igsh=eWNnN2V1YXF5bHpo"],
  ["X / Twitter", "@3h0ll7", "https://twitter.com/3h0ll7"],
  ["GitHub", "3h0ll7", "https://github.com/3h0ll7"],
  ["Facebook", "Hassan Salman", "https://www.facebook.com/share/1SXTmx3Zcj/"],
  ["Letterboxd", "boxd.it/7RQST", "https://boxd.it/7RQST"],
];

export const UI = {
  en: {
    name: "Hassan Salman",
    tagline: ["AI & Tech", "Practical AI tools", "Design prompts", "Nurse"],
    cue: "Scroll",
    lang: "عربي",
    soundOff: "Sound: Off",
    soundOn: "Sound: On",
    projects: "Projects",
    links: "Links",
    start: "Start",
    signature: "Developed by: Hassan salman",
  },
  ar: {
    name: "حسن سلمان",
    tagline: ["ذكاء اصطناعي وتقنية", "أدوات ذكاء اصطناعي عملية", "موجّهات تصميم", "ممرض"],
    cue: "مرّر",
    lang: "EN",
    soundOff: "الصوت: مغلق",
    soundOn: "الصوت: مفتوح",
    projects: "المشاريع",
    links: "الروابط",
    start: "البداية",
    signature: "Developed by: Hassan salman",
  },
} as const;

// Stops along the journey: intro, one per project, links.
export const STOP_COUNT = PROJECTS.length + 2;
