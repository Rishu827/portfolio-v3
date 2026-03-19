import { Directive, ElementRef, HostListener, input } from '@angular/core';

@Directive({
  selector: '[appMagnetic]',
  standalone: true
})
export class MagneticDirective {
  strength = input<number>(0.3);

  constructor(private el: ElementRef<HTMLElement>) {}

  @HostListener('mousemove', ['$event'])
  onMove(e: MouseEvent): void {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) * this.strength();
    const dy = (e.clientY - cy) * this.strength();
    this.el.nativeElement.style.transform = `translate(${dx}px, ${dy}px)`;
    this.el.nativeElement.style.transition = 'transform 0.1s ease';
  }

  @HostListener('mouseleave')
  onLeave(): void {
    this.el.nativeElement.style.transform = 'translate(0,0)';
    this.el.nativeElement.style.transition = 'transform 0.4s cubic-bezier(0.23,1,0.32,1)';
  }
}
