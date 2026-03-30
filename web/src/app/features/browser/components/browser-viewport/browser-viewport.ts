import { Component, input, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserTab } from '../../models/browser-tab.interface';
import { DefaultPage } from '../default-page/default-page';
import { DeliverMyFoodShell } from '../../../deliver-my-food/shell/deliver-my-food-shell';

@Component({
  selector: 'app-browser-viewport',
  imports: [CommonModule],
  templateUrl: './browser-viewport.html',
  styleUrl: './browser-viewport.scss',
})
export class BrowserViewport {
  tabs = input.required<BrowserTab[]>();

  constructor() {
    effect(() => {
      const tabs = this.tabs();
    });
  }

  resolveTabComponent(tab: BrowserTab) {
    switch (tab.app) {
      case 'deliver-my-food':
        return DeliverMyFoodShell;
      case 'refresh':
        return null;
      default:
        return DefaultPage;
    }
  }
}
