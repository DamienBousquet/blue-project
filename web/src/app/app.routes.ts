import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./core/presentation/presentation.routes').then((m) => m.PRESENTATION_ROUTES),
    pathMatch: 'full',
  },
  {
    path: 'presentation',
    loadChildren: () =>
      import('./core/presentation/presentation.routes').then((m) => m.PRESENTATION_ROUTES),
  },
  {
    path: 'blueproject',
    loadChildren: () => import('./features/home/home.routes').then((m) => m.HOME_ROUTES),
  },
];
