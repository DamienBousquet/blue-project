export interface Dish {
  id: string;
  name: string;
  description: string;
  imagePath: string;
  price?: number;
  newPrice?: number;
  isAvailable: boolean;
  isShown: boolean;
}
