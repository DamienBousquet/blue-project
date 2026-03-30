import {
  Component,
  input,
  effect,
  ElementRef,
  ViewChild,
  model,
  computed,
  Signal,
  Input,
  output,
  Renderer2,
  ViewContainerRef,
} from '@angular/core';
import { AppInstance } from '../../models/app-info.interface';
import { bringToFront } from '../../../../shared/constants';

@Component({
  selector: 'app-info-panel',
  imports: [],
  templateUrl: './info-panel.html',
  styleUrl: './info-panel.scss',
})
export class InfoPanel {
  panelToShow = model.required<{ value: string; counter: number }>();
  desktopApplications = model.required<AppInstance[]>();
  applicationToOpen = output<string>();
  internetSpeed = input<number>();
  panelActualValue: string = 'none';
  panelToShowOldValue: { value: string; counter: number } | undefined;
  profileIconPath: string = '/profile_icon.png';
  shutdownIconPath: string = '/shutdown_icon.png';
  volumeNoneLogoPath: string = '/volume0.png';
  volumeOneLogoPath: string = '/volume1.png';
  volumeTwoLogoPath: string = '/volume2.png';
  volumeThreeLogoPath: string = '/volume3.png';
  notepadPath: string = '/Notepad.png';
  volumeLogoPath = model.required<string>();
  sliderValue: number = 50;
  @ViewChild('sliderElement', { static: false }) sliderElement!: ElementRef<HTMLInputElement>;
  isSearchPanelResult: boolean = false;
  searchPanelResultHeight: number = 40;
  listOfProgram: { program: string; name: string; logo: string }[] = [
    { program: 'browser', name: 'NetSphere', logo: 'browser3-logo.png' },
    { program: 'ticTacToe', name: 'Tic-tac-toe', logo: 'Tic-tac-toe.png' },
    { program: 'notepad', name: 'Notepad', logo: 'Notepad.png' },
  ];
  programsFound: { program: string; name: string; logo: string }[] = [];
  showProfileText: boolean = false;
  showShutdownText: boolean = false;
  @ViewChild('searchInput', { static: false }) searchInput!: ElementRef<HTMLInputElement>;

  constructor(
    private renderer: Renderer2,
    private viewContainerRef: ViewContainerRef,
  ) {
    effect(() => {
      const panelValue = this.panelToShow();
      this.managePreviewNotepad(panelValue.value);
      let panelValueEffect: { value: string; counter: number } | undefined = panelValue;
      if (
        panelValueEffect != undefined &&
        this.panelToShowOldValue != undefined &&
        panelValueEffect?.value == this.panelToShowOldValue?.value
      ) {
        panelValueEffect.value = '';
      }
      switch (panelValueEffect?.value) {
        case 'windows':
          this.panelActualValue = 'windows';
          break;
        case 'search':
          this.panelActualValue = 'search';
          this.defaultProgramView();
          setTimeout(() => this.searchInput?.nativeElement.focus());
          break;
        case 'network':
          this.panelActualValue = 'network';
          break;
        case 'network':
          this.panelActualValue = 'network';
          break;
        case 'volume':
          this.panelActualValue = 'volume';
          break;
        default:
          this.panelActualValue = 'none';
          break;
      }
      this.panelToShowOldValue = panelValueEffect;
    });
  }

  // Preload all program images so they are in browser cache BEFORE the search panel opens.
  // Without this, Angular creates the <img> tags only when the panel appears,
  // causing a brief flash where the images are not yet loaded.
  ngOnInit() {
    this.defaultProgramView();
    this.programsFound.forEach((program) => {
      const img = new Image();
      img.src = `/${program.logo}`;
    });
  }

  //Because of @if in html, some elements (here slider) are not initialized, so no ngAfterViewInit
  ngAfterViewChecked() {
    console.log(this.internetSpeed$);
    const slider = this.sliderElement?.nativeElement;
    if (slider) {
      const percent = (this.sliderValue / 99) * 100;
      slider.style.background = `linear-gradient(to right, #007bff 0%, #007bff ${percent}%, #ddd ${percent}%, #ddd 100%)`;
    }
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   if (changes.internetSpeed$) {
  //     console.log(this.internetSpeed$);
  //   }
  // }

  searchProgram(e: Event) {
    const text = (e.target as HTMLInputElement).value;
    const matchingValues = this.listOfProgram.filter(({ program, name }) =>
      name.toLowerCase().startsWith(text.toLowerCase()),
    );
    this.programsFound = matchingValues;
    matchingValues.length > 0
      ? (this.isSearchPanelResult = true)
      : (this.isSearchPanelResult = false);
    if (matchingValues.length < 2) {
      this.searchPanelResultHeight = 45;
    } else if (matchingValues.length == 2) {
      this.searchPanelResultHeight = 80;
    } else if (matchingValues.length > 2) {
      this.searchPanelResultHeight = 120;
    }
  }

  defaultProgramView() {
    this.programsFound = this.listOfProgram;
    this.isSearchPanelResult = true;
    this.searchPanelResultHeight = 120;
  }

  clickOnProgram(value: any): void {
    const current = this.panelToShow();
    this.panelToShow.set({ value: value.program, counter: current.counter + 1 });
    this.applicationToOpen.emit(value.program);
  }

  onSliderChange(e: Event): void {
    const slider = e.target as HTMLInputElement;
    const soundValue: string = (e.target as HTMLInputElement).value;
    const soundValueNumber: number = +soundValue;
    this.sliderValue = soundValueNumber;
    switch (true) {
      case soundValueNumber == 0:
        this.volumeLogoPath.set('volume0.png');
        break;
      case soundValueNumber > 0 && soundValueNumber < 30:
        this.volumeLogoPath.set('volume1.png');
        break;
      case soundValueNumber >= 30 && soundValueNumber < 70:
        this.volumeLogoPath.set('volume2.png');
        break;
      case soundValueNumber >= 70:
        this.volumeLogoPath.set('volume3.png');
        break;
      default:
        break;
    }
    const percent = (soundValueNumber / 99) * 100;
    slider.style.background = `linear-gradient(to right, #007bff 0%, #007bff ${percent}%, #ddd ${percent}%, #ddd 100%)`;
  }

  managePreviewNotepad(panelValue: string) {
    this.destroyNotepadPreview();
    if (panelValue !== 'notepad-desktop') return;

    const hasMultipleNotepadRunning =
      this.desktopApplications().filter(
        (app: AppInstance) => app.appType === 'notepad' && app.state !== 'closed',
      ).length >= 2;

    if (!hasMultipleNotepadRunning) return;

    const hasTictactoeRunning = this.desktopApplications().some(
      (app: AppInstance) => app.appType === 'ticTacToe' && app.state !== 'closed',
    );
    const newLeft = hasTictactoeRunning ? 465 : 415;

    this.createNotepadPreview(newLeft);
  }

  private createNotepadPreview(left: number) {
    this.destroyNotepadPreview();
    const apps: AppInstance[] = this.desktopApplications()
      .filter((app: AppInstance) => app.appType === 'notepad' && app.state !== 'closed')
      .sort((a, b) => a.id.localeCompare(b.id));

    const containerDiv = this.renderer.createElement('div');
    this.renderer.addClass(containerDiv, 'panel');
    this.renderer.setAttribute(containerDiv, 'id', 'notepad-preview-container');
    this.renderer.setStyle(containerDiv, 'left', `${left}px`);
    this.renderer.appendChild(this.viewContainerRef.element.nativeElement, containerDiv);

    this.setupContainerPreviewDiv(containerDiv, apps);

    apps.forEach((appShow: AppInstance) => {
      this.createNotepadDetail(appShow, containerDiv);
    });
  }

  private setupContainerPreviewDiv(containerDiv: HTMLDivElement, apps: AppInstance[]) {
    const MAX_VISIBLE_ITEMS = 4;
    let containerDivHeight = 45;
    let containerDivTop = 767;
    if (apps.length == 3) {
      containerDivHeight = 70;
      containerDivTop -= 24;
    }
    if (apps.length >= 4) {
      containerDivHeight = 95;
      containerDivTop -= 49;
    }
    this.renderer.setStyle(containerDiv, 'height', `${containerDivHeight}px`);
    this.renderer.setStyle(containerDiv, 'top', `${containerDivTop}px`);

    if (apps.length > MAX_VISIBLE_ITEMS) {
      this.renderer.setStyle(containerDiv, 'overflow-y', 'auto');
    } else {
      this.renderer.setStyle(containerDiv, 'overflow', 'hidden');
    }
  }

  private createNotepadDetail(appShow: AppInstance, containerDiv: HTMLDivElement) {
    const notepadDetailDiv = this.renderer.createElement('div');
    this.renderer.addClass(notepadDetailDiv, 'notepad-detail');
    this.renderer.appendChild(containerDiv, notepadDetailDiv);

    this.renderer.listen(notepadDetailDiv, 'click', () => {
      const current = this.panelToShow();
      this.panelToShow.set({ value: 'none', counter: current.counter + 1 });
      this.destroyNotepadPreview();
      this.desktopApplications.update((apps: AppInstance[]) =>
        apps.map((app: AppInstance) => ({
          ...app,
          state: app.id === appShow.id ? 'open' : app.state,
        })),
      );
      bringToFront(this.desktopApplications, appShow.id);
    });

    const notepadImageContainer = this.renderer.createElement('div');
    this.renderer.addClass(notepadImageContainer, 'notepad-image-container');
    this.renderer.appendChild(notepadDetailDiv, notepadImageContainer);

    const notepadImage = document.createElement('img');
    notepadImage.src = this.notepadPath;
    this.renderer.appendChild(notepadImageContainer, notepadImage);

    const notepadTextContainer = this.renderer.createElement('div');
    this.renderer.addClass(notepadTextContainer, 'notepad-text-container');
    this.renderer.appendChild(notepadDetailDiv, notepadTextContainer);

    const notepadText = this.renderer.createElement('p');
    this.renderer.addClass(notepadText, 'notepad-text');

    const fullTitle = appShow?.title ? appShow?.title : '???';

    this.renderer.addClass(notepadText, 'shortcut-title');
    this.renderer.setProperty(notepadText, 'textContent', `${fullTitle}\xa0 `);

    const shortcutTitleType = this.renderer.createElement('p');
    this.renderer.addClass(shortcutTitleType, 'notepad-text');
    this.renderer.setProperty(shortcutTitleType, 'textContent', `- Notepad`);

    this.renderer.appendChild(notepadTextContainer, notepadText);
    this.renderer.appendChild(notepadTextContainer, shortcutTitleType);
  }

  private destroyNotepadPreview() {
    const existing = this.viewContainerRef.element.nativeElement.querySelector(
      '#notepad-preview-container',
    );
    if (existing) {
      this.renderer.removeChild(this.viewContainerRef.element.nativeElement, existing);
    }
  }

  refresh() {
    window.location.reload();
  }
}
