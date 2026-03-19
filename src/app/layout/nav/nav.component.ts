import {
  Component, ChangeDetectionStrategy, inject, signal
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { QuantumStateService, DIMENSIONS } from '../../core/services/quantum-state.service';
import { MagneticDirective } from '../../core/directives/magnetic.directive';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MagneticDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <nav class="nav-bar">
      <!-- Logo -->
      <a routerLink="/" class="nav-logo" appMagnetic [strength]="0.2">
        <span class="logo-bracket">[</span>
        <span class="logo-name">RS</span>
        <span class="logo-bracket">]</span>
      </a>

      <!-- Desktop links -->
      <ul class="nav-links">
        @for (dim of dims; track dim.path) {
          <li>
            <a [routerLink]="'/' + dim.path"
               routerLinkActive="nav-active"
               [routerLinkActiveOptions]="{ exact: dim.path === '' }"
               class="nav-link">
              <span class="nav-icon">{{ dim.icon }}</span>
              <span class="nav-label">{{ dim.label }}</span>
            </a>
          </li>
        }
      </ul>

      <!-- Controls -->
      <div class="nav-controls">
        <button (click)="toggleMode()" class="mode-btn" [class.mode-researcher]="qs.mode() === 'researcher'">
          <span class="mode-indicator"></span>
          {{ qs.mode() === 'engineer' ? 'ENG' : 'RES' }}
        </button>
        <button (click)="mobileOpen.set(!mobileOpen())" class="burger-btn" aria-label="Menu">
          <span [class.open]="mobileOpen()"></span>
          <span [class.open]="mobileOpen()"></span>
          <span [class.open]="mobileOpen()"></span>
        </button>
      </div>
    </nav>

    <!-- Mobile drawer -->
    @if (mobileOpen()) {
      <div class="mobile-drawer" (click)="mobileOpen.set(false)">
        <div class="drawer-inner" (click)="$event.stopPropagation()">
          @for (dim of dims; track dim.path) {
            <a [routerLink]="'/' + dim.path"
               routerLinkActive="drawer-active"
               [routerLinkActiveOptions]="{ exact: dim.path === '' }"
               class="drawer-link"
               (click)="mobileOpen.set(false)">
              <span>{{ dim.icon }}</span> {{ dim.label }}
            </a>
          }
          <button (click)="toggleMode(); mobileOpen.set(false)" class="drawer-mode-btn">
            Switch to {{ qs.mode() === 'engineer' ? 'Researcher' : 'Engineer' }} Mode
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    .nav-bar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 100;
      height: 64px;
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 24px;
      background: rgba(5,5,5,0.85);
      backdrop-filter: blur(20px) saturate(180%);
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }
    .nav-logo {
      font-family: var(--font-mono);
      font-size: 16px; font-weight: 700;
      color: #00F2FF; text-decoration: none;
      letter-spacing: 0.05em;
    }
    .logo-bracket { color: rgba(0,242,255,0.55); }
    .logo-name { color: #00F2FF; margin: 0 2px; }

    .nav-links {
      display: flex; align-items: center; gap: 4px;
      list-style: none; margin: 0; padding: 0;
    }
    .nav-link {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 12px; border-radius: 8px;
      text-decoration: none;
      font-size: 13px; font-weight: 500;
      color: rgba(255,255,255,0.72);
      transition: color 0.2s, background 0.2s;
    }
    .nav-link:hover { color: #fff; background: rgba(255,255,255,0.08); }
    .nav-active { color: #00F2FF !important; background: rgba(0,242,255,0.1) !important; }
    .nav-icon { font-size: 12px; opacity: 0.85; }

    .nav-controls { display: flex; align-items: center; gap: 8px; }

    .mode-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 12px; border-radius: 20px; border: none;
      background: rgba(0,242,255,0.1); color: #00F2FF;
      font-family: var(--font-mono); font-size: 11px; font-weight: 700;
      letter-spacing: 0.1em;
      transition: background 0.3s, color 0.3s;
    }
    .mode-btn.mode-researcher {
      background: rgba(168,85,247,0.12); color: #c084fc;
    }
    .mode-indicator {
      width: 6px; height: 6px; border-radius: 50%;
      background: currentColor;
      box-shadow: 0 0 6px currentColor;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    .burger-btn {
      display: none;
      flex-direction: column; gap: 5px;
      padding: 8px; background: none; border: none;
    }
    .burger-btn span {
      display: block; width: 20px; height: 1.5px;
      background: rgba(255,255,255,0.6);
      transition: transform 0.3s, opacity 0.3s;
    }
    .burger-btn span.open:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
    .burger-btn span.open:nth-child(2) { opacity: 0; }
    .burger-btn span.open:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }

    .mobile-drawer {
      position: fixed; inset: 0; z-index: 99;
      background: rgba(0,0,0,0.6);
    }
    .drawer-inner {
      position: absolute; top: 64px; right: 0; bottom: 0;
      width: 260px;
      background: #0a0a0f;
      border-left: 1px solid rgba(255,255,255,0.06);
      padding: 16px;
      display: flex; flex-direction: column; gap: 4px;
    }
    .drawer-link {
      display: flex; align-items: center; gap: 10px;
      padding: 12px 16px; border-radius: 10px;
      text-decoration: none; font-size: 14px; font-weight: 500;
      color: rgba(255,255,255,0.78);
      transition: background 0.2s, color 0.2s;
    }
    .drawer-link:hover { background: rgba(255,255,255,0.06); color: #fff; }
    .drawer-active { color: #00F2FF !important; background: rgba(0,242,255,0.08) !important; }
    .drawer-mode-btn {
      margin-top: 16px; padding: 12px 16px; border-radius: 10px; border: none;
      background: rgba(0,242,255,0.08); color: #00F2FF;
      font-size: 13px; font-weight: 500; text-align: left;
    }

    @media (max-width: 768px) {
      .nav-links { display: none; }
      .burger-btn { display: flex; }
    }
  `]
})
export class NavComponent {
  readonly qs = inject(QuantumStateService);
  readonly dims = DIMENSIONS;
  readonly mobileOpen = signal(false);

  toggleMode(): void {
    this.qs.toggleMode();
  }
}
