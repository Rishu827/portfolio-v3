import {
  Component, ChangeDetectionStrategy, inject, signal, computed, OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuantumStateService, ToolbarState, DIMENSIONS } from '../../core/services/quantum-state.service';

interface Intent {
  keywords: string[];
  path: string;
  label: string;
}

const INTENTS: Intent[] = [
  { keywords: ['dashboard', 'home', 'start', 'begin'],           path: '',           label: 'Dashboard' },
  { keywords: ['career', 'experience', 'graph', 'job', 'work'],  path: 'career',     label: 'Career Graph' },
  { keywords: ['lab', 'research', 'paper', 'publication'],       path: 'lab',        label: 'The Lab' },
  { keywords: ['neural', 'ml', 'deep learning', 'ai', 'model'],  path: 'neural',     label: 'Neural Flow' },
  { keywords: ['project', 'repo', 'code', 'github'],             path: 'repository', label: 'Project Repository' },
  { keywords: ['theory', 'quantum', 'algorithm', 'physics'],     path: 'theory',     label: 'Theoretical Computing' },
  { keywords: ['blog', 'article', 'post', 'writing', 'read'],    path: 'blog',       label: 'Blog' },
];

@Component({
  selector: 'app-agentic-toolbar',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toolbar" [class.computing]="state() === 'COMPUTING'" [class.resolved]="state() === 'RESOLVED'" [class.error]="state() === 'ERROR'">
      <!-- State indicator -->
      <div class="state-badge">
        <span class="state-dot"></span>
        <span class="state-label">{{ stateLabel() }}</span>
      </div>

      <!-- Input -->
      <div class="input-wrap">
        <span class="input-prefix">›</span>
        <input
          #inp
          type="text"
          [ngModel]="query()"
          (ngModelChange)="onInput($event)"
          (keydown.enter)="execute()"
          (keydown.escape)="clear()"
          placeholder="navigate to... / open lab / show projects"
          class="toolbar-input"
          spellcheck="false"
          autocomplete="off"
        />
        @if (query()) {
          <button (click)="clear()" class="clear-btn">✕</button>
        }
      </div>

      <!-- Suggestion -->
      @if (suggestion()) {
        <div class="suggestion" (click)="navigate(suggestion()!.path)">
          <span class="suggestion-icon">{{ suggestion()!.icon }}</span>
          <span class="suggestion-label">{{ suggestion()!.label }}</span>
          <kbd>↵</kbd>
        </div>
      }

      <!-- Quick shortcuts -->
      <div class="shortcuts">
        @for (dim of dims.slice(0, 5); track dim.path) {
          <button (click)="navigate(dim.path)" class="shortcut-btn">
            <span>{{ dim.icon }}</span>
            <kbd>{{ dim.shortcut }}</kbd>
          </button>
        }
      </div>
    </div>
  `,
  styles: [`
    .toolbar {
      position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%);
      z-index: 90;
      display: flex; align-items: center; gap: 12px;
      padding: 8px 16px; border-radius: 14px;
      background: rgba(10,10,15,0.9);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.08);
      box-shadow: 0 8px 32px rgba(0,0,0,0.4);
      min-width: 500px;
      transition: border-color 0.3s, box-shadow 0.3s;
    }
    .toolbar.computing { border-color: rgba(0,242,255,0.4); box-shadow: 0 0 20px rgba(0,242,255,0.1); }
    .toolbar.resolved  { border-color: rgba(0,242,255,0.6); }
    .toolbar.error     { border-color: rgba(255,59,92,0.4); }

    .state-badge {
      display: flex; align-items: center; gap: 5px;
      font-family: var(--font-mono); font-size: 10px; font-weight: 700;
      letter-spacing: 0.1em;
      color: rgba(0,242,255,0.7);
      white-space: nowrap;
    }
    .state-dot {
      width: 5px; height: 5px; border-radius: 50%;
      background: #00F2FF;
      box-shadow: 0 0 6px #00F2FF;
      animation: blink 1.5s infinite;
    }
    @keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0.3 } }

    .input-wrap {
      flex: 1;
      display: flex; align-items: center; gap: 8px;
    }
    .input-prefix {
      color: rgba(0,242,255,0.5);
      font-family: var(--font-mono); font-size: 14px;
    }
    .toolbar-input {
      flex: 1; background: none; border: none; outline: none;
      color: rgba(255,255,255,0.92);
      font-family: var(--font-sans); font-size: 13px;
    }
    .toolbar-input::placeholder { color: rgba(255,255,255,0.38); }
    .clear-btn {
      background: none; border: none;
      color: rgba(255,255,255,0.3); font-size: 11px;
      padding: 2px 4px;
      transition: color 0.2s;
    }
    .clear-btn:hover { color: rgba(255,255,255,0.7); }

    .suggestion {
      display: flex; align-items: center; gap: 6px;
      padding: 4px 10px; border-radius: 8px;
      background: rgba(0,242,255,0.08); border: 1px solid rgba(0,242,255,0.2);
      cursor: pointer;
      font-size: 12px; color: #00F2FF; white-space: nowrap;
    }
    .suggestion:hover { background: rgba(0,242,255,0.14); }
    kbd {
      display: inline-block;
      padding: 1px 5px; border-radius: 4px;
      background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
      font-family: var(--font-mono); font-size: 10px;
      color: rgba(255,255,255,0.4);
    }

    .shortcuts {
      display: flex; align-items: center; gap: 4px;
      padding-left: 12px;
      border-left: 1px solid rgba(255,255,255,0.06);
    }
    .shortcut-btn {
      display: flex; align-items: center; gap: 4px;
      padding: 4px 8px; border-radius: 6px; border: none;
      background: rgba(255,255,255,0.04);
      color: rgba(255,255,255,0.4);
      font-size: 13px;
      transition: background 0.2s, color 0.2s;
    }
    .shortcut-btn:hover { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.8); }

    @media (max-width: 600px) {
      .toolbar { min-width: calc(100vw - 32px); }
      .shortcuts { display: none; }
    }
  `]
})
export class AgenticToolbarComponent {
  private qs = inject(QuantumStateService);
  private router = inject(Router);

  readonly dims = DIMENSIONS;
  readonly query  = signal('');
  readonly state  = this.qs.toolbarState;

  readonly stateLabel = computed(() => {
    const map: Record<ToolbarState, string> = {
      IDLE:      'IDLE',
      COMPUTING: 'PARSING',
      TYPING:    'TYPING',
      RESOLVED:  'RESOLVED',
      ERROR:     'ERROR'
    };
    return map[this.state()];
  });

  readonly suggestion = computed(() => {
    const q = this.query().toLowerCase().trim();
    if (!q) return null;
    for (const intent of INTENTS) {
      if (intent.keywords.some(k => q.includes(k))) {
        const dim = DIMENSIONS.find(d => d.path === intent.path);
        return dim ? { path: intent.path, label: intent.label, icon: dim.icon } : null;
      }
    }
    return null;
  });

  onInput(val: string): void {
    this.query.set(val);
    this.qs.setToolbarState(val ? 'TYPING' : 'IDLE');
    if (val.length > 2) {
      this.qs.setToolbarState('COMPUTING');
      setTimeout(() => {
        this.qs.setToolbarState(this.suggestion() ? 'RESOLVED' : 'IDLE');
      }, 300);
    }
  }

  execute(): void {
    const s = this.suggestion();
    if (s) this.navigate(s.path);
  }

  navigate(path: string): void {
    this.router.navigate(['/' + path]);
    this.clear();
  }

  clear(): void {
    this.query.set('');
    this.qs.setToolbarState('IDLE');
  }
}
