// mercure-signal.service.ts
import { Injectable, NgZone, signal, OnDestroy } from '@angular/core';
import { Observable, Subscriber, Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class MercureService implements OnDestroy {
  private eventSource?: EventSource;
  private apiUrl = `${environment.apiURL}`;
  constructor(private zone: NgZone) {}

  subscribe<T>(topic: string): Observable<T> {
    return new Observable<T>((observer: any) => {
      this.eventSource = new EventSource(
        `${this.apiUrl}/.well-known/mercure?topic=${encodeURIComponent(topic)}`,
        { withCredentials: true },
      );

      this.eventSource.onmessage = (event) => {
        this.zone.run(() => {
          observer.next(JSON.parse(event.data));
        });
      };

      this.eventSource.onerror = (error) => {
        this.zone.run(() => {
          observer.error(error);
        });
      };

      return () => {
        this.eventSource?.close();
      };
    });
  }

  disconnect(): void {
    this.eventSource?.close();
    this.eventSource = undefined;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
