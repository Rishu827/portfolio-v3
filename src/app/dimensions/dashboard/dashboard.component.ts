import {
  Component, ChangeDetectionStrategy, ViewChild, ElementRef,
  AfterViewInit, OnDestroy, NgZone, inject, signal
} from '@angular/core';
import * as THREE from 'three';
import { RouterLink } from '@angular/router';
import { QuantumStateService, DIMENSIONS } from '../../core/services/quantum-state.service';
import { RevealDirective } from '../../core/directives/reveal.directive';
import { QuantumObserverDirective } from '../../core/directives/quantum-observer.directive';
import { MagneticDirective } from '../../core/directives/magnetic.directive';

const FACTS = [
  { icon: '⬡', value: '4+', label: 'Years at Big Tech' },
  { icon: '⚛', value: '5+', label: 'Research Outputs' },
  { icon: '◈', value: '8+', label: 'Projects Shipped' },
  { icon: '∞', value: '4',  label: 'Hackathon Awards' },
];

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, RevealDirective, QuantumObserverDirective, MagneticDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="dashboard">
      <!-- Three.js canvas -->
      <canvas #threeCanvas class="three-canvas" aria-hidden="true"></canvas>

      <!-- Hero content -->
      <div class="hero-content">
        <div class="badge q-tag q-tag-cyan" appReveal [delay]="0">SDE3 · GOOGLE · QUANTUM RESEARCHER</div>

        <h1 class="hero-title" appReveal [delay]="100">
          <span appQuantumObserver>Rishabh</span>
          <br />
          <span class="text-gradient" appQuantumObserver>Singhal</span>
        </h1>

        <p class="hero-sub" appReveal [delay]="200">
          Software engineer at Google. Quantum computing researcher (qutrits, magic state distillation).
          Graph theorist. B.Tech EE+CS from DEI · M.Tech AI/ML at BITS Pilani.
        </p>

        <div class="hero-ctas" appReveal [delay]="300">
          <a routerLink="/career" class="cta-primary" appMagnetic>
            Explore Career Graph
          </a>
          <a routerLink="/lab" class="cta-secondary" appMagnetic>
            View Research
          </a>
        </div>
      </div>

      <!-- Stats widgets -->
      <div class="widgets" appReveal [delay]="400">
        @for (f of facts; track f.label) {
          <div class="widget glass glass-hover">
            <span class="widget-icon">{{ f.icon }}</span>
            <span class="widget-value">{{ f.value }}</span>
            <span class="widget-label">{{ f.label }}</span>
          </div>
        }
      </div>

      <!-- Dimension quick-nav -->
      <nav class="dim-nav" appReveal [delay]="500">
        @for (dim of dims.slice(1); track dim.path) {
          <a [routerLink]="'/' + dim.path" class="dim-card glass glass-hover">
            <span class="dim-icon">{{ dim.icon }}</span>
            <span class="dim-label">{{ dim.label }}</span>
          </a>
        }
      </nav>
    </section>
  `,
  styles: [`
    .dashboard {
      position: relative;
      min-height: 100vh;
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 80px 24px 160px;
      overflow: hidden;
    }

    .three-canvas {
      position: absolute; inset: 0;
      width: 100%; height: 100%;
      pointer-events: none; z-index: 0;
      opacity: 0.5;
    }

    .hero-content {
      position: relative; z-index: 1;
      display: flex; flex-direction: column;
      align-items: center; text-align: center;
      gap: 20px; max-width: 680px;
    }

    .badge {
      font-size: 10px !important; letter-spacing: 0.15em;
    }

    .hero-title {
      font-size: clamp(52px, 10vw, 96px);
      font-weight: 700; line-height: 1;
      letter-spacing: -0.03em;
      color: rgba(255,255,255,0.92);
    }

    .hero-sub {
      font-size: 16px; line-height: 1.7;
      color: rgba(255,255,255,0.72);
      max-width: 520px;
    }

    .hero-ctas {
      display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;
      margin-top: 8px;
    }
    .cta-primary {
      padding: 12px 28px; border-radius: 10px;
      background: #00F2FF; color: #050505;
      font-size: 14px; font-weight: 600; text-decoration: none;
      transition: box-shadow 0.3s;
    }
    .cta-primary:hover { box-shadow: 0 0 30px rgba(0,242,255,0.4); }
    .cta-secondary {
      padding: 12px 28px; border-radius: 10px;
      background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.85);
      border: 1px solid rgba(255,255,255,0.15);
      font-size: 14px; font-weight: 500; text-decoration: none;
      transition: border-color 0.3s, color 0.3s;
    }
    .cta-secondary:hover { border-color: rgba(0,242,255,0.3); color: #fff; }

    .widgets {
      position: relative; z-index: 1;
      display: flex; gap: 16px; flex-wrap: wrap;
      justify-content: center; margin-top: 48px;
    }
    .widget {
      display: flex; flex-direction: column;
      align-items: center; gap: 6px;
      padding: 20px 28px; min-width: 120px;
    }
    .widget-icon { font-size: 22px; }
    .widget-value { font-size: 28px; font-weight: 700; color: #00F2FF; line-height: 1; }
    .widget-label { font-size: 11px; color: rgba(255,255,255,0.65); text-align: center; }

    .dim-nav {
      position: relative; z-index: 1;
      display: flex; gap: 12px; flex-wrap: wrap;
      justify-content: center; margin-top: 32px;
      max-width: 900px;
    }
    .dim-card {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 18px; text-decoration: none;
      font-size: 13px; font-weight: 500;
      color: rgba(255,255,255,0.72);
      transition: color 0.2s;
    }
    .dim-card:hover { color: #fff; }
    .dim-icon { font-size: 15px; }

    @media (max-width: 600px) {
      .widgets { gap: 10px; }
      .widget { padding: 16px 20px; min-width: 100px; }
    }
  `]
})
export class DashboardComponent implements AfterViewInit, OnDestroy {
  @ViewChild('threeCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private zone  = inject(NgZone);
  readonly qs   = inject(QuantumStateService);
  readonly dims = DIMENSIONS;
  readonly facts = FACTS;

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private icosahedron!: THREE.Mesh;
  private rafId = 0;

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => this.initThree());
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    this.renderer?.dispose();
  }

  private initThree(): void {
    const canvas = this.canvasRef.nativeElement;
    const W = canvas.clientWidth  || window.innerWidth;
    const H = canvas.clientHeight || window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    this.renderer.setSize(W, H);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.scene  = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    this.camera.position.z = 3.5;

    const geo = new THREE.IcosahedronGeometry(1.2, 1);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x00F2FF,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    this.icosahedron = new THREE.Mesh(geo, mat);
    this.scene.add(this.icosahedron);

    // Inner solid
    const innerGeo = new THREE.IcosahedronGeometry(1.0, 0);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x00F2FF,
      transparent: true,
      opacity: 0.03
    });
    this.scene.add(new THREE.Mesh(innerGeo, innerMat));

    window.addEventListener('resize', this.onResize.bind(this));
    this.animate();
  }

  private animate(): void {
    this.icosahedron.rotation.x += 0.003;
    this.icosahedron.rotation.y += 0.005;
    this.renderer.render(this.scene, this.camera);
    this.rafId = requestAnimationFrame(() => this.animate());
  }

  private onResize(): void {
    const canvas = this.canvasRef.nativeElement;
    const W = canvas.clientWidth;
    const H = canvas.clientHeight;
    if (!W || !H) return;
    this.camera.aspect = W / H;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(W, H);
  }
}
