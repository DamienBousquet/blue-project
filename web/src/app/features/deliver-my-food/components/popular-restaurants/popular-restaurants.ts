import { Component, input, signal, effect, output, computed } from '@angular/core';
import { FoodPlace } from '../../models/food-place.interface';
import { StarCustom } from '../star-custom/star-custom';

@Component({
  selector: 'app-popular-restaurants',
  imports: [StarCustom],
  templateUrl: './popular-restaurants.html',
  styleUrl: './popular-restaurants.scss',
})
export class PopularRestaurants {
  parentSize = input<string>('regular');
  foodPlaces = input<FoodPlace[]>([]);
  goToFoodPlaceEvent = output<number>();

  readonly starOffset = computed(() => {
    return this.foodPlaces().map((foodPlace: FoodPlace) => {
      const decimalPart = +(foodPlace.ratingAvg - Math.floor(foodPlace.ratingAvg)).toFixed(2);
      return decimalPart * 100 + '%';
    });
  });

  constructor() {
    effect(() => {
      const foodPlaces = this.foodPlaces();
    });
  }

  clickOnFoodPlace(idFoodPlace: number) {
    this.goToFoodPlaceEvent.emit(idFoodPlace);
  }
}
