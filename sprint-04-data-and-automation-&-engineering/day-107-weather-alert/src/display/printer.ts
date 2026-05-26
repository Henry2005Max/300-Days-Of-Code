import { WeatherReading, Alert } from '../types';

const DLINE = '═'.repeat(72);
const LINE  = '─'.repeat(72);

function conditionIcon(conditionId: number): string {
    if (conditionId >= 200 && conditionId < 300) return '⛈';
    if (conditionId >= 300 && conditionId < 400) return '🌦';
    if (conditionId >= 500 && conditionId < 600) return '🌧';
    if (conditionId >= 600 && conditionId < 700) return '❄️';
    if (conditionId >= 700 && conditionId < 800) return '🌫';
    if (conditionId === 800)                     return '☀️';
    if (conditionId > 800)                       return '⛅';
    return '🌡';
}

function severityColor(severity: string): string {
    if (severity === 'critical') return '\x1b[31m';
    if (severity === 'warning')  return '\x1b[33m';
    return '\x1b[36m';
}

function alertBadge(severity: string): string {
    const color = severityColor(severity);
    const label = severity.toUpperCase().padEnd(8);
    return `${color}[${label}]\x1b[0m`;
}

export function printConditions(readings: WeatherReading[]): void {
    const now = new Date().toLocaleString('en-NG', {
        timeZone: 'Africa/Lagos', dateStyle: 'medium', timeStyle: 'short',
    });

    console.log('\n' + DLINE);
    console.log(`  NIGERIAN WEATHER MONITOR  —  ${now} WAT`);
    console.log(DLINE);
    console.log(
        `  ${'City'.padEnd(16)} ${'Temp'.padStart(7)} ${'Feels'.padStart(7)} ${'Humidity'.padStart(9)} ${'Wind'.padStart(8)} ${'Rain/h'.padStart(8)}  Condition`
    );
    console.log('  ' + LINE);

    for (const r of readings) {
        const icon = conditionIcon(r.conditionId);
        console.log(
            `  ${r.cityName.padEnd(16)} ${String(r.tempC + '°C').padStart(7)} ${String(r.feelsLikeC + '°C').padStart(7)} ${String(r.humidity + '%').padStart(9)} ${String(r.windKph + 'kph').padStart(8)} ${String(r.rain1h + 'mm').padStart(8)}  ${icon} ${r.condition}`
        );
    }
}

export function printAlerts(alerts: Alert[]): void {
    if (alerts.length === 0) {
        console.log('\n  ✓ No alerts triggered this cycle.\n');
        return;
    }

    console.log('\n  ALERTS TRIGGERED');
    console.log('  ' + LINE);

    for (const a of alerts) {
        console.log(`  ${alertBadge(a.severity)} ${a.cityName.padEnd(16)} [${a.type.padEnd(8)}] ${a.message}`);
    }
}

export function printHistoricalReport(
    latestReadings: Record<string, unknown>[],
    recentAlerts:   Record<string, unknown>[],
    alertStats:     { city_name: string; type: string; severity: string; count: number }[]
): void {
    console.log('\n' + DLINE);
    console.log('  WEATHER ALERT REPORT — HISTORICAL');
    console.log(DLINE);

    // Latest readings
    console.log('\n  LATEST CONDITIONS PER CITY');
    console.log('  ' + LINE);
    for (const r of latestReadings) {
        const icon = conditionIcon(r.condition_id as number);
        console.log(
            `  ${String(r.city_name).padEnd(16)} ${String(r.temp_c + '°C').padStart(7)} ${String(r.humidity + '%').padStart(9)}  ${icon} ${r.condition}`
        );
    }

    // Recent alerts
    console.log('\n  RECENT ALERTS (last 20)');
    console.log('  ' + LINE);
    if (recentAlerts.length === 0) {
        console.log('  No alerts recorded yet.');
    } else {
        for (const a of recentAlerts) {
            const ts  = String(a.triggered_at).slice(0, 16).replace('T', ' ');
            const badge = alertBadge(String(a.severity));
            console.log(`  ${badge} ${String(a.city_name).padEnd(16)} [${String(a.type).padEnd(8)}] ${String(a.message).slice(0, 50)}`);
            console.log(`  ${''.padEnd(12)} ${ts}`);
        }
    }

    // Alert stats
    if (alertStats.length > 0) {
        console.log('\n  ALERT FREQUENCY (all time)');
        console.log('  ' + LINE);
        console.log(`  ${'City'.padEnd(16)} ${'Type'.padEnd(10)} ${'Severity'.padEnd(10)} ${'Count'.padStart(6)}`);
        console.log('  ' + LINE);
        for (const s of alertStats) {
            const color = severityColor(s.severity);
            console.log(
                `  ${s.city_name.padEnd(16)} ${s.type.padEnd(10)} ${color}${s.severity.padEnd(10)}\x1b[0m ${String(s.count).padStart(6)}`
            );
        }
    }

    console.log('\n' + DLINE + '\n');
}