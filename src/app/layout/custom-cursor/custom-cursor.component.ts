import {
  Component, OnInit, OnDestroy, ChangeDetectionStrategy,
  ElementRef, ViewChild, NgZone
} from '@angular/core';

@Component({
  selector: 'app-custom-cursor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div #dot class="cursor-dot"></div>
    <div #ring class="cursor-ring"></div>
  `,
  styles: [`
    .cursor-dot, .cursor-ring {
      position: fixed;
      top: 0; left: 0;
      pointer-events: none;
      z-index: 9999;
      border-radius: 50%;
      transform: translate(-50%, -50%);
      will-change: transform;
    }
    .cursor-dot {
      width: 6px; height: 6px;
      background: #00F2FF;
      box-shadow: 0 0 8px rgba(0,242,255,0.8);
    }
    .cursor-ring {
      width: 32px; height: 32px;
      border: 1px solid rgba(0,242,255,0.4);
      transition: width 0.2s ease, height 0.2s ease, border-color 0.2s ease;
    }
    :host-context([data-mode="researcher"]) .cursor-dot {
      background: #7000FF;
      box-shadow: 0 0 8px rgba(112,0,255,0.8);
    }
    :host-context([data-mode="researcher"]) .cursor-ring {
      border-color: rgba(112,0,255,0.4);
    }
  `]
})
export class CustomCursorComponent implements OnInit, OnDestroy {
  @ViewChild('dot',  { static: true }) dotRef!: ElementRef<HTMLDivElement>;
  @ViewChild('ring', { static: true }) ringRef!: ElementRef<HTMLDivElement>;

  private rx = 0; private ry = 0;
  private rafId = 0;

  constructor(private zone: NgZone) {}

  ngOnInit(): void {
    this.zone.runOutsideAngular(() => {
      document.addEventListener('mousemove', this.onMove);
      document.addEventListener('mousedown', this.onDown);
      document.addEventListener('mouseup',   this.onUp);
      this.animate();
    });
  }

  ngOnDestroy(): void {
    document.removeEventListener('mousemove', this.onMove);
    document.removeEventListener('mousedown', this.onDown);
    document.removeEventListener('mouseup',   this.onUp);
    cancelAnimationFrame(this.rafId);
  }

  private mx = 0; private my = 0;

  private onMove = (e: MouseEvent): void => {
    this.mx = e.clientX;
    this.my = e.clientY;
    this.dotRef.nativeElement.style.transform =
      `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))`;
  };

  private onDown = (): void => {
    const ring = this.ringRef.nativeElement;
    ring.style.width  = '20px';
    ring.style.height = '20px';
    ring.style.borderColor = 'rgba(0,242,255,0.9)';
  };

  private onUp = (): void => {
    const ring = this.ringRef.nativeElement;
    ring.style.width  = '32px';
    ring.style.height = '32px';
    ring.style.borderColor = 'rgba(0,242,255,0.4)';
  };

  private animate = (): void => {
    this.rx += (this.mx - this.rx) * 0.12;
    this.ry += (this.my - this.ry) * 0.12;
    this.ringRef.nativeElement.style.transform =
      `translate(calc(${this.rx}px - 50%), calc(${this.ry}px - 50%))`;
    this.rafId = requestAnimationFrame(this.animate);
  };
}
