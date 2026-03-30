import { Component, input, computed } from '@angular/core';
import { Order } from '../../models/order.interface';
import { DateFormatPipe } from '../../services/pipe/date-format.pipe';

@Component({
  selector: 'app-order-data-table',
  imports: [DateFormatPipe],
  templateUrl: './order-data-table.html',
  styleUrl: './order-data-table.scss',
})
export class OrderDataTable {
  orders = input<Order[]>();
  sortedOrders = computed(() => {
    const orders = this.orders();
    if (!orders) return;
    return [...orders].sort((a, b) => b.id - a.id);
  });
}
