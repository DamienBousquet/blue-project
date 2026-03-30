import { Component, input, output } from '@angular/core';
import { SearchBar } from '../search-bar/search-bar';

@Component({
  selector: 'app-home-search-bar',
  imports: [SearchBar],
  templateUrl: './home-search-bar.html',
  styleUrl: './home-search-bar.scss',
})
export class HomeSearchBar {
  parentSize = input<string>('regular');
  searchEvent = output<string>();

  search(query: string) {
    this.searchEvent.emit(query);
  }
}
