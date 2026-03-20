import {
  Component, ChangeDetectionStrategy, inject, signal, computed, OnInit,
  ViewChild, ElementRef, AfterViewInit, OnDestroy, NgZone
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RevealDirective } from '../../core/directives/reveal.directive';
import { Achievement } from '../../core/models/portfolio.schema';

type AchType = Achievement['type'] | 'all';

const TYPE_META: Record<Achievement['type'], { icon: string; label: string; color: string }> = {
  competition:   { icon: '⬡', label: 'Competitions',   color: '#00F2FF' },
  award:         { icon: '◈', label: 'Awards',          color: '#c084fc' },
  certification: { icon: '◎', label: 'Certifications',  color: '#34d399' },
  grant:         { icon: '⚗', label: 'Grants',          color: '#f59e0b' },
};

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page dimension-view">
      <canvas #wofCanvas class="wof-canvas" aria-hidden="true"></canvas>

      <!-- Header -->
      <header class="page-header" appReveal>
        <span class="dim-badge q-tag q-tag-cyan">DIMENSION 5</span>
        <h1 class="page-title">Achievements</h1>
        <p class="page-sub">Detected events — quantum collapses of effort into recognition.</p>
      </header>

      <!-- Stats row -->
      <div class="stats-row" appReveal [delay]="80">
        @for (entry of typeCounts(); track entry.type) {
          <button class="stat-card glass glass-hover"
                  [class.active]="activeType() === entry.type"
                  (click)="activeType.set(entry.type)">
            <span class="stat-icon" [style.color]="entry.color">{{ entry.icon }}</span>
            <span class="stat-value" [style.color]="entry.color">{{ entry.count }}</span>
            <span class="stat-label">{{ entry.label }}</span>
          </button>
        }
        <button class="stat-card glass glass-hover all-btn"
                [class.active]="activeType() === 'all'"
                (click)="activeType.set('all')">
          <span class="stat-icon">∑</span>
          <span class="stat-value">{{ achievements().length }}</span>
          <span class="stat-label">Total</span>
        </button>
      </div>

      <!-- Cards -->
      <div class="cards-grid">
        @for (ach of filtered(); track ach.id; let i = $index) {
          <div class="ach-card glass glass-hover" appReveal [delay]="i * 50">
            <div class="ach-top">
              <span class="ach-icon" [style.color]="typeMeta[ach.type].color">
                {{ typeMeta[ach.type].icon }}
              </span>
              <div class="ach-type-badge q-tag"
                   [style.background]="typeMeta[ach.type].color + '18'"
                   [style.border-color]="typeMeta[ach.type].color + '44'"
                   [style.color]="typeMeta[ach.type].color">
                {{ typeMeta[ach.type].label.slice(0, -1) }}
              </div>
              <span class="ach-year">{{ ach.year }}</span>
            </div>
            <h3 class="ach-title">{{ ach.title }}</h3>
            <p class="ach-org">{{ ach.org }}</p>
            <p class="ach-desc">{{ ach.description }}</p>
            <span class="evt-id">EVT-{{ ach.year }}-0{{ i + 1 }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page { background: var(--color-obsidian); padding-bottom: 80px; position: relative; }

    .wof-canvas { position: fixed; inset: 0; z-index: 0; width: 100%; height: 100%; pointer-events: none; }

    .page-header {
      max-width: 1100px; margin: 0 auto;
      padding: 60px 24px 28px;
      display: flex; flex-direction: column; gap: 12px;
      position: relative; z-index: 1;
    }
    .dim-badge { font-size: 10px !important; letter-spacing: 0.15em; align-self: flex-start; }
    .page-title { font-size: clamp(32px, 5vw, 52px); font-weight: 700; color: rgba(255,255,255,0.92); }
    .page-sub   { font-size: 15px; color: rgba(255,255,255,0.72); line-height: 1.7; max-width: 600px; }

    /* ── Stats row ───────────────────────────────────── */
    .stats-row {
      max-width: 1100px; margin: 0 auto 36px;
      padding: 0 24px;
      display: flex; gap: 12px; flex-wrap: wrap;
      position: relative; z-index: 1;
    }
    .stat-card {
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      padding: 16px 24px; min-width: 110px;
      border: none; text-align: center;
      transition: transform 0.2s cubic-bezier(0.23,1,0.32,1);
    }
    .stat-card:hover { transform: translateY(-2px); }
    .stat-card.active { border-color: rgba(255,255,255,0.2) !important; box-shadow: 0 0 20px rgba(255,255,255,0.05) !important; }
    .stat-icon  { font-size: 18px; }
    .stat-value { font-size: 34px !important; font-weight: 700; line-height: 1; }
    .stat-label { font-size: 11px; color: rgba(255,255,255,0.55); text-transform: uppercase; letter-spacing: 0.06em; }
    .all-btn .stat-icon  { color: rgba(255,255,255,0.7); }
    .all-btn .stat-value { color: rgba(255,255,255,0.85); }

    /* ── Cards grid ──────────────────────────────────── */
    .cards-grid {
      max-width: 1100px; margin: 0 auto;
      padding: 0 24px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
      gap: 16px;
      position: relative; z-index: 1;
    }
    .ach-card {
      padding: 22px;
      display: flex; flex-direction: column; gap: 10px;
      transition: transform 0.25s cubic-bezier(0.23,1,0.32,1);
    }
    .ach-card:hover { transform: translateY(-3px); }

    .ach-top {
      display: flex; align-items: center; gap: 10px;
    }
    .ach-icon  { font-size: 26px !important; flex-shrink: 0; }
    .ach-type-badge {
      font-size: 13px !important; font-weight: 600;
      letter-spacing: 0.06em; text-transform: uppercase;
      padding: 3px 9px; border-radius: 5px; border: 1px solid;
    }
    .ach-year {
      margin-left: auto;
      font-size: 12px; color: rgba(255,255,255,0.55);
      font-family: var(--font-mono); font-weight: 600;
    }
    .ach-title { font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.92); line-height: 1.35; }
    .ach-org   { font-size: 12px; color: rgba(255,255,255,0.55); }
    .ach-desc  { font-size: 12px; color: rgba(255,255,255,0.68); line-height: 1.6; }
    .evt-id { font-family: var(--font-mono); font-size: 9px; color: rgba(255,255,255,0.18); letter-spacing: 0.1em; margin-top: auto; align-self: flex-end; }

    .page-header, .stats-row, .cards-grid { position: relative; z-index: 1; }

    @media (max-width: 600px) {
      .cards-grid { grid-template-columns: 1fr; }
      .stats-row  { gap: 8px; }
      .stat-card  { min-width: 80px; padding: 12px 16px; }
    }
  `]
})
export class AchievementsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('wofCanvas') wofCanvasRef!: ElementRef<HTMLCanvasElement>;

  private http = inject(HttpClient);
  private zone = inject(NgZone);

  readonly achievements = signal<Achievement[]>([]);
  readonly activeType   = signal<AchType>('all');
  readonly typeMeta     = TYPE_META;

  private wofRaf = 0;

  readonly filtered = computed(() => {
    const t = this.activeType();
    return t === 'all' ? this.achievements() : this.achievements().filter(a => a.type === t);
  });

  readonly typeCounts = computed(() =>
    (['competition', 'award', 'certification', 'grant'] as Achievement['type'][]).map(type => ({
      type,
      count: this.achievements().filter(a => a.type === type).length,
      ...TYPE_META[type]
    }))
  );

  ngOnInit(): void {
    this.http.get<Achievement[]>('/assets/data/achievements.json').subscribe(d => {
      this.achievements.set(d);
    });
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => this.initWofCanvas());
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.wofRaf);
  }

  private initWofCanvas(): void {
    const canvas = this.wofCanvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    interface Sparkle {
      x: number; y: number;
      vx: number; vy: number;
      life: number; maxLife: number;
      size: number; color: string;
    }

    const sparkles: Sparkle[] = [];

    const spawnSparkle = () => {
      const colors = ['rgba(251,191,36,', 'rgba(255,215,100,', 'rgba(252,211,77,', 'rgba(255,255,200,'];
      sparkles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.6,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -0.3 - Math.random() * 0.5,
        life: 0,
        maxLife: 120 + Math.random() * 80,
        size: 1 + Math.random() * 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
      if (sparkles.length > 80) sparkles.splice(0, 5);
    };

    const spotlights = [
      { x: 0.25, intensity: 0.06 },
      { x: 0.50, intensity: 0.08 },
      { x: 0.75, intensity: 0.06 },
    ];

    const ctx = canvas.getContext('2d')!;
    let frame = 0;

    const draw = () => {
      frame++;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      for (const sl of spotlights) {
        const grd = ctx.createRadialGradient(
          sl.x * W, 0, 0,
          sl.x * W, 0, H * 0.8
        );
        grd.addColorStop(0, `rgba(251,191,36,${sl.intensity})`);
        grd.addColorStop(0.3, `rgba(251,191,36,${sl.intensity * 0.4})`);
        grd.addColorStop(1, 'transparent');

        ctx.save();
        ctx.beginPath();
        const spreadW = W * 0.2;
        ctx.moveTo(sl.x * W, 0);
        ctx.lineTo(sl.x * W - spreadW, H);
        ctx.lineTo(sl.x * W + spreadW, H);
        ctx.closePath();
        ctx.clip();
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      if (frame % 3 === 0) spawnSparkle();

      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i];
        s.x += s.vx; s.y += s.vy;
        s.life++;
        if (s.life >= s.maxLife) { sparkles.splice(i, 1); continue; }

        const t = s.life / s.maxLife;
        const alpha = t < 0.2 ? t / 0.2 : t > 0.7 ? (1-t)/0.3 : 1;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.color + (alpha * 0.85) + ')';
        ctx.fill();

        if (s.size > 2) {
          ctx.save();
          ctx.translate(s.x, s.y);
          ctx.globalAlpha = alpha * 0.4;
          for (let j = 0; j < 4; j++) {
            ctx.rotate(Math.PI / 4);
            ctx.beginPath();
            ctx.moveTo(0, -s.size * 3);
            ctx.lineTo(0, s.size * 3);
            ctx.strokeStyle = s.color + '0.6)';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
          ctx.restore();
          ctx.globalAlpha = 1;
        }
      }

      this.wofRaf = requestAnimationFrame(draw);
    };
    draw();
  }
}
