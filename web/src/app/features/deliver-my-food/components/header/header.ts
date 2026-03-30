import { Component, ViewChild, ElementRef, signal, output } from '@angular/core';
import { AppService } from '../../services/app.service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  goTo = output<string>();
  name: string = 'Marco';
  @ViewChild('mainContainer') header!: ElementRef;
  isHeaderSmall = signal<boolean>(false);
  headerSize = signal<'smaller' | 'small' | 'regular'>('regular');
  balance = signal<number>(0);

  constructor(private appService: AppService) {}

  ngOnInit() {
    this.appService.getBalance().subscribe((value: any) => {
      this.balance.set(value);
    });
  }

  ngAfterViewInit() {
    if (!this.header) return;

    const observer = new ResizeObserver((entries) => {
      this.updateHeaderLayout(entries[0].contentRect.width);
    });
    observer.observe(this.header.nativeElement);
  }

  updateHeaderLayout(width: number) {
    if (width <= 630) {
      this.headerSize.set('smaller');
    } else if (width > 630 && width < 720) {
      this.headerSize.set('small');
    } else {
      this.headerSize.set('regular');
    }
  }
}
