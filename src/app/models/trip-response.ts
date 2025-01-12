import { TripVideoResponse } from "./trip-video-response";

export interface TripResponse {
  directoryName: string;
  startDate: Date;
  endDate: Date;
  vehicleName: Date;
  allVideosStartedDate: Date;
  videos: TripVideoResponse[]
}
