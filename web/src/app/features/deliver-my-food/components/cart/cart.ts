import { Component, input, effect, computed, signal, output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { DishSelection } from '../../models/dish-selection.interface';

@Component({
  selector: 'app-cart',
  imports: [DecimalPipe],
  templateUrl: './cart.html',
  styleUrl: './cart.scss',
})
export class Cart {
  items = input<Record<string, DishSelection>>();
  deliveryFee = input<number>();
  orderEvent = output<void>();
  itemArray = signal<DishSelection[]>([]);
  hasItems = computed(() => {
    const items = this.items();
    if (!items) return false;
    const itemArray = Object.values(items);
    if (itemArray.length > 0) return true;
    return false;
  });
  readonly safeTotalPricePerDish = computed(() => {
    const itemArray = this.itemArray();
    return {
      getTotalPrice: (dishSelection: DishSelection) => {
        const item = itemArray.find(
          (item: DishSelection) => item.dish.id === dishSelection.dish.id,
        );
        if (item?.dish?.newPrice) return (item?.dish?.newPrice ?? 0) * (item?.quantity ?? 0);
        else return (item?.dish?.price ?? 0) * (item?.quantity ?? 0);
      },
    };
  });

  constructor() {
    effect(() => {
      const items = this.items();
      if (!items) return;
      this.itemArray.set(Object.values(items));
    });
  }

  totalPrice(): number {
    const items = this.itemArray();
    const sum = items.reduce((acc: any, item: DishSelection) => {
      if (item.dish.newPrice) return acc + (item.dish?.newPrice || 0) * item.quantity;
      else return acc + (item.dish?.price || 0) * item.quantity;
    }, 0);
    return sum + this.deliveryFee();
  }

  order() {
    this.orderEvent.emit();
  }
}
