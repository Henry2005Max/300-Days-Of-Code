export interface Metric {
  id: number;
  sensor_id: string;
  city: string;
  metric_type: string;
  value: number;
  recorded_at: string;
}

/** Raw row + moving average + lag + period-over-period change */
export interface MovingAverageRow {
  recorded_at: string;
  sensor_id: string;
  value: number;
  ma_7: number | null;
  ma_30: number | null;
  prev_value: number | null;
  change_pct: number | null;
}

/** Cumulative running total within a window */
export interface RunningTotalRow {
  recorded_at: string;
  sensor_id: string;
  value: number;
  running_total: number;
  daily_rank: number;
}

/** Period-over-period comparison (e.g. this month vs last month) */
export interface PeriodComparisonRow {
  period: string;
  sensor_id: string;
  avg_value: number;
  prev_avg: number | null;
  change_pct: number | null;
  rank_in_period: number;
}

/** Percentile band row — where does each reading sit in the distribution? */
export interface PercentileBandRow {
  recorded_at: string;
  sensor_id: string;
  value: number;
  percentile: number;
  band: string;
}

/** Daily high/low/avg with first and last value of the day */
export interface DailyOHLCRow {
  day: string;
  sensor_id: string;
  open: number;
  high: number;
  low: number;
  close: number;
  avg_value: number;
  reading_count: number;
}

/** Gap detection — intervals where no readings were recorded */
export interface GapRow {
  sensor_id: string;
  gap_start: string;
  gap_end: string;
  gap_hours: number;
}

export interface QueryOptions {
  sensorId?: string;
  city?: string;
  metricType?: string;
  from?: string;
  to?: string;
  limit?: number;
}
