import {
  Component, ChangeDetectionStrategy, inject, signal, OnInit,
  ViewChild, ElementRef, AfterViewInit, OnDestroy, NgZone
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RevealDirective } from '../../core/directives/reveal.directive';
import { Experience } from '../../core/models/portfolio.schema';

@Component({
  selector: 'app-neural-flow',
  standalone: true,
  imports: [RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page dimension-view">
      <!-- Header -->
      <header class="page-header" appReveal>
        <span class="dim-badge q-tag q-tag-cyan">DIMENSION 3</span>
        <h1 class="page-title">Neural Flow</h1>
        <p class="page-sub">Career trajectory and professional experience.</p>
      </header>

      <!-- Neural network canvas background -->
      <canvas #neuralCanvas class="neural-canvas" aria-hidden="true"></canvas>

      <!-- Timeline -->
      <div class="timeline-wrap">
        <div class="timeline-line"></div>
        @for (exp of experiences(); track exp.id; let i = $index) {
          <div class="timeline-item" appReveal [delay]="i * 80" [class.right]="i % 2 === 1">
            <div class="timeline-dot"></div>
            <div class="exp-card glass glass-hover">
              <div class="exp-header">
                <div class="exp-meta">
                  <span class="exp-type q-tag" [class]="typeClass(exp.type)">{{ exp.type }}</span>
                  <span class="exp-dates">{{ exp.start }} — {{ exp.end }}</span>
                </div>
                <h3 class="exp-role">{{ exp.role }}</h3>
                <p class="exp-company">{{ exp.company }} · {{ exp.location }}</p>
              </div>
              <p class="exp-desc">{{ exp.description }}</p>
              <ul class="exp-bullets">
                @for (b of exp.bullets; track b) {
                  <li class="exp-bullet">{{ b }}</li>
                }
              </ul>
              <div class="exp-skills">
                @for (s of exp.skills; track s) {
                  <span class="q-tag q-tag-cyan">{{ s }}</span>
                }
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page { background: var(--color-obsidian); padding-bottom: 80px; position: relative; }

    .page-header {
      max-width: 900px; margin: 0 auto;
      padding: 60px 24px 40px;
      display: flex; flex-direction: column; gap: 12px;
      position: relative; z-index: 1;
    }
    .dim-badge { font-size: 10px !important; letter-spacing: 0.15em; align-self: flex-start; }
    .page-title { font-size: clamp(32px, 5vw, 52px); font-weight: 700; color: rgba(255,255,255,0.92); }
    .page-sub   { font-size: 15px; color: rgba(255,255,255,0.72); line-height: 1.7; }

    .neural-canvas {
      position: fixed; inset: 0; z-index: 0;
      width: 100%; height: 100%;
      pointer-events: none; opacity: 0.15;
    }

    .timeline-wrap {
      max-width: 900px; margin: 0 auto;
      padding: 0 24px 60px;
      position: relative; z-index: 1;
      display: flex; flex-direction: column; gap: 32px;
    }
    .timeline-line {
      position: absolute; left: 50%; top: 0; bottom: 0;
      width: 1px; background: rgba(0,242,255,0.15);
      transform: translateX(-50%);
    }

    .timeline-item {
      position: relative;
      width: calc(50% - 20px);
      align-self: flex-start;
    }
    .timeline-item.right {
      align-self: flex-end;
    }

    .timeline-dot {
      position: absolute;
      top: 20px;
      width: 10px; height: 10px; border-radius: 50%;
      background: #00F2FF;
      box-shadow: 0 0 10px rgba(0,242,255,0.6);
    }
    .timeline-item:not(.right) .timeline-dot { right: -25px; }
    .timeline-item.right .timeline-dot { left: -25px; }

    .exp-card { padding: 24px; display: flex; flex-direction: column; gap: 12px; }

    .exp-header { display: flex; flex-direction: column; gap: 6px; }
    .exp-meta { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
    .exp-dates { font-size: 11px; color: rgba(255,255,255,0.55); font-family: var(--font-mono); }

    .exp-role    { font-size: 17px; font-weight: 600; color: rgba(255,255,255,0.95); }
    .exp-company { font-size: 13px; color: rgba(255,255,255,0.68); }

    .exp-desc { font-size: 13px; color: rgba(255,255,255,0.72); line-height: 1.6; }

    .exp-bullets { margin: 0; padding-left: 16px; display: flex; flex-direction: column; gap: 6px; }
    .exp-bullet  { font-size: 13px; color: rgba(255,255,255,0.78); line-height: 1.5; }
    .exp-bullet::marker { color: #00F2FF; }

    .exp-skills { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }

    @media (max-width: 700px) {
      .timeline-line { display: none; }
      .timeline-item, .timeline-item.right { width: 100%; align-self: stretch; }
      .timeline-dot { display: none; }
    }
  `]
})
export class NeuralFlowComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('neuralCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private http = inject(HttpClient);
  private zone = inject(NgZone);

  readonly experiences = signal<Experience[]>([]);
  private rafId = 0;
  private nodes: { x: number; y: number; vx: number; vy: number }[] = [];

  ngOnInit(): void {
    this.http.get<Experience[]>('/assets/data/experience.json').subscribe(data => {
      this.experiences.set(data);
    });
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => this.initCanvas());
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
  }

  typeClass(type: string): string {
    const map: Record<string, string> = {
      'full-time': 'q-tag-cyan', 'internship': 'q-tag-purple',
      'research': 'q-tag-purple', 'contract': 'q-tag-cyan'
    };
    return map[type] ?? 'q-tag-cyan';
  }

  private initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Seed nodes
    for (let i = 0; i < 40; i++) {
      this.nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
      });
    }

    const ctx = canvas.getContext('2d')!;
    const draw = () => {
      const W = canvas.width; const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      for (const n of this.nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }

      // Edges
      ctx.strokeStyle = 'rgba(0,242,255,0.15)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < this.nodes.length; i++) {
        for (let j = i + 1; j < this.nodes.length; j++) {
          const dx = this.nodes[i].x - this.nodes[j].x;
          const dy = this.nodes[i].y - this.nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.globalAlpha = (1 - dist / 140) * 0.4;
            ctx.beginPath();
            ctx.moveTo(this.nodes[i].x, this.nodes[i].y);
            ctx.lineTo(this.nodes[j].x, this.nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Nodes
      ctx.globalAlpha = 1;
      for (const n of this.nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,242,255,0.5)';
        ctx.fill();
      }

      this.rafId = requestAnimationFrame(draw);
    };
    draw();
  }
}
