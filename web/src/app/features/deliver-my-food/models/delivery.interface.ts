export interface Delivery {
  id: string;
  status: string;
  hashedValue: string;
  orderId: string;
  createdAt: {
    date: string;
    timezone_type: number;
    timezone: string;
  };
  completedAt?: {
    date: string;
    timezone_type: number;
    timezone: string;
  };
}
