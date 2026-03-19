import {
  Component, ChangeDetectionStrategy, inject, signal, computed, OnInit
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RevealDirective } from '../../core/directives/reveal.directive';
import { Project } from '../../core/models/portfolio.schema';

@Component({
  selector: 'app-repository',
  standalone: true,
  imports: [RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page dimension-view">
      <!-- Header -->
      <header class="page-header" appReveal>
        <span class="dim-badge q-tag q-tag-cyan">DIMENSION 4</span>
        <h1 class="page-title">Project Repository</h1>
        <p class="page-sub">Open-source tools, experiments, and side projects.</p>
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
          <h2 class="section-label" appReveal [delay]="100">Featured</h2>
          <div class="featured-grid">
            @for (p of featured(); track p.id; let i = $index) {
              <div class="project-card featured-card glass glass-hover" appReveal [delay]="120 + i * 60">
                <div class="card-top">
                  <div class="card-icon">⬢</div>
                  <div class="card-links">
                    @if (p.github) {
                      <a [href]="p.github" target="_blank" rel="noopener" class="icon-link" title="GitHub">⌥</a>
                    }
                    @if (p.demo) {
                      <a [href]="p.demo" target="_blank" rel="noopener" class="icon-link" title="Demo">↗</a>
                    }
                  </div>
                </div>
                <h3 class="card-title">{{ p.title }}</h3>
                <p class="card-tagline">{{ p.tagline }}</p>
                <p class="card-desc">{{ p.description }}</p>
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
          <h2 class="section-label" appReveal [delay]="200">All Projects</h2>
        }
        <div class="projects-grid">
          @for (p of displayed(); track p.id; let i = $index) {
            <div class="project-card glass glass-hover" appReveal [delay]="(activeTag() ? i : i + featured().length) * 50">
              <div class="card-top">
                <div class="card-icon small">◈</div>
                <div class="card-links">
                  @if (p.github) {
                    <a [href]="p.github" target="_blank" rel="noopener" class="icon-link">⌥</a>
                  }
                  @if (p.demo) {
                    <a [href]="p.demo" target="_blank" rel="noopener" class="icon-link">↗</a>
                  }
                </div>
              </div>
              <h3 class="card-title">{{ p.title }}</h3>
              <p class="card-tagline">{{ p.tagline }}</p>
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
    .page { background: var(--color-obsidian); padding-bottom: 80px; }

    .page-header {
      max-width: 1200px; margin: 0 auto;
      padding: 60px 24px 24px;
      display: flex; flex-direction: column; gap: 12px;
    }
    .dim-badge { font-size: 10px !important; letter-spacing: 0.15em; align-self: flex-start; }
    .page-title { font-size: clamp(32px, 5vw, 52px); font-weight: 700; color: rgba(255,255,255,0.92); }
    .page-sub   { font-size: 15px; color: rgba(255,255,255,0.72); line-height: 1.7; }

    .filter-bar {
      max-width: 1200px; margin: 0 auto 32px;
      padding: 0 24px;
      display: flex; gap: 8px; flex-wrap: wrap;
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
    }
    .section-label {
      font-size: 12px; font-weight: 600;
      letter-spacing: 0.1em; text-transform: uppercase;
      color: rgba(255,255,255,0.3);
      margin-bottom: 16px;
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
    }
    .featured-card { padding: 24px; gap: 12px; }

    .card-top { display: flex; justify-content: space-between; align-items: center; }
    .card-icon { font-size: 20px; color: #00F2FF; }
    .card-icon.small { font-size: 16px; }
    .card-links { display: flex; gap: 8px; }
    .icon-link {
      font-size: 16px; color: rgba(255,255,255,0.55);
      text-decoration: none;
      transition: color 0.2s;
    }
    .icon-link:hover { color: #00F2FF; }

    .card-title {
      font-size: 16px; font-weight: 600;
      color: rgba(255,255,255,0.9);
    }
    .featured-card .card-title { font-size: 18px; }
    .card-tagline { font-size: 12px; color: #00F2FF; font-weight: 500; }
    .card-desc { font-size: 12px; color: rgba(255,255,255,0.72); line-height: 1.6; }

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

    @media (max-width: 600px) {
      .featured-grid, .projects-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class RepositoryComponent implements OnInit {
  private http = inject(HttpClient);

  readonly projects  = signal<Project[]>([]);
  readonly activeTag = signal<string>('');

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
}
