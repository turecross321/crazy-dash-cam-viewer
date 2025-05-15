import {Component, ElementRef, HostListener, QueryList, ViewChildren} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faArrowLeft,
  faBars, faCalendar,
  faCar, faCaretRight,
  faClock,
  faDownload, faGamepad, faGasPump,
  faGaugeHigh, faGears,
  faPause,
  faPlay, faRoad,
  faRotate,
  faSpinner,
  faTachometer, faTemperature0,
  faVideoCamera
} from '@fortawesome/free-solid-svg-icons';
import { ApiClientService } from '../../services/api-client.service';
import {ActivatedRoute, RouterLink} from '@angular/router';
import { TripResponse } from '../../models/trip-response';
import {HasTimestamp, Location, NumberWithTimestamp, TripEventsResponse} from "../../models/trip-events-response";
import {TripGaugeComponent} from "../../components/trip-gauge/trip-gauge.component";
import {TripMapComponent} from "../../components/trip-map/trip-map.component";
import {formatMilliseconds} from "../../helpers/formatting-helper";
@Component({
  selector: 'app-trip-viewer-page',
  standalone: true,
  imports: [FontAwesomeModule, TripGaugeComponent, TripMapComponent, RouterLink],
  templateUrl: './trip-viewer-page.component.html',
  styleUrl: './trip-viewer-page.component.css'
})
export class TripViewerPageComponent {
  faSpinner = faSpinner;
  trip: TripResponse | null = null;

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (document.fullscreenElement) {
      event.stopPropagation();
    }

    switch(event.code) {
      case 'Space': // Spacebar
        event.preventDefault();
        this.togglePlay();
        break;
      case 'ArrowLeft': // Left arrow
        event.preventDefault();
        this.seek(this.current - 5000); // Skip back 5 seconds
        break;
      case 'ArrowRight': // Right arrow;
        event.preventDefault();
        this.seek(this.current + 5000); // Skip forward 5 seconds
        break;
    }
  }

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
          response.allVideosStartedDate = new Date(response.allVideosStartedDate);
          response.endDate = new Date(response.endDate);

          this.trip = response;
          this.tripLength = this.trip.endDate.getTime() - this.playbackStartDate().getTime();
        });

      apiClient.connectToTripEvents(directoryName!);
      this.apiClient.getTripEvents().subscribe((response) => {
        this.events = response;
        this.apiClient.closeTripEvents();
      });
    });
  }

  getSliderTrackStyle(): string {
    const highlights = [
      { start: 5000, end: 7000 }, // in ms
      { start: 12000, end: 15000 },
    ];

    const total = this.tripLength;
    const stops = highlights.map(h => {
      const startPercent = (h.start / total) * 100;
      const endPercent = (h.end / total) * 100;
      return `#facc15 ${startPercent}%, #facc15 ${endPercent}%`;
    });

    const base = `#e5e7eb 0%, ${stops.join(', ')}, #e5e7eb 100%`;
    console.log(`linear-gradient(to right, ${base})`);
    return `linear-gradient(to right, ${base})`;
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",  // Full day name (e.g., "Monday")
      month: "long",    // Full month name (e.g., "April")
      day: "numeric",   // Numeric day (e.g., "13")
      year: "numeric",  // Full year (e.g., "2020")
    }).format(date);
  }

  playbackStartDate(): Date {
    return this.trip!.allVideosStartedDate;
  }

  getMsFromDate(date: Date) {
    return date.getTime() - this.playbackStartDate().getTime();
  }

  getDateFromMs(ms : number): Date {
    const time = this.playbackStartDate().getTime() + ms;
    const date = new Date();
    date.setTime(time);
    return date;
  }


  setCurrent(ms: number) {
    const newCurrentDate = this.getDateFromMs(ms);
    // todo: don't just get all the things at the same time.

    if (this.events == null)
      this.apiClient.sendTripEventRequest(this.playbackStartDate(), this.trip!.endDate);
    this.current = Math.min(Math.max(ms, 0), this.tripLength);

    if (this.current >= this.tripLength) {
      this.stopPlaying();
    }

    this.syncEvents(newCurrentDate);
  }

  seek(ms: number) {
    this.setCurrent(ms);
    this.syncVideos();
  }

  togglePlay() {
    if (this.playing) this.stopPlaying();
    else this.startPlaying();
  }

  startPlaying() {
    if (this.current >= this.tripLength)
      this.setCurrent(0);

    this.playing = true;
    this.startUpdatingCurrent();

    this.syncVideos();
    this.videoElements.map((element) => {
      element.nativeElement.play().then();
    });
  }

  syncVideos() {
    this.videoElements.map((element: any) => {
      const vid = this.trip!.videos.find(v => v.label === element.nativeElement.id)!;
      const offset = this.getMsFromDate(new Date(vid.startDate));

      element.nativeElement.currentTime = (this.current - offset) / 1000;
    });
  }

  ambientAirTemp : NumberWithTimestamp | undefined;
  coolantTemp: NumberWithTimestamp | undefined;
  fuelLevel: NumberWithTimestamp | undefined;
  location: Location | undefined;
  oilTemp: NumberWithTimestamp | undefined;
  rpm: NumberWithTimestamp | undefined;
  speed: NumberWithTimestamp | undefined;
  throttlePosition: NumberWithTimestamp | undefined;

  getAppropriateEvent<T extends HasTimestamp>(date: Date, events: T[]): T | undefined {
    let last = undefined;

    for (let event of events) {
      const timestamp = new Date(event.date);

      if (timestamp <= date) {
        last = event;
      }
      else {
        break;
      }
    }

    return last;
  }

  syncEvents(date: Date) {
    this.ambientAirTemp  = undefined
    this.coolantTemp = undefined
    this.fuelLevel = undefined
    this.location = undefined
    this.oilTemp = undefined
    this.rpm = undefined
    this.speed = undefined
    this.throttlePosition = undefined

    if (!this.events) {
      return;
    }

    this.ambientAirTemp = this.getAppropriateEvent(date, this.events.amb_air_temp);
    this.coolantTemp = this.getAppropriateEvent(date, this.events.cool_temp);
    this.fuelLevel = this.getAppropriateEvent(date, this.events.fuel_lvl);
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

      this.setCurrent(this.current + this.updateInterval); // Increment by 100ms

      if (this.current > this.tripLength) {
        this.setCurrent(this.tripLength); // Cap at the trip length
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
  protected readonly faCar = faCar;
  protected readonly faRoad = faRoad;
  protected readonly faBars = faBars;
  protected readonly faGamepad = faGamepad;
  protected readonly faGears = faGears;
  protected readonly parseInt = parseInt;
  protected readonly formatMilliseconds = formatMilliseconds;
  protected readonly faCalendar = faCalendar;
  protected readonly faCaretRight = faCaretRight;
  protected readonly faArrowLeft = faArrowLeft;
}
