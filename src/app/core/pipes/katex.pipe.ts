import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import katex from 'katex';

@Pipe({ name: 'katex', standalone: true })
export class KatexPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(latex: string, display = false): SafeHtml {
    try {
      const html = katex.renderToString(latex, {
        throwOnError: false,
        displayMode: display,
        output: 'html',
      });
      return this.sanitizer.bypassSecurityTrustHtml(html);
    } catch {
      return this.sanitizer.bypassSecurityTrustHtml(latex);
    }
  }
}
