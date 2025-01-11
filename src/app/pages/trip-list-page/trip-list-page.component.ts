import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';
import { HttpApiClientService } from '../../services/http-api-client.service';
import { TripResponse } from '../../models/trip-response';

@Component({
  selector: 'app-trip-list-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './trip-list-page.component.html',
})
export class TripListPageComponent {
  trips: TripResponse[] | null = null;

  constructor(private httpApiClient: HttpApiClientService) {
    httpApiClient.getTrips().subscribe((response) => {
      this.trips = response.items;
    })
  }
}
