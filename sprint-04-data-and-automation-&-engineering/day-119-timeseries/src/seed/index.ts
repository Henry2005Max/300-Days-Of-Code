import { getPool } from '../db/pool';
import { runMigrations } from '../db/migrations';

const SENSORS = [
  { id: 'LAGOS-TEMP-01',  city: 'Lagos',   metricType: 'temperature' },
  { id: 'LAGOS-AQI-01',   city: 'Lagos',   metricType: 'aqi' },
  { id: 'LAGOS-HUM-01',   city: 'Lagos',   metricType: 'humidity' },
  { id: 'ABUJA-TEMP-01',  city: 'Abuja',   metricType: 'temperature' },
  { id: 'ABUJA-POWER-01', city: 'Abuja',   metricType: 'power_kwh' },
  { id: 'KANO-TEMP-01',   city: 'Kano',    metricType: 'temperature' },
  { id: 'KANO-HUM-01',    city: 'Kano',    metricType: 'humidity' },
  { id: 'PH-TEMP-01',     city: 'Port Harcourt', metricType: 'temperature' },
  { id: 'PH-AQI-01',      city: 'Port Harcourt', metricType: 'aqi' },
  { id: 'ENUGU-POWER-01', city: 'Enugu',   metricType: 'power_kwh' },
];

/** Baseline and noise profile per metric type */
const PROFILES: Record<string, { base: number; amplitude: number; noise: number }> = {
  temperature: { base: 30, amplitude: 6,  noise: 1.5 },
  humidity:    { base: 65, amplitude: 20, noise: 3   },
  aqi:         { base: 80, amplitude: 40, noise: 10  },
  power_kwh:   { base: 45, amplitude: 15, noise: 5   },
};

function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Generates 6 months of hourly readings per sensor (Jan–Jun 2025).
 * Values follow a daily sinusoidal pattern (peak at midday) plus
 * random noise. A handful of sensors have deliberate 3–6 hour gaps
 * seeded in to exercise the gap detection endpoint.
 */
export async function seedMetrics(): Promise<void> {
  await runMigrations();
  const pool = getPool();

  const existing = await pool.query('SELECT COUNT(*)::int AS count FROM metrics');
  if (existing.rows[0].count > 0) {
    console.log(`Already seeded (${existing.rows[0].count} rows) — skipping.`);
    return;
  }

  const start = new Date('2025-01-01T00:00:00Z');
  const end   = new Date('2025-06-14T00:00:00Z');

  // Sensors that should have deliberate gaps (simulate outages)
  const gapSensors = new Set(['LAGOS-AQI-01', 'KANO-TEMP-01']);

  let totalRows = 0;
  const BATCH = 500;

  for (const sensor of SENSORS) {
    const profile = PROFILES[sensor.metricType] ?? PROFILES.temperature;
    const values: string[] = [];
    const params: (string | number | Date)[] = [];
    let idx = 1;
    let skipUntil: Date | null = null;

    const cursor = new Date(start);
    let tick = 0;

    while (cursor < end) {
      // Deliberate outage: skip 4 hours every ~10 days for gap sensors
      if (gapSensors.has(sensor.id) && tick % (24 * 10) === 24 * 10 - 1) {
        skipUntil = new Date(cursor.getTime() + 4 * 3600 * 1000);
      }

      if (skipUntil && cursor < skipUntil) {
        cursor.setHours(cursor.getHours() + 1);
        tick++;
        continue;
      }
      skipUntil = null;

      const hour = cursor.getUTCHours();
      const dayPhase = Math.sin((hour - 6) * Math.PI / 12); // peak at 18:00
      const noise = (seededRandom(tick + SENSORS.indexOf(sensor) * 10000) - 0.5) * profile.noise * 2;
      const value = Math.max(0, profile.base + profile.amplitude * dayPhase + noise);

      values.push(`($${idx++}, $${idx++}, $${idx++}, $${idx++}, $${idx++})`);
      params.push(sensor.id, sensor.city, sensor.metricType, value.toFixed(4), new Date(cursor));

      if (values.length >= BATCH) {
        await pool.query(
          `INSERT INTO metrics (sensor_id, city, metric_type, value, recorded_at) VALUES ${values.join(',')}`,
          params
        );
        totalRows += values.length;
        values.length = 0;
        params.length = 0;
        idx = 1;
      }

      cursor.setHours(cursor.getHours() + 1);
      tick++;
    }

    if (values.length > 0) {
      await pool.query(
        `INSERT INTO metrics (sensor_id, city, metric_type, value, recorded_at) VALUES ${values.join(',')}`,
        params
      );
      totalRows += values.length;
    }
  }

  console.log(`Seeded ${totalRows.toLocaleString()} metric readings across ${SENSORS.length} sensors.`);
}

if (require.main === module) {
  seedMetrics()
    .then(() => process.exit(0))
    .catch((err) => { console.error(err); process.exit(1); });
}
