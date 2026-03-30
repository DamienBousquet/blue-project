import { Component, input, effect } from '@angular/core';
import { LatLngTuple } from 'leaflet';
import * as L from 'leaflet';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-map',
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class Map {
  currentLocation = input<any>();
  points = input<any>();
  private map: any;
  cityCoordinates: number[] = [43.573, 3.92];
  // cityRestriction: number[][] = [
  //   [43.573, 3.92],
  //   [43.573, 3.92],
  // ];
  markers: number[][] = [];
  private currentMarker: L.Marker | null = null;
  DeliveryPersonIcon: any = undefined;
  homeIcon: any = undefined;
  foodPlaceIcon: any = undefined;
  currentDeliveryLocation: number[] = [];
  viewIsInitialized: boolean = false;

  private initMap(): void {
    this.map = L.map('map', {
      center: [this.cityCoordinates[0], this.cityCoordinates[1]],
      zoom: 14,
      maxBoundsViscosity: 1.0,
      // maxBounds: [
      //   [43.595, 3.9],
      //   [43.55, 3.95],
      // ],
    });
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 13,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    });

    tiles.addTo(this.map);
  }

  constructor() {
    this.setIcons();

    effect(() => {
      const currentLocation = this.currentLocation();
      if (currentLocation && currentLocation?.location) {
        this.updateMarker(currentLocation?.location);
      }
      if (!this.viewIsInitialized) this.initializeSetView();
    });

    effect(() => {
      const points = this.points();
      if (points) {
        const foodPlaceLocation = points[0];
        const homeLocation = points[points.length - 1];
        points.shift();
        points.pop();

        L.marker([foodPlaceLocation[1], foodPlaceLocation[0]], {
          icon: this.foodPlaceIcon,
        }).addTo(this.map);
        L.marker([homeLocation[1], homeLocation[0]], {
          icon: this.homeIcon,
        }).addTo(this.map);

        let tuplePoints: LatLngTuple[] = [];
        points.forEach((element: any) => {
          const tuple: LatLngTuple = [element[1], element[0]];
          tuplePoints.push(tuple);
        });
        L.polyline(tuplePoints, { color: 'black' }).addTo(this.map);
      }
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  private initializeSetView() {
    if (this.currentDeliveryLocation.length > 0) {
      const tuple: LatLngTuple = [this.currentDeliveryLocation[1], this.currentDeliveryLocation[0]];
      this.map.setView(tuple);
      this.viewIsInitialized = true;
    }
  }

  private setIcons() {
    this.DeliveryPersonIcon = L.icon({
      iconUrl: '/marker-delivery-person.png',
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    this.foodPlaceIcon = L.icon({
      iconUrl: '/marker-restaurant2.png',
      iconSize: [24, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    this.homeIcon = L.icon({
      iconUrl: '/marker-home-final2.png',
      iconSize: [24, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  }

  private updateMarker([lng, lat]: number[]): void {
    if (!this.map) return;

    if (this.currentMarker) {
      this.map.removeLayer(this.currentMarker);
    }

    this.currentMarker = L.marker([lat, lng], { icon: this.DeliveryPersonIcon }).addTo(this.map);
    this.currentDeliveryLocation = [lng, lat];
  }
}
