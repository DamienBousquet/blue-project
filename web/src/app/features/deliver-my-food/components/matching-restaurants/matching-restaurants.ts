import { Component, input, effect, output } from '@angular/core';
import { FoodPlace } from '../../models/food-place.interface';
import { Star } from '../star/star';

@Component({
  selector: 'app-matching-restaurants',
  imports: [Star],
  templateUrl: './matching-restaurants.html',
  styleUrl: './matching-restaurants.scss',
})
export class MatchingRestaurants {
  foodPlaces = input<FoodPlace[]>();
  selectFoodPlaceEvent = output<number>();
  selectedIdFoodPlace: number | undefined = undefined;

  constructor() {
    effect(() => {
      const foodPlaces = this.foodPlaces();
      if (foodPlaces && foodPlaces.length === 1) {
        const foodPlace = foodPlaces[0];
        this.selectedIdFoodPlace = foodPlace.id;
        console.log(foodPlaces);
        this.selectFoodPlaceEvent.emit(foodPlace.id);
      }
    });
  }

  selectFoodPlace(idFoodPlace: number) {
    if (this.selectedIdFoodPlace != idFoodPlace) {
      this.selectedIdFoodPlace = idFoodPlace;
      this.selectFoodPlaceEvent.emit(idFoodPlace);
    }
  }
}
