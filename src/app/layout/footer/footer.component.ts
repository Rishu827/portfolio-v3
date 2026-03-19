import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <span class="brand-text">Rishabh Singhal</span>
          <span class="brand-sub">SDE3 · Google · Quantum Researcher · Graph Theorist</span>
        </div>
        <div class="footer-links">
          <a href="https://github.com/rishabhsinghal" target="_blank" rel="noopener" class="footer-link">GitHub</a>
          <a href="https://linkedin.com/in/rishabhsinghal" target="_blank" rel="noopener" class="footer-link">LinkedIn</a>
          <a href="https://arxiv.org/abs/2408.00436" target="_blank" rel="noopener" class="footer-link">arXiv</a>
          <a href="https://scholar.google.com/scholar?q=rishabh+singhal+qutrit" target="_blank" rel="noopener" class="footer-link">Scholar</a>
        </div>
        <div class="footer-copy">
          <span>© 2025 · Built with Angular 21 + D3 + Three.js</span>
          <span class="footer-dot">·</span>
          <a routerLink="/" class="footer-version">v3.0 "The Observer Effect"</a>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      border-top: 1px solid rgba(255,255,255,0.06);
      padding: 40px 0 24px;
      margin-top: auto;
    }
    .footer-inner {
      max-width: 1200px; margin: 0 auto; padding: 0 24px;
      display: flex; flex-direction: column; align-items: center; gap: 16px;
      text-align: center;
    }
    .footer-brand { display: flex; flex-direction: column; gap: 4px; }
    .brand-text { font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.85); }
    .brand-sub  { font-size: 12px; color: rgba(255,255,255,0.52); letter-spacing: 0.1em; }

    .footer-links { display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; }
    .footer-link {
      font-size: 13px; color: rgba(255,255,255,0.62); text-decoration: none;
      transition: color 0.2s;
    }
    .footer-link:hover { color: #00F2FF; }

    .footer-copy {
      display: flex; align-items: center; gap: 8px;
      font-size: 11px; color: rgba(255,255,255,0.45);
      font-family: var(--font-mono);
    }
    .footer-dot { color: rgba(255,255,255,0.3); }
    .footer-version { color: rgba(0,242,255,0.65); text-decoration: none; }
    .footer-version:hover { color: #00F2FF; }
  `]
})
export class FooterComponent {}
