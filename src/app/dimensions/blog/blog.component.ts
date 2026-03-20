import {
  Component, ChangeDetectionStrategy, inject, signal, computed, OnInit
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RevealDirective } from '../../core/directives/reveal.directive';
import { BlogPost } from '../../core/models/portfolio.schema';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page dimension-view">
      <!-- Header -->
      <header class="page-header" appReveal>
        <span class="dim-badge q-tag q-tag-cyan">DIMENSION 6</span>
        <h1 class="page-title">Blog</h1>
        <p class="page-sub">Thought experiments — observations that collapse quantum uncertainty into words.</p>
      </header>

      <!-- Tag filters -->
      <div class="tag-filters" appReveal [delay]="80">
        <button class="tag-chip" [class.active]="activeTag() === ''" (click)="activeTag.set('')">
          All
        </button>
        @for (tag of allTags(); track tag) {
          <button class="tag-chip" [class.active]="activeTag() === tag" (click)="activeTag.set(tag)">
            {{ tag }}
          </button>
        }
      </div>

      <!-- Featured post -->
      @if (featuredPost() && !activeTag()) {
        <div class="featured-wrap" appReveal [delay]="100">
          <div class="featured-post glass glass-hover">
            <div class="featured-badge q-tag q-tag-purple">◈ OBSERVATION</div>
            <h2 class="featured-title">{{ featuredPost()!.title }}</h2>
            <p class="featured-excerpt">{{ featuredPost()!.excerpt }}</p>
            <div class="featured-meta">
              <span class="wf-label">WAVEFUNCTION COLLAPSED ON</span>
              <span class="meta-date">{{ formatDate(featuredPost()!.date) }}</span>
              <span class="meta-dot">·</span>
              <span class="meta-read">{{ featuredPost()!.readTime }} min read</span>
              <div class="meta-tags">
                @for (t of featuredPost()!.tags.slice(0, 2); track t) {
                  <span class="q-tag q-tag-cyan">{{ t }}</span>
                }
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Posts grid -->
      <div class="posts-grid">
        @for (post of filteredPosts(); track post.id; let i = $index) {
          @if (!post.featured || activeTag()) {
            <article class="post-card glass glass-hover" appReveal [delay]="i * 60">
              <div class="post-top">
                <div class="post-tags">
                  @for (t of post.tags.slice(0, 2); track t) {
                    <button class="q-tag q-tag-cyan tag-btn" (click)="activeTag.set(t); $event.stopPropagation()">{{ t }}</button>
                  }
                </div>
                <span class="post-read">{{ post.readTime }}m READ</span>
              </div>
              <h3 class="post-title">{{ post.title }}</h3>
              <p class="post-excerpt">{{ post.excerpt }}</p>
              <div class="post-footer">
                <time class="post-date">{{ formatDate(post.date) }}</time>
                <span class="post-arrow post-observe">OBSERVE →</span>
              </div>
            </article>
          }
        }
      </div>

      <!-- Empty state -->
      @if (filteredPosts().length === 0) {
        <div class="empty-state" appReveal>
          <span class="empty-icon">✦</span>
          <p>No posts match <strong>{{ activeTag() }}</strong></p>
          <button class="clear-btn" (click)="activeTag.set('')">Clear filter</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { background: var(--color-obsidian); padding-bottom: 80px; position: relative; }
    .page::before { content: ''; position: fixed; inset: 0; background: radial-gradient(ellipse 80% 40% at 20% 60%, rgba(0,242,255,0.015) 0%, transparent 60%), radial-gradient(ellipse 60% 30% at 80% 30%, rgba(168,85,247,0.015) 0%, transparent 60%); pointer-events: none; z-index: 0; }

    .page-header {
      max-width: 1000px; margin: 0 auto;
      padding: 60px 24px 24px;
      display: flex; flex-direction: column; gap: 12px;
      position: relative; z-index: 1;
    }
    .dim-badge { font-size: 10px !important; letter-spacing: 0.15em; align-self: flex-start; }
    .page-title { font-size: clamp(32px, 5vw, 52px); font-weight: 700; color: rgba(255,255,255,0.92); }
    .page-sub   { font-size: 15px; color: rgba(255,255,255,0.72); line-height: 1.7; }

    .tag-filters {
      max-width: 1000px; margin: 0 auto 28px;
      padding: 0 24px;
      display: flex; gap: 8px; flex-wrap: wrap;
      position: relative; z-index: 1;
    }
    .tag-chip {
      padding: 5px 14px; border-radius: 20px;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      color: rgba(255,255,255,0.4);
      font-size: 12px; font-weight: 500;
      transition: all 0.2s;
    }
    .tag-chip:hover { color: #fff; border-color: rgba(255,255,255,0.2); }
    .tag-chip.active {
      background: rgba(0,242,255,0.1);
      border-color: rgba(0,242,255,0.3);
      color: #00F2FF;
    }

    .featured-wrap {
      max-width: 1000px; margin: 0 auto 28px;
      padding: 0 24px;
      position: relative; z-index: 1;
    }
    .featured-post {
      padding: 32px;
      display: flex; flex-direction: column; gap: 14px;
    }
    .featured-badge {
      font-size: 10px !important; align-self: flex-start;
      background: rgba(0,242,255,0.08) !important;
      border-color: rgba(0,242,255,0.25) !important;
      color: #00F2FF !important;
    }
    .featured-title { font-size: 26px; font-weight: 700; color: rgba(255,255,255,0.92); line-height: 1.3; }
    .featured-excerpt { font-size: 14px; color: rgba(255,255,255,0.75); line-height: 1.7; }
    .featured-meta {
      display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
      font-size: 12px; color: rgba(255,255,255,0.58);
    }
    .wf-label { font-size: 9px; font-family: var(--font-mono); color: rgba(255,255,255,0.25); letter-spacing: 0.15em; }
    .meta-dot { color: rgba(255,255,255,0.2); }
    .meta-tags { display: flex; gap: 6px; margin-left: 8px; }

    .posts-grid {
      max-width: 1000px; margin: 0 auto;
      padding: 0 24px;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 16px;
      position: relative; z-index: 1;
    }

    .post-card {
      padding: 22px;
      display: flex; flex-direction: column; gap: 10px;
      transition: transform 0.3s cubic-bezier(0.23,1,0.32,1);
    }
    .post-card:hover { transform: translateY(-2px); }

    .post-top { display: flex; justify-content: space-between; align-items: center; }
    .post-tags { display: flex; gap: 5px; }
    .tag-btn { font-size: 10px !important; }
    .post-read { font-size: 11px; color: rgba(0,242,255,0.35); font-family: var(--font-mono); letter-spacing: 0.05em; }

    .post-title {
      font-size: 15px; font-weight: 600;
      color: rgba(255,255,255,0.88); line-height: 1.4;
    }
    .post-excerpt {
      font-size: 12px; color: rgba(255,255,255,0.7); line-height: 1.6;
      display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
      flex: 1;
    }
    .post-footer {
      display: flex; justify-content: space-between; align-items: center;
      margin-top: auto; padding-top: 10px;
      border-top: 1px solid rgba(255,255,255,0.05);
    }
    .post-date { font-size: 11px; color: rgba(255,255,255,0.5); font-family: var(--font-mono); }
    .post-arrow { color: rgba(0,242,255,0.5); font-size: 14px; }
    .post-observe { color: rgba(0,242,255,0.6); font-size: 12px; font-family: var(--font-mono); }

    .empty-state {
      max-width: 400px; margin: 60px auto;
      text-align: center;
      display: flex; flex-direction: column; align-items: center; gap: 12px;
      color: rgba(255,255,255,0.35);
    }
    .empty-icon { font-size: 32px; color: rgba(0,242,255,0.3); }
    .empty-state strong { color: #00F2FF; }
    .clear-btn {
      padding: 8px 20px; border-radius: 8px;
      background: rgba(0,242,255,0.08);
      border: 1px solid rgba(0,242,255,0.2);
      color: #00F2FF; font-size: 13px;
      transition: background 0.2s;
    }
    .clear-btn:hover { background: rgba(0,242,255,0.15); }

    @media (max-width: 600px) {
      .posts-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class BlogComponent implements OnInit {
  private http = inject(HttpClient);

  readonly posts     = signal<BlogPost[]>([]);
  readonly activeTag = signal<string>('');

  readonly allTags = computed(() => {
    const tags = new Set<string>();
    this.posts().forEach(p => p.tags.forEach(t => tags.add(t)));
    return [...tags];
  });

  readonly featuredPost = computed(() =>
    this.posts().find(p => p.featured) ?? null
  );

  readonly filteredPosts = computed(() => {
    const tag = this.activeTag();
    return tag ? this.posts().filter(p => p.tags.includes(tag)) : this.posts();
  });

  ngOnInit(): void {
    this.http.get<BlogPost[]>('assets/data/blog-posts.json').subscribe(data => {
      this.posts.set(data);
    });
  }

  formatDate(d: string): string {
    return new Date(d).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }
}
