import { Component, signal, ViewChild, ElementRef, output } from '@angular/core';
import { RestaurantOfTheDay } from '../../components/restaurant-of-the-day/restaurant-of-the-day';
import { PopularRestaurants } from '../../components/popular-restaurants/popular-restaurants';
import { HomeSearchBar } from '../../components/home-search-bar/home-search-bar';
import { AppService } from '../../services/app.service';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { FoodPlace } from '../../models/food-place.interface';
import { Loader } from '../../components/loader/loader';
import { EstimatedTimeDelivery } from '../../models/estimatedTimeDelivery.interface';

@Component({
  selector: 'app-home-page',
  imports: [RestaurantOfTheDay, PopularRestaurants, HomeSearchBar, Loader],
  templateUrl: './home-page.html',
  styleUrl: './home-page.scss',
})
export class HomePage {
  mainContainerSize = signal<string>('regular');
  @ViewChild('mainContainer') mainContainer!: ElementRef;
  isLoading = signal<boolean>(false);
  allPlaces = signal<FoodPlace[]>([]);
  dayFoodPlaceFeatures = signal<FoodPlace | undefined>(undefined);
  estimatedTimeDelivery = signal<number | undefined>(undefined);
  goTo = output<string>();

  constructor(private appService: AppService) {}

  ngOnInit() {
    this.isLoading.set(true);
    const firstApiCall = this.appService.getAllFoodPlaces();
    const secondApiCall = this.appService.getDayFoodPlaceFeatures();
    const thirdApiCall = this.appService.getEstimatedTimesDelivery('-1');
    forkJoin([
      firstApiCall,
      secondApiCall,
      thirdApiCall.pipe(catchError((err) => of(null))),
    ]).subscribe({
      next: ([firstResult, secondResult, thirdResult]) => {
        this.allPlaces.set(firstResult);
        this.dayFoodPlaceFeatures.set(secondResult);
        this.setEstimatedTimeDelivery(thirdResult);
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
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
    if (width < 600) {
      this.mainContainerSize.set('small');
    } else {
      this.mainContainerSize.set('regular');
    }
  }

  search(query: string) {
    if (!query) return;
    const encodedText = encodeURIComponent(query);
    this.goTo.emit(`/discovery?query=${encodedText}`);
  }

  goToFoodPlace(idFoodPlace: number) {
    this.goTo.emit(`/discovery/${idFoodPlace}`);
  }

  setEstimatedTimeDelivery(estimatedTimes: EstimatedTimeDelivery[]) {
    if (!estimatedTimes || estimatedTimes.length == 0) return;
    const estimatedTime = estimatedTimes[0];
    const timeDelivery = estimatedTime.timeDelivery;
    const estimatedMinutes = Math.round(timeDelivery / 60);
    this.estimatedTimeDelivery.set(estimatedMinutes);
  }
}
