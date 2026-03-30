import {
  Component,
  model,
  HostListener,
  ViewChild,
  ElementRef,
  Renderer2,
  inject,
  signal,
  effect,
  afterNextRender,
  Injector,
  runInInjectionContext,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResizableContainer } from '../../../../shared/resizable-container';
import { AppInstance } from '../../models/app-info.interface';
import { Shortcut } from '../../models/shortcut.interface';
import { Tictactoe } from '../tictactoe/tictactoe';
import { HomeService } from '../../services/home.service';
import { MovableStore } from '../../../../shared/movable-store';
import {
  DESKTOP_HEIGHT,
  DESKTOP_WIDTH,
  Z,
  bringToFront,
  bringToBack,
} from '../../../../shared/constants';
import { Browser } from '../../../browser/components/browser/browser';
import { Notepad } from '../notepad/notepad';
import { ResizableWindowDirective } from '../../../../shared/resizable-window';

@Component({
  selector: 'app-main-screen',
  imports: [CommonModule, Browser, Tictactoe, Notepad, ResizableWindowDirective],
  templateUrl: './main-screen.html',
  styleUrl: './main-screen.scss',
})
export class MainScreen {
  desktopApplications = model.required<AppInstance[]>();
  panelToShow = model.required<{ value: string; counter: number }>();
  // desktopApplicationsOld: AppInstance[] | undefined;
  dragging = false;
  currentApplication: string | null = null;
  offsetApp = { x: 0, y: 0 };
  readonly SHORTCUT_WIDTH = 85;
  readonly SHORTCUT_HEIGHT = 70;
  readonly SHORTCUT_WIDTH_GAP = 7;
  readonly SHORTCUT_HEIGHT_GAP = 4;
  readonly MAX_ROW = 9;
  readonly MAX_COLUMN = 14;
  zIndexAppPriority: string = '3';
  zIndexAppNoPriority: string = '2';

  @ViewChild('firegroxShortcut') firegroxShortcut?: ElementRef<HTMLDivElement>;
  @ViewChild('notebookShortcut') notebookShortcut?: ElementRef<HTMLDivElement>;

  private refShortcuts = new Map<string, ElementRef>();
  isReadyToGrabShortcuts: boolean = false;
  shortcuts: Shortcut[] = [
    {
      id: 'firegroxShortcut',
      title: 'NetSphere',
      type: 'browser',
      isSelected: false,
      x: 0,
      y: 0,
      oldX: 0,
      oldY: 0,
    },
    {
      id: 'notepad-1',
      title: 'Courses',
      type: 'notepad',
      isSelected: false,
      x: 0,
      y: this.SHORTCUT_HEIGHT + this.SHORTCUT_HEIGHT_GAP,
      oldX: 0,
      oldY: this.SHORTCUT_HEIGHT + this.SHORTCUT_HEIGHT_GAP,
    },
  ];
  draggingShortcuts: boolean = false;
  @ViewChild('blueRectangle') blueRectangle?: ElementRef<HTMLDivElement>;
  blueRectangleStartingPosition: { x: number; y: number } = { x: 0, y: 0 };
  drawingBlueRectangle: boolean = false;
  shortcutsInside: string[] = [];
  offsetShortcut = { x: 0, y: 0 };
  currentShortcut: string | null = null;
  public Z = Z;

  constructor(
    private homeService: HomeService,
    private movableStore: MovableStore,
  ) {
    effect(() => {
      // console.log('Desktop changed:', this.desktopApplications());
      const apps = this.desktopApplications();
      this.manageNewNotepad();
      this.manageShortcutsName();
      // this.desktopApplicationsOld = this.desktopApplications();
    });
  }

  private manageNewNotepad() {
    const apps = this.desktopApplications();
    const notepadApps = apps.filter((app: AppInstance) => app.appType === 'notepad');
    notepadApps.forEach((notepadApp: AppInstance) => {
      if (!this.movableStore.isElement(notepadApp.id)) {
        this.movableStore.addElement(notepadApp.id, { x: 350, y: 120, width: 350, height: 400 });
      }
    });
  }

  private manageShortcutsName() {
    const apps = this.desktopApplications();
    this.shortcuts.forEach((shortcut: Shortcut) => {
      const app = apps.find((app: AppInstance) => app.id == shortcut.id);
      const title = app?.title;
      if (title) shortcut.title = title;
    });
  }

  ngAfterViewInit(): void {
    if (this.firegroxShortcut?.nativeElement) {
      this.refShortcuts.set('firegroxShortcut', this.firegroxShortcut);
    }
    if (this.notebookShortcut?.nativeElement) {
      this.refShortcuts.set('notebookShortcut', this.notebookShortcut);
    }
  }

  clickOnScreen(): void {
    const current = this.panelToShow();
    this.panelToShow.set({ value: 'main-screen', counter: current.counter + 1 });
    this.isReadyToGrabShortcuts = false;
  }

  //drag
  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    //apps
    if (this.dragging && this.currentApplication) {
      const newX = event.clientX - this.offsetApp.x;
      const newY = event.clientY - this.offsetApp.y;
      const maxX = DESKTOP_WIDTH - this.movableElements[this.currentApplication].width;
      const maxY = DESKTOP_HEIGHT - this.movableElements[this.currentApplication].height;
      this.movableElements[this.currentApplication].x = Math.max(0, Math.min(newX, maxX));
      this.movableElements[this.currentApplication].y = Math.max(0, Math.min(newY, maxY));
    }

    //shortcuts (one)
    if (this.draggingShortcuts && this.shortcutsInside.length <= 1) {
      const newX = event.clientX - this.offsetShortcut.x;
      const newY = event.clientY - this.offsetShortcut.y;
      const maxX = DESKTOP_WIDTH - this.SHORTCUT_WIDTH;
      const maxY = DESKTOP_HEIGHT - this.SHORTCUT_HEIGHT;
      const shortcut = this.shortcuts.find((shortcut) => shortcut.id === this.currentShortcut);
      if (shortcut) {
        shortcut.x = Math.max(0, Math.min(newX, maxX));
        shortcut.y = Math.max(0, Math.min(newY, maxY));
      }
    }
    //shortcuts (>2)
    if (this.draggingShortcuts && this.shortcutsInside.length > 1) {
      const shortcutClicked = this.shortcuts.find(
        (shortcut) => shortcut.id === this.currentShortcut,
      );
      if (shortcutClicked == undefined) return;
      const baseNewX = event.clientX - this.offsetShortcut.x;
      const baseNewY = event.clientY - this.offsetShortcut.y;

      const maxX = DESKTOP_WIDTH - this.SHORTCUT_WIDTH;
      const maxY = DESKTOP_HEIGHT - this.SHORTCUT_HEIGHT;

      // Screen constraints
      let minXAllowed = 0;
      let maxXAllowed = maxX;
      let minYAllowed = 0;
      let maxYAllowed = maxY;

      this.shortcutsInside.forEach((shortcutInside) => {
        if (shortcutInside === this.currentShortcut) return;

        const other = this.shortcuts.find((s) => s.id === shortcutInside);
        if (!other) return;

        const dx = other.oldX - shortcutClicked.oldX;
        const dy = other.oldY - shortcutClicked.oldY;

        // X
        if (dx > 0) {
          maxXAllowed = Math.min(maxXAllowed, maxX - dx);
        } else if (dx < 0) {
          minXAllowed = Math.max(minXAllowed, -dx);
        }

        // Y
        if (dy > 0) {
          maxYAllowed = Math.min(maxYAllowed, maxY - dy);
        } else if (dy < 0) {
          minYAllowed = Math.max(minYAllowed, -dy);
        }
      });

      if (minXAllowed > maxXAllowed) {
        minXAllowed = maxXAllowed;
      }

      if (minYAllowed > maxYAllowed) {
        minYAllowed = maxYAllowed;
      }

      const clampedX = Math.max(minXAllowed, Math.min(baseNewX, maxXAllowed));
      const clampedY = Math.max(minYAllowed, Math.min(baseNewY, maxYAllowed));

      shortcutClicked.x = clampedX;
      shortcutClicked.y = clampedY;

      this.shortcutsInside.forEach((shortcutInside) => {
        if (shortcutInside === this.currentShortcut) return;

        const other = this.shortcuts.find((s) => s.id === shortcutInside);
        if (!other) return;

        const dx = other.oldX - shortcutClicked.oldX;
        const dy = other.oldY - shortcutClicked.oldY;

        other.x = clampedX + dx;
        other.y = clampedY + dy;
      });
    }

    //blueRectangle
    if (this.drawingBlueRectangle && this.blueRectangle?.nativeElement) {
      const el = this.blueRectangle.nativeElement;
      const containerRect = el.parentElement!.getBoundingClientRect();

      const currentX = event.clientX - containerRect.left + el.parentElement!.scrollLeft;
      const currentY = event.clientY - containerRect.top + el.parentElement!.scrollTop;
      const startX = this.blueRectangleStartingPosition.x;
      const startY = this.blueRectangleStartingPosition.y;

      let left = Math.min(startX, currentX);
      let width = Math.abs(currentX - startX);
      let top = Math.min(startY, currentY);
      let height = Math.abs(currentY - startY);

      if (currentX > DESKTOP_WIDTH) {
        width = DESKTOP_WIDTH - this.blueRectangleStartingPosition.x;
      } else if (currentX < 0) {
        left = 0;
        width = this.blueRectangleStartingPosition.x;
      }

      if (currentY > DESKTOP_HEIGHT) {
        height = DESKTOP_HEIGHT - this.blueRectangleStartingPosition.y;
      } else if (currentY < 0) {
        top = 0;
        height = this.blueRectangleStartingPosition.y;
      }

      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
      el.style.width = `${width}px`;
      el.style.height = `${height}px`;
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    if (this.draggingShortcuts) {
      this.placeShortcutNewPosition();
    }
    this.currentApplication = null;
    this.dragging = false;
    this.draggingShortcuts = false;
    this.drawingBlueRectangle = false;
    if (this.blueRectangle?.nativeElement) {
      const el = this.blueRectangle.nativeElement;
      //check if blue rectangle is on
      if (el.style.width > '0') {
        this.containShortcut(el);
        el.style.width = '0px';
        el.style.height = '0px';
      }
    }
  }

  placeShortcutNewPosition() {
    const matchedShortcuts = this.shortcuts.filter((s) => this.shortcutsInside.includes(s.id));

    const shortcutsToMove =
      matchedShortcuts.length > 0
        ? matchedShortcuts
        : [this.shortcuts.find((s) => s.id === this.currentShortcut)].filter(Boolean);

    shortcutsToMove.forEach((shortcut) => this.snapShortcutPosition(shortcut!));

    //case when placing shortcuts, one can return to his place but maybe the place is already containing
    //another shortcuts (freshly placed), so the easier solution is to change his position to a new one
    const overlayedShortcut = this.findShortcutsOverlay();
    if (!overlayedShortcut) return;
    const newPlace = this.getNewEmptyShortcutPlace();
    if (!newPlace) return;
    overlayedShortcut.x = newPlace.x;
    overlayedShortcut.y = newPlace.y;
    overlayedShortcut.oldX = newPlace.x;
    overlayedShortcut.oldY = newPlace.y;
  }

  private snapShortcutPosition(shortcut: Shortcut) {
    const x = Math.round(shortcut.x / (this.SHORTCUT_WIDTH + this.SHORTCUT_WIDTH_GAP));
    const newX = x * (this.SHORTCUT_WIDTH + this.SHORTCUT_WIDTH_GAP);

    const y = Math.round(shortcut.y / (this.SHORTCUT_HEIGHT + this.SHORTCUT_HEIGHT_GAP));
    const newY = y * (this.SHORTCUT_HEIGHT + this.SHORTCUT_HEIGHT_GAP);

    const taken = this.isShortcutPositionTaken(newX, newY);

    if (!taken) {
      shortcut.x = newX;
      shortcut.y = newY;
    } else {
      shortcut.x = shortcut.oldX ?? shortcut.x;
      shortcut.y = shortcut.oldY ?? shortcut.y;
    }

    shortcut.oldX = shortcut.x;
    shortcut.oldY = shortcut.y;
  }

  private findShortcutsOverlay(): Shortcut | undefined {
    const overlay = new Set<string>();
    for (const shortcut of this.shortcuts) {
      const key = `${shortcut.x},${shortcut.y}`;
      if (overlay.has(key)) return shortcut;
      overlay.add(key);
    }
    return undefined;
  }

  //if one of the selected shortcut is place at the old place of another selected shortcut its ok
  isShortcutPositionTaken(newX: number, newY: number): boolean {
    let isPositionTaken = false;
    const matchedShortcuts = this.shortcuts.filter((s) => this.shortcutsInside.includes(s.id));
    this.shortcuts.forEach((shortcut) => {
      if (shortcut.oldX === newX && shortcut.oldY === newY) {
        if (!matchedShortcuts.some((shortcutMatch) => shortcutMatch.id == shortcut.id))
          isPositionTaken = true;
      }
    });
    return isPositionTaken;
  }

  containShortcut(el: HTMLElement) {
    const rect = el.getBoundingClientRect();
    const containerRect = el.parentElement!.getBoundingClientRect();

    const left = rect.left - containerRect.left;
    const top = rect.top - containerRect.top;
    const width = rect.width;
    const height = rect.height;
    // const bottom = top + height;
    this.shortcuts.forEach((shortcut: Shortcut) => {
      if (this.isShortcutInsideRect(shortcut, left, top, width, height))
        this.shortcutsInside.push(shortcut.id);
    });
    if (this.shortcutsInside.length > 0) {
      this.shortcutsInside.forEach((shortcutInside: string) => {
        const shortcut = this.shortcuts.find((s: Shortcut) => s.id === shortcutInside);
        if (!shortcut) return;
        shortcut.isSelected = true;
      });
      this.isReadyToGrabShortcuts = true;
    }
  }

  isShortcutInsideRect(
    shortcut: Shortcut,
    left: number,
    top: number,
    width: number,
    height: number,
  ) {
    const scLeft = shortcut.x;
    const scRight = shortcut.x + this.SHORTCUT_WIDTH;
    const scTop = shortcut.y;
    const scBottom = shortcut.y + this.SHORTCUT_HEIGHT;

    const rectLeft = left;
    const rectRight = left + width;
    const rectTop = top;
    const rectBottom = top + height;

    const horizontallyIn = rectLeft < scRight && rectRight > scLeft;

    const verticallyIn = rectTop < scBottom && rectBottom > scTop;

    return horizontallyIn && verticallyIn;
  }

  startDrag(event: MouseEvent, id: string) {
    const apps = this.desktopApplications();
    const appDesktop = apps.find((a: AppInstance) => a.id === id);
    if (!appDesktop) return;
    if (appDesktop && appDesktop.isFullScreen === true) return;
    event.preventDefault();
    this.dragging = true;
    this.currentApplication = id;

    const app = this.movableElements[id];
    this.offsetApp.x = event.clientX - app.x;
    this.offsetApp.y = event.clientY - app.y;
  }

  startDragShortcut(event: MouseEvent, nameShortcutClicked: string) {
    event.preventDefault();
    this.draggingShortcuts = true;
    this.currentShortcut = nameShortcutClicked;
    if (!this.isShortcutPreSelected(nameShortcutClicked)) {
      this.removeOldSelectedShortcuts();
    }
    const shortcut = this.shortcuts.find((shortcut) => shortcut.id === nameShortcutClicked);
    if (shortcut) {
      this.offsetShortcut.x = event.clientX - shortcut.x;
      this.offsetShortcut.y = event.clientY - shortcut.y;
    }
  }

  isShortcutPreSelected(name: string) {
    if (this.shortcutsInside.length > 0) {
      return this.shortcutsInside.some((shortcut) => shortcut === name);
    }
    return false;
  }

  getPosition(id: string) {
    const app = this.movableElements[id];
    if (!app)
      return {
        left: '0px',
        top: '0px',
      };
    return {
      left: app.x + 'px',
      top: app.y + 'px',
    };
  }

  getShortcutPosition(name: string) {
    const shortcut = this.shortcuts.find((shortcut: any) => shortcut.id === name);
    if (shortcut) {
      return {
        left: shortcut.x + 'px',
        top: shortcut.y + 'px',
      };
    }
    return { left: 0 + 'px', top: 0 + 'px' };
  }

  //fin drag
  ngOnDestroy(): void {}

  openProgram(program: string) {
    this.desktopApplications.update((apps: AppInstance[]) =>
      apps.map((app: AppInstance) => ({
        ...app,
        state: app.id === program ? 'open' : app.state,
      })),
    );
    bringToFront(this.desktopApplications, program);
  }

  hideApp(name: string) {
    this.desktopApplications.update((apps: AppInstance[]) =>
      apps.map((app: AppInstance) => (app.id === name ? { ...app, state: 'minimized' } : app)),
    );
    bringToBack(this.desktopApplications, name);
  }

  closeApp(name: string) {
    if (name === 'ticTacToe') {
      this.homeService.resetTictactoe().subscribe();
    }

    this.desktopApplications.update((apps: AppInstance[]) =>
      apps.map((app: AppInstance) => (app.id === name ? { ...app, state: 'closed' } : app)),
    );
    bringToBack(this.desktopApplications, name);
  }

  get movableElements() {
    return this.movableStore.movableElements();
  }

  //only work with 1 instance of browser
  putFullScreenBrowser() {
    this.desktopApplications.update((apps: AppInstance[]) =>
      apps.map((app: AppInstance) =>
        app.appType === 'browser' ? { ...app, isFullScreen: true } : app,
      ),
    );
  }
  //only work with 1 instance of browser
  removeFullScreenBrowser() {
    this.desktopApplications.update((apps: AppInstance[]) =>
      apps.map((app: AppInstance) =>
        app.appType === 'browser' ? { ...app, isFullScreen: false } : app,
      ),
    );
  }

  mousedownApp(name: string) {
    bringToFront(this.desktopApplications, name);
  }

  pressClickOnBackground(event: MouseEvent) {
    //remove the selected shortcuts via the old rectangle
    this.removeOldSelectedShortcuts();
    this.drawingBlueRectangle = true;
    if (this.blueRectangle?.nativeElement) {
      const containerEl = event.currentTarget as HTMLElement;
      const rect = containerEl.getBoundingClientRect();

      // clientX/clientY (viewport coords) minus container viewport position → coordinates inside container
      const x = event.clientX - rect.left + containerEl.scrollLeft;
      const y = event.clientY - rect.top + containerEl.scrollTop;

      const el = this.blueRectangle.nativeElement;

      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      this.blueRectangleStartingPosition.x = x;
      this.blueRectangleStartingPosition.y = y;
    }
  }

  removeOldSelectedShortcuts() {
    if (this.shortcutsInside.length > 0) {
      this.shortcutsInside.forEach((shortcutInside: string) => {
        const shortcut = this.shortcuts.find((s: Shortcut) => s.id === shortcutInside);
        if (!shortcut) return;
        shortcut.isSelected = false;
      });
    }
    this.shortcutsInside = [];
  }

  openNotepad(id: string) {
    const apps = this.desktopApplications();
    const appDesktop = apps.find((a: AppInstance) => a.id === id);
    if (!appDesktop) return;
    this.desktopApplications.update((apps: AppInstance[]) =>
      apps.map((app: AppInstance) => ({
        ...app,
        state: app.id === id ? 'open' : app.state,
      })),
    );
    bringToFront(this.desktopApplications, id);
  }

  setNewShortcutTitle(e: string[]) {
    const appId = e[0];
    const title = e[1];
    if (!title || !appId) return;
    const apps = this.desktopApplications();
    const appDesktop = apps.find((a: AppInstance) => a.id === appId);
    if (!appDesktop) return;

    this.desktopApplications.update((apps: AppInstance[]) =>
      apps.map((app: AppInstance) => ({
        ...app,
        title: app.id === appId ? title : app.title,
        state: app.id === appId ? 'closed' : app.state,
      })),
    );

    const isShortcutCreated = this.shortcuts.some((shortcut: Shortcut) => shortcut.id === appId);
    if (isShortcutCreated) return;
    this.createNewNotepadShortcut(appId, title);
  }

  createNewNotepadShortcut(id: string, title: string) {
    const newPlace = this.getNewEmptyShortcutPlace();
    if (!newPlace) return;
    this.shortcuts.push({
      id: id,
      title: title,
      type: 'notepad',
      isSelected: false,
      x: newPlace.x,
      y: newPlace.y,
      oldX: newPlace.x,
      oldY: newPlace.y,
    });
  }

  getNewEmptyShortcutPlace(): { x: number; y: number } | undefined {
    let positionTaken = true;
    let x = 0;
    let y = 0;
    for (let indexX = 0; indexX < this.MAX_ROW - 1; indexX++) {
      if (!positionTaken) break;
      x = indexX * (this.SHORTCUT_WIDTH + this.SHORTCUT_WIDTH_GAP);
      for (let indexY = 0; indexY < this.MAX_COLUMN - 1; indexY++) {
        y = indexY * (this.SHORTCUT_HEIGHT + this.SHORTCUT_HEIGHT_GAP);
        positionTaken = this.isShortcutPositionTaken(x, y);
        if (!positionTaken) break;
      }
    }
    if (positionTaken) return undefined;
    return { x: x, y: y };
  }

  setNewNotepadContent(e: string[]) {
    const appId = e[0];
    const content = e[1];
    const apps = this.desktopApplications();
    const appDesktop = apps.find((a: AppInstance) => a.id === appId);
    if (!appDesktop) return;

    this.desktopApplications.update((apps: AppInstance[]) =>
      apps.map((app: AppInstance) => ({
        ...app,
        content: app.id === appId ? content : app.content,
      })),
    );
  }
}
