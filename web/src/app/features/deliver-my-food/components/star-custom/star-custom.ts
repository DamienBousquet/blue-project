import { Component, input, computed, signal } from '@angular/core';

@Component({
  selector: 'app-star-custom',
  imports: [],
  templateUrl: './star-custom.html',
  styleUrl: './star-custom.scss',
})
export class StarCustom {
  ratingAvg = input<number>(0);
  starNumber = input<number>(0);
  id = signal<string>(crypto.randomUUID());

  readonly starOffset = computed(() => {
    const integerValue = this.ratingAvg().toString().substring(0, 1);
    if (+integerValue + 1 == this.starNumber()) {
      const decimalPart = +(this.ratingAvg() - Math.floor(this.ratingAvg())).toFixed(2);
      return decimalPart * 100 + '%';
    } else if (this.starNumber() > +integerValue + 1) {
      return '0%';
    }
    return '100%';
  });
}
