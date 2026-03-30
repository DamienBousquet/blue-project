import { Component, input, output } from '@angular/core';
import { Dish } from '../../models/dish.interface';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-dish-card',
  imports: [DecimalPipe],
  templateUrl: './dish-card.html',
  styleUrl: './dish-card.scss',
})
export class DishCard {
  dish = input<Dish>();
}
