import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-presentation',
  imports: [RouterLink],
  templateUrl: './presentation.html',
  styleUrl: './presentation.scss',
})
export class Presentation {
  isOnMobile = signal<boolean>(false);

  ngOnInit() {
    if (window.innerWidth < 800) this.isOnMobile.set(true);
  }
}
