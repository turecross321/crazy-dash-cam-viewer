import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-trip-map',
  standalone: true,
  imports: [],
  templateUrl: './trip-map.component.html',
  styleUrl: './trip-map.component.css'
})
export class TripMapComponent implements OnInit {
  latitude = 51.505;  // Your latitude
  longitude = -0.09;  // Your longitude

  ngOnInit() {
  }
}
