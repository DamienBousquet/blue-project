import { Component, signal, input, Signal, effect } from '@angular/core';
import { RouterModule, Routes, RouterOutlet } from '@angular/router';
import { HomePage } from '../pages/home-page/home-page';
import { ProfilePage } from '../pages/profile-page/profile-page';
import { Header } from '../components/header/header';
import { Footer } from '../components/footer/footer';
import { DiscoveryPage } from '../pages/discovery-page/discovery-page';
import { DeliveryPage } from '../pages/delivery-page/delivery-page';
import { BrowserService } from '../../browser/services/browser-service';

@Component({
  selector: 'app-deliver-my-food-shell',
  standalone: true,
  imports: [HomePage, ProfilePage, Header, Footer, DiscoveryPage, DeliveryPage],
  template: `
    <app-header (goTo)="goTo($event)" />
    @switch (route()) {
      @case ('home') {
        <app-home-page (goTo)="goTo($event)" />
      }
      @case ('profile') {
        <app-profile-page (goTo)="goTo($event)" />
      }
      @case ('discovery') {
        <app-discovery-page [link]="fullPath()" (goTo)="goTo($event)" />
      }
      @case ('delivery') {
        <app-delivery-page [link]="fullPath()" (goTo)="goTo($event)" />
      }
    }
    <app-footer />
  `,
})
export class DeliverMyFoodShell {
  itemSignal: Signal<any> | undefined;
  route = signal<string>('discovery');
  id = input<string>();
  fullPath = signal<string>('');
  baseUrl = 'http://delivermyfood.com';

  constructor(private browserService: BrowserService) {
    effect(() => {
      const tab = this.itemSignal?.();
      if (!tab) return;

      const url = tab.url;
      const { route, fullPath } = this.getRouteAndFullPathFromUrl(url);
      this.setAttributesToTab();
      this.route.set(route);
      this.fullPath.set(fullPath);
    });
  }

  getRouteAndFullPathFromUrl(url: string): { route: string; fullPath: string } {
    if (!url) return { route: 'home', fullPath: '' };

    const parsedUrl = new URL(url.startsWith('http') ? url : `http://${url}`);
    const pathname = parsedUrl.pathname;
    const search = parsedUrl.search;
    const fullPath = pathname.substring(1) + search;

    const pathnameArray = pathname.split('/').filter(Boolean);
    const route = pathnameArray[0] || 'home';

    return { route, fullPath };
  }

  ngOnInit() {
    const id = this.id?.();
    if (id) this.itemSignal = this.browserService.getTab(id);
  }

  goTo(url: string) {
    const id = this.id?.();
    const link = this.baseUrl + url;
    if (id) this.browserService.setUrlFromApp(id, link);
  }

  setAttributesToTab() {
    const id = this.id?.();
    if (id)
      this.browserService.setTabAttributesFromApp(id, {
        title: 'Deliver my Food',
        logoPath: 'food-icon2.png',
      });
  }
}
