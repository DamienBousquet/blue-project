import { Component, input, effect, signal } from '@angular/core';

@Component({
  selector: 'app-delivery-details',
  imports: [],
  templateUrl: './delivery-details.html',
  styleUrl: './delivery-details.scss',
})
export class DeliveryDetails {
  currentStatus = input<any>();
  timeLeft = signal<number>(0);

  constructor() {
    effect(() => {
      const currentStatus = this.currentStatus();
      if (!currentStatus?.timeLeft) return;
      this.timeLeft.set(this.getTimeLeft(currentStatus?.timeLeft));
    });
  }

  getTimeLeft(timeLeft: number) {
    const minutesLeft = Math.round(timeLeft / 60);
    if (minutesLeft < 1) return 1;
    return minutesLeft;
  }
}
