import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RevealDirective } from '../../core/directives/reveal.directive';

const BLOG_URL = 'https://rishabh-writes.vercel.app/';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page dimension-view">
      <header class="page-header" appReveal>
        <span class="dim-badge q-tag q-tag-cyan">DIMENSION 6</span>
        <h1 class="page-title">Blog</h1>
        <p class="page-sub">Thought experiments — observations that collapse quantum uncertainty into words.</p>
        <a class="visit-btn" [href]="blogUrl" target="_blank" rel="noopener noreferrer" appReveal [delay]="80">
          Visit the blog <span class="arrow">→</span>
        </a>
      </header>
    </div>
  `,
  styles: [`
    .page { background: var(--color-obsidian); padding-bottom: 80px; position: relative; }
    .page::before { content: ''; position: fixed; inset: 0; background: radial-gradient(ellipse 80% 40% at 20% 60%, rgba(0,242,255,0.015) 0%, transparent 60%), radial-gradient(ellipse 60% 30% at 80% 30%, rgba(168,85,247,0.015) 0%, transparent 60%); pointer-events: none; z-index: 0; }

    .page-header {
      max-width: 1000px; margin: 0 auto;
      padding: 60px 24px 24px;
      display: flex; flex-direction: column; gap: 16px;
      position: relative; z-index: 1;
    }
    .dim-badge { font-size: 10px !important; letter-spacing: 0.15em; align-self: flex-start; }
    .page-title { font-size: clamp(32px, 5vw, 52px); font-weight: 700; color: rgba(255,255,255,0.92); }
    .page-sub   { font-size: 15px; color: rgba(255,255,255,0.72); line-height: 1.7; }

    .visit-btn {
      align-self: flex-start;
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 22px; border-radius: 8px;
      background: rgba(0,242,255,0.08);
      border: 1px solid rgba(0,242,255,0.25);
      color: #00F2FF; font-size: 14px; font-weight: 500;
      text-decoration: none;
      transition: background 0.2s, border-color 0.2s, transform 0.2s;
      margin-top: 8px;
    }
    .visit-btn:hover {
      background: rgba(0,242,255,0.15);
      border-color: rgba(0,242,255,0.45);
      transform: translateY(-1px);
    }
    .arrow { font-size: 16px; transition: transform 0.2s; }
    .visit-btn:hover .arrow { transform: translateX(3px); }
  `]
})
export class BlogComponent {
  readonly blogUrl = BLOG_URL;
}
