export interface FoodPlace {
  id: number;
  name: string;
  ratingAvg: number;
  tags: string;
  icon: string;
  longitude: number;
  latitude: number;
  isOpen: boolean;
  estimatedTimeDelivery?: number;
  firstDish?: any;
  secondDish?: any;
}
