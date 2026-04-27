// All shared types for the Lagos Traffic Mock API

export type TrafficCondition = "free" | "light" | "moderate" | "heavy" | "gridlock";

export type IncidentType =
    | "accident"
    | "road_works"
    | "flooding"
    | "broken_down_vehicle"
    | "police_checkpoint"
    | "protest"
    | "market_overflow";

export type IncidentSeverity = "low" | "medium" | "high";

// A Lagos landmark / junction used as route origin or destination
export interface Landmark {
    id: number;
    name: string;
    area: string;         // e.g. "Ikeja", "Victoria Island", "Lekki"
    lat: number;
    lng: number;
    type: string;         // "junction" | "market" | "airport" | "bridge" | "island"
}

// A named route between two landmarks (e.g. "Third Mainland Bridge")
export interface Route {
    id: number;
    name: string;
    from_landmark_id: number;
    to_landmark_id: number;
    distance_km: number;
    base_duration_minutes: number;   // free-flow travel time
}

// Current traffic state on a route — updated by the simulation engine
export interface TrafficState {
    id: number;
    route_id: number;
    condition: TrafficCondition;
    current_duration_minutes: number;   // actual estimated travel time right now
    congestion_percent: number;         // 0–100
    speed_kmh: number;                  // average speed on this route
    updated_at: string;
}

// A traffic incident on or near a route
export interface Incident {
    id: number;
    route_id: number | null;
    landmark_id: number | null;
    type: IncidentType;
    severity: IncidentSeverity;
    description: string;
    reported_by: string;    // Nigerian name
    lat: number;
    lng: number;
    active: number;         // SQLite boolean (1 = active, 0 = resolved)
    reported_at: string;
    resolved_at: string | null;
}

// A traffic history snapshot (written every refresh cycle)
export interface TrafficSnapshot {
    id: number;
    route_id: number;
    condition: TrafficCondition;
    congestion_percent: number;
    speed_kmh: number;
    recorded_at: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    errors?: { field: string; message: string }[];
    meta?: { total: number; count: number };
}