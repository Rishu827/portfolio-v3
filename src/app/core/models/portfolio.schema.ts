// ── Career Graph ──────────────────────────────────────────
export interface CareerNode {
  id: string;
  label: string;
  type: 'person' | 'skill' | 'project' | 'education' | 'experience';
  group: number;           // for D3 color grouping
  radius?: number;         // optional override
  description?: string;
  url?: string;
  tags?: string[];
}

export interface CareerLink {
  source: string;
  target: string;
  strength?: number;       // 0–1
  label?: string;
}

export interface CareerGraph {
  nodes: CareerNode[];
  links: CareerLink[];
}

// ── Publications ──────────────────────────────────────────
export type PubType = 'paper' | 'thesis' | 'patent' | 'poster' | 'review';

export interface Publication {
  id: string;
  title: string;
  authors: string[];
  venue: string;
  year: number;
  type: PubType;
  abstract: string;
  doi?: string;
  arxiv?: string;
  pdf?: string;
  tags: string[];
  equations?: string[];    // KaTeX strings
}

// ── Projects ──────────────────────────────────────────────
export interface Project {
  id: string;
  title: string;
  tagline: string;
  description: string;
  image?: string;
  tags: string[];
  stack: string[];
  github?: string;
  demo?: string;
  featured: boolean;
  year: number;
}

// ── Experience ────────────────────────────────────────────
export interface Experience {
  id: string;
  role: string;
  company: string;
  location: string;
  start: string;
  end: string | 'Present';
  type: 'full-time' | 'internship' | 'research' | 'contract';
  description: string;
  bullets: string[];
  skills: string[];
  logo?: string;
}

// ── Blog ─────────────────────────────────────────────────
export type BlogTag = string;

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  date: string;
  readTime: number;
  tags: BlogTag[];
  cover?: string;
  featured: boolean;
}

// ── Achievements ──────────────────────────────────────────
export interface Achievement {
  id: string;
  title: string;
  org: string;
  year: number;
  description: string;
  type: 'award' | 'certification' | 'competition' | 'grant';
  icon?: string;
}
