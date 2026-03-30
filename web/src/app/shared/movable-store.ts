import { Injectable, signal } from '@angular/core';

export interface MovableInfo {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type Movable = Record<string, { x: number; y: number; width: number; height: number }>;

@Injectable({ providedIn: 'root' })
export class MovableStore {
  movableElements = signal<Movable>({});

  // updateElement(key: string, value: Partial<Movable[string]>) {
  //   this.movableElements.update((e: any) => ({
  //     ...e,
  //     [key]: { ...e[key], ...value },
  //   }));
  // }

  addElement(id: string, initial: MovableInfo) {
    this.movableElements.update((e: any) => ({
      ...e,
      [id]: initial,
    }));
  }

  updateElement(id: string, value: Partial<MovableInfo>) {
    this.movableElements.update((e: any) => ({
      ...e,
      [id]: { ...e[id], ...value },
    }));
  }

  isElement(id: string): boolean {
    return !!this.movableElements()[id];
  }
}
