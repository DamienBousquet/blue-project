import { Component, output, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-search-bar',
  imports: [],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
})
export class SearchBar {
  searchEvent = output<string>();
  @ViewChild('input') input!: ElementRef;
  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^A-Za-z,\s]/g, '');
  }

  search() {
    const searchText = this.getSearchText();
    this.searchEvent.emit(searchText);
  }

  private getSearchText(): string {
    const inputElement = this.input.nativeElement;
    if (!inputElement) return '';

    const inputValue = inputElement.value;
    if (!inputValue) return '';

    return inputValue || '';
  }
}
