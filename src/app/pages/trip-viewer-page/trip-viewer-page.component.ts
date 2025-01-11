import {Component, ElementRef, QueryList, ViewChildren} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faDownload,
  faGaugeHigh,
  faPause,
  faPlay,
  faRotate,
  faSpinner,
  faStopwatch, faTemperature0,
  faVideoCamera
} from '@fortawesome/free-solid-svg-icons';
import { HttpApiClientService } from '../../services/http-api-client.service';
import { ActivatedRoute } from '@angular/router';
import { TripResponse } from '../../models/trip-response';

@Component({
  selector: 'app-trip-viewer-page',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './trip-viewer-page.component.html',
})
export class TripViewerPageComponent {
  faSpinner = faSpinner;
  trip: TripResponse | null = null;

  tripLength: number = 0;
  current: number = 0;
  playing: boolean = false;
  private intervalId: any = null;
  @ViewChildren('videoElement') videoElements!: QueryList<ElementRef<HTMLVideoElement>>;

  constructor(public httpApiClient: HttpApiClientService, private route: ActivatedRoute) {
    this.route.paramMap.subscribe(params => {
      let directoryName = params.get('directoryName');

      // todo: error page

      httpApiClient.getTrip(directoryName!)
        .subscribe((response) => {
          response.startDate = new Date(response.startDate);
          response.endDate = new Date(response.endDate);

          this.trip = response;
          this.current = 0;
          this.tripLength = this.trip.endDate.getTime() - this.trip.startDate.getTime();
        });
    });
  }

  getMsFromDate(date: Date) {
    return date.getTime() - this.trip!.startDate.getTime();
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
    this.current = ms;
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

  stopPlaying() {
    this.playing = false
    this.stopUpdatingCurrent();

    this.videoElements.map((element) => {
      element.nativeElement.pause();
    });
  }


  updateInterval: number = 500;
  private startUpdatingCurrent() {
    if (this.intervalId) return; // Prevent multiple intervals
    this.intervalId = setInterval(() => {
      if (!this.trip) return;

      this.current = this.current + this.updateInterval; // Increment by 100ms

      if (this.current > this.tripLength) {
        this.current = this.tripLength; // Cap at the trip length
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
}
