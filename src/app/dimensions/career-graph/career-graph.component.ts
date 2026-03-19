import {
  Component, ChangeDetectionStrategy, ViewChild, ElementRef,
  AfterViewInit, OnDestroy, NgZone, inject, signal
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as d3 from 'd3';
import { UpperCasePipe } from '@angular/common';
import { RevealDirective } from '../../core/directives/reveal.directive';
import { CareerGraph, CareerNode, Experience } from '../../core/models/portfolio.schema';

type ViewTab = 'timeline' | 'graph';

// Group → color
const GC: Record<number, string> = {
  0: '#00F2FF',  // person
  1: '#a78bfa',  // core skills
  2: '#38bdf8',  // tech skills
  3: '#6ee7b7',  // tools
  4: '#fbbf24',  // education
  5: '#f472b6',  // experience
  6: '#34d399',  // projects
  7: '#c084fc',  // publications
};

const LEGEND_ITEMS = [
  { label: 'Core Skills',  g: 1 },
  { label: 'Tech Stack',   g: 2 },
  { label: 'Tools',        g: 3 },
  { label: 'Education',    g: 4 },
  { label: 'Experience',   g: 5 },
  { label: 'Projects',     g: 6 },
  { label: 'Publications', g: 7 },
];

interface SimNode extends CareerNode, d3.SimulationNodeDatum {}
interface SimLink extends d3.SimulationLinkDatum<SimNode> { strength?: number }

function nodeR(d: SimNode): number {
  if (d.type === 'person')     return 22;
  if (d.type === 'experience') return 13;
  if (d.type === 'education')  return 12;
  if (d.type === 'project')    return 10;
  return 8;
}

@Component({
  selector: 'app-career-graph',
  standalone: true,
  imports: [RevealDirective, UpperCasePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page dimension-view">
      <!-- Header -->
      <header class="page-header" appReveal>
        <span class="dim-badge q-tag q-tag-cyan">DIMENSION 1</span>
        <h1 class="page-title">Career</h1>
        <p class="page-sub">Professional experience and an interactive force-directed map of skills, projects, and publications.</p>
      </header>

      <!-- Tab bar -->
      <div class="tab-bar" appReveal [delay]="60">
        <button class="tab-btn" [class.active]="tab() === 'timeline'" (click)="switchTab('timeline')">
          <span>◎</span> Experience
        </button>
        <button class="tab-btn" [class.active]="tab() === 'graph'" (click)="switchTab('graph')">
          <span>⬡</span> Graph
        </button>

        @if (tab() === 'graph') {
          <button class="fit-btn" (click)="zoomToFit()" title="Zoom to fit">⊡ Fit</button>
          <div class="search-wrap">
            <input class="search-input" type="text" placeholder="Search nodes…"
                   [value]="searchQuery()"
                   (input)="onSearch($event)" />
          </div>
        }
      </div>

      <!-- ── GRAPH VIEW ── -->
      @if (tab() === 'graph') {
        <div class="graph-wrap">
          <svg #svg class="graph-svg"></svg>

          <!-- Detail panel -->
          @if (selected()) {
            <div class="detail-panel glass">
              <button class="panel-close" (click)="selected.set(null)">✕</button>
              <div class="panel-type q-tag q-tag-cyan" style="align-self:flex-start; font-size:10px">
                {{ selected()!.type | uppercase }}
              </div>
              <h3 class="panel-title">{{ selected()!.label }}</h3>
              @if (selected()!.description) {
                <p class="panel-desc">{{ selected()!.description }}</p>
              }
              @if (selected()!.tags?.length) {
                <div class="panel-tags">
                  @for (t of selected()!.tags!; track t) {
                    <span class="q-tag q-tag-cyan">{{ t }}</span>
                  }
                </div>
              }
              @if (selected()!.url) {
                <a [href]="selected()!.url" class="panel-link">Open →</a>
              }
            </div>
          }
        </div>
      }

      <!-- ── TIMELINE VIEW ── -->
      @if (tab() === 'timeline') {
        <div class="timeline-section">
          <canvas #neuralCanvas class="neural-canvas" aria-hidden="true"></canvas>
          <div class="timeline-wrap">
            <div class="timeline-line"></div>
            @for (exp of experiences(); track exp.id; let i = $index) {
              <div class="tl-item" appReveal [delay]="i * 65" [class.right]="i % 2 === 1">
                <div class="tl-dot"></div>
                <div class="exp-card glass glass-hover">
                  <div class="exp-meta">
                    <span class="exp-type q-tag" [class]="typeClass(exp.type)">{{ exp.type }}</span>
                    <span class="exp-dates">{{ exp.start }} — {{ exp.end }}</span>
                  </div>
                  <h3 class="exp-role">{{ exp.role }}</h3>
                  <p class="exp-company">{{ exp.company }} · {{ exp.location }}</p>
                  <p class="exp-desc">{{ exp.description }}</p>
                  <ul class="exp-bullets">
                    @for (b of exp.bullets; track b) {
                      <li>{{ b }}</li>
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
      }
    </div>
  `,
  styles: [`
    .page { background: var(--color-obsidian); }

    .page-header {
      max-width: 1000px; margin: 0 auto;
      padding: 60px 24px 20px;
      display: flex; flex-direction: column; gap: 10px;
    }
    .dim-badge { font-size: 10px !important; letter-spacing: 0.15em; align-self: flex-start; }
    .page-title { font-size: clamp(30px, 5vw, 48px); font-weight: 700; color: rgba(255,255,255,0.92); }
    .page-sub   { font-size: 14px; color: rgba(255,255,255,0.65); line-height: 1.6; }

    /* ── Tab bar ──────────────────────────────────────── */
    .tab-bar {
      display: flex; align-items: center; gap: 4px;
      padding: 0 24px;
      border-bottom: 1px solid rgba(255,255,255,0.07);
      max-width: 100%;
    }
    .tab-btn {
      display: flex; align-items: center; gap: 7px;
      padding: 10px 18px; border-radius: 10px 10px 0 0;
      background: none; border: none;
      font-size: 13px; font-weight: 500;
      color: rgba(255,255,255,0.5);
      position: relative; bottom: -1px;
      border-bottom: 2px solid transparent;
      transition: color 0.2s, border-color 0.2s;
    }
    .tab-btn:hover { color: rgba(255,255,255,0.8); }
    .tab-btn.active { color: #00F2FF; border-bottom-color: #00F2FF; }

    .fit-btn {
      margin-left: 12px; padding: 5px 12px; border-radius: 7px;
      background: rgba(0,242,255,0.07); border: 1px solid rgba(0,242,255,0.2);
      color: rgba(0,242,255,0.8); font-size: 12px;
      transition: background 0.2s;
    }
    .fit-btn:hover { background: rgba(0,242,255,0.14); }

    .search-wrap { margin-left: auto; padding: 4px 0; }
    .search-input {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 5px 12px;
      font-size: 12px; color: rgba(255,255,255,0.8);
      width: 180px; outline: none;
      transition: border-color 0.2s;
    }
    .search-input:focus { border-color: rgba(0,242,255,0.35); }
    .search-input::placeholder { color: rgba(255,255,255,0.3); }

    /* ── Graph wrap ───────────────────────────────────── */
    .graph-wrap {
      position: relative;
      width: 100%; height: calc(100vh - 200px);
      min-height: 500px;
    }
    .graph-svg { width: 100%; height: 100%; display: block; }

    /* ── Detail panel ─────────────────────────────────── */
    .detail-panel {
      position: absolute; top: 16px; right: 16px;
      width: 270px; padding: 20px;
      display: flex; flex-direction: column; gap: 10px;
      z-index: 10; border-radius: 14px !important;
    }
    .panel-close {
      position: absolute; top: 12px; right: 12px;
      background: none; border: none;
      color: rgba(255,255,255,0.45); font-size: 13px;
      transition: color 0.2s;
    }
    .panel-close:hover { color: rgba(255,255,255,0.9); }
    .panel-title { font-size: 16px; font-weight: 600; color: rgba(255,255,255,0.92); }
    .panel-desc  { font-size: 12px; color: rgba(255,255,255,0.7); line-height: 1.6; }
    .panel-tags  { display: flex; flex-wrap: wrap; gap: 5px; }
    .panel-link  { font-size: 12px; color: #00F2FF; text-decoration: none; }

    /* ── Timeline section ─────────────────────────────── */
    .timeline-section { position: relative; padding-bottom: 80px; }
    .neural-canvas {
      position: fixed; inset: 0; z-index: 0;
      width: 100%; height: 100%;
      pointer-events: none; opacity: 0.1;
    }
    .timeline-wrap {
      max-width: 900px; margin: 32px auto 0;
      padding: 0 24px;
      position: relative; z-index: 1;
      display: flex; flex-direction: column; gap: 28px;
    }
    .timeline-line {
      position: absolute; left: 50%; top: 0; bottom: 0;
      width: 1px; background: rgba(0,242,255,0.12);
      transform: translateX(-50%);
    }
    .tl-item {
      position: relative;
      width: calc(50% - 24px);
      align-self: flex-start;
    }
    .tl-item.right { align-self: flex-end; }
    .tl-dot {
      position: absolute; top: 22px;
      width: 9px; height: 9px; border-radius: 50%;
      background: #00F2FF; box-shadow: 0 0 8px rgba(0,242,255,0.6);
    }
    .tl-item:not(.right) .tl-dot { right: -28px; }
    .tl-item.right .tl-dot       { left:  -28px; }

    .exp-card { padding: 20px; display: flex; flex-direction: column; gap: 10px; }
    .exp-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .exp-dates { font-size: 11px; color: rgba(255,255,255,0.5); font-family: var(--font-mono); }
    .exp-role    { font-size: 16px; font-weight: 600; color: rgba(255,255,255,0.95); }
    .exp-company { font-size: 13px; color: rgba(255,255,255,0.62); }
    .exp-desc    { font-size: 13px; color: rgba(255,255,255,0.7); line-height: 1.6; }
    .exp-bullets {
      margin: 0; padding-left: 16px;
      display: flex; flex-direction: column; gap: 5px;
    }
    .exp-bullets li { font-size: 12px; color: rgba(255,255,255,0.72); line-height: 1.55; }
    .exp-bullets li::marker { color: #00F2FF; }
    .exp-skills { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 4px; }

    @media (max-width: 700px) {
      .timeline-line, .tl-dot { display: none; }
      .tl-item, .tl-item.right { width: 100%; align-self: stretch; }
    }
  `]
})
export class CareerGraphComponent implements AfterViewInit, OnDestroy {
  @ViewChild('svg', { static: false }) svgRef?: ElementRef<SVGSVGElement>;
  @ViewChild('neuralCanvas', { static: false }) canvasRef?: ElementRef<HTMLCanvasElement>;

  private http = inject(HttpClient);
  private zone = inject(NgZone);

  readonly tab          = signal<ViewTab>('timeline');
  readonly selected     = signal<CareerNode | null>(null);
  readonly searchQuery  = signal('');
  readonly experiences  = signal<Experience[]>([]);

  private simulation!: d3.Simulation<SimNode, SimLink>;
  private zoomBehavior!: d3.ZoomBehavior<SVGSVGElement, unknown>;
  private nodesSel?: d3.Selection<SVGGElement, SimNode, SVGGElement, unknown>;
  private linksSel?: d3.Selection<SVGPathElement, SimLink, SVGGElement, unknown>;
  private allNodes: SimNode[] = [];
  private resizeObs?: ResizeObserver;
  private neuralRaf = 0;
  private neuralNodes: { x: number; y: number; vx: number; vy: number }[] = [];
  private graphData?: CareerGraph;

  ngAfterViewInit(): void {
    this.http.get<Experience[]>('/assets/data/experience.json').subscribe(d => {
      this.experiences.set(d);
    });
    this.http.get<CareerGraph>('/assets/data/career-nodes.json').subscribe(data => {
      this.graphData = data;
    });
    // Default tab is timeline — init canvas after view renders
    setTimeout(() => this.zone.runOutsideAngular(() => this.initNeuralCanvas()), 50);
  }

  ngOnDestroy(): void {
    this.simulation?.stop();
    this.resizeObs?.disconnect();
    cancelAnimationFrame(this.neuralRaf);
  }

  switchTab(t: ViewTab): void {
    this.tab.set(t);
    if (t === 'graph') {
      // @if destroys/recreates the SVG each time — always rebuild
      this.simulation?.stop();
      this.resizeObs?.disconnect();
      setTimeout(() => {
        if (this.svgRef && this.graphData) {
          this.zone.runOutsideAngular(() => this.buildGraph(this.graphData!));
        }
      }, 50);
    }
    if (t === 'timeline') {
      setTimeout(() => this.zone.runOutsideAngular(() => this.initNeuralCanvas()), 50);
    }
  }

  zoomToFit(): void {
    if (!this.svgEl || !this.zoomBehavior || !this.allNodes.length) return;
    const W = this.svgEl.clientWidth;
    const H = this.svgEl.clientHeight;
    const xs = this.allNodes.map(n => n.x ?? 0);
    const ys = this.allNodes.map(n => n.y ?? 0);
    const x0 = Math.min(...xs), x1 = Math.max(...xs);
    const y0 = Math.min(...ys), y1 = Math.max(...ys);
    const pad = 60;
    const scale = Math.min(0.9, (W - pad * 2) / (x1 - x0), (H - pad * 2) / (y1 - y0));
    const tx = W / 2 - scale * (x0 + x1) / 2;
    const ty = H / 2 - scale * (y0 + y1) / 2;
    d3.select(this.svgEl).transition().duration(600)
      .call(this.zoomBehavior.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
  }

  onSearch(e: Event): void {
    const q = (e.target as HTMLInputElement).value.toLowerCase();
    this.searchQuery.set(q);
    this.nodesSel?.select('circle')
      .attr('opacity', (d: SimNode) =>
        !q || d.label.toLowerCase().includes(q) || d.type.toLowerCase().includes(q) ? 1 : 0.15
      );
    this.nodesSel?.select('text')
      .attr('opacity', (d: SimNode) =>
        !q || d.label.toLowerCase().includes(q) ? 1 : 0.1
      );
  }

  typeClass(type: string): string {
    return { 'full-time': 'q-tag-cyan', internship: 'q-tag-purple',
              research: 'q-tag-purple', contract: 'q-tag-cyan' }[type] ?? 'q-tag-cyan';
  }

  private get svgEl(): SVGSVGElement | undefined {
    return this.svgRef?.nativeElement;
  }

  private buildGraph(data: CareerGraph): void {
    const svgEl = this.svgRef!.nativeElement;
    const W = svgEl.clientWidth  || window.innerWidth;
    const H = svgEl.clientHeight || 600;

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    // ── Defs ─────────────────────────────────────────────
    const defs = svg.append('defs');

    // Glow filter
    const glow = defs.append('filter').attr('id', 'node-glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    glow.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'blur');
    const feMerge = glow.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'blur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Radial gradients per group
    Object.entries(GC).forEach(([g, color]) => {
      const grad = defs.append('radialGradient')
        .attr('id', `rg-${g}`).attr('cx', '35%').attr('cy', '35%');
      grad.append('stop').attr('offset', '0%')
          .attr('stop-color', color).attr('stop-opacity', 0.7);
      grad.append('stop').attr('offset', '100%')
          .attr('stop-color', color).attr('stop-opacity', 0.08);
    });

    // ── Zoom ──────────────────────────────────────────────
    const g = svg.append('g');
    this.zoomBehavior = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on('zoom', e => g.attr('transform', e.transform));
    svg.call(this.zoomBehavior);
    svg.on('dblclick.zoom', null);

    // ── Data ──────────────────────────────────────────────
    const nodes: SimNode[] = data.nodes.map(n => ({ ...n }));
    this.allNodes = nodes;
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const links: SimLink[] = data.links
      .filter(l => nodeMap.has(l.source as string) && nodeMap.has(l.target as string))
      .map(l => ({
        source: nodeMap.get(l.source as string)!,
        target: nodeMap.get(l.target as string)!,
        strength: l.strength
      }));

    // ── Simulation ────────────────────────────────────────
    this.simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink<SimNode, SimLink>(links)
        .id(d => d.id)
        .distance(d => 70 / (d.strength ?? 0.5))
        .strength(d => (d.strength ?? 0.5) * 0.8))
      .force('charge',  d3.forceManyBody().strength(-280).distanceMax(400))
      .force('center',  d3.forceCenter(W / 2, H / 2).strength(0.05))
      .force('collide', d3.forceCollide<SimNode>(d => nodeR(d) + 12).strength(0.7))
      .alphaDecay(0.025);

    // ── Links (curved paths) ──────────────────────────────
    const linkG = g.append('g').attr('class', 'links');
    this.linksSel = linkG.selectAll<SVGPathElement, SimLink>('path')
      .data(links).join('path')
      .attr('fill', 'none')
      .attr('stroke', (d: SimLink) => {
        const src = d.source as SimNode;
        return GC[src.group] ?? 'rgba(255,255,255,0.15)';
      })
      .attr('stroke-opacity', (d: SimLink) => 0.15 + (d.strength ?? 0.5) * 0.25)
      .attr('stroke-width',   (d: SimLink) => 0.8 + (d.strength ?? 0.5) * 1.5);

    // ── Nodes ─────────────────────────────────────────────
    const nodeG = g.append('g').attr('class', 'nodes');
    this.nodesSel = nodeG.selectAll<SVGGElement, SimNode>('g')
      .data(nodes).join('g')
      .call(d3.drag<SVGGElement, SimNode>()
        .on('start', (e, d) => {
          if (!e.active) this.simulation.alphaTarget(0.3).restart();
          d.fx = d.x; d.fy = d.y;
        })
        .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
        .on('end',  (e, _d) => {
          if (!e.active) this.simulation.alphaTarget(0);
          // Node stays pinned at drop position; rest of graph re-adjusts
          // Double-click the node to release it
        }))
      .on('click', (_, d) => this.zone.run(() => this.selected.set(d)))
      .on('dblclick', (e, d) => {
        e.stopPropagation();
        d.fx = null; d.fy = null;
        this.simulation.alpha(0.3).restart();
      })
      .on('mouseenter', (_, d) => this.highlightNeighbors(d, true))
      .on('mouseleave', ()     => this.highlightNeighbors(null, false));

    // Outer glow ring (person node only)
    this.nodesSel.filter(d => d.type === 'person')
      .append('circle')
      .attr('r', d => nodeR(d) + 8)
      .attr('fill', 'none')
      .attr('stroke', d => GC[d.group])
      .attr('stroke-width', 1)
      .attr('stroke-opacity', 0.25)
      .attr('stroke-dasharray', '4 3');

    // Main circle with gradient fill
    this.nodesSel.append('circle')
      .attr('r', d => nodeR(d))
      .attr('fill', d => `url(#rg-${d.group})`)
      .attr('stroke', d => GC[d.group] ?? '#fff')
      .attr('stroke-width', d => d.type === 'person' ? 2 : 1.2)
      .attr('filter', 'url(#node-glow)');

    // Label background pill
    this.nodesSel.append('rect')
      .attr('rx', 3).attr('ry', 3)
      .attr('fill', 'rgba(5,5,5,0.72)')
      .attr('class', 'label-bg');

    // Label text
    this.nodesSel.append('text')
      .attr('class', 'node-label')
      .text(d => d.label)
      .attr('text-anchor', 'middle')
      .attr('dy', d => nodeR(d) + 13)
      .attr('fill', d => GC[d.group] ?? 'rgba(255,255,255,0.75)')
      .attr('font-size', d => d.type === 'person' ? 11 : 9)
      .attr('font-family', 'Space Grotesk, sans-serif')
      .attr('font-weight', d => d.type === 'person' ? '700' : '500')
      .attr('pointer-events', 'none');

    // Size label background after text render
    this.nodesSel.each(function() {
      const grp  = d3.select(this);
      const txt  = grp.select<SVGTextElement>('text.node-label');
      const bg   = grp.select<SVGRectElement>('rect.label-bg');
      if (txt.empty() || bg.empty()) return;
      try {
        const bb = (txt.node() as SVGTextElement).getBBox();
        bg.attr('x', bb.x - 3).attr('y', bb.y - 1)
          .attr('width', bb.width + 6).attr('height', bb.height + 2);
      } catch {}
    });

    // ── SVG-embedded legend ───────────────────────────────
    this.buildLegend(svg, W, H);

    // ── Tick ─────────────────────────────────────────────
    this.simulation.on('tick', () => {
      this.linksSel!.attr('d', (d: SimLink) => {
        const sx = (d.source as SimNode).x ?? 0, sy = (d.source as SimNode).y ?? 0;
        const tx = (d.target as SimNode).x ?? 0, ty = (d.target as SimNode).y ?? 0;
        const dr = Math.sqrt((tx - sx) ** 2 + (ty - sy) ** 2) * 1.2;
        return `M${sx},${sy}A${dr},${dr} 0 0,1 ${tx},${ty}`;
      });
      this.nodesSel!.attr('transform', d => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    // Zoom to fit after simulation settles
    this.simulation.on('end', () => this.zoomToFit());

    // ── Resize observer ───────────────────────────────────
    this.resizeObs = new ResizeObserver(() => {
      const nW = svgEl.clientWidth;
      const nH = svgEl.clientHeight;
      if (!nW || !nH) return;
      svg.attr('viewBox', null);
      this.simulation.force('center', d3.forceCenter(nW / 2, nH / 2).strength(0.05));
      this.simulation.alpha(0.15).restart();
      // Reposition legend
      svg.select<SVGGElement>('.svg-legend')
        .attr('transform', `translate(${nW - 160}, ${nH - LEGEND_ITEMS.length * 20 - 16})`);
    });
    this.resizeObs.observe(svgEl);
  }

  private buildLegend(
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    W: number, H: number
  ): void {
    const lh = LEGEND_ITEMS.length * 20 + 20;
    const lw = 148;
    const lx = W - lw - 12;
    const ly = H - lh - 12;

    const leg = svg.append('g').attr('class', 'svg-legend')
      .attr('transform', `translate(${lx}, ${ly})`);

    // Background
    leg.append('rect')
      .attr('width', lw).attr('height', lh)
      .attr('rx', 10)
      .attr('fill', 'rgba(8,8,18,0.82)')
      .attr('stroke', 'rgba(255,255,255,0.08)')
      .attr('stroke-width', 1);

    LEGEND_ITEMS.forEach(({ label, g }, i) => {
      const row = leg.append('g').attr('transform', `translate(12, ${14 + i * 20})`);
      row.append('circle').attr('r', 5).attr('cx', 5)
        .attr('fill', GC[g]).attr('fill-opacity', 0.85)
        .attr('filter', 'url(#node-glow)');
      row.append('text').text(label)
        .attr('x', 16).attr('dy', '0.35em')
        .attr('fill', 'rgba(255,255,255,0.7)')
        .attr('font-size', 10)
        .attr('font-family', 'Space Grotesk, sans-serif');
    });
  }

  private highlightNeighbors(hovered: SimNode | null, entering: boolean): void {
    if (!this.linksSel || !this.nodesSel) return;
    if (!entering || !hovered) {
      this.nodesSel.attr('opacity', 1);
      this.linksSel.attr('stroke-opacity', (d: SimLink) => 0.15 + (d.strength ?? 0.5) * 0.25);
      return;
    }
    const connectedIds = new Set<string>([hovered.id]);
    this.linksSel.each((d: SimLink) => {
      const s = (d.source as SimNode).id, t = (d.target as SimNode).id;
      if (s === hovered.id) connectedIds.add(t);
      if (t === hovered.id) connectedIds.add(s);
    });
    this.nodesSel.attr('opacity', (d: SimNode) => connectedIds.has(d.id) ? 1 : 0.18);
    this.linksSel.attr('stroke-opacity', (d: SimLink) => {
      const s = (d.source as SimNode).id, t = (d.target as SimNode).id;
      return (s === hovered.id || t === hovered.id)
        ? 0.55 + (d.strength ?? 0.5) * 0.35
        : 0.04;
    });
  }

  private initNeuralCanvas(): void {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    if (!this.neuralNodes.length) {
      for (let i = 0; i < 40; i++) this.neuralNodes.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      });
    }
    const ctx = canvas.getContext('2d')!;
    const draw = () => {
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);
      for (const n of this.neuralNodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > W) n.vx *= -1;
        if (n.y < 0 || n.y > H) n.vy *= -1;
      }
      for (let i = 0; i < this.neuralNodes.length; i++) {
        for (let j = i + 1; j < this.neuralNodes.length; j++) {
          const dx = this.neuralNodes[i].x - this.neuralNodes[j].x;
          const dy = this.neuralNodes[i].y - this.neuralNodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.globalAlpha = (1 - dist / 130) * 0.3;
            ctx.strokeStyle = 'rgba(0,242,255,0.8)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(this.neuralNodes[i].x, this.neuralNodes[i].y);
            ctx.lineTo(this.neuralNodes[j].x, this.neuralNodes[j].y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      for (const n of this.neuralNodes) {
        ctx.beginPath(); ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,242,255,0.5)'; ctx.fill();
      }
      this.neuralRaf = requestAnimationFrame(draw);
    };
    draw();
  }
}
