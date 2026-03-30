import { Injectable, signal, Signal, WritableSignal } from '@angular/core';
import { BrowserTab } from '../models/browser-tab.interface';

@Injectable({
  providedIn: 'root',
})
/*
  this service establish the communication between the browser and the apps. 
  - It allow an app to send a change of url (_updateFromApp)
  - Also it copy the tabs value and make sure the apps receive the right url (tabsUrl)
*/
export class BrowserService {
  private readonly _updateFromApp = signal<Partial<BrowserTab> | undefined>(undefined);
  readonly updateFromApp = this._updateFromApp.asReadonly();

  private tabsUrl = new Map<string, WritableSignal<Partial<BrowserTab>>>();

  initialize(item: Partial<BrowserTab>) {
    if (!item?.id) return;
    this.tabsUrl.set(item.id, signal(item));
  }

  updateTabUrl(item: Partial<BrowserTab>) {
    if (!item?.id) return;
    if (!this.tabsUrl.has(item.id)) {
      this.tabsUrl.set(item.id, signal(item));
    } else {
      this.tabsUrl.get(item.id)!.set(item);
    }
  }

  getTab(id: string): Signal<Partial<BrowserTab>> | undefined {
    return this.tabsUrl.get(id);
  }

  setUrlFromApp(id: string, url: string) {
    this._updateFromApp.set({ id: id, url: url });
  }

  setTabAttributesFromApp(id: string, items: Partial<BrowserTab>) {
    this._updateFromApp.set({ id: id, ...items });
  }

  // private createBrowserPanel(){
  //   const containerDiv = this.renderer.createElement('div');
  //   this.renderer.addClass(containerDiv, 'panel');
  //   this.renderer.setAttribute(containerDiv, 'id', 'notepad-preview-container');
  //   this.renderer.setStyle(containerDiv, 'left', `${left}px`);
  //   this.renderer.appendChild(this.viewContainerRef.element.nativeElement, containerDiv);
  // }
}
