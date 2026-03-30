import { Dish } from './dish.interface';

export interface DishSelection {
  quantity: number;
  dish: Partial<Dish>;
}
