import {
  Component, ChangeDetectionStrategy, AfterViewInit, OnDestroy,
  ViewChild, ElementRef, NgZone, inject
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { RevealDirective } from '../../core/directives/reveal.directive';

const FORM_EMBED_URL =
  'https://docs.google.com/forms/d/e/1FAIpQLScqPCDLVU8GZoeVkE_FbXVc-ZraYWR72yQ-w-ZjxMg6XsC0ag/viewform?embedded=true';

const CHANNELS = [
  {
    icon: '⬡',
    label: 'LinkedIn',
    handle: '/in/rishabh-singhal-036ab618b',
    description: 'Best for professional conversations — networking, research collaborations, or just to say hi.',
    href: 'https://www.linkedin.com/in/rishabh-singhal-036ab618b/',
    action: 'Connect →',
    color: '#00F2FF',
    note: 'Responds within 24 h',
  },
  {
    icon: '◈',
    label: 'Email',
    handle: 'r.singhal.com@gmail.com',
    description: 'For direct, longer-form conversations — hiring enquiries, research collabs, or deep dives.',
    href: 'mailto:r.singhal.com@gmail.com',
    action: 'Send email →',
    color: '#c084fc',
    note: 'Preferred for hiring & collabs',
  },
  {
    icon: '⬢',
    label: 'GitHub',
    handle: '@Rishu827',
    description: 'Code reviews, open-source contributions, bug reports, or raising an issue on any project.',
    href: 'https://github.com/Rishu827',
    action: 'View profile →',
    color: '#34d399',
    note: 'Open to PRs & reviews',
  },
  {
    icon: '⌬',
    label: 'Topmate',
    handle: 'rishabh_singhal27',
    description: 'Best for personalized mentorship — career guidance, mock interviews, or dedicated 1:1 strategy sessions.',
    href: 'https://topmate.io/rishabh_singhal27/',
    action: 'Explore Services →',
    color: '#FF914D',
    note: 'Limited slots available weekly',
  },
];

const TOPICS = [
  { icon: '⚛', text: 'Quantum computing research & qutrit systems' },
  { icon: '⬢', text: 'Large-scale distributed systems & SDE roles' },
  { icon: '∞', text: 'Graph theory, graphlets & network analysis' },
  { icon: '⚗', text: 'Academic collaborations & co-authorship' },
  { icon: '◎', text: 'Hiring, internships & tech opportunities' },
  { icon: '✦', text: 'Portfolio feedback & general thoughts' },
];

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page dimension-view">
      <canvas #tunnelCanvas class="tunnel-canvas" aria-hidden="true"></canvas>

      <!-- Header -->
      <header class="page-header" appReveal>
        <span class="dim-badge q-tag q-tag-cyan">DIMENSION 7</span>
        <h1 class="page-title">Contact</h1>
        <p class="page-sub">
          Quantum tunneling — signals that bridge the potential barrier between dimensions.
        </p>
      </header>

      <!-- Channel cards -->
      <section class="channels-grid">
        @for (ch of channels; track ch.label; let i = $index) {
          <a class="channel-card glass glass-hover"
             [href]="ch.href"
             target="_blank"
             rel="noopener noreferrer"
             appReveal [delay]="i * 70">
            <div class="ch-top">
              <span class="ch-icon" [style.color]="ch.color">{{ ch.icon }}</span>
              <span class="ch-label" [style.color]="ch.color">{{ ch.label }}</span>
            </div>
            <p class="ch-handle">{{ ch.handle }}</p>
            <p class="ch-desc">{{ ch.description }}</p>
            <div class="ch-footer">
              <span class="ch-note">{{ ch.note }}</span>
              <span class="ch-action" [style.color]="ch.color">{{ ch.action }}</span>
            </div>
          </a>
        }
      </section>

      <!-- Topics -->
      <section class="topics-section" appReveal [delay]="200">
        <h2 class="section-title">Open to discussing</h2>
        <div class="topics-grid">
          @for (t of topics; track t.text) {
            <div class="topic-item">
              <span class="topic-icon">{{ t.icon }}</span>
              <span class="topic-text">{{ t.text }}</span>
            </div>
          }
        </div>
      </section>

      <!-- Embedded feedback form -->
      <section class="form-section" appReveal [delay]="260">
        <div class="form-header">
          <span class="form-icon">✦</span>
          <div class="form-header-text">
            <h2 class="form-title">Leave a message</h2>
            <p class="form-sub">Comment, suggestion, or feedback.</p>
          </div>
          <span class="form-anon-badge q-tag">GREETINGS</span>
        </div>
        <div class="form-wrap glass">
          <iframe
            [src]="formUrl"
            class="form-iframe"
            frameborder="0"
            marginheight="0"
            marginwidth="0"
            title="Feedback form">
            Loading…
          </iframe>
        </div>
      </section>

      <!-- System status -->
      <section class="status-section" appReveal [delay]="320">
        <div class="status-card glass">
          <span class="status-dot"></span>
          <span class="status-text">Signal active · Open to new conversations</span>
          <span class="status-id">SIG-2025-∞</span>
        </div>
      </section>

    </div>
  `,
  styles: [`
    .page { background: var(--color-obsidian); padding-bottom: 80px; position: relative; min-height: 100vh; }

    .tunnel-canvas {
      position: fixed; inset: 0; z-index: 0;
      width: 100%; height: 100%;
      pointer-events: none;
    }

    /* ── Header ──────────────────────────────────────── */
    .page-header {
      max-width: 1100px; margin: 0 auto;
      padding: 60px 24px 36px;
      display: flex; flex-direction: column; gap: 12px;
      position: relative; z-index: 1;
    }
    .dim-badge { font-size: 10px !important; letter-spacing: 0.15em; align-self: flex-start; }
    .page-title { font-size: clamp(32px, 5vw, 52px); font-weight: 700; color: rgba(255,255,255,0.92); }
    .page-sub   { font-size: 15px; color: rgba(255,255,255,0.62); line-height: 1.7; max-width: 560px; }

    /* ── Channel cards ───────────────────────────────── */
    .channels-grid {
      max-width: 1100px; margin: 0 auto 48px;
      padding: 0 24px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
      position: relative; z-index: 1;
    }
    .channel-card {
      padding: 26px;
      display: flex; flex-direction: column; gap: 12px;
      text-decoration: none; color: inherit;
      transition: transform 0.25s cubic-bezier(0.23,1,0.32,1);
    }
    .channel-card:hover { transform: translateY(-4px); }

    .ch-top { display: flex; align-items: center; gap: 10px; }
    .ch-icon  { font-size: 22px !important; flex-shrink: 0; }
    .ch-label { font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; }
    .ch-handle {
      font-family: var(--font-mono);
      font-size: 12px; color: rgba(255,255,255,0.72); margin: 0;
    }
    .ch-desc {
      font-size: 13px; color: rgba(255,255,255,0.62);
      line-height: 1.65; margin: 0; flex: 1;
    }
    .ch-footer {
      display: flex; align-items: center; justify-content: space-between;
      margin-top: auto; padding-top: 8px;
      border-top: 1px solid rgba(255,255,255,0.06);
    }
    .ch-note   { font-size: 11px; color: rgba(255,255,255,0.38); font-family: var(--font-mono); }
    .ch-action { font-size: 12px; font-weight: 600; letter-spacing: 0.04em; }

    /* ── Topics ──────────────────────────────────────── */
    .topics-section {
      max-width: 1100px; margin: 0 auto 48px;
      padding: 0 24px;
      position: relative; z-index: 1;
    }
    .section-title {
      font-size: 11px; font-weight: 600;
      text-transform: uppercase; letter-spacing: 0.15em;
      color: rgba(255,255,255,0.42);
      margin-bottom: 16px;
    }
    .topics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 10px;
    }
    .topic-item {
      display: flex; align-items: center; gap: 12px;
      padding: 12px 16px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.06);
      border-radius: 10px;
    }
    .topic-icon { font-size: 14px; opacity: 0.7; flex-shrink: 0; }
    .topic-text { font-size: 13px; color: rgba(255,255,255,0.65); }

    /* ── Embedded form ───────────────────────────────── */
    .form-section {
      max-width: 1100px; margin: 0 auto 36px;
      padding: 0 24px;
      position: relative; z-index: 1;
    }
    .form-header {
      display: flex; align-items: center; gap: 14px;
      margin-bottom: 16px;
    }
    .form-icon {
      font-size: 20px; color: #f59e0b; flex-shrink: 0;
    }
    .form-header-text { flex: 1; }
    .form-title {
      font-size: 16px; font-weight: 600;
      color: rgba(255,255,255,0.88); margin: 0 0 2px;
    }
    .form-sub {
      font-size: 12px; color: rgba(255,255,255,0.45); margin: 0;
    }
    .form-anon-badge {
      font-size: 10px !important; letter-spacing: 0.12em;
      background: rgba(245,158,11,0.1) !important;
      border-color: rgba(245,158,11,0.3) !important;
      color: #f59e0b !important;
      align-self: flex-start;
    }
    .form-wrap {
      overflow: hidden;
      border-radius: var(--radius-glass);
      padding: 0;
    }
    .form-iframe {
      display: block;
      width: 100%;
      height: 680px;
      border: none;
      background: transparent;
      filter: invert(0.92) hue-rotate(180deg) brightness(0.95);
    }

    /* ── Status ──────────────────────────────────────── */
    .status-section {
      max-width: 1100px; margin: 0 auto;
      padding: 0 24px;
      position: relative; z-index: 1;
    }
    .status-card {
      display: flex; align-items: center; gap: 12px;
      padding: 14px 20px;
    }
    .status-dot {
      width: 8px; height: 8px; border-radius: 50%;
      background: #00F2FF;
      box-shadow: 0 0 8px #00F2FF;
      animation: status-pulse 2.5s infinite;
      flex-shrink: 0;
    }
    @keyframes status-pulse {
      0%, 100% { opacity: 1; box-shadow: 0 0 8px #00F2FF; }
      50%       { opacity: 0.5; box-shadow: 0 0 3px #00F2FF; }
    }
    .status-text { font-size: 13px; color: rgba(255,255,255,0.62); flex: 1; }
    .status-id {
      font-family: var(--font-mono); font-size: 10px;
      color: rgba(255,255,255,0.2); letter-spacing: 0.08em;
    }

    @media (max-width: 600px) {
      .channels-grid { grid-template-columns: 1fr; }
      .topics-grid   { grid-template-columns: 1fr; }
      .form-iframe   { height: 780px; filter: invert(0.92) hue-rotate(180deg) brightness(0.95); }
    }
  `]
})
export class ContactComponent implements AfterViewInit, OnDestroy {
  @ViewChild('tunnelCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private zone      = inject(NgZone);
  private sanitizer = inject(DomSanitizer);
  private raf = 0;

  readonly channels = CHANNELS;
  readonly topics   = TOPICS;
  readonly formUrl: SafeResourceUrl =
    this.sanitizer.bypassSecurityTrustResourceUrl(FORM_EMBED_URL);

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => this.initCanvas());
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.raf);
  }

  // ── Quantum tunneling visualisation ───────────────────────────────────────
  // Horizontal wave stripes travel rightward. At the barrier (~40% of width)
  // the amplitude decays exponentially (ψ ∝ e^{−κx}) and re-emerges at a
  // reduced transmission coefficient T on the far side, mirroring quantum
  // tunneling through a potential barrier.
  private initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const ctx = canvas.getContext('2d')!;
    let t = 0;

    const N_WAVES   = 9;
    const k         = 0.013;
    const omega     = 0.022;
    const kappa     = 0.065;
    const T_COEFF   = 0.30;
    const BARRIER_F = 0.42;
    const BARRIER_W = 52;

    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      const bx  = W * BARRIER_F;
      const amp = H / (N_WAVES * 3.0);

      const bg = ctx.createLinearGradient(bx - BARRIER_W, 0, bx + BARRIER_W, 0);
      bg.addColorStop(0,   'rgba(0,242,255,0)');
      bg.addColorStop(0.5, 'rgba(0,242,255,0.06)');
      bg.addColorStop(1,   'rgba(0,242,255,0)');
      ctx.fillStyle = bg;
      ctx.fillRect(bx - BARRIER_W, 0, BARRIER_W * 2, H);

      ctx.beginPath();
      ctx.moveTo(bx, 0); ctx.lineTo(bx, H);
      ctx.strokeStyle = 'rgba(0,242,255,0.12)';
      ctx.lineWidth = 1;
      ctx.stroke();

      for (let i = 0; i < N_WAVES; i++) {
        const cy        = H * (i + 0.5) / N_WAVES;
        const phaseOff  = i * 0.85;
        const baseAlpha = 0.09 + (i % 3 === 1 ? 0.05 : 0);

        ctx.beginPath();
        for (let x = 0; x <= bx - BARRIER_W; x += 2) {
          const y = cy + amp * Math.sin(k * x - omega * t + phaseOff);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(0,242,255,${baseAlpha})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.beginPath();
        const bStart = bx - BARRIER_W;
        for (let x = bStart; x <= bx + BARRIER_W; x += 1) {
          const dx      = x - bStart;
          const decayed = amp * Math.exp(-kappa * dx);
          const y       = cy + decayed * Math.sin(k * x - omega * t + phaseOff);
          x === bStart ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(0,242,255,${baseAlpha * 0.55})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        const tStart = bx + BARRIER_W;
        for (let x = tStart; x <= W; x += 2) {
          const y = cy + amp * T_COEFF * Math.sin(k * x - omega * t + phaseOff);
          x === tStart ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(0,242,255,${baseAlpha * T_COEFF * 1.8})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      t += 0.65;
      this.raf = requestAnimationFrame(draw);
    };
    draw();
  }
}
