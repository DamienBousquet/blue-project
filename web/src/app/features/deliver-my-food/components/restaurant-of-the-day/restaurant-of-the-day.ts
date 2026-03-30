import { Component, input, effect, signal } from '@angular/core';
import { FoodPlace } from '../../models/food-place.interface';
import { StarCustom } from '../star-custom/star-custom';

@Component({
  selector: 'app-restaurant-of-the-day',
  imports: [StarCustom],
  templateUrl: './restaurant-of-the-day.html',
  styleUrl: './restaurant-of-the-day.scss',
})
export class RestaurantOfTheDay {
  parentSize = input<string>('regular');
  dayRestaurant = input<FoodPlace>();
  timeToDeliver = input<number | undefined>(undefined);
  rating = signal<number>(0);
  starOffset = signal<string>('00%');
  titleLogoPath: string = '';
  firstDealLogoPath: string = '';
  secondDealLogoPath: string = '';
  firstDealName: string = 'Ramen Narutomaki';
  secondDealName: string = 'California Boat';

  constructor() {
    effect(() => {
      const dayRestaurant = this.dayRestaurant();
      if (!dayRestaurant) return;
      const ratingAvg = Number(dayRestaurant.ratingAvg);
      this.rating.set(ratingAvg);
      const decimalPart = +(ratingAvg - Math.floor(ratingAvg)).toFixed(2);
      this.starOffset.set(decimalPart * 100 + '%');

      this.manageIcons(dayRestaurant);
    });
  }

  manageIcons(dayRestaurant: FoodPlace) {
    dayRestaurant.icon
      ? (this.titleLogoPath = '/food-icon/' + dayRestaurant.icon + '.png')
      : (this.titleLogoPath = '/food-icon/default.png');

    this.firstDealLogoPath = '/food-icon/' + dayRestaurant.firstDish.imagePath;
    this.secondDealLogoPath = '/food-icon/' + dayRestaurant.secondDish.imagePath;
  }
}
