import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appQuantumObserver]',
  standalone: true
})
export class QuantumObserverDirective {
  constructor(private el: ElementRef<HTMLElement>) {}

  @HostListener('mouseenter')
  onEnter(): void {
    const el = this.el.nativeElement;
    el.classList.remove('decohere');
    void el.offsetWidth; // reflow to restart animation
    el.classList.add('decohere');
  }
}
