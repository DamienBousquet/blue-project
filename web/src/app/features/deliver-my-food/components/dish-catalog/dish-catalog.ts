import {
  Component,
  input,
  effect,
  signal,
  computed,
  ViewChild,
  ElementRef,
  output,
} from '@angular/core';
import { Dish } from '../../models/dish.interface';
import { DishSelection } from '../../models/dish-selection.interface';
import { FoodPlace } from '../../models/food-place.interface';
import { DishCard } from '../dish-card/dish-card';
import { Loader } from '../loader/loader';

@Component({
  selector: 'app-dish-catalog',
  imports: [DishCard, Loader],
  templateUrl: './dish-catalog.html',
  styleUrl: './dish-catalog.scss',
})
export class DishCatalog {
  foodPlaces = input<FoodPlace[]>();
  dishes = input<Dish[]>();
  dishesFirstRow: Dish[] = [];
  dishesSecondRow: Dish[] = [];
  isLoading = input<boolean>();
  isFirstRowFull = signal<boolean>(false);
  isSecondRowFull = signal<boolean>(false);
  dishQuantities = input<Record<string, DishSelection>>({});
  quantityChangeEvent = output<Record<string, DishSelection>>();
  dishMaxQuantity: number = 9;
  firstRowObserver: ResizeObserver | undefined = undefined;
  private firstRowHTMLElement?: HTMLElement;
  //a setter is use to deal with reactive (otherwise firstRowContext isn't rendered at the end of the effect)
  @ViewChild('firstRowContext')
  set firstRowContext(el: ElementRef<HTMLElement> | undefined) {
    this.firstRowHTMLElement = el?.nativeElement;
    if (!el) {
      this.cleanupObserver('first');
      return;
    }
    this.cleanupObserver('first');
    this.firstRowObserver = new ResizeObserver((entries) => {
      this.updateCatalogLayout(entries[0].contentRect.width, 'first');
    });
    this.firstRowObserver.observe(el.nativeElement);
  }
  secondRowObserver: ResizeObserver | undefined = undefined;
  private secondRowHTMLElement?: HTMLElement;
  @ViewChild('secondRowContext')
  set secondRowContext(el: ElementRef<HTMLElement> | undefined) {
    this.secondRowHTMLElement = el?.nativeElement;
    if (!el) {
      this.cleanupObserver('second');
      return;
    }
    this.cleanupObserver('second');
    this.secondRowObserver = new ResizeObserver((entries) => {
      this.updateCatalogLayout(entries[0].contentRect.width, 'second');
    });
    this.secondRowObserver.observe(el.nativeElement);
  }

  readonly hasDishes = computed(() => {
    const dishes = this.dishes();
    return dishes !== undefined && dishes?.length > 0;
  });
  readonly hasFoodPlaceButNoneSelected = computed(() => {
    const foodPlaces = this.foodPlaces();
    const dishes = this.dishes();
    return (foodPlaces?.length ?? 0) > 0 && (dishes === undefined || dishes?.length == 0);
  });
  readonly safeDishQuantities = computed(() => {
    const q = this.dishQuantities();
    return {
      ...q,
      getQuantity: (dishId: string) => q[dishId]?.quantity ?? 0,
    };
  });

  constructor() {
    effect(() => {
      const dishes = this.dishes();
      if (dishes == undefined || (dishes && dishes.length == 0)) return;
      this.dispatchDishes(dishes);
    });

    effect(() => {
      const foodPlaces = this.foodPlaces();
    });
  }

  dispatchDishes(dishes: Dish[]) {
    const halfLength = Math.ceil(dishes.length / 2);
    this.dishesFirstRow = dishes.slice(0, halfLength);
    this.dishesSecondRow = dishes.slice(halfLength, dishes.length);
  }

  updateCatalogLayout(containerWidth: number, id: string) {
    const nbElements = id === 'first' ? this.dishesFirstRow.length : this.dishesSecondRow.length;
    let isFull = false;

    if (nbElements <= 1) {
      isFull = false;
    } else if (nbElements >= 4) {
      isFull = true;
    } else if (nbElements === 3) {
      isFull = containerWidth < 720;
    } else if (nbElements === 2) {
      isFull = containerWidth < 500;
    }
    if (id === 'first') {
      this.isFirstRowFull.set(isFull);
    } else if (id === 'second') {
      this.isSecondRowFull.set(isFull);
    }
  }

  incrementQuantity(dish: Dish) {
    const dishId = dish.id;
    const current = this.dishQuantities()[dishId];
    const currentQuantity = current?.quantity ?? 0;
    const newQuantity = currentQuantity + 1;
    if (currentQuantity < this.dishMaxQuantity) {
      const updated = {
        ...this.dishQuantities(),
        [dishId]: { dish: dish, quantity: newQuantity },
      };
      this.quantityChangeEvent.emit(updated);
    }
  }

  decrementQuantity(dish: Dish) {
    const dishId = dish.id;
    const current = this.dishQuantities()[dishId];
    const currentQuantity = current?.quantity ?? 0;
    const newQuantity = currentQuantity - 1;
    if (currentQuantity > 0) {
      const updated = {
        ...this.dishQuantities(),
        [dishId]: { dish: dish, quantity: newQuantity },
      };
      if (newQuantity === 0) delete updated[dishId];
      this.quantityChangeEvent.emit(updated);
    }
  }

  private cleanupObserver(id: string) {
    if (id === 'first') {
      this.firstRowObserver?.disconnect();
      this.firstRowObserver = undefined;
    } else {
      this.secondRowObserver?.disconnect();
      this.secondRowObserver = undefined;
    }
  }

  clickPrevious(rowNumber: number) {
    let el: HTMLElement | undefined = undefined;
    if (rowNumber == 1) el = this.firstRowHTMLElement;
    else el = this.secondRowHTMLElement;
    if (!el) return;
    el.scrollBy({ left: -230, top: 0, behavior: 'smooth' });
  }

  clickNext(rowNumber: number) {
    let el: HTMLElement | undefined = undefined;
    if (rowNumber == 1) el = this.firstRowHTMLElement;
    else el = this.secondRowHTMLElement;
    if (!el) return;
    el.scrollBy({ left: 230, top: 0, behavior: 'smooth' });
  }
}
