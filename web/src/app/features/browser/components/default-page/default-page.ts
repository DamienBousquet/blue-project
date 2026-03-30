import { Component, signal, inject, input, ViewChild, ElementRef } from '@angular/core';
import { BrowserService } from '../../services/browser-service';
import { HomeService } from '../../../home/services/home.service';
import { Weather } from '../../models/weather.interface';

@Component({
  selector: 'app-default-page',
  imports: [],
  templateUrl: './default-page.html',
  styleUrl: './default-page.scss',
})
export class DefaultPage {
  urlInformation = signal<string>('');
  id = input<string>();
  browserService = inject(BrowserService);
  @ViewChild('urlInformationContainer') urlInformationContainer!: ElementRef;
  weather = signal<Weather | undefined>(undefined);

  constructor(private homeService: HomeService) {}

  ngOnInit() {
    this.homeService.getWeather().subscribe((value: any) => {
      if (Object.keys(value).length == 0) return;
      this.weather.set(value);
    });
    this.updateAttributesToTab('Nouvel onglet', '/browser3-logo.png');
  }

  mouseEnter(a: any) {
    const text = a.target.firstChild.firstChild.alt;
    if (!text) return;
    this.urlInformation.set(text);
    const el = this.urlInformationContainer?.nativeElement;
    if (!el) return;
    el.style.borderTop = '2px solid black';
    el.style.borderRight = '2px solid black';
  }

  mouseLeave(a: any) {
    this.urlInformation.set('');
    const el = this.urlInformationContainer?.nativeElement;
    if (!el) return;
    el.style.borderTop = 'none';
    el.style.borderRight = 'none';
  }

  clickIcon(el: string) {
    const id = this.id();
    if (id) this.browserService.setUrlFromApp(id, el);
  }

  updateAttributesToTab(title: string, logoPath: string) {
    const id = this.id?.();
    if (id) this.browserService.setTabAttributesFromApp(id, { title: title, logoPath: logoPath });
  }
}
