// All shared types for the Maps App

export interface Landmark {
    id: number;
    name: string;
    category: string;   // "market" | "government" | "transport" | "culture" | "education" | "bridge"
    city: string;
    lat: number;
    lng: number;
    description: string;
    created_at: string;
}

export interface GeocodedLocation {
    id: number;
    query: string;              // normalised search string (cache key)
    formatted_address: string;
    lat: number;
    lng: number;
    city: string;
    state: string;
    country: string;
    hit_count: number;
    cached_at: string;
    created_at: string;
}

// Directions result cached in SQLite
export interface CachedRoute {
    id: number;
    origin_query: string;
    destination_query: string;
    distance_text: string;
    duration_text: string;
    distance_meters: number;
    duration_seconds: number;
    polyline: string;           // encoded polyline from Google Directions API
    cached_at: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    errors?: { field: string; message: string }[];
}