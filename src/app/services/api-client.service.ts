import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {map, Observable} from 'rxjs';
import { PaginatedList } from '../models/paginated-list';
import { TripResponse } from '../models/trip-response';
import { WebSocketSubject, webSocket } from 'rxjs/webSocket';
import {TripEventsRequest} from "../models/trip-events-request";
import {TripEventsResponse} from "../models/trip-events-response";

@Injectable({
  providedIn: 'root'
})
export class ApiClientService {


  private server: string = "localhost:5162/";
  private baseHttpUrl: string = "http://" + this.server;
  private baseWebsocketUrl: string = "ws://" + this.server;

  private webSocket: WebSocketSubject<any> | null = null;

  constructor(private httpClient: HttpClient) {
  }

  getVideoDownloadUrl(directoryName: string, videoLabel: string) {
    return this.baseHttpUrl + "trips/" + directoryName + "/videos/" + videoLabel;
  }

  getVideoStreamUrl(directoryName: string, videoLabel: string) {
    return this.baseHttpUrl + "trips/" + directoryName + "/videos/" + videoLabel + "/stream";
  }

  getTrip(directoryName: string): Observable<TripResponse> {
    return this.get("trips/" + directoryName);
  }

  getTrips(): Observable<PaginatedList<TripResponse>> {
    return this.get("trips?take=100"); // todo: fix pagination
  }

  connectToTripEvents(directoryName: string) {
    const url = this.baseWebsocketUrl + `trips/${directoryName}/events`;
    this.webSocket = webSocket(url);
  }

  sendTripEventRequest(from: Date, to: Date) {
    const request: TripEventsRequest = {from: from, to: to};

    console.log(JSON.stringify(request));

    this.webSocket?.next(JSON.stringify(request));
  }

  getTripEvents(): Observable<TripEventsResponse> {
    return this.webSocket!.asObservable().pipe(map((event: any) => {
      return event;
    }));
  }

  closeTripEvents() {
    this.webSocket?.complete();
  }

  private get<T>(endpoint: string): Observable<T> {
    return this.httpClient.get<T>(this.baseHttpUrl + endpoint);
  }
}
