import {
  Component, ChangeDetectionStrategy, ViewChild, ElementRef,
  AfterViewInit, OnDestroy, inject
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavComponent }          from '../nav/nav.component';
import { AgenticToolbarComponent } from '../agentic-toolbar/agentic-toolbar.component';
import { CustomCursorComponent }  from '../custom-cursor/custom-cursor.component';
import { FooterComponent }        from '../footer/footer.component';
import { QuantumCanvasService }   from '../../core/services/quantum-canvas.service';
import { QuantumStateService }    from '../../core/services/quantum-state.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    RouterOutlet,
    NavComponent,
    AgenticToolbarComponent,
    CustomCursorComponent,
    FooterComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Quantum interference background -->
    <canvas #qCanvas class="quantum-bg" aria-hidden="true"></canvas>

    <app-custom-cursor />
    <app-nav />

    <main class="main-content">
      <router-outlet />
      <app-footer />
    </main>

    <app-agentic-toolbar />
  `,
  styles: [`
    :host { display: block; }
    .quantum-bg {
      position: fixed; inset: 0; z-index: 0;
      width: 100vw; height: 100vh;
      pointer-events: none;
    }
    .main-content {
      position: relative; z-index: 1;
      display: flex; flex-direction: column;
      min-height: 100vh;
    }
  `]
})
export class ShellComponent implements AfterViewInit, OnDestroy {
  @ViewChild('qCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private canvas = inject(QuantumCanvasService);
  private qs     = inject(QuantumStateService);

  ngAfterViewInit(): void {
    this.canvas.attach(this.canvasRef.nativeElement);
  }

  ngOnDestroy(): void {
    this.canvas.detach();
  }
}
