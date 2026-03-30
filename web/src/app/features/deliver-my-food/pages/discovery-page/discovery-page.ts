import {
  Component,
  signal,
  ViewChild,
  ElementRef,
  SecurityContext,
  effect,
  output,
  input,
  ApplicationRef,
  Injector,
} from '@angular/core';
import { AppService } from '../../services/app.service';
import { FoodPlace } from '../../models/food-place.interface';
import { Dish } from '../../models/dish.interface';
import { EstimatedTimeDelivery } from '../../models/estimatedTimeDelivery.interface';
import { MatchingRestaurants } from '../../components/matching-restaurants/matching-restaurants';
import { SearchBar } from '../../components/search-bar/search-bar';
import { SearchSentence } from '../../components/search-sentence/search-sentence';
import { DishCatalog } from '../../components/dish-catalog/dish-catalog';
import { Cart } from '../../components/cart/cart';
import { Loader } from '../../components/loader/loader';
import { Subscription, forkJoin, of, switchMap, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { DishSelection } from '../../models/dish-selection.interface';
import { ModalComponent } from '../../services/modal/modal.component';

@Component({
  selector: 'app-discovery-page',
  imports: [
    MatchingRestaurants,
    SearchBar,
    SearchSentence,
    DishCatalog,
    Loader,
    Cart,
    ModalComponent,
  ],
  templateUrl: './discovery-page.html',
  styleUrl: './discovery-page.scss',
})
export class DiscoveryPage {
  link = input<string>();
  goTo = output<string>();
  mainContainerSize = signal<string>('regular');
  @ViewChild('mainContainer') mainContainer!: ElementRef;
  @ViewChild('input') input!: ElementRef;
  foodPlaces = signal<FoodPlace[]>([]);
  dishes = signal<Dish[]>([]);
  deliveryFee = signal<number>(0);
  isLoading = signal<boolean>(false);
  isLoadingDishes = signal<boolean>(false);
  lastSearch = signal<string>('');
  dishesSubcription: Subscription | undefined = undefined;
  dishQuantities = signal<Record<string, DishSelection>>({});
  modalState = signal<{ isOpen: boolean; text: string; isLock: boolean }>({
    isOpen: false,
    text: '',
    isLock: false,
  });

  constructor(private appService: AppService) {
    effect(() => {
      const foodPlaces = this.foodPlaces();
      foodPlaces.forEach((foodPlace: FoodPlace) => {
        foodPlace.estimatedTimeDelivery = this.getTimeInMinutes(foodPlace.estimatedTimeDelivery);
      });
    });

    effect(() => {
      const link = this.link();
      if (!link) return;

      this.dishes.set([]);
      this.dishQuantities.set({});
      if (link == 'discovery/all') {
        this.getAllFoodPlaces();
        return;
      }
      const linkArray = link.split('/');
      if (linkArray[0] === 'discovery' && linkArray[1] && !isNaN(Number(linkArray[1]))) {
        const id = Number(linkArray[1]);
        this.getFoodPlace(id);
        return;
      }
      //query search
      const searchTerm = this.extractSearchTerm(link);
      if (searchTerm == null) this.foodPlaces.set([]);
      if (searchTerm && this.lastSearch() !== searchTerm) {
        this.search(decodeURIComponent(searchTerm));
        this.lastSearch.set(searchTerm);
      }
    });
  }

  private extractSearchTerm(link: string): string | null {
    const linkArray = link.split('discovery?query=');
    return linkArray.length > 1 ? linkArray[1] : null;
  }

  private getTimeInMinutes(time: number | undefined) {
    if (time === undefined) return undefined;
    const minutes = time / 60;
    return Math.ceil(minutes);
  }

  ngOnInit() {
    this.appService.getDeliveryFee().subscribe((value: any) => {
      this.deliveryFee.set(value);
    });
  }

  ngAfterViewInit() {
    if (!this.mainContainer) return;
    const observer = new ResizeObserver((entries) => {
      this.updateContainerLayout(entries[0].contentRect.width);
    });
    observer.observe(this.mainContainer.nativeElement);
  }

  private updateContainerLayout(width: number) {
    if (width < 760) {
      this.mainContainerSize.set('small');
    } else {
      this.mainContainerSize.set('regular');
    }
  }

  search(urlValue: string) {
    const searchText = urlValue;
    if (!searchText) return;
    // this.lastSearch.set(searchText);
    this.isLoading.set(true);
    this.dishes.set([]);
    this.appService
      .getSearchResult(searchText)
      .pipe(
        tap(() => this.isLoading.set(false)),
        switchMap((data: any) => {
          if (!data) {
            throw new Error('');
          }
          this.foodPlaces.set(data);
          const ids = data.map((foodPlace: FoodPlace) => {
            return foodPlace.id;
          });
          if (ids.length === 0) throw new Error('');
          return this.appService.getEstimatedTimesDelivery(ids).pipe(
            tap((data: EstimatedTimeDelivery[]) => {
              this.setEstimatedTimeDelivery(data);
            }),
          );
        }),
        catchError((err) => {
          this.isLoading.set(false);
          return of(null);
        }),
      )
      .subscribe();
  }

  getAllFoodPlaces() {
    this.lastSearch.set('');
    this.isLoading.set(true);
    const firstApiCall = this.appService.getAllFoodPlaces();
    const secondApiCall = this.appService.getEstimatedTimesDelivery('all');
    forkJoin([firstApiCall, secondApiCall.pipe(catchError((err) => of(null)))]).subscribe({
      next: ([firstResult, secondResult]) => {
        this.foodPlaces.set(firstResult);
        this.setEstimatedTimeDelivery(secondResult);
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        console.error('Error loading data:', err);
      },
    });
  }

  getFoodPlace(id: number) {
    this.lastSearch.set('');
    this.isLoading.set(true);
    const firstApiCall = this.appService.getFoodPlace(id);
    const secondApiCall = this.appService.getEstimatedTimesDelivery(id.toString());
    forkJoin([firstApiCall, secondApiCall.pipe(catchError((err) => of(null)))]).subscribe({
      next: ([firstResult, secondResult]) => {
        this.foodPlaces.set(firstResult);
        this.setEstimatedTimeDelivery(secondResult);
        this.isLoading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading.set(false);
        console.error('Error loading data:', err);
      },
    });
  }

  goToAllFoodPlaces() {
    this.goTo.emit(`/discovery/all`);
  }

  changeQueryUrl(query: string) {
    if (!query) return;
    const encodedText = encodeURIComponent(query);
    this.goTo.emit(`/discovery?query=${encodedText}`);
  }

  setEstimatedTimeDelivery(estimatedTimesDelivery: EstimatedTimeDelivery[]) {
    if (!estimatedTimesDelivery || estimatedTimesDelivery.length === 0) return;
    this.foodPlaces.update((foodPlaces: FoodPlace[]) => {
      return foodPlaces.map((foodPlace) => {
        const estimatedTime = estimatedTimesDelivery.find(
          (estimated) => estimated.id === foodPlace.id,
        )?.timeDelivery;
        return {
          ...foodPlace,
          estimatedTimeDelivery: estimatedTime,
        };
      });
    });
  }

  setDishes(idFoodPlace: number) {
    this.dishesSubcription?.unsubscribe();
    this.dishes.set([]);
    this.dishQuantities.set({});
    this.isLoadingDishes.set(true);
    this.dishesSubcription = this.appService
      .getFoodPlaceAllDish(idFoodPlace)
      .subscribe((value: any) => {
        this.dishes.set(value);
        this.isLoadingDishes.set(false);
      });
  }

  openModal() {
    this.modalState.set({ isOpen: true, text: this.getModalText(), isLock: false });
  }

  closeModal(validate: boolean): void {
    if (!validate) {
      this.modalState.set({ isOpen: false, text: '', isLock: false });
      return;
    }
    this.modalState.set({ isOpen: true, text: '', isLock: true });
    const items = this.dishQuantities();
    const itemArray = Object.values(items);
    this.appService.createOrder(itemArray).subscribe({
      next: (value: any) => {
        this.modalState.set({
          isOpen: true,
          text: value,
          isLock: true,
        });
      },
      error: (err: any) => {
        console.error('Error:', err);
        this.modalState.set({
          isOpen: true,
          text: err.error.error,
          isLock: true,
        });
      },
    });
  }

  getModalText(): string {
    const itemArray = Object.values(this.dishQuantities());
    if (!itemArray) return ``;

    const sum = itemArray.reduce((acc: any, item: any) => {
      if (item.dish.newPrice) return acc + (item.dish?.newPrice || 0) * item.quantity;
      else return acc + (item.dish?.price || 0) * item.quantity;
    }, 0);
    const totalPrice = sum + this.deliveryFee();
    const roundedTotalPrice = parseFloat(totalPrice.toFixed(2));
    return `Êtes-vous sûr de passer commande pour ${roundedTotalPrice}€ ?`;
  }
}
