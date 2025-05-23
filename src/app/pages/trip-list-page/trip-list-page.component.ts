import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';
import { ApiClientService } from '../../services/api-client.service';
import { TripResponse } from '../../models/trip-response';
import {formatMilliseconds} from "../../helpers/formatting-helper";
import {formatDistance} from "date-fns";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faEllipsisVertical, faListDots} from "@fortawesome/free-solid-svg-icons";

@Component({
  selector: 'app-trip-list-page',
  standalone: true,
  imports: [RouterLink, FaIconComponent],
  templateUrl: './trip-list-page.component.html',
})
export class TripListPageComponent {
  trips: TripResponse[] | null = null;

  constructor(public httpApiClient: ApiClientService) {
    httpApiClient.getTrips().subscribe((response) => {
      this.trips = response.items;
    })
  }

  getLength(trip: TripResponse): number {
    return new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime();
  }

  getTimeAgo(trip: TripResponse) {
    return formatDistance(new Date(trip.startDate), new Date(), {addSuffix: true});
  }

  protected readonly formatMilliseconds = formatMilliseconds;
  protected readonly faListDots = faListDots;
  protected readonly faEllipsisVertical = faEllipsisVertical;
}
