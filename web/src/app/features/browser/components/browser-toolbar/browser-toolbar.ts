import { Component, input, output, effect, signal, ViewChild, ElementRef } from '@angular/core';
import { BrowserTab } from '../../models/browser-tab.interface';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-browser-toolbar',
  imports: [FormsModule],
  templateUrl: './browser-toolbar.html',
  styleUrl: './browser-toolbar.scss',
})
export class BrowserToolbar {
  tabs = input.required<BrowserTab[]>();
  goBackEvent = output<void>();
  goNextEvent = output<void>();
  refreshEvent = output<void>();
  url = signal('');
  isTherePreviousPage = signal(false);
  isThereNextPage = signal(false);
  @ViewChild('refreshButton') refreshButton?: ElementRef<HTMLDivElement>;
  @ViewChild('refreshArrowHistory') refreshArrowHistory?: ElementRef<HTMLDivElement>;
  isRotating = false;
  isRefreshClicked = false;
  currentSelectedTabId: string = '';

  constructor() {
    effect(() => {
      const tabs = this.tabs();
      const selectedTab = tabs.find((tab: BrowserTab) => tab.isSelected);
      if (selectedTab) {
        this.url.set(selectedTab.url);
      }
      this.checkPreviousPage(selectedTab!);
      this.checkNextPage(selectedTab!);
      if (this.currentSelectedTabId !== selectedTab?.id) this.stopRotation();
      selectedTab?.id ? (this.currentSelectedTabId = selectedTab.id) : '';
    });
  }

  checkPreviousPage(tab: BrowserTab) {
    if (tab.historyIndex < 1) {
      this.isTherePreviousPage.set(false);
      return;
    }
    const el = tab.history[tab.historyIndex - 1];
    if (el !== undefined || el !== null) this.isTherePreviousPage.set(true);
  }

  checkNextPage(tab: BrowserTab) {
    const el = tab.history[tab.historyIndex + 1];
    if (el === undefined || el === null) {
      this.isThereNextPage.set(false);
    } else {
      this.isThereNextPage.set(true);
    }
  }

  clickRefresh() {
    if (!this.isRefreshClicked) {
      this.isRefreshClicked = true;
      this.isRotating = true;
      //time for the animation
      setTimeout(() => {
        this.isRotating = false;
        this.isRefreshClicked = false;
      }, 500);
      this.refreshEvent.emit();
    }
  }

  goBack() {
    if (!this.isTherePreviousPage()) return;
    this.goBackEvent.emit();
  }

  goNext() {
    if (!this.isThereNextPage()) return;
    this.goNextEvent.emit();
  }

  stopRotation() {
    this.isRotating = false;
    const el = this.refreshArrowHistory?.nativeElement;
    if (!el) return;
    el.style.transform = 'rotate(0deg)';
    el.style.transition = 'none';
  }
}
