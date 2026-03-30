import {
  Directive,
  Input,
  ElementRef,
  Renderer2,
  AfterViewInit,
  input,
  effect,
} from '@angular/core';
import { ResizableContainer } from './resizable-container';
import { MovableStore } from './movable-store';

@Directive({
  selector: '[appResizableWindow]',
  standalone: true,
})
export class ResizableWindowDirective implements AfterViewInit {
  @Input({ required: true }) appId!: string;
  @Input({ required: true }) appType!: string;
  isFullScreen = input<boolean>();

  private resizable!: ResizableContainer;

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2,
    private movableStore: MovableStore
  ) {
    effect(() => {
      const isFullScreen = this.isFullScreen();
      if (!this.resizable || isFullScreen === undefined) return;

      if (isFullScreen) {
        this.resizable.putMaxSize();
      } else {
        this.resizable.restoreSizeAndResizable();
      }
    });
  }

  ngAfterViewInit() {
    if (!this.movableStore.isElement(this.appId)) {
      this.movableStore.addElement(this.appId, this.getInitialConfig());
    }
    this.resizable = new ResizableContainer(this.renderer, this.movableStore);

    const config = this.getResizeConfig();
    if (!config.minWidth) return;
    this.resizable.init(
      this.el.nativeElement,
      config.minWidth,
      config.maxWidth,
      config.minHeight,
      config.maxHeight,
      this.appId
    );

    if (config.useMaxSize && this.resizable.putMaxSize) {
      this.resizable.putMaxSize();
    }
  }

  ngOnDestroy() {}

  private getInitialConfig() {
    switch (this.appType) {
      case 'notepad':
        return { x: 350, y: 120, width: 350, height: 400 };
      case 'browser':
        return { x: 0, y: 0, width: 800, height: 300 };
      case 'ticTacToe':
        return { x: 150, y: 300, width: 250, height: 270 };
      default:
        return { x: 0, y: 0, width: 300, height: 300 };
    }
  }

  private getResizeConfig() {
    switch (this.appType) {
      case 'notepad':
        return {
          minWidth: 250,
          maxWidth: 700,
          minHeight: 250,
          maxHeight: 450,
        };
      case 'browser':
        return {
          minWidth: 350,
          maxWidth: 1000,
          minHeight: 250,
          maxHeight: 700,
          useMaxSize: this.isFullScreen(),
        };
      case 'ticTacToe':
        return {
          minWidth: 150,
          maxWidth: 300,
          minHeight: 150,
          maxHeight: 300,
        };
      default:
        return {};
    }
  }
}
