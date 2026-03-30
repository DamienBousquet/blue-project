import {
  Component,
  ChangeDetectorRef,
  output,
  input,
  model,
  computed,
  effect,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePipe } from '@angular/common';
import { AppInstance } from '../../models/app-info.interface';
import { bringToFront, bringToBack } from '../../../../shared/constants';

@Component({
  selector: 'app-windows-bar',
  imports: [CommonModule, DatePipe],
  templateUrl: './windows-bar.html',
  styleUrl: './windows-bar.scss',
})
export class WindowsBar {
  desktopApplications = model.required<AppInstance[]>();
  panelToShow = output<string>();
  networkImagePath: string = '/bars_2_white.png';
  windowsLogoPath: string = '/os-logo.png';
  searchLogoPath: string = '/icon_search.png';
  browserLogoPath: string = '/browser3-logo.png';
  tictactoePath: string = '/Tic-tac-toe.png';
  notepadPath: string = '/Notepad.png';
  internetSpeed = input.required<number>();
  volumeLogoPath = input<string>();
  readonly volumeLogoSrc = computed(() => '/' + this.volumeLogoPath());
  date = new Date(2012, 3, 9, 11, 14);
  private timer: any;
  @ViewChild('notepadLogo') notepadLogo?: ElementRef<HTMLDivElement>;
  @ViewChild('emptySpace') emptySpace?: ElementRef<HTMLDivElement>;

  constructor(private cdr: ChangeDetectorRef) {
    effect(() => {
      const apps = this.desktopApplications();
      this.manageEmptySpaceWidth(apps);
    });

    effect(() => {
      const internetSpeed = this.internetSpeed();
      this.changeNetworkImage(internetSpeed);
    });
  }

  ngOnInit(): void {
    this.timer = setInterval(() => {
      this.date = new Date(this.date.getTime() + 1000);
      this.cdr.detectChanges();
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  clickOnIcon(value: string): void {
    this.panelToShow.emit(value);
  }

  changeNetworkImage(speed: number) {
    switch (true) {
      case speed < 30:
        this.networkImagePath = '/bars_1_white.png';
        break;
      case speed >= 30 && speed < 68:
        this.networkImagePath = '/bars_2_white.png';
        break;
      case speed >= 68 && speed < 89:
        this.networkImagePath = '/bars_3_white.png';
        break;
      case speed >= 89:
        this.networkImagePath = '/bars_4_white.png';
        break;
      default:
        this.networkImagePath = '/bars_2_white.png';
        break;
    }
  }

  clickOnApp(id: string) {
    const apps = this.desktopApplications();
    let app = apps.find((a: AppInstance) => a.id === id);

    if (id === 'notepad') {
      let nbNotepad: number = 0;
      apps.forEach((app: AppInstance) => {
        if (app.appType === 'notepad' && app.state !== 'closed') nbNotepad++;
      });
      if (nbNotepad > 1) {
        return;
      }
      if (nbNotepad == 1) {
        app = apps.find((app: AppInstance) => app.appType === 'notepad' && app.state !== 'closed');
        if (app && app.id) id = app.id;
      }
    }

    if (!app) return;
    const lastApp = this.desktopApplications()[this.desktopApplications().length - 1];
    const isAppOpenNoFocus = app.state === 'open' && app.appType !== lastApp.appType;

    const isAppOpenWithFocus = app.state === 'open' && app.appType === lastApp.appType;

    const isAppMinimized = app.state === 'minimized';
    const isAppClosed = app.state === 'closed';

    // App is open but has no focus → give it focus
    if (isAppOpenNoFocus) {
      bringToFront(this.desktopApplications, id);
    }

    // App is open and already focused → minimize it
    else if (isAppOpenWithFocus) {
      this.desktopApplications.update((apps: AppInstance[]) =>
        apps.map((a: AppInstance) => (a.id === id ? { ...a, state: 'minimized' } : a)),
      );
      bringToBack(this.desktopApplications, id);
    }

    // App is minimized or closed → open it and give focus
    else if (isAppMinimized || isAppClosed) {
      this.desktopApplications.update((apps: AppInstance[]) =>
        apps.map((a: AppInstance) => ({
          ...a,
          state: a.id === id ? 'open' : a.state,
        })),
      );
      bringToFront(this.desktopApplications, id);
    }
  }

  readonly isAnyNotepadRunning = computed(() => {
    return this.desktopApplications().some(
      (app: AppInstance) =>
        app.appType === 'notepad' && (app.state === 'open' || app.state === 'minimized'),
    );
  });

  readonly isAnyBrowserRunning = computed(() => {
    return this.desktopApplications().some(
      (app: AppInstance) =>
        app.appType === 'browser' && (app.state === 'open' || app.state === 'minimized'),
    );
  });

  readonly isAnyTicTacToeRunning = computed(() => {
    return this.desktopApplications().some(
      (app: AppInstance) =>
        app.appType === 'ticTacToe' && (app.state === 'open' || app.state === 'minimized'),
    );
  });

  readonly hasFocusedNotepad = computed(
    () => this.desktopApplications()[this.desktopApplications().length - 1].appType === 'notepad',
  );

  readonly hasFocusedBrowser = computed(
    () => this.desktopApplications()[this.desktopApplications().length - 1].appType === 'browser',
  );

  readonly hasFocusedTicTacToe = computed(
    () => this.desktopApplications()[this.desktopApplications().length - 1].appType === 'ticTacToe',
  );

  readonly hasMultipleNotepadRunning = computed(
    () =>
      this.desktopApplications().filter(
        (app: AppInstance) => app.appType === 'notepad' && app.state !== 'closed',
      ).length >= 2,
  );

  //the browser is fixed (will not move)
  manageEmptySpaceWidth(apps: AppInstance[]) {
    const runningApps = apps.filter(
      (app: AppInstance) => app.state !== 'closed' && app.appType !== 'browser',
    );
    const uniqueAppTypes = new Set(runningApps.map((app: AppInstance) => app.appType));
    const nbDifferentAppType = uniqueAppTypes.size;
    const el: HTMLDivElement | undefined = this.emptySpace?.nativeElement;
    if (!el) return;
    let emptySpaceNewWidth: number = 983;
    if (nbDifferentAppType == 1) emptySpaceNewWidth = 933;
    if (nbDifferentAppType == 2) emptySpaceNewWidth = 883;

    if (this.hasMultipleNotepadRunning()) emptySpaceNewWidth -= 2;
    el.style.width = `${emptySpaceNewWidth}px`;
  }
}
