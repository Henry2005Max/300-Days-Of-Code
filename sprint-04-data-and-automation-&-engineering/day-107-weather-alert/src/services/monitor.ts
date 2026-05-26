import { NIGERIAN_CITIES, loadThresholds } from '../services/cities';
import { fetchWeather }                    from '../services/fetcher';
import { evaluateAlerts }                  from '../alerts/evaluator';
import { saveReading, saveAlert }          from '../db/store';
import { printConditions, printAlerts }    from '../display/printer';
import { WeatherReading, Alert }           from '../types';

export async function runMonitorCycle(): Promise<void> {
    const thresholds = loadThresholds();
    const readings:  WeatherReading[] = [];
    const allAlerts: Alert[]          = [];

    const isMock = !process.env.OPENWEATHER_API_KEY ||
        process.env.OPENWEATHER_API_KEY === 'demo';

    console.log(`\n[Monitor] Fetching weather for ${NIGERIAN_CITIES.length} cities${isMock ? ' (mock mode)' : ''}...`);

    for (const city of NIGERIAN_CITIES) {
        const reading = await fetchWeather(city);
        readings.push(reading);

        saveReading({
            cityName:    reading.cityName,
            tempC:       reading.tempC,
            feelsLikeC:  reading.feelsLikeC,
            humidity:    reading.humidity,
            windKph:     reading.windKph,
            rain1h:      reading.rain1h,
            condition:   reading.condition,
            conditionId: reading.conditionId,
            visibility:  reading.visibility,
            fetchedAt:   reading.fetchedAt,
        });

        const alerts = evaluateAlerts(reading, thresholds);
        for (const alert of alerts) {
            saveAlert({
                cityName:    alert.cityName,
                type:        alert.type,
                severity:    alert.severity,
                message:     alert.message,
                value:       alert.value,
                threshold:   alert.threshold,
                triggeredAt: alert.triggeredAt,
            });
            allAlerts.push(alert);
        }
    }

    printConditions(readings);
    printAlerts(allAlerts);

    const total    = NIGERIAN_CITIES.length;
    const alertCnt = allAlerts.length;
    const critical = allAlerts.filter((a) => a.severity === 'critical').length;

    console.log(`\n[Monitor] Cycle complete — ${total} cities, ${alertCnt} alert(s) (${critical} critical)\n`);
}