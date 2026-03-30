import { Renderer2, Injectable } from '@angular/core';
import { MovableStore } from './movable-store';
import { DESKTOP_WIDTH, DESKTOP_HEIGHT } from './constants';
@Injectable({ providedIn: 'root' })
export class ResizableContainer {
  public isInit: boolean = false;
  currentElement: string = '';
  private resizeContainer!: HTMLElement;
  private resizeEdgeRight!: HTMLElement;
  private resizeEdgeLeft!: HTMLElement;
  private resizeEdgeBottom!: HTMLElement;
  private resizeCornerBotRight!: HTMLElement;
  private resizeCornerBotLeft!: HTMLElement;
  private isResizingRight = false;
  private isResizingLeft = false;
  private isResizingBottom = false;
  private isResizingCornerBotRight = false;
  private isResizingCornerBotLeft = false;
  private startX = 0;
  private startY = 0;
  private startLeft = 0;
  private startWidth = 0;
  private startHeight = 0;
  private minWidth = 0;
  private maxWidth = 0;
  private minHeight = 0;
  private maxHeight = 0;

  private removeMouseMove?: () => void;
  private removeMouseUp?: () => void;

  constructor(private renderer: Renderer2, private movableStore: MovableStore) {}

  create(): ResizableContainer {
    return new ResizableContainer(this.renderer, this.movableStore);
  }

  init(
    resizeContainer: HTMLElement,
    minWidth: number,
    maxWidth: number,
    minHeight: number,
    maxHeight: number,
    currentElement: string
  ) {
    this.resizeContainer = resizeContainer;
    this.minWidth = minWidth;
    this.maxWidth = maxWidth;
    this.minHeight = minHeight;
    this.maxHeight = maxHeight;
    this.buildElements();
    this.currentElement = currentElement;
    this.isInit = true;
    this.renderer.setStyle(
      resizeContainer,
      'width',
      `${this.movableStore.movableElements()[currentElement].width}px`
    );
    this.renderer.setStyle(
      resizeContainer,
      'height',
      `${this.movableStore.movableElements()[currentElement].height}px`
    );
  }

  buildElements() {
    this.resizeEdgeRight = this.renderer.createElement('div');
    this.resizeEdgeLeft = this.renderer.createElement('div');
    this.resizeEdgeBottom = this.renderer.createElement('div');
    this.resizeCornerBotRight = this.renderer.createElement('div');
    this.resizeCornerBotLeft = this.renderer.createElement('div');
    this.addCssClass();
    this.renderer.appendChild(this.resizeContainer, this.resizeEdgeRight);
    this.renderer.appendChild(this.resizeContainer, this.resizeEdgeLeft);
    this.renderer.appendChild(this.resizeContainer, this.resizeEdgeBottom);
    this.renderer.appendChild(this.resizeContainer, this.resizeCornerBotRight);
    this.renderer.appendChild(this.resizeContainer, this.resizeCornerBotLeft);
    this.renderer.listen(this.resizeEdgeRight, 'mousedown', (event: MouseEvent) =>
      this.startResizingRight(event)
    );
    this.renderer.listen(this.resizeEdgeLeft, 'mousedown', (event: MouseEvent) =>
      this.startResizingLeft(event)
    );
    this.renderer.listen(this.resizeEdgeBottom, 'mousedown', (event: MouseEvent) =>
      this.startResizingBottom(event)
    );
    this.renderer.listen(this.resizeCornerBotRight, 'mousedown', (event: MouseEvent) =>
      this.startResizingCornerBotRight(event)
    );
    this.renderer.listen(this.resizeCornerBotLeft, 'mousedown', (event: MouseEvent) =>
      this.startResizingCornerBotLeft(event)
    );
  }
  addCssClass() {
    this.resizeEdgeRight.style.cssText = `
        position: absolute;
        top: 0;
        right: 0;
        width: 4px;
        height: 100%;
        cursor: ew-resize;
        `;

    this.resizeEdgeLeft.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
        cursor: ew-resize;
        `;

    this.resizeEdgeBottom.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        height: 4px;
        width: 100%;
        cursor: ns-resize;
        `;

    this.resizeCornerBotRight.style.cssText = `
        position: absolute;
        bottom: 0;
        right: 0;
        height: 5px;
        width: 5px;
        cursor: nwse-resize;
        `;
    this.resizeCornerBotLeft.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        height: 5px;
        width: 5px;
        cursor: nesw-resize;
        `;
  }

  private startResizingRight(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    this.isResizingRight = true;
    this.startX = event.clientX;
    this.startWidth = this.resizeContainer.offsetWidth;

    this.attachDocumentListeners();
  }

  private startResizingLeft(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    this.isResizingLeft = true;
    this.startX = event.clientX;
    this.startWidth = this.resizeContainer.offsetWidth;

    this.startLeft = this.resizeContainer.offsetLeft;

    // Making sure it can move
    this.renderer.setStyle(this.resizeContainer, 'position', 'absolute');
    this.attachDocumentListeners();
  }

  private startResizingBottom(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    this.isResizingBottom = true;
    this.startY = event.clientY;
    this.startHeight = this.resizeContainer.offsetHeight;
    // Record initial 'left' offset (from container's position)
    const rect = this.resizeContainer.getBoundingClientRect();
    this.startLeft = rect.left;

    this.renderer.setStyle(this.resizeContainer, 'position', 'absolute');

    this.attachDocumentListeners();
  }

  private startResizingCornerBotRight(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    this.isResizingCornerBotRight = true;
    this.startX = event.clientX;

    this.startY = event.clientY;
    this.startWidth = this.resizeContainer.offsetWidth;
    this.startHeight = this.resizeContainer.offsetHeight;

    this.attachDocumentListeners();
  }

  private startResizingCornerBotLeft(event: MouseEvent): void {
    event.stopPropagation();
    event.preventDefault();

    this.isResizingCornerBotLeft = true;
    this.startX = event.clientX;
    this.startWidth = this.resizeContainer.offsetWidth;
    this.startLeft = this.resizeContainer.offsetLeft;
    this.renderer.setStyle(this.resizeContainer, 'position', 'absolute');

    this.startY = event.clientY;
    this.startHeight = this.resizeContainer.offsetHeight;

    this.attachDocumentListeners();
  }

  private attachDocumentListeners(): void {
    this.removeMouseMove = this.renderer.listen('document', 'mousemove', (e: any) =>
      this.onResizing(e)
    );
    this.removeMouseUp = this.renderer.listen('document', 'mouseup', () => this.stopResizing());
  }

  private onResizing(event: MouseEvent): void {
    if (this.isResizingRight) {
      this.resizeRight(event);
    }

    if (this.isResizingLeft) {
      this.resizeLeft(event);
    }

    if (this.isResizingBottom) {
      this.resizeHeight(event);
    }

    if (this.isResizingCornerBotRight) {
      this.resizeRight(event);
      this.resizeHeight(event);
    }
    if (this.isResizingCornerBotLeft) {
      this.resizeLeft(event);
      this.resizeHeight(event);
    }

    this.movableStore.updateElement(this.currentElement, {
      width: this.resizeContainer.getBoundingClientRect().width,
    });
    this.movableStore.updateElement(this.currentElement, {
      height: this.resizeContainer.getBoundingClientRect().height,
    });
  }

  stopResizing(): void {
    this.isResizingRight = false;
    this.isResizingLeft = false;
    this.isResizingBottom = false;
    this.isResizingCornerBotRight = false;
    this.isResizingCornerBotLeft = false;
    this.removeMouseMove?.();
    this.removeMouseUp?.();
  }

  resizeHeight(event: MouseEvent) {
    const deltaY = event.clientY - this.startY;
    let newHeight = Math.max(this.minHeight, this.startHeight + deltaY);
    newHeight = Math.min(newHeight, this.maxHeight);
    const parent = this.resizeContainer.offsetParent;
    const newBottom = this.startHeight + this.resizeContainer.offsetTop + deltaY;

    if (!parent) return;

    // Clamp height if mouse is outside the screen
    if (newBottom > parent.clientHeight) {
      newHeight = parent.clientHeight - this.resizeContainer.offsetTop;
      newHeight = Math.min(newHeight, this.maxHeight);
      this.renderer.setStyle(this.resizeContainer, 'top', `${this.resizeContainer.offsetTop}px`);
    }

    this.renderer.setStyle(this.resizeContainer, 'height', `${newHeight}px`);
  }
  resizeRight(event: MouseEvent) {
    const parentWidth = this.resizeContainer.offsetParent?.clientWidth;
    const containerLeft = this.resizeContainer.offsetLeft;

    const deltaX = event.clientX - this.startX;
    let newWidth = this.startWidth + deltaX;
    let newRight = newWidth + containerLeft;

    //minimum width
    newWidth = Math.max(this.minWidth, newWidth);

    //maximum width
    newWidth = Math.min(newWidth, this.maxWidth);

    // If mouse goes outside the parent container
    if (parentWidth && newRight > parentWidth) {
      newWidth = parentWidth - containerLeft;
      newWidth = Math.min(newWidth, this.maxWidth);
    }

    this.renderer.setStyle(this.resizeContainer, 'width', `${newWidth}px`);
  }
  resizeLeft(event: MouseEvent) {
    let deltaX = event.clientX - this.startX;
    let newWidth = this.startWidth - deltaX;
    if (newWidth < this.minWidth) {
      newWidth = this.minWidth;
      deltaX = this.startWidth - this.minWidth;
    } else if (newWidth > this.maxWidth) {
      newWidth = this.maxWidth;
      deltaX = this.startWidth - this.maxWidth;
    }
    const newLeft = this.startLeft + deltaX;

    //When the client burst the mouse outside the screen, and the element is not stuck to the edge
    if (newLeft < 0 && this.resizeContainer.offsetLeft > 0) {
      const correctWidth = newWidth + newLeft;
      const widthToUse = correctWidth >= this.minWidth ? correctWidth : newWidth;
      this.renderer.setStyle(this.resizeContainer, 'width', `${widthToUse}px`);
      this.renderer.setStyle(this.resizeContainer, 'left', '0px');
      this.movableStore.updateElement(this.currentElement, { x: 0 });
    }
    //When the mouse is outside of the screen
    else if (newLeft < 0) {
      this.renderer.setStyle(this.resizeContainer, 'left', `0px`);
      this.movableStore.updateElement(this.currentElement, { x: 0 });
    } else {
      this.renderer.setStyle(this.resizeContainer, 'width', `${newWidth}px`);
      this.renderer.setStyle(this.resizeContainer, 'left', `${newLeft}px`);
      this.movableStore.updateElement(this.currentElement, { x: newLeft });
    }
  }

  putMaxSize() {
    this.renderer.setStyle(this.resizeContainer, 'width', `${DESKTOP_WIDTH}px`);
    this.renderer.setStyle(this.resizeContainer, 'height', `${DESKTOP_HEIGHT}px`);
    this.renderer.setStyle(this.resizeContainer, 'top', `0px`);
    this.renderer.setStyle(this.resizeContainer, 'left', `0px`);
    this.removeResizeHandles();
  }

  restoreSizeAndResizable() {
    const width = this.movableStore.movableElements()[this.currentElement].width;
    const height = this.movableStore.movableElements()[this.currentElement].height;
    const x = this.movableStore.movableElements()[this.currentElement].x;
    const y = this.movableStore.movableElements()[this.currentElement].y;
    this.renderer.setStyle(this.resizeContainer, 'width', `${width}px`);
    this.renderer.setStyle(this.resizeContainer, 'height', `${height}px`);
    this.renderer.setStyle(this.resizeContainer, 'top', `${y}px`);
    this.renderer.setStyle(this.resizeContainer, 'left', `${x}px`);
    this.renderer.appendChild(this.resizeContainer, this.resizeEdgeRight);
    this.renderer.appendChild(this.resizeContainer, this.resizeEdgeLeft);
    this.renderer.appendChild(this.resizeContainer, this.resizeEdgeBottom);
    this.renderer.appendChild(this.resizeContainer, this.resizeCornerBotRight);
    this.renderer.appendChild(this.resizeContainer, this.resizeCornerBotLeft);
  }

  removeResizeHandles() {
    this.renderer.removeChild(this.resizeContainer, this.resizeEdgeBottom);
    this.renderer.removeChild(this.resizeContainer, this.resizeEdgeLeft);
    this.renderer.removeChild(this.resizeContainer, this.resizeEdgeRight);
    this.renderer.removeChild(this.resizeContainer, this.resizeCornerBotLeft);
    this.renderer.removeChild(this.resizeContainer, this.resizeCornerBotRight);
  }

  // destroy() {
  //   this.removeResizeHandles();
  //   this.removeMouseMove?.();
  //   this.removeMouseUp?.();
  //   this.isInit = false;
  // }
}
