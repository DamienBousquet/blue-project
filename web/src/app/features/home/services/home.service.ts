import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class HomeService {
  private apiUrl = `${environment.apiURL}/api`;
  constructor(private http: HttpClient) {}

  getCookie(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/home`, { withCredentials: true });
  }

  getInternetConnexion(): Observable<{ text: string }> {
    return this.http.get<{ text: string }>(`${this.apiUrl}/internetConnexion`);
  }

  sendTictactoeMove(box: number): Observable<{ text: string }> {
    return this.http.post<{ text: string }>(
      `${this.apiUrl}/tictactoeMove`,
      { box: box },
      { withCredentials: true },
    );
  }

  resetTictactoe(): Observable<{ text: string }> {
    return this.http.get<{ text: string }>(`${this.apiUrl}/tictactoeReset`, {
      withCredentials: true,
    });
  }

  getSession(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/session`, { text: 't' }, { withCredentials: true });
  }

  getWeather(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/weather`);
  }
}
