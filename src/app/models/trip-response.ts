import { TripVideoResponse } from "./trip-video-response";
import {TripHighlightResponse} from "./trip-highlight-response";

export interface TripResponse {
  directoryName: string;
  startDate: Date;
  endDate: Date;
  vehicleName: Date;
  allVideosStartedDate: Date;
  videos: TripVideoResponse[];
  highlights: TripHighlightResponse[] | null;
}
