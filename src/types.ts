export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Slide {
  id: string;
  title: string;
  bullets: string[];
  speakerNotes: string;
  imagePrompt: string;
  imageUrl: string | null;
  layout: 'title' | 'split' | 'bullets' | 'quote' | 'hero';
}

export interface Presentation {
  id: string;
  userId: string;
  topic: string;
  slideCount: number;
  theme: PresentationTheme;
  slides: Slide[];
  status: 'draft' | 'generating' | 'complete';
  createdAt: string;
  updatedAt: string;
}

export type PresentationTheme = 'modern' | 'professional' | 'creative' | 'elegant' | 'tech';

export interface ThemeConfig {
  name: string;
  id: PresentationTheme;
  bg: string;
  cardBg: string;
  text: string;
  accent: string;
  accentText: string;
  muted: string;
  fonts: {
    heading: string;
    body: string;
  };
  palette: string[];
}

export const THEMES: Record<PresentationTheme, ThemeConfig> = {
  modern: {
    name: 'Modern Minimalist',
    id: 'modern',
    bg: 'bg-slate-50',
    cardBg: 'bg-white border border-slate-100',
    text: 'text-slate-900',
    accent: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    accentText: 'text-indigo-600',
    muted: 'text-slate-500',
    fonts: {
      heading: 'font-sans font-extrabold tracking-tight',
      body: 'font-sans'
    },
    palette: ['#4f46e5', '#3b82f6', '#10b981', '#f59e0b', '#ef4444']
  },
  professional: {
    name: 'Corporate Slate',
    id: 'professional',
    bg: 'bg-zinc-50',
    cardBg: 'bg-white border border-zinc-200',
    text: 'text-zinc-800',
    accent: 'bg-slate-900 hover:bg-slate-800 text-white',
    accentText: 'text-slate-900',
    muted: 'text-zinc-500',
    fonts: {
      heading: 'font-serif font-bold tracking-tight',
      body: 'font-sans'
    },
    palette: ['#0f172a', '#475569', '#64748b', '#94a3b8', '#cbd5e1']
  },
  creative: {
    name: 'Vibrant Creative',
    id: 'creative',
    bg: 'bg-rose-50/30',
    cardBg: 'bg-white border border-rose-100',
    text: 'text-stone-900',
    accent: 'bg-rose-500 hover:bg-rose-600 text-white',
    accentText: 'text-rose-500',
    muted: 'text-stone-500',
    fonts: {
      heading: 'font-sans font-black uppercase tracking-wider',
      body: 'font-sans'
    },
    palette: ['#f43f5e', '#ec4899', '#f97316', '#eab308', '#8b5cf6']
  },
  elegant: {
    name: 'Emerald Luxury',
    id: 'elegant',
    bg: 'bg-stone-50',
    cardBg: 'bg-emerald-950 text-stone-100 border border-emerald-900',
    text: 'text-stone-100',
    accent: 'bg-amber-500 hover:bg-amber-600 text-stone-950',
    accentText: 'text-amber-500',
    muted: 'text-stone-400',
    fonts: {
      heading: 'font-serif italic font-medium',
      body: 'font-serif'
    },
    palette: ['#064e3b', '#047857', '#d97706', '#f59e0b', '#fef3c7']
  },
  tech: {
    name: 'Cyber Terminal',
    id: 'tech',
    bg: 'bg-zinc-950 text-green-400 border-zinc-800',
    cardBg: 'bg-zinc-900 border border-zinc-800 text-zinc-100',
    text: 'text-zinc-100',
    accent: 'bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-mono',
    accentText: 'text-emerald-400',
    muted: 'text-zinc-500',
    fonts: {
      heading: 'font-mono font-bold tracking-wider',
      body: 'font-mono'
    },
    palette: ['#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#18181b']
  }
};
