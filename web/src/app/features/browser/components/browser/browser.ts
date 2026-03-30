import { Component, signal, effect, inject, output, Signal } from '@angular/core';
import { BrowserTab } from '../../models/browser-tab.interface';
import { BrowserTabs } from '../browser-tabs/browser-tabs';
import { BrowserToolbar } from '../browser-toolbar/browser-toolbar';
import { BrowserViewport } from '../browser-viewport/browser-viewport';
import { DefaultPage } from '../default-page/default-page';
import { BrowserService } from '../../services/browser-service';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-browser',
  imports: [BrowserTabs, BrowserToolbar, BrowserViewport],
  templateUrl: './browser.html',
  styleUrl: './browser.scss',
})
export class Browser {
  browserPath: string = '/browser3-logo.png';
  closeBrowser = output<void>();
  isTabsFull = signal(false);
  tabs = signal<BrowserTab[]>([
    {
      id: 'default-id',
      title: 'Nouvel onglet',
      logoPath: this.browserPath,
      isSelected: true,
      url: '',
      history: [{ url: '', app: 'default' }],
      historyIndex: 0,
      app: 'default',
    },
  ]);
  domainToApp = new Map<string, string>([
    ['', 'default'],
    ['delivermyfood.com', 'deliver-my-food'],
  ]);
  browserService = inject(BrowserService);
  //if an effect is used instead of an observable, the cycle is triggered twice the first time the value is updated (not talking about initialization)
  updateFromApp$ = toObservable(this.browserService.updateFromApp);

  constructor() {
    this.browserService.initialize({ id: this.tabs()[0].id, url: this.tabs()[0].url });
    let previousTabsUrl: Partial<BrowserTab>[] = [];

    effect(() => {
      const tabs = this.tabs();
      //everytime a tab'url change (or a tab is added), it is updated in the service
      this.updateServiceTabsUrl(tabs, previousTabsUrl);
      previousTabsUrl = [
        ...tabs.map((tab: BrowserTab) => ({
          id: tab.id,
          url: tab.url,
        })),
      ];
      // console.log(tabs);
    });

    //listen to the apps
    this.updateFromApp$.subscribe((update: any) => {
      if (!update) return;
      if (update?.url && update?.id) {
        // console.log('update URL');
        const app = this.getAppFromUrl(update.url);
        this.goTo(update.id, update.url, app);
      } else if (update?.id) {
        // console.log('update others attributes');
        this.updateTabFromApp(update.id, update);
      }
    });
  }

  updateServiceTabsUrl(tabs: BrowserTab[], previousTabsUrl: Partial<BrowserTab>[]) {
    const changedIds: string[] = [];
    const newTabs: BrowserTab[] = [];

    tabs.forEach((tab: BrowserTab) => {
      const oldItem = previousTabsUrl.find((item) => item.id === tab.id);
      if (!oldItem) {
        newTabs.push(tab);
      } else if (oldItem.url !== tab.url) {
        changedIds.push(tab.id);
      }
    });

    if (changedIds.length > 0) {
      changedIds.forEach((id: string) => {
        const tab = tabs.find((item) => item.id === id);
        if (tab) this.browserService.updateTabUrl({ id: tab.id, url: tab.url });
      });
    }
    if (newTabs.length > 0) {
      newTabs.forEach((tab) => {
        this.browserService.updateTabUrl({ id: tab.id, url: tab.url });
      });
    }
  }

  closeTab(id: string) {
    this.tabs.update((tabs: BrowserTab[]) => {
      const newTabs = tabs.filter((tab) => tab.id !== id);

      const hasSelected = newTabs.some((tab) => tab.isSelected);

      if (!hasSelected && newTabs.length > 0) {
        newTabs[0] = { ...newTabs[0], isSelected: true };
      }

      return newTabs;
    });
    if (this.tabs().length === 0) {
      this.closeBrowser.emit();
      // destroy component ?
    }
  }

  setIsTabsFull(value: boolean) {
    this.isTabsFull.set(value);
  }

  addNewTab() {
    const newId: string = crypto.randomUUID();
    this.tabs.update((tabs: BrowserTab[]) => [
      ...tabs,
      {
        id: newId,
        title: 'Nouvel onglet',
        logoPath: this.browserPath,
        isSelected: true,
        url: '',
        history: [{ url: '', app: 'default' }],
        historyIndex: 0,
        app: 'default',
      },
    ]);
    this.tabs.update((tabs: BrowserTab[]) =>
      tabs.map((tab: BrowserTab) => (tab.id !== newId ? { ...tab, isSelected: false } : tab)),
    );
  }

  setTabSelect(id: string) {
    this.tabs.update((tabs: BrowserTab[]) =>
      tabs.map((tab: BrowserTab) =>
        tab.id === id ? { ...tab, isSelected: true } : { ...tab, isSelected: false },
      ),
    );
  }

  ///TODO (maybe) : prevent clicking the arrows of the browser during the refresh
  refreshPage() {
    const selectedTab = this.tabs().find((tab: BrowserTab) => tab.isSelected === true);
    if (!selectedTab) return;
    const id = selectedTab?.id;
    const selectedApp = selectedTab.app;
    this.tabs.update((tabs: BrowserTab[]) =>
      tabs.map((tab: BrowserTab) => (tab.isSelected === true ? { ...tab, app: 'refresh' } : tab)),
    );
    //simulate the refresh
    setTimeout(() => {
      this.tabs.update((tabs: BrowserTab[]) =>
        tabs.map((tab: BrowserTab) => (tab.id === id ? { ...tab, app: selectedApp } : tab)),
      );
    }, 300);
  }

  goBack() {
    const selectedTab = this.tabs().find((tab: BrowserTab) => tab.isSelected === true);
    if (!selectedTab) return;
    if (selectedTab.historyIndex < 1) return;
    this.tabs.update((tabs: BrowserTab[]) =>
      tabs.map((tab: BrowserTab) =>
        tab.isSelected === true
          ? {
              ...tab,
              historyIndex: --tab.historyIndex,
              url: tab.history[tab.historyIndex].url,
              app: tab.history[tab.historyIndex].app,
            }
          : tab,
      ),
    );
  }

  goNext() {
    const selectedTab = this.tabs().find((tab: BrowserTab) => tab.isSelected === true);
    if (!selectedTab) return;
    const nextTab = selectedTab.history[selectedTab.historyIndex + 1];
    if (!nextTab) return;
    this.tabs.update((tabs: BrowserTab[]) =>
      tabs.map((tab: BrowserTab) =>
        tab.isSelected === true
          ? {
              ...tab,
              historyIndex: ++tab.historyIndex,
              url: tab.history[tab.historyIndex]?.url,
              app: tab.history[tab.historyIndex]?.app,
            }
          : tab,
      ),
    );
  }

  goTo(tabId: string, url: string, app?: string) {
    const specificTab = this.tabs().find((tab: BrowserTab) => tab.id === tabId);
    if (!specificTab) return;
    if (!app) app = specificTab.app;
    const currentHistoryUrl = specificTab.history[specificTab.historyIndex]?.url;
    const nextHistoryUrl = specificTab.history[specificTab.historyIndex + 1]?.url;
    const isUrlUnchanged: boolean = nextHistoryUrl === url || currentHistoryUrl === url;
    this.tabs.update((tabs: BrowserTab[]) =>
      tabs.map((tab: BrowserTab) =>
        tab.id === specificTab.id
          ? {
              ...tab,
              historyIndex: isUrlUnchanged ? tab.historyIndex : ++tab.historyIndex,
              url: url,
              app: app,
              history: isUrlUnchanged ? [...tab.history] : [...tab.history, { url: url, app: app }],
            }
          : tab,
      ),
    );
  }

  getAppFromUrl(link: string) {
    if (!link) return 'default';

    const url = new URL(link.startsWith('http') ? link : `http://${link}`);
    const domain = url.hostname;
    return this.domainToApp.get(domain) || 'default';
  }

  updateTabFromApp(tabId: string, items: Partial<BrowserTab>) {
    this.tabs.update((tabs: BrowserTab[]) =>
      tabs.map((tab: BrowserTab) => (tab.id === tabId ? { ...tab, ...items } : tab)),
    );
  }
}
