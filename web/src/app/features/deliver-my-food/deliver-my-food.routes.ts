// import { Routes } from '@angular/router';
// import { DeliverMyFoodShell } from './shell/deliver-my-food-shell';

// // export const DELIVER_MY_FOOD_ROUTES: Routes = [
// //   { path: 'menu', component: MenuPage },
// //   { path: 'profile', component: ProfilePage },
// //   { path: '', redirectTo: 'menu', pathMatch: 'full' }
// // ];

// export const DELIVER_MY_FOOD_ROUTES: Routes = [
//   {
//     path: '',
//     component: DeliverMyFoodShell,
//     children: [
//       {
//         path: 'home',
//         loadComponent: () => import('./pages/home-page/home-page').then((m) => m.HomePage),
//       },
//       {
//         path: 'profile',
//         loadComponent: () => import('./pages/profile-page/profile-page').then((m) => m.ProfilePage),
//       },
//       { path: '', redirectTo: 'home', pathMatch: 'full' },
//     ],
//   },
// ];
