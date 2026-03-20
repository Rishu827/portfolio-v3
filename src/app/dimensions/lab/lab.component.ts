import {
  Component, ChangeDetectionStrategy, inject, signal, computed, OnInit,
  ViewChild, ElementRef, AfterViewInit, OnDestroy, NgZone
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RevealDirective } from '../../core/directives/reveal.directive';
import { KatexPipe } from '../../core/pipes/katex.pipe';
import { Publication, PubType } from '../../core/models/portfolio.schema';

const TYPE_LABELS: Record<PubType, string> = {
  paper:  'Paper',
  thesis: 'Thesis',
  patent: 'Patent',
  poster: 'Poster',
  review: 'Technical Review',
};

const PUB_FILTERS: { label: string; value: PubType | 'all' }[] = [
  { label: 'All',     value: 'all'    },
  { label: 'Papers',  value: 'paper'  },
  { label: 'Thesis',  value: 'thesis' },
  { label: 'Patents', value: 'patent' },
  { label: 'Posters', value: 'poster' },
];

@Component({
  selector: 'app-lab',
  standalone: true,
  imports: [RevealDirective, KatexPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page dimension-view">
      <canvas #labCanvas class="lab-canvas" aria-hidden="true"></canvas>

      <!-- Header -->
      <header class="page-header" appReveal>
        <span class="dim-badge q-tag q-tag-purple">DIMENSION 2</span>
        <h1 class="page-title">Research Lab</h1>
        <p class="page-sub">EXPERIMENT LOG — Publications, patents, and research outputs.</p>
      </header>

      <!-- Pub type filters -->
      <div class="filters" appReveal [delay]="80">
        @for (tab of pubFilters; track tab.value) {
          <button class="filter-chip"
                  [class.active]="pubFilter() === tab.value"
                  (click)="pubFilter.set(tab.value)">
            {{ tab.label }}
            <span class="chip-count">
              {{ tab.value === 'all' ? pubs().length : countOf(tab.value) }}
            </span>
          </button>
        }
      </div>

      <!-- Publications grid -->
      <div class="pubs-grid">
        @for (pub of filteredPubs(); track pub.id; let i = $index) {
          <div class="flip-card pub-card" appReveal [delay]="i * 55">
            <div class="flip-inner">
              <!-- Front -->
              <div class="flip-front glass">
                <div class="pub-type q-tag" [class]="typeTagClass(pub.type)">
                  {{ typeLabels[pub.type] }}
                </div>
                <h3 class="pub-title">{{ pub.title }}</h3>
                <p class="pub-authors">{{ pub.authors.join(', ') }}</p>
                <p class="pub-venue">{{ pub.venue }} · {{ pub.year }}</p>
                @if (pub.equations?.length) {
                  <div class="pub-equations" [innerHTML]="pub.equations![0] | katex"></div>
                }
                <div class="pub-tags">
                  @for (tag of pub.tags.slice(0, 3); track tag) {
                    <span class="q-tag q-tag-cyan">{{ tag }}</span>
                  }
                </div>
                <span class="flip-hint">Hover to read abstract →</span>
              </div>
              <!-- Back -->
              <div class="flip-back glass">
                <p class="pub-abstract">{{ pub.abstract }}</p>
                <div class="pub-links">
                  @if (pub.doi) {
                    <a [href]="'https://doi.org/' + pub.doi" target="_blank" class="pub-link">DOI</a>
                  }
                  @if (pub.arxiv) {
                    <a [href]="'https://arxiv.org/abs/' + pub.arxiv" target="_blank" class="pub-link">arXiv</a>
                  }
                  @if (pub.pdf) {
                    <a [href]="pub.pdf" target="_blank" class="pub-link pub-link-pdf">PDF ↓</a>
                  }
                </div>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page { background: var(--color-obsidian); padding-bottom: 80px; position: relative; }

    .lab-canvas {
      position: fixed; inset: 0; z-index: 0;
      width: 100%; height: 100%;
      pointer-events: none; opacity: 0.9;
    }

    .page-header {
      max-width: 1000px; margin: 0 auto;
      padding: 60px 24px 24px;
      display: flex; flex-direction: column; gap: 12px;
      position: relative; z-index: 1;
    }
    .dim-badge { font-size: 10px !important; letter-spacing: 0.15em; align-self: flex-start; }
    .page-title { font-size: clamp(32px, 5vw, 52px); font-weight: 700; color: rgba(255,255,255,0.92); }
    .page-sub   { font-size: 15px; color: rgba(255,255,255,0.72); line-height: 1.7; }

    /* ── Filters ──────────────────────────────────────── */
    .filters {
      max-width: 1000px; margin: 0 auto 28px;
      padding: 0 24px;
      display: flex; gap: 8px; flex-wrap: wrap;
      position: relative; z-index: 1;
    }
    .filter-chip {
      display: flex; align-items: center; gap: 5px;
      padding: 6px 14px; border-radius: 20px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-left: 2px solid transparent !important;
      border-radius: 0 6px 6px 0 !important;
      color: rgba(255,255,255,0.6);
      font-size: 12px; font-weight: 500;
      transition: all 0.2s;
    }
    .filter-chip:hover { color: #fff; border-color: rgba(255,255,255,0.18); }
    .filter-chip.active {
      background: rgba(168,85,247,0.1);
      border-color: rgba(168,85,247,0.3);
      border-left-color: #c084fc !important;
      color: #c084fc;
    }
    .chip-count { font-size: 10px; color: rgba(255,255,255,0.35); }
    .filter-chip.active .chip-count { color: rgba(192,132,252,0.7); }

    /* ── Publications grid ───────────────────────────── */
    .pubs-grid {
      max-width: 1200px; margin: 0 auto;
      padding: 0 24px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 20px;
      position: relative; z-index: 1;
    }
    .pub-card { height: 360px; }

    .flip-front, .flip-back {
      padding: 22px;
      display: flex; flex-direction: column; gap: 10px;
      border-radius: 16px !important;
    }
    .flip-front { border-top: 1px solid rgba(0,242,255,0.18) !important; }
    .pub-type { font-size: 10px !important; align-self: flex-start; }
    .pub-title {
      font-size: 14px; font-weight: 600;
      color: rgba(255,255,255,0.9); line-height: 1.4;
      display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
    }
    .pub-authors { font-size: 12px; color: rgba(255,255,255,0.65); }
    .pub-venue   { font-size: 12px; color: rgba(255,255,255,0.52); font-style: italic; }
    .pub-equations {
      background: rgba(0,242,255,0.04); border: 1px solid rgba(0,242,255,0.15) !important;
      border-radius: 8px; padding: 8px 14px; overflow: hidden; flex-shrink: 0;
    }
    /* Scale KaTeX to fit card width — no horizontal scrollbar */
    .pub-equations .katex-html {
      display: block;
      transform: scale(0.78);
      transform-origin: left center;
      color: rgba(0,242,255,0.88);
    }
    .pub-equations .katex-display { margin: 0; }
    .pub-equations .katex-display > .katex { color: rgba(0,242,255,0.88); }
    .pub-tags   { display: flex; flex-wrap: wrap; gap: 5px; margin-top: auto; }
    .flip-hint  { font-size: 11px; color: rgba(255,255,255,0.38); align-self: flex-end; margin-top: auto; }
    .pub-abstract {
      font-size: 12px; line-height: 1.7; color: rgba(255,255,255,0.78);
      overflow-y: auto; flex: 1;
    }
    .pub-links { display: flex; gap: 8px; flex-wrap: wrap; margin-top: auto; }
    .pub-link {
      padding: 5px 12px; border-radius: 6px;
      background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.13);
      font-size: 12px; color: rgba(255,255,255,0.8); text-decoration: none;
      transition: background 0.2s, color 0.2s;
    }
    .pub-link:hover { background: rgba(255,255,255,0.12); color: #fff; }
    .pub-link-pdf { background: rgba(168,85,247,0.1); border-color: rgba(168,85,247,0.2); color: #c084fc; }

    .page-header, .filters, .pubs-grid { position: relative; z-index: 1; }

    @media (max-width: 600px) {
      .pubs-grid { grid-template-columns: 1fr; }
      .pub-card  { height: 360px; }
    }
  `]
})
export class LabComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('labCanvas') labCanvasRef!: ElementRef<HTMLCanvasElement>;

  private http = inject(HttpClient);
  private zone = inject(NgZone);

  readonly pubs       = signal<Publication[]>([]);
  readonly pubFilter  = signal<PubType | 'all'>('all');
  readonly pubFilters = PUB_FILTERS;
  readonly typeLabels = TYPE_LABELS;

  private labRaf = 0;

  readonly filteredPubs = computed(() => {
    const f = this.pubFilter();
    return f === 'all' ? this.pubs() : this.pubs().filter(p => p.type === f);
  });

  ngOnInit(): void {
    this.http.get<Publication[]>('assets/data/publications.json').subscribe(d => this.pubs.set(d));
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => this.initLabCanvas());
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.labRaf);
  }

  countOf(type: PubType | 'all'): number {
    return type === 'all' ? this.pubs().length
      : this.pubs().filter(p => p.type === type).length;
  }

  typeTagClass(type: PubType): string {
    const m: Partial<Record<PubType, string>> = {
      paper: 'q-tag-purple', thesis: 'q-tag-cyan',
      patent: 'q-tag-purple', poster: 'q-tag-cyan', review: 'q-tag-cyan'
    };
    return m[type] ?? 'q-tag-cyan';
  }

  private initLabCanvas(): void {
    const canvas = this.labCanvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    const N_PAIRS = 10;

    interface Particle {
      x: number; y: number; vx: number; vy: number;
      phase: number; partnerId: number; spin: 1 | -1;
    }

    interface Pulse {
      pairIdx: number; t: number; speed: number; dir: 1 | -1;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < N_PAIRS; i++) {
      const cx = Math.random() * canvas.width;
      const cy = Math.random() * canvas.height;
      const vx = (Math.random() - 0.5) * 0.25;
      const vy = (Math.random() - 0.5) * 0.25;
      particles.push({
        x: cx + (Math.random() - 0.5) * 250, y: cy + (Math.random() - 0.5) * 250,
        vx, vy, phase: Math.random() * Math.PI * 2, partnerId: i * 2 + 1, spin: 1
      });
      particles.push({
        x: cx + (Math.random() - 0.5) * 250, y: cy + (Math.random() - 0.5) * 250,
        vx: -vx, vy: -vy, phase: Math.random() * Math.PI * 2 + Math.PI,
        partnerId: i * 2, spin: -1
      });
    }

    const pulses: Pulse[] = [];
    let frame = 0;
    const ctx = canvas.getContext('2d')!;

    const bezierPoint = (t: number, ax: number, ay: number, mx: number, my: number, bx: number, by: number) => ({
      x: (1-t)*(1-t)*ax + 2*(1-t)*t*mx + t*t*bx,
      y: (1-t)*(1-t)*ay + 2*(1-t)*t*my + t*t*by,
    });

    const draw = () => {
      frame++;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Spawn pulses periodically
      if (frame % 35 === 0 && Math.random() < 0.8) {
        pulses.push({
          pairIdx: Math.floor(Math.random() * N_PAIRS),
          t: 0, speed: 0.007 + Math.random() * 0.007,
          dir: Math.random() < 0.5 ? 1 : -1
        });
      }

      // Update particles
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy; p.phase += 0.012;
        if (p.x < 0 || p.x > W) { p.vx *= -1; p.x = Math.max(0, Math.min(W, p.x)); }
        if (p.y < 0 || p.y > H) { p.vy *= -1; p.y = Math.max(0, Math.min(H, p.y)); }
      }

      // Draw entanglement lines as curved paths
      for (let i = 0; i < N_PAIRS; i++) {
        const a = particles[i * 2], b = particles[i * 2 + 1];
        const mx = (a.x + b.x) / 2 + Math.sin(a.phase) * 40;
        const my = (a.y + b.y) / 2 + Math.cos(a.phase) * 25;

        const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        grad.addColorStop(0,   'rgba(192,132,252,0.22)');
        grad.addColorStop(0.5, 'rgba(139, 92,246,0.12)');
        grad.addColorStop(1,   'rgba(192,132,252,0.22)');

        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(mx, my, b.x, b.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 0.7;
        ctx.stroke();
      }

      // Draw pulses travelling along the entanglement curves
      for (let pi = pulses.length - 1; pi >= 0; pi--) {
        const pulse = pulses[pi];
        pulse.t += pulse.speed;
        if (pulse.t > 1) { pulses.splice(pi, 1); continue; }

        const a = particles[pulse.pairIdx * 2], b = particles[pulse.pairIdx * 2 + 1];
        const mx = (a.x + b.x) / 2 + Math.sin(a.phase) * 40;
        const my = (a.y + b.y) / 2 + Math.cos(a.phase) * 25;
        const t = pulse.dir === 1 ? pulse.t : 1 - pulse.t;
        const pos = bezierPoint(t, a.x, a.y, mx, my, b.x, b.y);

        const fade = Math.sin(pulse.t * Math.PI);
        const pg = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 12);
        pg.addColorStop(0, `rgba(216,180,254,${0.9 * fade})`);
        pg.addColorStop(1, 'transparent');
        ctx.fillStyle = pg;
        ctx.beginPath(); ctx.arc(pos.x, pos.y, 12, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(pos.x, pos.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${fade})`; ctx.fill();
      }

      // Draw particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const isA = i % 2 === 0;
        const pulse = 0.55 + 0.45 * Math.sin(p.phase * 2);
        const baseColor = isA ? '192,132,252' : '139,92,246';

        const gGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 16 * pulse);
        gGrad.addColorStop(0, `rgba(${baseColor},0.45)`);
        gGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = gGrad;
        ctx.beginPath(); ctx.arc(p.x, p.y, 16 * pulse, 0, Math.PI * 2); ctx.fill();

        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${baseColor},0.9)`; ctx.fill();

        // Spin arc indicator
        const sa = p.spin === 1 ? -Math.PI * 0.8 : Math.PI * 0.2;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 7, sa, sa + Math.PI);
        ctx.strokeStyle = `rgba(${baseColor},0.35)`; ctx.lineWidth = 1; ctx.stroke();
      }

      this.labRaf = requestAnimationFrame(draw);
    };
    draw();
  }
}
