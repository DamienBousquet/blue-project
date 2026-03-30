import { input, Component, effect, ViewChild, ElementRef, output } from '@angular/core';
import { BrowserTab } from '../../models/browser-tab.interface';

@Component({
  selector: 'app-browser-tabs',
  imports: [],
  templateUrl: './browser-tabs.html',
  styleUrl: './browser-tabs.scss',
})
export class BrowserTabs {
  firegroxPath: string = '/browser3-logo.png';
  tabs = input<BrowserTab[]>();
  isTabsFull = input<boolean>(false);
  addNewTab = output<void>();
  selectTab = output<string>();
  changeIsTabsFull = output<boolean>();
  closeTab = output<string>();
  @ViewChild('upperSide') upperSide?: ElementRef<HTMLDivElement>;
  @ViewChild('tabsPlacement') tabsPlacement?: ElementRef<HTMLDivElement>;

  constructor() {
    effect(() => {
      const tabs = this.tabs();
      const width = this.upperSide?.nativeElement.offsetWidth;
      if (width) this.updateTabsLayout(width);
    });
  }

  ngAfterViewInit() {
    if (!this.upperSide) return;

    const observer = new ResizeObserver((entries) => {
      this.updateTabsLayout(entries[0].contentRect.width);
    });

    observer.observe(this.upperSide.nativeElement);
  }

  updateTabsLayout(containerWidth: number) {
    const el = this.tabsPlacement?.nativeElement;
    if (!el) return;

    const tabsWidth = containerWidth - 65;
    const tabs = this.tabs();
    if (!tabs) return;
    const nbTabs = tabs.length;
    const ratio = tabsWidth / nbTabs;

    if (ratio < 135) {
      this.changeIsTabsFull.emit(true);
      el.style.width = 'calc(100% - 120px)';
    } else {
      this.changeIsTabsFull.emit(false);
      el.style.width = 'calc(100% - 85px)';
    }
  }

  clickPreviousTabs() {
    const el = this.tabsPlacement?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: -50, top: 0, behavior: 'smooth' });
  }

  clickNextTabs() {
    const el = this.tabsPlacement?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: 50, top: 0, behavior: 'smooth' });
  }

  addTab() {
    this.addNewTab.emit();
  }

  closeSpecificTab(id: string, e: MouseEvent) {
    //e.stopPropagation() -> prevent selectSpecificTab()
    e.stopPropagation();

    this.closeTab.emit(id);
  }

  selectSpecificTab(id: string) {
    this.selectTab.emit(id);
  }
}
