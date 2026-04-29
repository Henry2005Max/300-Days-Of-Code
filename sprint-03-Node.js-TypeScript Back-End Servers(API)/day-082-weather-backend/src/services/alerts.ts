// Alert engine — runs after every weather fetch.
// Checks the new reading against a set of thresholds and either raises
// a new alert or resolves a previously active one.
//
// Why check on every fetch rather than a separate cron?
// The weather cache already decides when to re-fetch (TTL-based).
// Piggybacking alert evaluation on fetch means alerts are always in sync
// with the latest data and we don't need a separate scheduler.

import { stmts } from "../db/statements";
import { WeatherRecord } from "../types";

// Each threshold entry: type label, severity, message builder, check fn
interface ThresholdRule {
    type: string;
    severity: "info" | "warning" | "critical";
    threshold: number;
    message: (city: string, value: number, threshold: number) => string;
    triggered: (w: WeatherRecord) => { value: number; exceeded: boolean };
}

const RULES: ThresholdRule[] = [
    {
        type:      "HIGH_TEMP",
        severity:  "warning",
        threshold: 38,
        message:   (city, v, t) => `High temperature in ${city}: ${v}°C (threshold: ${t}°C)`,
        triggered: (w) => ({ value: w.temp, exceeded: w.temp >= 38 }),
    },
    {
        type:      "EXTREME_HEAT",
        severity:  "critical",
        threshold: 42,
        message:   (city, v, t) => `Extreme heat in ${city}: ${v}°C (threshold: ${t}°C) — danger to outdoor workers`,
        triggered: (w) => ({ value: w.temp, exceeded: w.temp >= 42 }),
    },
    {
        type:      "HIGH_HUMIDITY",
        severity:  "info",
        threshold: 90,
        message:   (city, v, t) => `Very high humidity in ${city}: ${v}% (threshold: ${t}%)`,
        triggered: (w) => ({ value: w.humidity, exceeded: w.humidity >= 90 }),
    },
    {
        type:      "STRONG_WIND",
        severity:  "warning",
        threshold: 15,   // m/s ≈ 54 km/h
        message:   (city, v, t) => `Strong winds in ${city}: ${v} m/s (threshold: ${t} m/s)`,
        triggered: (w) => ({ value: w.wind_speed, exceeded: w.wind_speed >= 15 }),
    },
    {
        type:      "LOW_VISIBILITY",
        severity:  "warning",
        threshold: 1000,   // metres
        message:   (city, v, t) => `Low visibility in ${city}: ${v}m (threshold: ${t}m)`,
        triggered: (w) => ({ value: w.visibility, exceeded: w.visibility < 1000 }),
    },
];

export function evaluateAlerts(weather: WeatherRecord): void {
    const city = weather.city;

    for (const rule of RULES) {
        const { value, exceeded } = rule.triggered(weather);

        if (exceeded) {
            // Raise alert only if no active alert of this type already exists for this city
            const existing = (stmts.getActiveAlerts.all(city) as any[])
                .find((a) => a.type === rule.type);

            if (!existing) {
                stmts.insertAlert.run({
                    city,
                    type:      rule.type,
                    severity:  rule.severity,
                    message:   rule.message(city, Math.round(value * 10) / 10, rule.threshold),
                    value:     Math.round(value * 10) / 10,
                    threshold: rule.threshold,
                });
                console.log(`[alerts] Raised ${rule.severity} alert: ${rule.type} for ${city}`);
            }
        } else {
            // Condition no longer met — resolve any active alert of this type
            const resolved = stmts.resolveAlert.run({ city, type: rule.type });
            if (resolved.changes > 0) {
                console.log(`[alerts] Resolved alert: ${rule.type} for ${city}`);
            }
        }
    }
}