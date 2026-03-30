import { Component, NgZone, input, effect, signal, output } from '@angular/core';
import { Subscription, catchError, of, switchMap, tap, merge, EMPTY } from 'rxjs';
import { MercureService } from '../../services/mercure.service';
import { Map } from '../../components/map/map';
import { DeliveryDetails } from '../../components/delivery-details/delivery-details';
import { Loader } from '../../components/loader/loader';
import { AppService } from '../../services/app.service';

@Component({
  selector: 'app-delivery-page',
  imports: [Map, DeliveryDetails, Loader],
  templateUrl: './delivery-page.html',
  styleUrl: './delivery-page.scss',
})
export class DeliveryPage {
  link = input<string>();
  goTo = output<string>();
  status = signal<any>(undefined);
  placePoints = signal<any>(undefined);
  private sub?: Subscription;
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  constructor(
    private appService: AppService,
    private mercureService: MercureService,
  ) {
    effect((onCleanup) => {
      const link = this.link();
      if (!link) return;

      this.isLoading.set(true);
      this.error.set(null);

      /* 
        There is 2 request to validate the user accessing to this data 
        (need to have a rightful cookie and the delivery need a special status)
        Then 2 request are send to reach the data
      */
      this.sub = this.appService
        .getMercureCookie(link)
        .pipe(
          switchMap((data: any) => {
            if (!data) {
              throw new Error('You do not have the authorization');
            }
            return this.appService.getDeliveryStatus(link).pipe(
              tap(() => this.isLoading.set(false)),
              switchMap((secondData) => {
                if (!secondData) {
                  throw new Error('Error');
                }
                if (secondData !== 'ON_THE_WAY') {
                  this.error.set('La commande a déjà été livrée');
                  return EMPTY;
                }
                // The 2 request that validate are finished, now start request to reach data
                return merge(
                  this.mercureService.subscribe(link).pipe(
                    tap((data) => {
                      this.status.set(data);
                      this.manageEndDelivery(data);
                    }),
                    catchError((err) => {
                      this.error.set('Une erreur est parvenue.');
                      return of(null);
                    }),
                  ),
                  this.appService.getDeliveryPath(link).pipe(
                    tap((data) => {
                      this.placePoints.set(data);
                    }),
                  ),
                );
              }),
            );
          }),
          catchError((err) => {
            this.isLoading.set(false);
            this.error.set('');
            return of(null);
          }),
        )
        .subscribe();

      onCleanup(() => {
        this.sub?.unsubscribe();
        this.mercureService.disconnect();
      });
    });
  }

  manageEndDelivery(data: any) {
    if (data && data?.timeLeft == 0) {
      setTimeout(() => {
        this.goTo.emit(`/profile`);
      }, 8000);
    }
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.mercureService.disconnect();
  }
}
