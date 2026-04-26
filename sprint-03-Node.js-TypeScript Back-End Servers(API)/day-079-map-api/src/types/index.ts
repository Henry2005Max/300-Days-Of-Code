// All shared types for the Map API service

// A geocoded location stored in SQLite
export interface Location {
    id: number;
    query: string;            // the original address string the user searched
    formatted_address: string;
    lat: number;
    lng: number;
    city: string;
    state: string;
    country: string;
    postal_code: string;
    hit_count: number;        // how many times this address has been looked up
    cached_at: string;        // when we last fetched from Google
    created_at: string;
}

// Nigerian city reference entry (seeded at startup)
export interface NigerianCity {
    id: number;
    name: string;
    state: string;
    lat: number;
    lng: number;
    population: number;
}

// Distance calculation result
export interface DistanceResult {
    from: Pick<Location, "id" | "formatted_address" | "lat" | "lng">;
    to: Pick<Location, "id" | "formatted_address" | "lat" | "lng">;
    distance_km: number;
    distance_miles: number;
    bearing_degrees: number;   // compass bearing from A to B
    bearing_label: string;     // e.g. "North-East"
}

// Raw shape of a Google Maps Geocoding API result
export interface GoogleGeocodeResult {
    formatted_address: string;
    geometry: {
        location: { lat: number; lng: number };
    };
    address_components: {
        long_name: string;
        short_name: string;
        types: string[];
    }[];
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    errors?: { field: string; message: string }[];
    meta?: { total: number; count: number };
}