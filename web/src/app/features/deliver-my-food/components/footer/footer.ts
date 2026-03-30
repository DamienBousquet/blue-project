import { Component, ViewChild, ElementRef, signal } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  @ViewChild('mainContainer') footer!: ElementRef;
  footerSize = signal<'small' | 'regular'>('regular');

  ngAfterViewInit() {
    if (!this.footer) return;

    const observer = new ResizeObserver((entries) => {
      this.updateHeaderLayout(entries[0].contentRect.width);
    });
    observer.observe(this.footer.nativeElement);
  }

  updateHeaderLayout(width: number) {
    if (width <= 550) {
      this.footerSize.set('small');
    } else {
      this.footerSize.set('regular');
    }
  }
}
