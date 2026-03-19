import { Injectable, NgZone, OnDestroy } from '@angular/core';

interface Wave {
  x: number; y: number;
  freq: number; phase: number; amp: number;
}

@Injectable({ providedIn: 'root' })
export class QuantumCanvasService implements OnDestroy {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private offscreen: HTMLCanvasElement | null = null;
  private offCtx: CanvasRenderingContext2D | null = null;
  private rafId = 0;
  private t = 0;

  // Color state (engineer=cyan, researcher=purple)
  private cr = 0; private cg = 242; private cb = 255;

  // Two-source interference
  private s1x = 0.25; private s1y = 0.5;
  private s2x = 0.75; private s2y = 0.5;
  private readonly SCALE = 0.35;

  constructor(private zone: NgZone) {}

  attach(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.resize();
    window.addEventListener('resize', this.resize.bind(this));
    this.zone.runOutsideAngular(() => this.loop());
  }

  detach(): void {
    cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.resize.bind(this));
    this.canvas = null;
    this.ctx = null;
  }

  setMode(mode: 'engineer' | 'researcher'): void {
    if (mode === 'researcher') {
      this.cr = 112; this.cg = 0; this.cb = 255;
    } else {
      this.cr = 0; this.cg = 242; this.cb = 255;
    }
  }

  private resize(): void {
    if (!this.canvas) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    this.canvas.width  = W;
    this.canvas.height = H;
    const sw = Math.floor(W * this.SCALE);
    const sh = Math.floor(H * this.SCALE);
    this.offscreen = document.createElement('canvas');
    this.offscreen.width  = sw;
    this.offscreen.height = sh;
    this.offCtx = this.offscreen.getContext('2d');
  }

  private loop(): void {
    this.draw();
    this.rafId = requestAnimationFrame(() => this.loop());
  }

  private draw(): void {
    if (!this.canvas || !this.ctx || !this.offscreen || !this.offCtx) return;
    this.t += 0.012;

    const W = this.offscreen.width;
    const H = this.offscreen.height;
    const imageData = this.offCtx.createImageData(W, H);
    const data = imageData.data;

    const x1 = this.s1x * W; const y1 = this.s1y * H;
    const x2 = this.s2x * W; const y2 = this.s2y * H;
    const lambda = W * 0.09;
    const k = (2 * Math.PI) / lambda;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const r1 = Math.sqrt((x - x1) ** 2 + (y - y1) ** 2);
        const r2 = Math.sqrt((x - x2) ** 2 + (y - y2) ** 2);
        const v1 = Math.sin(k * r1 - this.t);
        const v2 = Math.sin(k * r2 - this.t);
        const amp = ((v1 + v2) / 2 + 1) / 2; // 0..1

        const idx = (y * W + x) * 4;
        data[idx]     = this.cr * amp * 0.12;
        data[idx + 1] = this.cg * amp * 0.12;
        data[idx + 2] = this.cb * amp * 0.12;
        data[idx + 3] = amp * 28;
      }
    }

    this.offCtx.putImageData(imageData, 0, 0);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.drawImage(this.offscreen, 0, 0, this.canvas.width, this.canvas.height);
  }

  ngOnDestroy(): void {
    this.detach();
  }
}
