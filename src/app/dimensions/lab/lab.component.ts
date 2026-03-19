import {
  Component, ChangeDetectionStrategy, inject, signal, computed, OnInit
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RevealDirective } from '../../core/directives/reveal.directive';
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
  imports: [RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page dimension-view">
      <!-- Header -->
      <header class="page-header" appReveal>
        <span class="dim-badge q-tag q-tag-purple">DIMENSION 2</span>
        <h1 class="page-title">Research Lab</h1>
        <p class="page-sub">Publications, patents, and research output in quantum computing, graph theory, and systems engineering.</p>
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
                  <div class="pub-equations">
                    <code class="equation-code">{{ pub.equations![0] }}</code>
                  </div>
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
    .page { background: var(--color-obsidian); padding-bottom: 80px; }

    .page-header {
      max-width: 1000px; margin: 0 auto;
      padding: 60px 24px 24px;
      display: flex; flex-direction: column; gap: 12px;
    }
    .dim-badge { font-size: 10px !important; letter-spacing: 0.15em; align-self: flex-start; }
    .page-title { font-size: clamp(32px, 5vw, 52px); font-weight: 700; color: rgba(255,255,255,0.92); }
    .page-sub   { font-size: 15px; color: rgba(255,255,255,0.72); line-height: 1.7; }

    /* ── Filters ──────────────────────────────────────── */
    .filters {
      max-width: 1000px; margin: 0 auto 28px;
      padding: 0 24px;
      display: flex; gap: 8px; flex-wrap: wrap;
    }
    .filter-chip {
      display: flex; align-items: center; gap: 5px;
      padding: 6px 14px; border-radius: 20px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.6);
      font-size: 12px; font-weight: 500;
      transition: all 0.2s;
    }
    .filter-chip:hover { color: #fff; border-color: rgba(255,255,255,0.18); }
    .filter-chip.active {
      background: rgba(168,85,247,0.1);
      border-color: rgba(168,85,247,0.3);
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
    }
    .pub-card { height: 320px; }

    .flip-front, .flip-back {
      padding: 22px;
      display: flex; flex-direction: column; gap: 10px;
      border-radius: 16px !important;
    }
    .pub-type { font-size: 10px !important; align-self: flex-start; }
    .pub-title {
      font-size: 14px; font-weight: 600;
      color: rgba(255,255,255,0.9); line-height: 1.4;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
    .pub-authors { font-size: 12px; color: rgba(255,255,255,0.65); }
    .pub-venue   { font-size: 12px; color: rgba(255,255,255,0.52); font-style: italic; }
    .pub-equations {
      background: rgba(0,242,255,0.04); border: 1px solid rgba(0,242,255,0.1);
      border-radius: 8px; padding: 8px 12px; overflow: hidden; flex-shrink: 0;
    }
    .equation-code {
      font-family: var(--font-mono); font-size: 11px;
      color: rgba(0,242,255,0.72);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;
    }
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

    @media (max-width: 600px) {
      .pubs-grid { grid-template-columns: 1fr; }
      .pub-card  { height: 360px; }
    }
  `]
})
export class LabComponent implements OnInit {
  private http = inject(HttpClient);

  readonly pubs       = signal<Publication[]>([]);
  readonly pubFilter  = signal<PubType | 'all'>('all');
  readonly pubFilters = PUB_FILTERS;
  readonly typeLabels = TYPE_LABELS;

  readonly filteredPubs = computed(() => {
    const f = this.pubFilter();
    return f === 'all' ? this.pubs() : this.pubs().filter(p => p.type === f);
  });

  ngOnInit(): void {
    this.http.get<Publication[]>('/assets/data/publications.json').subscribe(d => this.pubs.set(d));
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
}
