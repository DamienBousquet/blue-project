import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DishSelection } from '../models/dish-selection.interface';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AppService {
  private apiUrl = `${environment.apiURL}/api/dmf`;
  constructor(private http: HttpClient) {}

  getUser(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/user`, { withCredentials: true });
  }

  getAllFoodPlaces(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/places`);
  }

  getFoodPlace(idFoodPlace: number): Observable<any> {
    const params = new HttpParams().set('idFoodPlace', idFoodPlace);
    return this.http.get<any>(`${this.apiUrl}/place`, { params });
  }

  getFoodPlaceAllDish(idFoodPlace: number): Observable<any> {
    const params = new HttpParams().set('idFoodPlace', idFoodPlace);
    return this.http.get<any>(`${this.apiUrl}/placeAllDish`, { params });
  }

  getDayFoodPlaceFeatures(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/dayFoodPlace`);
  }

  getEstimatedTimesDelivery(text: string): Observable<any> {
    const params = new HttpParams().set('foodPlaceText', text);
    return this.http.get<any>(`${this.apiUrl}/estimatedTimesDelivery`, {
      params,
      withCredentials: true,
    });
  }

  getSearchResult(search: string): Observable<any> {
    const params = new HttpParams().set('query', search);
    return this.http.get<any>(`${this.apiUrl}/restaurantsSearch`, { params });
  }

  getDeliveryFee(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/deliveryFee`);
  }

  createOrder(itemArray: DishSelection[]): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}/order`,
      { dishes: itemArray },
      { withCredentials: true },
    );
  }

  getOrder() {
    return this.http.get<any>(`${this.apiUrl}/orders`, { withCredentials: true });
  }

  getBalance() {
    return this.http.get<any>(`${this.apiUrl}/balance`, { withCredentials: true });
  }

  getCurrentDelivery() {
    return this.http.get<any>(`${this.apiUrl}/currentDelivery`, { withCredentials: true });
  }

  getDeliveryPath(link: string) {
    const params = new HttpParams().set('link', link);
    return this.http.get<any>(`${this.apiUrl}/deliveryPath`, { params });
  }

  getMercureCookie(link: string) {
    return this.http.post<any>(
      `${this.apiUrl}/mercureCookie`,
      { link: link },
      { withCredentials: true },
    );
  }

  getDeliveryStatus(link: string) {
    const params = new HttpParams().set('link', link);
    return this.http.get<any>(`${this.apiUrl}/deliveryStatus`, {
      params,
      withCredentials: true,
    });
  }
}
