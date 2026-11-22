// Shapes of the JSON files in /public/content, edited from /admin.

export interface Stat {
  value: string;
  label_ar: string;
  label_en: string;
}

export interface Experience {
  years: string;
  title_ar: string;
  title_en: string;
  place_ar: string;
  place_en: string;
}

export interface Settings {
  name_ar: string;
  name_en: string;
  role_ar: string;
  role_en: string;
  city_ar: string;
  city_en: string;
  headline_ar: string;
  headline_en: string;
  photo: string;
  about_photo: string;
  contact_photo: string;
  whatsapp: string;
  phone: string;
  instagram: string;
  github?: string;
  behance: string;
  stats: Stat[];
  about_ar: string;
  about_en: string;
  experience: Experience[];
  copyright_ar: string;
  copyright_en: string;
}

export interface Category {
  id: string;
  label_ar: string;
  label_en: string;
}

export interface Project {
  title_ar: string;
  title_en: string;
  brand: string;
  category: string;
  summary_ar: string;
  summary_en: string;
  cover: string;
  focus?: string;
  images: { src: string }[];
}

export interface Client {
  name: string;
  logo: string;
  /** The brand's Instagram or website; the logo links to it. */
  link?: string;
  /** The brand's online store, shown in the viewer of its projects. */
  store?: string;
}

export interface Work {
  categories: Category[];
  projects: Project[];
  posters: { src: string }[];
  clients: Client[];
}

export interface Service {
  title_ar: string;
  title_en: string;
  text_ar: string;
  text_en: string;
  category: string;
}

export interface ExpertiseGroup {
  title_ar: string;
  title_en: string;
  text_ar: string;
  text_en: string;
  /** Comma-separated tool names, shown as chips. */
  tools: string;
  image: string;
  link?: string;
  link_ar?: string;
  link_en?: string;
}

export interface Partner {
  name: string;
  note_ar?: string;
  note_en?: string;
  link?: string;
}

export interface Expertise {
  intro_ar: string;
  intro_en: string;
  groups: ExpertiseGroup[];
  partners_title_ar: string;
  partners_title_en: string;
  partners_text_ar: string;
  partners_text_en: string;
  partners_image: string;
  partners: Partner[];
}

export interface Content {
  settings: Settings;
  work: Work;
  services: Service[];
  expertise: Expertise;
}
