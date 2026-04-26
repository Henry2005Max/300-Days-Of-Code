// Haversine formula — calculates the great-circle distance between two points
// on the surface of a sphere (Earth) given their latitude and longitude.
//
// Why not just use Pythagoras? Because the Earth is a sphere, not a flat plane.
// The straight-line (Euclidean) distance between two lat/lng pairs would cut
// through the Earth. The Haversine formula accounts for the curvature and gives
// the shortest path along the surface — what a plane would actually fly.
//
// Formula:
//   a = sin²(Δlat/2) + cos(lat1) × cos(lat2) × sin²(Δlng/2)
//   c = 2 × atan2(√a, √(1−a))
//   d = R × c      where R = 6371 km (Earth's mean radius)

const EARTH_RADIUS_KM = 6371;

function toRad(deg: number): number {
    return (deg * Math.PI) / 180;
}

export function haversineKm(
    lat1: number, lng1: number,
    lat2: number, lng2: number
): number {
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
}

// Initial bearing from point A to point B, in degrees (0–360, clockwise from North)
export function bearingDegrees(
    lat1: number, lng1: number,
    lat2: number, lng2: number
): number {
    const dLng  = toRad(lng2 - lng1);
    const rLat1 = toRad(lat1);
    const rLat2 = toRad(lat2);

    const y = Math.sin(dLng) * Math.cos(rLat2);
    const x =
        Math.cos(rLat1) * Math.sin(rLat2) -
        Math.sin(rLat1) * Math.cos(rLat2) * Math.cos(dLng);

    // atan2 returns -π to π; convert to 0–360
    return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

// Convert a bearing in degrees to a human-readable compass label
export function bearingLabel(degrees: number): string {
    const labels = [
        "North", "North-East", "East", "South-East",
        "South", "South-West", "West", "North-West",
    ];
    // Each segment is 45°; offset by 22.5° so North is centred on 0°
    const index = Math.round(degrees / 45) % 8;
    return labels[index];
}