import {
  Component, ChangeDetectionStrategy, inject, signal, computed, OnInit,
  ViewChild, ElementRef, AfterViewInit, OnDestroy, NgZone
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RevealDirective } from '../../core/directives/reveal.directive';
import { MarkdownPipe } from '../../core/pipes/markdown.pipe';
import { Project } from '../../core/models/portfolio.schema';

@Component({
  selector: 'app-repository',
  standalone: true,
  imports: [RevealDirective, MarkdownPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page dimension-view">
      <canvas #circuitCanvas class="circuit-canvas" aria-hidden="true"></canvas>

      <!-- Header -->
      <header class="page-header" appReveal>
        <span class="dim-badge q-tag q-tag-cyan">DIMENSION 4</span>
        <h1 class="page-title">Project Repository</h1>
        <p class="page-sub">Quantum circuit — operations shipped into the universe.</p>
      </header>

      <!-- Active filter tag -->
      <div class="filter-bar" appReveal [delay]="80">
        <button class="filter-chip" [class.active]="activeTag() === ''" (click)="activeTag.set('')">
          All <span class="chip-count">{{ projects().length }}</span>
        </button>
        @for (tag of allTags(); track tag) {
          <button class="filter-chip" [class.active]="activeTag() === tag" (click)="activeTag.set(tag)">
            {{ tag }}
          </button>
        }
      </div>

      <!-- Featured row -->
      @if (featured().length && !activeTag()) {
        <section class="featured-section">
          <h2 class="section-label" appReveal [delay]="100">FEATURED</h2>
          <div class="featured-grid">
            @for (p of featured(); track p.id; let i = $index) {
              <div class="project-card featured-card glass glass-hover" appReveal [delay]="120 + i * 60"
                   (click)="toggleDesc(p.id)">
                <div class="card-top">
                  <div class="card-icon">⬢</div>
                  <div class="card-links">
                    @if (p.github) {
                      <a [href]="p.github" target="_blank" rel="noopener" class="icon-link" title="GitHub" (click)="$event.stopPropagation()">
                        <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
                      </a>
                    }
                    @if (p.demo) {
                      <a [href]="p.demo" target="_blank" rel="noopener" class="icon-link" title="Demo" (click)="$event.stopPropagation()">↗</a>
                    }
                  </div>
                </div>
                <h3 class="card-title">{{ p.title }}</h3>
                <p class="card-tagline">{{ p.tagline }}</p>
                <div class="card-desc" [class.expanded]="expandedId() === p.id" [innerHTML]="p.description | markdown"></div>
                @if (p.video) {
                  <div class="card-video" (click)="$event.stopPropagation()">
                    <iframe [src]="safeVideoUrl(p.video)" allowfullscreen allow="autoplay"></iframe>
                  </div>
                }
                <div class="card-stack">
                  @for (s of p.stack.slice(0, 4); track s) {
                    <span class="q-tag q-tag-cyan">{{ s }}</span>
                  }
                </div>
                <span class="card-year">{{ p.year }}</span>
              </div>
            }
          </div>
        </section>
      }

      <!-- All projects grid -->
      <section class="all-section">
        @if (featured().length && !activeTag()) {
          <h2 class="section-label" appReveal [delay]="200">ALL</h2>
        }
        <div class="projects-grid">
          @for (p of displayed(); track p.id; let i = $index) {
            <div class="project-card glass glass-hover" appReveal [delay]="(activeTag() ? i : i + featured().length) * 50"
                 (click)="toggleDesc(p.id)">
              <div class="card-top">
                <div class="card-icon small">◈</div>
                <div class="card-links">
                  @if (p.github) {
                    <a [href]="p.github" target="_blank" rel="noopener" class="icon-link" title="GitHub" (click)="$event.stopPropagation()">
                      <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
                    </a>
                  }
                  @if (p.demo) {
                    <a [href]="p.demo" target="_blank" rel="noopener" class="icon-link" (click)="$event.stopPropagation()">↗</a>
                  }
                </div>
              </div>
              <h3 class="card-title">{{ p.title }}</h3>
              <p class="card-tagline">{{ p.tagline }}</p>
              <div class="card-desc" [class.expanded]="expandedId() === p.id" [innerHTML]="p.description | markdown"></div>
              @if (p.video) {
                <div class="card-video" (click)="$event.stopPropagation()">
                  <iframe [src]="safeVideoUrl(p.video)" allowfullscreen allow="autoplay"></iframe>
                </div>
              }
              <div class="card-tags">
                @for (t of p.tags.slice(0, 3); track t) {
                  <button class="q-tag q-tag-cyan tag-clickable" (click)="activeTag.set(t)">{{ t }}</button>
                }
              </div>
              <div class="card-bottom">
                <div class="card-stack-small">
                  @for (s of p.stack.slice(0, 3); track s) {
                    <span class="stack-item">{{ s }}</span>
                  }
                </div>
                <span class="card-year">{{ p.year }}</span>
              </div>
            </div>
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    .page { background: var(--color-obsidian); padding-bottom: 80px; position: relative; }

    .circuit-canvas { position: fixed; inset: 0; z-index: 0; width: 100%; height: 100%; pointer-events: none; opacity: 1; }

    .page-header {
      max-width: 1200px; margin: 0 auto;
      padding: 60px 24px 24px;
      display: flex; flex-direction: column; gap: 12px;
      position: relative; z-index: 1;
    }
    .dim-badge { font-size: 10px !important; letter-spacing: 0.15em; align-self: flex-start; }
    .page-title { font-size: clamp(32px, 5vw, 52px); font-weight: 700; color: rgba(255,255,255,0.92); }
    .page-sub   { font-size: 15px; color: rgba(255,255,255,0.72); line-height: 1.7; }

    .filter-bar {
      max-width: 1200px; margin: 0 auto 32px;
      padding: 0 24px;
      display: flex; gap: 8px; flex-wrap: wrap;
      position: relative; z-index: 1;
    }
    .filter-chip {
      padding: 5px 14px; border-radius: 20px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.45);
      font-size: 12px; font-weight: 500;
      transition: all 0.2s;
      display: flex; align-items: center; gap: 5px;
    }
    .filter-chip:hover { color: #fff; border-color: rgba(255,255,255,0.2); }
    .filter-chip.active {
      background: rgba(0,242,255,0.1);
      border-color: rgba(0,242,255,0.3);
      color: #00F2FF;
    }
    .chip-count { font-size: 10px; color: rgba(255,255,255,0.25); }

    .featured-section, .all-section {
      max-width: 1200px; margin: 0 auto;
      padding: 0 24px 40px;
      position: relative; z-index: 1;
    }
    .section-label {
      font-size: 12px; font-weight: 600;
      letter-spacing: 0.1em; text-transform: uppercase;
      color: rgba(0,242,255,0.4) !important;
      margin-bottom: 16px;
      font-family: var(--font-mono) !important;
    }

    .featured-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 20px; margin-bottom: 40px;
    }

    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
    }

    .project-card {
      padding: 20px;
      display: flex; flex-direction: column; gap: 10px;
      border-top: 1px solid rgba(0,242,255,0.15) !important;
      position: relative;
    }
    .project-card::before { content: ''; position: absolute; top: -1px; left: 0; width: 20px; height: 2px; background: #00F2FF; }
    .featured-card { padding: 24px; gap: 12px; border-top-color: rgba(0,242,255,0.35) !important; }
    .featured-card::before { width: 40px; }

    .card-top { display: flex; justify-content: space-between; align-items: center; }
    .card-icon { font-size: 20px; color: #00F2FF; }
    .card-icon.small { font-size: 16px; }
    .card-links { display: flex; gap: 8px; }
    .icon-link {
      display: inline-flex; align-items: center;
      color: rgba(255,255,255,0.55);
      text-decoration: none;
      transition: color 0.2s;
    }
    .icon-link:hover { color: #00F2FF; }
    .icon-link svg { display: block; }

    .card-title {
      font-size: 16px; font-weight: 600;
      color: rgba(255,255,255,0.9);
    }
    .featured-card .card-title { font-size: 18px; }
    .card-tagline { font-size: 12px; color: #00F2FF; font-weight: 500; }
    .card-desc {
      font-size: 12px; color: rgba(255,255,255,0.72); line-height: 1.6;
      display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
    }
    .card-desc.expanded { -webkit-line-clamp: unset; display: block; overflow: visible; }

    .card-desc :is(p, li) { margin: 0 0 6px; }
    .card-desc ul, .card-desc ol { padding-left: 18px; margin: 0 0 6px; }
    .card-desc li { margin-bottom: 2px; }
    .card-desc strong { color: rgba(255,255,255,0.92); font-weight: 600; }
    .card-desc em { color: rgba(0,242,255,0.85); font-style: italic; }
    .card-desc code {
      font-family: var(--font-mono); font-size: 11px;
      background: rgba(0,242,255,0.06); border: 1px solid rgba(0,242,255,0.15);
      border-radius: 4px; padding: 1px 5px; color: #00F2FF;
    }
    .card-desc a { color: #00F2FF; text-decoration: underline; }
    .card-desc h1, .card-desc h2, .card-desc h3 {
      font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.9); margin: 8px 0 4px;
    }

    .project-card { cursor: pointer; }

    .card-video {
      position: relative; width: 100%;
      padding-bottom: 56.25%; /* 16:9 */
      border-radius: 8px; overflow: hidden;
      border: 1px solid rgba(0,242,255,0.15);
    }
    .card-video iframe {
      position: absolute; inset: 0;
      width: 100%; height: 100%;
      border: none;
    }

    .card-stack { display: flex; flex-wrap: wrap; gap: 5px; margin-top: auto; }
    .card-tags { display: flex; flex-wrap: wrap; gap: 5px; }
    .tag-clickable { transition: background 0.2s; }

    .card-bottom {
      display: flex; justify-content: space-between; align-items: center;
      margin-top: auto;
    }
    .card-stack-small { display: flex; gap: 8px; }
    .stack-item { font-size: 11px; color: rgba(255,255,255,0.5); font-family: var(--font-mono); }
    .card-year {
      font-size: 11px; color: rgba(255,255,255,0.45);
      font-family: var(--font-mono);
    }

    .page-header, .filter-bar, .featured-section, .all-section { position: relative; z-index: 1; }

    @media (max-width: 600px) {
      .featured-grid, .projects-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class RepositoryComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('circuitCanvas') circuitCanvasRef!: ElementRef<HTMLCanvasElement>;

  private http      = inject(HttpClient);
  private zone      = inject(NgZone);
  private sanitizer = inject(DomSanitizer);

  readonly projects   = signal<Project[]>([]);
  readonly activeTag  = signal<string>('');
  readonly expandedId = signal<string | null>(null);

  safeVideoUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  toggleDesc(id: string): void {
    this.expandedId.update(cur => cur === id ? null : id);
  }

  private circuitRaf = 0;

  readonly featured = computed(() => this.projects().filter(p => p.featured));

  readonly allTags = computed(() => {
    const tags = new Set<string>();
    this.projects().forEach(p => p.tags.forEach(t => tags.add(t)));
    return [...tags];
  });

  readonly displayed = computed(() => {
    const tag = this.activeTag();
    const all = this.projects();
    if (!tag) return all.filter(p => !p.featured);
    return all.filter(p => p.tags.includes(tag));
  });

  ngOnInit(): void {
    this.http.get<Project[]>('/assets/data/projects.json').subscribe(data => {
      this.projects.set(data);
    });
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => this.initCircuitCanvas());
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.circuitRaf);
  }

  private initCircuitCanvas(): void {
    const canvas = this.circuitCanvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    interface Trace {
      points: {x:number;y:number}[];
      color: string;
    }

    interface Pulse {
      traceIdx: number;
      progress: number;
      speed: number;
      color: string;
    }

    const W = () => canvas.width, H = () => canvas.height;

    const generateTraces = (): Trace[] => {
      const traces: Trace[] = [];
      const gridW = Math.ceil(W() / 60), gridH = Math.ceil(H() / 60);

      for (let i = 0; i < 35; i++) {
        const startX = Math.floor(Math.random() * gridW) * 60 + 30;
        const startY = Math.floor(Math.random() * gridH) * 60 + 30;
        const points: {x:number;y:number}[] = [{ x: startX, y: startY }];
        let cx = startX, cy = startY;
        const steps = 3 + Math.floor(Math.random() * 5);
        for (let s = 0; s < steps; s++) {
          const dir = Math.random() < 0.5 ? 'h' : 'v';
          const dist = (1 + Math.floor(Math.random() * 3)) * 60;
          if (dir === 'h') { cx += Math.random() < 0.5 ? dist : -dist; }
          else { cy += Math.random() < 0.5 ? dist : -dist; }
          cx = Math.max(0, Math.min(W(), cx));
          cy = Math.max(0, Math.min(H(), cy));
          points.push({ x: cx, y: cy });
        }
        traces.push({ points, color: Math.random() < 0.6 ? 'rgba(0,242,255,' : 'rgba(0,180,200,' });
      }
      return traces;
    };

    const traces = generateTraces();

    const pulses: Pulse[] = Array.from({ length: 20 }, () => ({
      traceIdx: Math.floor(Math.random() * traces.length),
      progress: Math.random(),
      speed: 0.002 + Math.random() * 0.003,
      color: Math.random() < 0.7 ? '#00F2FF' : '#7ee8a2',
    }));

    const ctx = canvas.getContext('2d')!;

    const getPulsePos = (trace: Trace, t: number): {x:number;y:number}|null => {
      if (trace.points.length < 2) return null;
      const totalLen = trace.points.reduce((acc, p, i) => {
        if (i === 0) return acc;
        const dx = p.x - trace.points[i-1].x, dy = p.y - trace.points[i-1].y;
        return acc + Math.sqrt(dx*dx+dy*dy);
      }, 0);
      const target = t * totalLen;
      let acc = 0;
      for (let i = 1; i < trace.points.length; i++) {
        const dx = trace.points[i].x - trace.points[i-1].x;
        const dy = trace.points[i].y - trace.points[i-1].y;
        const segLen = Math.sqrt(dx*dx+dy*dy);
        if (acc + segLen >= target) {
          const frac = (target - acc) / segLen;
          return { x: trace.points[i-1].x + dx*frac, y: trace.points[i-1].y + dy*frac };
        }
        acc += segLen;
      }
      return trace.points[trace.points.length-1];
    };

    const draw = () => {
      ctx.clearRect(0, 0, W(), H());

      for (const trace of traces) {
        if (trace.points.length < 2) continue;
        ctx.beginPath();
        ctx.moveTo(trace.points[0].x, trace.points[0].y);
        for (let i = 1; i < trace.points.length; i++) {
          ctx.lineTo(trace.points[i].x, trace.points[i].y);
        }
        ctx.strokeStyle = trace.color + '0.06)';
        ctx.lineWidth = 1;
        ctx.stroke();

        for (const p of trace.points) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = trace.color + '0.1)';
          ctx.fill();
        }
      }

      for (const pulse of pulses) {
        pulse.progress += pulse.speed;
        if (pulse.progress > 1) pulse.progress = 0;
        const trace = traces[pulse.traceIdx];
        const pos = getPulsePos(trace, pulse.progress);
        if (pos) {
          const pGrad = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, 8);
          pGrad.addColorStop(0, pulse.color);
          pGrad.addColorStop(1, 'transparent');
          ctx.fillStyle = pGrad;
          ctx.globalAlpha = 0.8;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
          ctx.fill();

          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#fff';
          ctx.globalAlpha = 0.9;
          ctx.fill();

          ctx.globalAlpha = 1;
        }
      }

      this.circuitRaf = requestAnimationFrame(draw);
    };
    draw();
  }
}
