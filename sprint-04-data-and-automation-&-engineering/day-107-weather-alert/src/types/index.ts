export interface City {
    name:      string;
    country:   string;
    lat:       number;
    lon:       number;
}

export interface WeatherReading {
    cityName:    string;
    tempC:       number;
    feelsLikeC:  number;
    humidity:    number;
    windKph:     number;
    rain1h:      number;
    condition:   string;
    conditionId: number;
    visibility:  number;
    fetchedAt:   string;
}

export interface AlertThresholds {
    tempMax:     number;
    tempMin:     number;
    humidityMax: number;
    windMax:     number;
    rain1h:      number;
}

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface Alert {
    cityName:  string;
    type:      string;
    severity:  AlertSeverity;
    message:   string;
    value:     number;
    threshold: number;
    triggeredAt: string;
}

export interface StoredReading {
    id:           number;
    city_name:    string;
    temp_c:       number;
    feels_like_c: number;
    humidity:     number;
    wind_kph:     number;
    rain_1h:      number;
    condition:    string;
    fetched_at:   string;
}

export interface StoredAlert {
    id:           number;
    city_name:    string;
    type:         string;
    severity:     string;
    message:      string;
    value:        number;
    threshold:    number;
    triggered_at: string;
}