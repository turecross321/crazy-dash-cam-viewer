import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PaginatedList } from '../models/paginated-list';
import { TripResponse } from '../models/trip-response';

@Injectable({
  providedIn: 'root'
})
export class HttpApiClientService {

  private baseUrl: string = "http://localhost:5162/";
  constructor(private httpClient: HttpClient) {}

  getVideoDownloadUrl(directoryName: string, videoLabel: string) {
    return this.baseUrl + "trips/" + directoryName + "/videos/" + videoLabel;
  }

  getVideoStreamUrl(directoryName: string, videoLabel: string) {
    return this.baseUrl + "trips/" + directoryName + "/videos/" + videoLabel + "/stream";
  }

  getTrip(directoryName: string): Observable<TripResponse> {
    return this.get("trips/" + directoryName);
  }

  getTrips(): Observable<PaginatedList<TripResponse>> {
    return this.get("trips");
  }

  private get<T>(endpoint: string): Observable<T> {
    return this.httpClient.get<T>(this.baseUrl + endpoint);
  }
}
