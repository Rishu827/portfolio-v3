import { Injectable, signal, computed } from '@angular/core';

export type AppMode = 'engineer' | 'researcher';
export type ToolbarState = 'IDLE' | 'COMPUTING' | 'TYPING' | 'RESOLVED' | 'ERROR';

export const DIMENSIONS = [
  { path: '',             label: 'Dashboard',         icon: '◈', shortcut: 'd' },
  { path: 'career',       label: 'Career',             icon: '⬡', shortcut: 'c' },
  { path: 'lab',          label: 'Research',           icon: '⚗', shortcut: 'l' },
  { path: 'repository',   label: 'Projects',           icon: '⬢', shortcut: 'r' },
  { path: 'theory',       label: 'Theory',             icon: '∞', shortcut: 't' },
  { path: 'achievements', label: 'Achievements',       icon: '◎', shortcut: 'a' },
  { path: 'blog',         label: 'Blog',               icon: '✦', shortcut: 'b', externalUrl: 'https://rishabh-writes.vercel.app/' },
  { path: 'contact',      label: 'Contact',             icon: '⊙', shortcut: 'n' },
] as const;

@Injectable({ providedIn: 'root' })
export class QuantumStateService {
  readonly mode = signal<AppMode>('engineer');
  readonly toolbarState = signal<ToolbarState>('IDLE');
  readonly toolbarQuery = signal<string>('');
  readonly activeNode = signal<string | null>(null);  // for career graph
  readonly isNavOpen = signal<boolean>(false);

  readonly isCyan = computed(() => this.mode() === 'engineer');
  readonly accentColor = computed(() =>
    this.mode() === 'engineer' ? '#00F2FF' : '#7000FF'
  );
  readonly accentGhost = computed(() =>
    this.mode() === 'engineer'
      ? 'rgba(0,242,255,0.08)'
      : 'rgba(112,0,255,0.08)'
  );

  toggleMode(): void {
    this.mode.update(m => m === 'engineer' ? 'researcher' : 'engineer');
    document.documentElement.setAttribute('data-mode', this.mode());
  }

  setMode(m: AppMode): void {
    this.mode.set(m);
    document.documentElement.setAttribute('data-mode', m);
  }

  setToolbarState(s: ToolbarState): void {
    this.toolbarState.set(s);
  }
}
