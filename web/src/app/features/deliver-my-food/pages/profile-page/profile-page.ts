import { Component, signal, ViewChild, ElementRef, output } from '@angular/core';
import { AppService } from '../../services/app.service';
import { Order } from '../../models/order.interface';
import { Delivery } from '../../models/delivery.interface';
import { User } from '../../models/user.interface';
import { forkJoin } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { OrderDataTable } from '../../components/order-data-table/order-data-table';
import { Loader } from '../../components/loader/loader';

@Component({
  selector: 'app-profile-page',
  imports: [Loader, OrderDataTable],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.scss',
})
export class ProfilePage {
  goTo = output<string>();
  error = signal<string | null>(null);
  isLoading = signal<boolean>(false);
  user = signal<User | undefined>(undefined);
  currentDelivery = signal<Delivery | undefined>(undefined);
  currentDeliveryMessage = signal<string>('');
  orderList = signal<Order[]>([]);
  mainContainerSize = signal<string>('regular');
  @ViewChild('mainContainer') mainContainer!: ElementRef;

  constructor(private appService: AppService) {}

  ngOnInit() {
    this.isLoading.set(true);
    const firstApiCall = this.appService.getUser();
    const secondApiCall = this.appService.getOrder();
    const thirdApiCall = this.appService.getCurrentDelivery();
    forkJoin([firstApiCall, secondApiCall, thirdApiCall]).subscribe({
      next: ([firstResult, secondResult, thirdResult]) => {
        this.user.set(firstResult);
        this.orderList.set(secondResult);
        this.setCurrentDelivery(thirdResult);
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.error.set('An error has been triggered');
        console.error('Error loading data:', err);
      },
    });
  }

  ngAfterViewInit() {
    if (!this.mainContainer) return;

    const observer = new ResizeObserver((entries) => {
      this.updateContainerLayout(entries[0].contentRect.width);
    });
    observer.observe(this.mainContainer.nativeElement);
  }

  updateContainerLayout(width: number) {
    if (width < 760) {
      this.mainContainerSize.set('small');
    } else {
      this.mainContainerSize.set('regular');
    }
  }

  goToDelivery() {
    const link = this.currentDelivery()?.hashedValue;
    if (!link) return;
    this.goTo.emit(`/delivery/${link}`);
  }

  setCurrentDelivery(apiCall: any) {
    if (!apiCall) return;
    this.currentDeliveryMessage.set(apiCall[1]);
    if (apiCall[0]) {
      this.currentDelivery.set(apiCall[0]);
    }
  }
}
