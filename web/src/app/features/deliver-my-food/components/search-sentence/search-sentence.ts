import { Component, input, output, effect, signal } from '@angular/core';
import { FoodPlace } from '../../models/food-place.interface';

@Component({
  selector: 'app-search-sentence',
  imports: [],
  templateUrl: './search-sentence.html',
  styleUrl: './search-sentence.scss',
})
export class SearchSentence {
  foodPlaces = input<FoodPlace[]>();
  lastSearch = input<string>();
  lastSearchText = signal<string | undefined>(undefined);
  isLoading = input<boolean>();
  allFoodPlacesEvent = output<void>();

  constructor() {
    effect(() => {
      const lastSearch = this.lastSearch();
      if (lastSearch) this.lastSearchText.set(decodeURIComponent(lastSearch));
    });
  }

  goToAllFoodPlace() {
    this.allFoodPlacesEvent.emit();
  }
}
