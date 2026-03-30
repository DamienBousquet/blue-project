import { Component, OnInit, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeService } from '../../services/home.service';
import { WindowsBar } from '../../components/windows-bar/windows-bar';
import { MainScreen } from '../../components/main-screen/main-screen';
import { InfoPanel } from '../../components/info-panel/info-panel';
import { interval, switchMap, startWith } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AppInstance } from '../../models/app-info.interface';
import { bringToFront } from '../../../../shared/constants';

@Component({
  selector: 'app-home-page',
  imports: [CommonModule, WindowsBar, InfoPanel, MainScreen],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage implements OnInit {
  constructor(
    private homeService: HomeService,
    private destroyRef: DestroyRef,
  ) {}

  token: string | null = null;
  computerScreenPath: string = '/test_ecran_grand_gris_final.png';
  panelToShow = signal<{ value: string; counter: number }>({ value: 'none', counter: 0 });
  volumeLogoPath = signal<string>('volume2.png');
  internetSpeed = signal<number>(50);
  desktopApplications = signal<AppInstance[]>([
    {
      id: 'ticTacToe',
      appType: 'ticTacToe',
      state: 'closed',
      logo: 'Tic-tac-toe.png',
      position: { x: 0, y: 0 },
    },
    {
      id: 'notepad-1',
      appType: 'notepad',
      state: 'closed',
      logo: 'Notepad.png',
      position: { x: 0, y: 0 },
      title: 'Courses',
      content: '4 Tomates \n2kg Farine de blé\n30cL Alcool mains\n2x 8Gb RAM\n',
    },
    {
      id: 'browser',
      appType: 'browser',
      state: 'open',
      logo: 'browser3-logo.png',
      position: { x: 0, y: 0 },
      isFullScreen: true,
    },
  ]);
  applicationToOpen: string = '';

  ngOnInit(): void {
    this.homeService
      .getCookie()
      .pipe(
        switchMap((cookieValue) => {
          return this.homeService.getSession();
        }),
      )
      .subscribe((sessionValue) => {});

    interval(16000)
      .pipe(
        startWith(0),
        switchMap(() => this.homeService.getInternetConnexion()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value: any) => {
        this.internetSpeed.set(value);
      });
  }

  iconClicked(value: string) {
    const current = this.panelToShow();
    this.panelToShow.set({ value: value, counter: current.counter + 1 });
  }

  onAppChangedViaSearch(value: string) {
    this.applicationToOpen = value;

    //If 'notepad', add to the desktopApplications
    if (value == 'notepad') {
      const newId: string = crypto.randomUUID();
      this.desktopApplications.update((apps: AppInstance[]) => [
        ...apps,
        {
          id: newId,
          appType: 'notepad',
          position: { x: 0, y: 0 },
          state: 'closed',
          title: 'Sans titre',
          logo: 'Notepad.png',
        },
      ]);
      value = newId;
    }
    this.desktopApplications.update((apps: AppInstance[]) =>
      apps.map((app: AppInstance) => ({
        ...app,
        state: app.id === value ? 'open' : app.state,
      })),
    );
    bringToFront(this.desktopApplications, value);
  }
}
