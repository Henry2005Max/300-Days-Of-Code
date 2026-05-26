import { WeatherReading, Alert, AlertThresholds, AlertSeverity } from '../types';

function severity(value: number, threshold: number, isMax: boolean): AlertSeverity {
    const ratio = isMax ? value / threshold : threshold / value;
    if (ratio >= 1.15) return 'critical';
    if (ratio >= 1.05) return 'warning';
    return 'info';
}

export function evaluateAlerts(
    reading:    WeatherReading,
    thresholds: AlertThresholds
): Alert[] {
    const alerts: Alert[] = [];
    const now = new Date().toISOString();

    // Heat alert
    if (reading.tempC >= thresholds.tempMax) {
        alerts.push({
            cityName:    reading.cityName,
            type:        'HEAT',
            severity:    severity(reading.tempC, thresholds.tempMax, true),
            message:     `Temperature ${reading.tempC}°C exceeds threshold of ${thresholds.tempMax}°C`,
            value:       reading.tempC,
            threshold:   thresholds.tempMax,
            triggeredAt: now,
        });
    }

    // Cold alert
    if (reading.tempC <= thresholds.tempMin) {
        alerts.push({
            cityName:    reading.cityName,
            type:        'COLD',
            severity:    severity(thresholds.tempMin, reading.tempC, false),
            message:     `Temperature ${reading.tempC}°C is below threshold of ${thresholds.tempMin}°C`,
            value:       reading.tempC,
            threshold:   thresholds.tempMin,
            triggeredAt: now,
        });
    }

    // Humidity alert
    if (reading.humidity >= thresholds.humidityMax) {
        alerts.push({
            cityName:    reading.cityName,
            type:        'HUMIDITY',
            severity:    severity(reading.humidity, thresholds.humidityMax, true),
            message:     `Humidity ${reading.humidity}% exceeds threshold of ${thresholds.humidityMax}%`,
            value:       reading.humidity,
            threshold:   thresholds.humidityMax,
            triggeredAt: now,
        });
    }

    // Wind alert
    if (reading.windKph >= thresholds.windMax) {
        alerts.push({
            cityName:    reading.cityName,
            type:        'WIND',
            severity:    severity(reading.windKph, thresholds.windMax, true),
            message:     `Wind speed ${reading.windKph} km/h exceeds threshold of ${thresholds.windMax} km/h`,
            value:       reading.windKph,
            threshold:   thresholds.windMax,
            triggeredAt: now,
        });
    }

    // Rain alert
    if (reading.rain1h >= thresholds.rain1h) {
        alerts.push({
            cityName:    reading.cityName,
            type:        'RAIN',
            severity:    severity(reading.rain1h, thresholds.rain1h, true),
            message:     `Rainfall ${reading.rain1h}mm/h exceeds threshold of ${thresholds.rain1h}mm/h`,
            value:       reading.rain1h,
            threshold:   thresholds.rain1h,
            triggeredAt: now,
        });
    }

    return alerts;
}