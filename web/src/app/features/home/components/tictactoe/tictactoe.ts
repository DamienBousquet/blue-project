import { Component, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { HomeService } from '../../services/home.service';

@Component({
  selector: 'app-tictactoe',
  imports: [],
  templateUrl: './tictactoe.html',
  styleUrl: './tictactoe.scss',
})
export class Tictactoe {
  playerLogo: string = '/tictactoe_player.png';
  botLogo: string = '/tictactoe_bot.png';
  restartPath: string = '/restart-arrow.png';
  map: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  winner: number = 0;
  @ViewChildren('box') boxs!: QueryList<ElementRef>;
  private listeners = new Map<HTMLElement, EventListener>();

  constructor(private homeService: HomeService) {}
  ngAfterViewInit() {
    this.boxs.forEach((box: ElementRef) => {
      const element = box?.nativeElement;
      const listener = () => this.handleClick(element);
      element.addEventListener('click', listener);
      this.listeners.set(element, listener);

      element.style.cursor = 'pointer';
    });
  }

  handleClick(element: HTMLElement) {
    this.addImageIntoHtml(element, true);
    this.boxs.forEach((box: ElementRef) => {
      this.removeClickListener(box?.nativeElement);
    });

    const index: number = this.boxs
      .toArray()
      .findIndex((box: ElementRef) => box.nativeElement === element);
    this.homeService.sendTictactoeMove(index).subscribe((value: any) => {
      this.addImageViaMap(value);
      if (!this.checkIfGameEnd(value)) {
        this.activateListeners(value);
      } else {
        this.winner = value[9];
      }
    });
  }

  removeClickListener(element: HTMLElement) {
    const listener = this.listeners.get(element);
    if (listener) {
      element.removeEventListener('click', listener);
      this.listeners.delete(element);
      element.style.cursor = 'default';
    }
  }

  activateListeners(map: number[]) {
    //if the current box should be empty then it add the listener
    for (let index = 0; index < map.length; index++) {
      if (map[index] == 0) {
        const boxsArray = this.boxs.toArray();
        const element = boxsArray[index]?.nativeElement;
        const listener = () => this.handleClick(element);
        element.addEventListener('click', listener);
        this.listeners.set(element, listener);

        element.style.cursor = 'pointer';
      }
    }
  }

  checkIfGameEnd(map: number[]): boolean {
    return map.length == 10;
  }

  addImageIntoHtml(element: HTMLElement, player: boolean) {
    let imagePath = this.playerLogo;
    if (!player) imagePath = this.botLogo;
    const imageContainer = document.createElement('div');
    imageContainer.style.width = '100%';
    imageContainer.style.height = '100%';
    imageContainer.style.display = 'flex';
    imageContainer.style.justifyContent = 'center';
    imageContainer.style.alignItems = 'center';
    imageContainer.style.overflow = 'hidden';
    const image = document.createElement('img');
    image.src = imagePath;
    image.style.maxHeight = '100%';
    image.style.maxWidth = '100%';
    image.style.objectFit = 'contain';
    image.style.scale = '0.8';
    if (!player) image.style.scale = '0.7';
    image.draggable = false;

    imageContainer.appendChild(image);
    element.appendChild(imageContainer);
  }

  addImageViaMap(map: number[]) {
    const boxsArray = this.boxs.toArray();
    for (let index = 0; index < 9; index++) {
      const element: HTMLElement = boxsArray[index]?.nativeElement;
      const shouldHaveIcon = map[index] == 2 && !element.firstChild;
      if (shouldHaveIcon) {
        this.addImageIntoHtml(element, false);
      }
    }
  }

  clickOnRestart() {
    this.winner = 0;
    this.map = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.boxs.forEach((box: ElementRef) => {
      const element: HTMLElement = box?.nativeElement;
      while (element.firstChild) element.removeChild(element.firstChild);
    });
    const randomNumber = Math.floor(Math.random() * 2 + 1);
    if (randomNumber == 2) {
      const numberThatRepresentBotStarting: number = 10;
      this.homeService.sendTictactoeMove(numberThatRepresentBotStarting).subscribe((value: any) => {
        this.addImageViaMap(value);
        this.activateListeners(value);
      });
    } else {
      this.activateListeners(this.map);
    }
  }
}
