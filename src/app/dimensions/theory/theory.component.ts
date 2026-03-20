import {
  Component, ChangeDetectionStrategy, signal, ViewChild, ElementRef,
  AfterViewInit, OnDestroy, NgZone, inject
} from '@angular/core';
import { RevealDirective } from '../../core/directives/reveal.directive';
import { KatexPipe } from '../../core/pipes/katex.pipe';

interface TheoryCard {
  id: string;
  title: string;
  subtitle: string;
  body: string;
  equations: string[];
  tags: string[];
  icon: string;
}

const THEORY_CARDS: TheoryCard[] = [
  {
    id: 'qutrit-msd',
    icon: '⚛',
    title: 'Qutrit Magic State Distillation',
    subtitle: 'High-threshold routines for fault-tolerant qutrits — arXiv:2408.00436',
    body: 'Magic state distillation purifies noisy "magic states" required for universal fault-tolerant quantum computation beyond the stabiliser formalism. For qutrits (d=3), the relevant magic state is |T⟩. My research searches systematically for distillation routines — built from self-dual additive codes over GF(9) — with thresholds exceeding prior art, reducing the overhead for qutrit-based fault-tolerant quantum computers.',
    equations: [
      '|T\\rangle = \\frac{1}{\\sqrt{2}}(|0\\rangle + e^{i\\pi/4}|1\\rangle)',
      'p_{\\text{out}} = \\frac{p_{\\text{in}}^k}{p_{\\text{in}}^k + (1-p_{\\text{in}})^k} < p_{\\text{in}} \\iff p_{\\text{in}} < p_{\\text{threshold}}',
    ],
    tags: ['Qutrits', 'Magic State Distillation', 'Fault-Tolerant QC', 'GF(9)'],
  },
  {
    id: 'qutrit-stabiliser',
    icon: '◎',
    title: 'Qutrit Stabiliser Codes over GF(9)',
    subtitle: 'Self-dual additive codes for quantum error correction',
    body: 'My BTech thesis develops quantum error correction for qutrits using self-dual additive codes over the finite field GF(9). The qutrit Pauli group has structure Z₃ × Z₃ at each site. A stabiliser code is defined by a commutative subgroup S of the Pauli group; logical qutrits are cosets of S. Self-duality over GF(9) is the key algebraic property ensuring efficient error correction.',
    equations: [
      '[[n, k, d]]_3 : \\text{ encodes } k \\text{ qutrits into } n \\text{ with distance } d',
      'H_i H_j = \\omega^{\\delta_{ij}} H_j H_i, \\quad \\omega = e^{2\\pi i/3}',
    ],
    tags: ['Quantum Error Correction', 'Stabiliser Codes', 'GF(9)', 'Qutrits'],
  },
  {
    id: 'conflict-free-coloring',
    icon: '⬡',
    title: 'Conflict-Free Graph Coloring',
    subtitle: 'Novel heuristic for two-colorability — Springer + Australian Patent',
    body: 'Conflict-free coloring requires every vertex\'s closed neighbourhood N[v] to contain at least one vertex with a unique color. Deciding whether a graph is CF two-colorable is NP-hard. My published heuristic (Springer AISC, DOI: 10.1007/978-981-15-8025-3_33) estimates two-colorability using structural graph properties, achieving high accuracy on real-world graphs. This work was subsequently granted Australian Patent 2021104261.',
    equations: [
      '\\forall v \\in V,\\; \\exists u \\in N[v] : c(u) \\neq c(w) \\; \\forall w \\in N[u] \\setminus \\{u\\}',
      '\\chi_{CF}(G) = \\min\\{k : G \\text{ has a CF } k\\text{-coloring}\\}',
    ],
    tags: ['Graph Coloring', 'NP-Hard Approximation', 'Combinatorics', 'Patent'],
  },
  {
    id: 'graphlet-analysis',
    icon: '⬢',
    title: 'Graphlet Analysis of Complex Networks',
    subtitle: 'Orbit-based network characterisation — UNBC / MITACS',
    body: 'Graphlets are small connected non-isomorphic subgraphs. Each node belongs to specific automorphic orbits within graphlets, providing a fine-grained structural signature beyond degree. My MITACS research at UNBC under Prof. Alex Aravind designed efficient algorithms for graphlet and orbit enumeration on large real-world networks, revealing structural properties invisible to standard centrality measures.',
    equations: [
      'GDV_i = (o_{i,0}, o_{i,1}, \\ldots, o_{i,72}) \\in \\mathbb{Z}^{73}',
      'S(u,v) = \\sum_{j=0}^{72} w_j \\cdot \\frac{|o_{u,j} - o_{v,j}|}{\\max(o_{u,j}, o_{v,j})}',
    ],
    tags: ['Graph Theory', 'Network Analysis', 'Algorithms', 'MITACS'],
  },
  {
    id: 'social-network-centrality',
    icon: '◈',
    title: 'Evolution-Based Centrality in Social Networks',
    subtitle: 'Robust centrality measuring topology-change resilience — IIT Hyderabad',
    body: 'Classic centrality measures (betweenness, closeness, eigenvector) are brittle to local topology changes. My research at IIT Hyderabad (TEQIP internship, 2019) designed a novel evolution-based centrality that incorporates how a node\'s centrality responds to small perturbations in its local neighbourhood — capturing structural robustness alongside influence. Implemented using the NetworkX library.',
    equations: [
      'C_{\\text{evo}}(v) = C_{\\text{classic}}(v) \\cdot \\left(1 - \\frac{\\Delta C(v)}{C_{\\text{classic}}(v)}\\right)',
      '\\Delta C(v) = \\mathbb{E}_{e \\sim \\partial N(v)}[|C(v) - C\'(v)|]',
    ],
    tags: ['Social Networks', 'Centrality', 'Graph Theory', 'IIT Hyderabad'],
  },
  {
    id: 'successive-iteration',
    icon: '∞',
    title: 'Successive Iteration for Higher-Dimensional Functions',
    subtitle: 'Extended numerical analysis technique — DEI',
    body: 'Classical successive iteration is a fixed-point technique for scalar functions. My undergraduate research at DEI extended it to functions of higher dimensions, formulating conditions under which the iteration converges, proving the extended formulas, and implementing the algorithm in C. The work introduces a tensor-based generalisation of the classical convergence criterion.',
    equations: [
      'x_{n+1} = F(x_n), \\quad x \\in \\mathbb{R}^d',
      '\\|J_F(x)\\| < 1 \\Rightarrow \\text{convergence of iteration}',
    ],
    tags: ['Numerical Analysis', 'Fixed-Point Iteration', 'C', 'DEI'],
  },
];

@Component({
  selector: 'app-theory',
  standalone: true,
  imports: [RevealDirective, KatexPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page dimension-view">
      <canvas #hilbertCanvas class="hilbert-canvas" aria-hidden="true"></canvas>

      <header class="page-header" appReveal>
        <span class="dim-badge q-tag q-tag-purple">DIMENSION 5</span>
        <h1 class="page-title">Theoretical Computing</h1>
        <p class="page-sub">
          Hilbert space — mathematical foundations of quantum algorithms, machine learning, and complexity theory.
        </p>
      </header>

      <div class="cards-grid">
        @for (card of cards(); track card.id; let i = $index) {
          <div class="theory-card glass glass-hover" appReveal [delay]="i * 70"
               (click)="toggle(card.id)">
            <div class="card-header">
              <span class="card-icon">{{ card.icon }}</span>
              <div class="card-info">
                <span class="theorem-label">{{ i % 2 === 0 ? 'THEOREM' : 'RESULT' }}</span>
                <h3 class="card-title">{{ card.title }}</h3>
                <p class="card-subtitle">{{ card.subtitle }}</p>
              </div>
            </div>

            <div class="card-body" [class.expanded]="expanded() === card.id">
              <p class="card-text">{{ card.body }}</p>
              <div class="equations">
                @for (eq of card.equations; track eq) {
                  <div class="eq-block" [innerHTML]="eq | katex:true"></div>
                }
              </div>
              <div class="card-tags">
                @for (t of card.tags; track t) {
                  <span class="q-tag q-tag-purple">{{ t }}</span>
                }
              </div>
            </div>

            <div class="card-footer">
              <span class="expand-hint">
                {{ expanded() === card.id ? '[ COLLAPSE ]' : '[ EXPAND ]' }}
              </span>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .page { background: var(--color-obsidian); padding-bottom: 80px; position: relative; }

    .hilbert-canvas { position: fixed; inset: 0; z-index: 0; width: 100%; height: 100%; pointer-events: none; }

    .page-header {
      max-width: 1100px; margin: 0 auto;
      padding: 60px 24px 32px;
      display: flex; flex-direction: column; gap: 12px;
      position: relative; z-index: 1;
    }
    .dim-badge { font-size: 10px !important; letter-spacing: 0.15em; align-self: flex-start; }
    .page-title { font-size: clamp(32px, 5vw, 52px); font-weight: 700; color: rgba(255,255,255,0.92); }
    .page-sub   { font-size: 15px; color: rgba(255,255,255,0.72); line-height: 1.7; max-width: 560px; }

    .cards-grid {
      max-width: 1100px; margin: 0 auto;
      padding: 0 24px 60px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 20px;
      position: relative; z-index: 1;
    }

    .theory-card {
      padding: 24px;
      display: flex; flex-direction: column; gap: 16px;
      cursor: pointer;
      border-left: 2px solid rgba(168,85,247,0.15);
      transition: border-color 0.3s, box-shadow 0.3s;
    }
    .theory-card:hover { border-left-color: rgba(168,85,247,0.5); }

    .card-header { display: flex; gap: 14px; align-items: flex-start; }
    .card-icon { font-size: 28px; color: #a855f7; flex-shrink: 0; margin-top: 2px; }
    .card-info { display: flex; flex-direction: column; gap: 4px; }
    .theorem-label { font-size: 9px; font-family: var(--font-mono); color: rgba(168,85,247,0.5); letter-spacing: 0.2em; text-transform: uppercase; }
    .card-title { font-size: 16px; font-weight: 600; color: rgba(255,255,255,0.9); }
    .card-subtitle { font-size: 12px; color: rgba(255,255,255,0.62); }

    .card-body {
      display: flex; flex-direction: column; gap: 14px;
      max-height: 0; overflow: hidden;
      transition: max-height 0.5s cubic-bezier(0.23,1,0.32,1);
    }
    .card-body.expanded { max-height: 600px; }
    .card-text { font-size: 13px; color: rgba(255,255,255,0.78); line-height: 1.7; }

    .equations { display: flex; flex-direction: column; gap: 10px; }
    .eq-block {
      background: rgba(112,0,255,0.06);
      border: 1px solid rgba(112,0,255,0.18);
      border-radius: 8px;
      padding: 14px 20px;
      overflow-x: auto;
      text-align: center;
    }
    /* KaTeX output theming */
    .eq-block .katex { color: rgba(216,180,254,0.95); font-size: 1.1em; }
    .eq-block .katex-display { margin: 0; }
    .eq-block .katex-display > .katex { color: rgba(216,180,254,0.95); }

    .card-tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .card-footer { border-top: 1px solid rgba(255,255,255,0.06); padding-top: 12px; }
    .expand-hint {
      font-size: 11px; color: rgba(168,85,247,0.6);
      font-family: var(--font-mono);
    }

    .page-header, .cards-grid { position: relative; z-index: 1; }

    @media (max-width: 600px) {
      .cards-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class TheoryComponent implements AfterViewInit, OnDestroy {
  @ViewChild('hilbertCanvas') hilbertCanvasRef!: ElementRef<HTMLCanvasElement>;

  private zone = inject(NgZone);

  readonly cards = signal(THEORY_CARDS);
  readonly expanded = signal<string | null>(null);

  private hilbertRaf = 0;
  private hilbertT = 0;

  toggle(id: string): void {
    this.expanded.update(cur => cur === id ? null : id);
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => this.initHilbertCanvas());
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.hilbertRaf);
  }

  private initHilbertCanvas(): void {
    const canvas = this.hilbertCanvasRef.nativeElement;
    const SCALE = 0.3;
    canvas.width = window.innerWidth * SCALE;
    canvas.height = window.innerHeight * SCALE;
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.imageRendering = 'pixelated';

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth * SCALE;
      canvas.height = window.innerHeight * SCALE;
    });

    const ctx = canvas.getContext('2d')!;

    const sources = [
      { kx: 1.5, ky: 0.8, omega: 0.7 },
      { kx: -1.0, ky: 1.2, omega: 0.9 },
      { kx: 0.5, ky: -1.5, omega: 0.5 },
    ];

    const draw = () => {
      this.hilbertT += 0.015;
      const W = canvas.width, H = canvas.height;
      const imageData = ctx.createImageData(W, H);
      const data = imageData.data;

      for (let y = 0; y < H; y++) {
        for (let x = 0; x < W; x++) {
          const nx = (x / W) * 2 * Math.PI - Math.PI;
          const ny = (y / H) * 2 * Math.PI - Math.PI;

          let re = 0, im = 0;
          for (const s of sources) {
            const phase = s.kx * nx + s.ky * ny - s.omega * this.hilbertT;
            re += Math.cos(phase);
            im += Math.sin(phase);
          }
          const amp = Math.sqrt(re*re + im*im) / sources.length;

          const idx = (y * W + x) * 4;
          const r = Math.round(amp * 80);
          const g = Math.round(amp * 30);
          const b = Math.round(amp * 140);
          const a = Math.round(amp * 55);
          data[idx] = r; data[idx+1] = g; data[idx+2] = b; data[idx+3] = a;
        }
      }
      ctx.putImageData(imageData, 0, 0);
      this.hilbertRaf = requestAnimationFrame(draw);
    };
    draw();
  }
}
