export interface TripEventsResponse {
  amb_air_temp: NumberWithTimestamp[];
  cool_temp: NumberWithTimestamp[];
  fuel_lvl: NumberWithTimestamp[];
  loc: Location[];
  oil_temp: NumberWithTimestamp[];
  rpm: NumberWithTimestamp[];
  speed: NumberWithTimestamp[];
  thr_pos: NumberWithTimestamp[];
  from: Date;
  to: Date;
}

export interface HasTimestamp {
  date: Date;
}

export interface NumberWithTimestamp extends HasTimestamp {
  value: number;
}

export interface Location extends HasTimestamp {
  latitude: number;
  longitude: number;
}
