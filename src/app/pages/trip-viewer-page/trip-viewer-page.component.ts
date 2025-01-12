import {Component, ElementRef, QueryList, ViewChildren} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faClock,
  faDownload, faGasPump,
  faGaugeHigh,
  faPause,
  faPlay,
  faRotate,
  faSpinner,
  faStopwatch, faTachometer, faTemperature0,
  faVideoCamera
} from '@fortawesome/free-solid-svg-icons';
import { ApiClientService } from '../../services/api-client.service';
import { ActivatedRoute } from '@angular/router';
import { TripResponse } from '../../models/trip-response';
import {HasTimestamp, Location, NumberWithTimestamp, TripEventsResponse} from "../../models/trip-events-response";
import {TripGaugeComponent} from "../../components/trip-gauge/trip-gauge.component";

@Component({
  selector: 'app-trip-viewer-page',
  standalone: true,
  imports: [FontAwesomeModule, TripGaugeComponent],
  templateUrl: './trip-viewer-page.component.html',
})
export class TripViewerPageComponent {
  faSpinner = faSpinner;
  trip: TripResponse | null = null;

  eventTimeSpanMs = 60 * 1000; // 1 minute
  tripLength: number = 0;
  current: number = 0;
  playing: boolean = false;
  events: TripEventsResponse | null = null;
  private intervalId: any = null;
  @ViewChildren('videoElement') videoElements!: QueryList<ElementRef<HTMLVideoElement>>;

  constructor(public apiClient: ApiClientService, private route: ActivatedRoute) {
    this.route.paramMap.subscribe(params => {
      let directoryName = params.get('directoryName');

      // todo: error page

      apiClient.getTrip(directoryName!)
        .subscribe((response) => {
          response.startDate = new Date(response.startDate);
          response.endDate = new Date(response.endDate);

          this.trip = response;
          this.setCurrentFromMs(0);
          this.tripLength = this.trip.endDate.getTime() - this.trip.startDate.getTime();
        });

      apiClient.connectToTripEvents(directoryName!);
      this.apiClient.getTripEvents().subscribe((response) => {
        this.events = response;
      });
    });
  }

  getMsFromDate(date: Date) {
    return date.getTime() - this.trip!.startDate.getTime();
  }

  getDateFromMs(ms : number): Date {
    const time = this.trip!.startDate.getTime() + ms;
    const date = new Date();
    date.setTime(time);
    return date;
  }

  formatMilliseconds(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }


  setCurrentFromMs(ms: number) {
    const newCurrentDate = this.getDateFromMs(ms);
    // todo: don't just get all the things at the same time.

    if (this.events == null)
      this.apiClient.sendTripEventRequest(this.trip!.startDate, this.trip!.endDate);
    this.current = ms;

    this.syncEvents(newCurrentDate);
  }

  togglePlay() {
    if (this.playing) this.stopPlaying();
    else this.startPlaying();
  }

  startPlaying() {
    this.playing = true;
    this.startUpdatingCurrent();

    this.syncVideos();
    this.videoElements.map((element) => {
      element.nativeElement.play().then();
    });
  }

  syncVideos() {
    this.videoElements.map((element) => {
      const vid = this.trip!.videos.find(v => v.label === element.nativeElement.id)!;
      const offset = this.getMsFromDate(new Date(vid.startDate));

      element.nativeElement.currentTime = (this.current - offset) / 1000;
    });
  }

  ambientAirTemp : NumberWithTimestamp | undefined;
  coolantTemp: NumberWithTimestamp | undefined;
  engineLoad: NumberWithTimestamp | undefined;
  fuelLevel: NumberWithTimestamp | undefined;
  intakeTemp: NumberWithTimestamp | undefined;
  location: Location | undefined;
  oilTemp: NumberWithTimestamp | undefined;
  rpm: NumberWithTimestamp | undefined;
  speed: NumberWithTimestamp | undefined;
  throttlePosition: NumberWithTimestamp | undefined;

  getAppropriateEvent<T extends HasTimestamp>(date: Date, events: T[]): T | undefined {
    for (let event of events) {
      const timestamp = new Date(event.date);

      if (timestamp <= date) {
        return event;
      }
    }

    return undefined;
  }

  syncEvents(date: Date) {
    this.speed = undefined;
    this.rpm = undefined;
    this.coolantTemp = undefined;
    this.oilTemp = undefined;

    if (!this.events) {
      return;
    }

    this.ambientAirTemp = this.getAppropriateEvent(date, this.events.amb_air_temp);
    this.coolantTemp = this.getAppropriateEvent(date, this.events.cool_temp);
    this.engineLoad = this.getAppropriateEvent(date, this.events.eng_load);
    this.fuelLevel = this.getAppropriateEvent(date, this.events.fuel_lvl);
    this.intakeTemp = this.getAppropriateEvent(date, this.events.in_temp);
    this.location = this.getAppropriateEvent(date, this.events.loc);
    this.oilTemp = this.getAppropriateEvent(date, this.events.oil_temp);
    this.rpm = this.getAppropriateEvent(date, this.events.rpm);
    this.speed = this.getAppropriateEvent(date, this.events.speed);
    this.throttlePosition = this.getAppropriateEvent(date, this.events.thr_pos);
  }

  stopPlaying() {
    this.playing = false
    this.stopUpdatingCurrent();

    this.videoElements.map((element) => {
      element.nativeElement.pause();
    });
  }


  updateInterval: number = 1000;
  private startUpdatingCurrent() {
    if (this.intervalId) return; // Prevent multiple intervals
    this.intervalId = setInterval(() => {
      if (!this.trip) return;

      this.setCurrentFromMs(this.current + this.updateInterval); // Increment by 100ms

      if (this.current > this.tripLength) {
        this.setCurrentFromMs(this.tripLength); // Cap at the trip length
        this.stopPlaying(); // Stop playing when the trip ends
      }

    }, this.updateInterval);
  }

  private stopUpdatingCurrent() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  onSeekbarChange(value: any) {
    this.stopPlaying();
    this.setCurrentFromMs(parseInt(value));
    this.syncVideos();
  }

  protected readonly faVideoCamera = faVideoCamera;
  protected readonly faGaugeHigh = faGaugeHigh;
  protected readonly faRotate = faRotate;
  protected readonly faPlay = faPlay;
  protected readonly faPause = faPause;
  protected readonly faDownload = faDownload;
  protected readonly faTemperature0 = faTemperature0;
  protected readonly faTachometer = faTachometer;
  protected readonly faGasPump = faGasPump;
  protected readonly faClock = faClock;
}
