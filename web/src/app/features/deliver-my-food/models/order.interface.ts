export interface Order {
  id: number;
  status: string;
  foodPlaceName: string;
  totalPrice: number;
  createdAt: {
    date: string;
    timezone_type: number;
    timezone: string;
  };
}
