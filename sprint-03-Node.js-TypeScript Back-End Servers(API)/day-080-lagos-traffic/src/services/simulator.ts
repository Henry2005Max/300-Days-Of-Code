// Traffic Simulation Engine
//
// Lagos traffic follows very predictable daily patterns:
//   05:00–07:00  Light — early commuters, before peak
//   07:00–10:00  Heavy to Gridlock — morning rush hour
//   10:00–15:00  Moderate — mid-day, markets active
//   15:00–16:00  Moderate to Heavy — pre-peak building
//   16:00–20:00  Heavy to Gridlock — evening rush (worst in Africa)
//   20:00–22:00  Moderate — post-work wind-down
//   22:00–05:00  Free to Light — night / early morning
//
// Each route also has a "congestion factor" — Apapa port access and
// Third Mainland Bridge are consistently worse than Lekki–Epe Expressway.
// Active incidents add extra congestion on top of the time-of-day base.
//
// The engine runs on a node-cron schedule. Every tick it:
//   1. Reads the current hour
//   2. Computes a base congestion % from the time-of-day profile
//   3. Adds route-specific variance (seeded pseudo-random so it is repeatable)
//   4. Adds incident impact for any active incident on the route
//   5. Writes updated traffic_states rows
//   6. Appends a traffic_history snapshot

import db from "../db/database";
import { TrafficCondition } from "../types";

// Per-hour base congestion percentage (index 0 = midnight)
const HOURLY_CONGESTION: number[] = [
    5,  5,  5,  5,  5,  15,  // 00–05: night
    35, 70, 85, 75, 55, 50,  // 06–11: morning rush peaks at 08
    45, 40, 45, 55, 70, 80,  // 12–17: afternoon build
    88, 85, 70, 55, 35, 15,  // 18–23: evening rush peaks at 18
];

// Routes that are chronically congested get a multiplier above 1.0
const ROUTE_CONGESTION_FACTOR: Record<number, number> = {
    1:  1.4,   // Third Mainland Bridge — always bad
    7:  1.5,   // Apapa–Oshodi Expressway — worst in Lagos
    9:  1.3,   // Lagos–Badagry Expressway — long and slow
    8:  1.2,   // Ikorodu Road — busy market corridor
    3:  1.1,   // Airport Road — moderate peak issues
};

// Severity multipliers — how much an incident worsens congestion
const INCIDENT_IMPACT: Record<string, number> = {
    low:    8,
    medium: 18,
    high:   30,
};

function conditionFromPercent(pct: number): TrafficCondition {
    if (pct < 20)  return "free";
    if (pct < 40)  return "light";
    if (pct < 60)  return "moderate";
    if (pct < 80)  return "heavy";
    return "gridlock";
}

// Simple seeded pseudo-random — gives stable variance per route per tick
// without requiring an external library
function seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}

export function runSimulationTick(): void {
    const hour = new Date().getHours();
    const basePercent = HOURLY_CONGESTION[hour];

    const routes = db.prepare(`
    SELECT r.id, r.base_duration_minutes, r.distance_km
    FROM routes r
  `).all() as { id: number; base_duration_minutes: number; distance_km: number }[];

    // Get active incidents grouped by route_id
    const activeIncidents = db.prepare(`
    SELECT route_id, severity FROM incidents WHERE active = 1 AND route_id IS NOT NULL
  `).all() as { route_id: number; severity: string }[];

    const incidentImpact: Record<number, number> = {};
    for (const inc of activeIncidents) {
        if (inc.route_id) {
            incidentImpact[inc.route_id] = (incidentImpact[inc.route_id] || 0) + INCIDENT_IMPACT[inc.severity];
        }
    }

    const updateState = db.prepare(`
    UPDATE traffic_states
    SET condition                = @condition,
        current_duration_minutes = @current_duration_minutes,
        congestion_percent       = @congestion_percent,
        speed_kmh                = @speed_kmh,
        updated_at               = datetime('now')
    WHERE route_id = @route_id
  `);

    const insertHistory = db.prepare(`
    INSERT INTO traffic_history (route_id, condition, congestion_percent, speed_kmh)
    VALUES (@route_id, @condition, @congestion_percent, @speed_kmh)
  `);

    const tick = db.transaction(() => {
        for (const route of routes) {
            const factor  = ROUTE_CONGESTION_FACTOR[route.id] || 1.0;
            // Add up to ±12% variance using seeded random (hour + route.id as seed)
            const variance = (seededRandom(hour * 100 + route.id) - 0.5) * 24;
            const incidentExtra = incidentImpact[route.id] || 0;

            const rawPct      = basePercent * factor + variance + incidentExtra;
            const congestion  = Math.min(100, Math.max(0, Math.round(rawPct)));
            const condition   = conditionFromPercent(congestion);

            // Scale duration: free-flow × (1 + congestion effect)
            // At 100% congestion, travel time is ~4× base (gridlock)
            const durationMultiplier = 1 + (congestion / 100) * 3;
            const currentDuration    = Math.round(route.base_duration_minutes * durationMultiplier);

            // Speed = distance / time
            const speed_kmh = Math.round((route.distance_km / currentDuration) * 60 * 10) / 10;

            updateState.run({
                route_id:                route.id,
                condition,
                current_duration_minutes: currentDuration,
                congestion_percent:       congestion,
                speed_kmh,
            });

            insertHistory.run({ route_id: route.id, condition, congestion_percent: congestion, speed_kmh });
        }
    });

    tick();

    // Auto-resolve incidents older than 3 hours
    db.prepare(`
    UPDATE incidents
    SET active = 0, resolved_at = datetime('now')
    WHERE active = 1
      AND datetime(reported_at, '+3 hours') < datetime('now')
  `).run();

    console.log(`[simulator] Tick complete at ${new Date().toISOString()} — hour ${hour}, base congestion ${basePercent}%`);
}