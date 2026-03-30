import { WritableSignal } from '@angular/core';
import { AppInstance } from '../features/home/models/app-info.interface';

export const DESKTOP_WIDTH = 1283;
export const DESKTOP_HEIGHT = 670;
export const Z = {
  DESKTOP: 0,
  WINDOWS_BASE: 100,
  PANELS: 1000,
};

export function bringToFront(apps: WritableSignal<AppInstance[]>, appId: string) {
  apps.update((apps: AppInstance[]) => {
    const index = apps.findIndex((a) => a.id === appId);
    if (index === -1) return apps;

    const app = apps[index];

    const rest = [...apps.slice(0, index), ...apps.slice(index + 1)];

    return [...rest, app];
  });
}

export function bringToBack(apps: WritableSignal<AppInstance[]>, appId: string) {
  apps.update((apps: AppInstance[]) => {
    const index = apps.findIndex((a) => a.id === appId);
    if (index === -1) return apps;

    const app = apps[index];
    const rest = [...apps.slice(0, index), ...apps.slice(index + 1)];

    return [app, ...rest];
  });
}
