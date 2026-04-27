import db from "../db/database";
import { Landmark, Route, TrafficState, Incident, TrafficSnapshot } from "../types";
import { NotFoundError, BadRequestError } from "../middleware/errorHandler";

// ── Landmarks ────────────────────────────────────────────────────────────────

export function listLandmarks(area?: string): Landmark[] {
    if (area) {
        return db.prepare(
            "SELECT * FROM landmarks WHERE LOWER(area) LIKE LOWER(@area) ORDER BY name"
        ).all({ area: `%${area}%` }) as Landmark[];
    }
    return db.prepare("SELECT * FROM landmarks ORDER BY area, name").all() as Landmark[];
}

export function getLandmarkById(id: number): Landmark {
    const row = db.prepare("SELECT * FROM landmarks WHERE id = ?").get(id) as Landmark | undefined;
    if (!row) throw new NotFoundError("Landmark", id);
    return row;
}

// ── Routes + live traffic ────────────────────────────────────────────────────

export function listRoutes(filters: { condition?: string; area?: string }): any[] {
    // Join routes with traffic_states and both landmarks for a rich response
    let where = "";
    const params: Record<string, unknown> = {};

    if (filters.condition) {
        where += " AND ts.condition = @condition";
        params.condition = filters.condition;
    }
    if (filters.area) {
        where += " AND (LOWER(lf.area) LIKE @area OR LOWER(lt.area) LIKE @area)";
        params.area = `%${filters.area.toLowerCase()}%`;
    }

    return db.prepare(`
    SELECT
      r.id, r.name, r.distance_km, r.base_duration_minutes,
      lf.name AS from_name, lf.area AS from_area,
      lt.name AS to_name,   lt.area AS to_area,
      ts.condition, ts.current_duration_minutes,
      ts.congestion_percent, ts.speed_kmh, ts.updated_at
    FROM routes r
    JOIN landmarks lf ON lf.id = r.from_landmark_id
    JOIN landmarks lt ON lt.id = r.to_landmark_id
    JOIN traffic_states ts ON ts.route_id = r.id
    WHERE 1=1 ${where}
    ORDER BY ts.congestion_percent DESC
  `).all(params);
}

export function getRouteById(id: number): any {
    const row = db.prepare(`
    SELECT
      r.id, r.name, r.distance_km, r.base_duration_minutes,
      lf.id AS from_id, lf.name AS from_name, lf.area AS from_area, lf.lat AS from_lat, lf.lng AS from_lng,
      lt.id AS to_id,   lt.name AS to_name,   lt.area AS to_area,   lt.lat AS to_lat,   lt.lng AS to_lng,
      ts.condition, ts.current_duration_minutes,
      ts.congestion_percent, ts.speed_kmh, ts.updated_at
    FROM routes r
    JOIN landmarks lf ON lf.id = r.from_landmark_id
    JOIN landmarks lt ON lt.id = r.to_landmark_id
    JOIN traffic_states ts ON ts.route_id = r.id
    WHERE r.id = ?
  `).get(id);

    if (!row) throw new NotFoundError("Route", id);
    return row;
}

// ── Summary / overview ───────────────────────────────────────────────────────

export function getOverview(): object {
    const conditions = db.prepare(`
    SELECT condition, COUNT(*) as count
    FROM traffic_states
    GROUP BY condition
    ORDER BY count DESC
  `).all() as { condition: string; count: number }[];

    const worst = db.prepare(`
    SELECT r.name, ts.condition, ts.congestion_percent, ts.current_duration_minutes
    FROM traffic_states ts
    JOIN routes r ON r.id = ts.route_id
    ORDER BY ts.congestion_percent DESC
    LIMIT 3
  `).all();

    const best = db.prepare(`
    SELECT r.name, ts.condition, ts.congestion_percent, ts.current_duration_minutes
    FROM traffic_states ts
    JOIN routes r ON r.id = ts.route_id
    ORDER BY ts.congestion_percent ASC
    LIMIT 3
  `).all();

    const activeIncidents = (db.prepare(
        "SELECT COUNT(*) as count FROM incidents WHERE active = 1"
    ).get() as { count: number }).count;

    const avgCongestion = (db.prepare(
        "SELECT ROUND(AVG(congestion_percent), 1) as avg FROM traffic_states"
    ).get() as { avg: number }).avg;

    const updatedAt = (db.prepare(
        "SELECT MAX(updated_at) as t FROM traffic_states"
    ).get() as { t: string }).t;

    return {
        conditions,
        worst_routes:      worst,
        best_routes:       best,
        active_incidents:  activeIncidents,
        avg_congestion:    avgCongestion,
        updated_at:        updatedAt,
    };
}

// ── Incidents ────────────────────────────────────────────────────────────────

export function listIncidents(filters: {
    active?: boolean;
    severity?: string;
    type?: string;
    limit: number;
    offset: number;
}): { rows: Incident[]; total: number } {
    const conditions: string[] = [];
    const params: Record<string, unknown> = { limit: filters.limit, offset: filters.offset };

    if (filters.active !== undefined) {
        conditions.push("active = @active");
        params.active = filters.active ? 1 : 0;
    }
    if (filters.severity) {
        conditions.push("severity = @severity");
        params.severity = filters.severity;
    }
    if (filters.type) {
        conditions.push("type = @type");
        params.type = filters.type;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const rows  = db.prepare(`SELECT * FROM incidents ${where} ORDER BY reported_at DESC LIMIT @limit OFFSET @offset`).all(params) as Incident[];
    const total = (db.prepare(`SELECT COUNT(*) as count FROM incidents ${where}`).get(params) as { count: number }).count;

    return { rows, total };
}

export function reportIncident(data: {
    route_id?: number;
    landmark_id?: number;
    type: string;
    severity: string;
    description: string;
    reported_by: string;
    lat: number;
    lng: number;
}): Incident {
    // Validate foreign keys if provided
    if (data.route_id) {
        const exists = db.prepare("SELECT id FROM routes WHERE id = ?").get(data.route_id);
        if (!exists) throw new BadRequestError(`Route with id ${data.route_id} does not exist`);
    }
    if (data.landmark_id) {
        const exists = db.prepare("SELECT id FROM landmarks WHERE id = ?").get(data.landmark_id);
        if (!exists) throw new BadRequestError(`Landmark with id ${data.landmark_id} does not exist`);
    }

    const result = db.prepare(`
    INSERT INTO incidents (route_id, landmark_id, type, severity, description, reported_by, lat, lng)
    VALUES (@route_id, @landmark_id, @type, @severity, @description, @reported_by, @lat, @lng)
  `).run({
        route_id:    data.route_id    ?? null,
        landmark_id: data.landmark_id ?? null,
        type:        data.type,
        severity:    data.severity,
        description: data.description,
        reported_by: data.reported_by,
        lat:         data.lat,
        lng:         data.lng,
    });

    return db.prepare("SELECT * FROM incidents WHERE id = ?").get(result.lastInsertRowid) as Incident;
}

export function resolveIncident(id: number): Incident {
    const row = db.prepare("SELECT * FROM incidents WHERE id = ?").get(id) as Incident | undefined;
    if (!row) throw new NotFoundError("Incident", id);
    if (!row.active) throw new BadRequestError(`Incident ${id} is already resolved`);

    db.prepare(`
    UPDATE incidents SET active = 0, resolved_at = datetime('now') WHERE id = ?
  `).run(id);

    return db.prepare("SELECT * FROM incidents WHERE id = ?").get(id) as Incident;
}

// ── Traffic history ──────────────────────────────────────────────────────────

export function getHistory(filters: {
    route_id?: number;
    hours: number;
    limit: number;
}): TrafficSnapshot[] {
    const params: Record<string, unknown> = {
        since: `datetime('now', '-${filters.hours} hours')`,
        limit: filters.limit,
    };

    let where = `WHERE recorded_at >= datetime('now', '-${filters.hours} hours')`;

    if (filters.route_id) {
        where += " AND route_id = @route_id";
        params.route_id = filters.route_id;
    }

    return db.prepare(`
    SELECT h.*, r.name as route_name
    FROM traffic_history h
    JOIN routes r ON r.id = h.route_id
    ${where}
    ORDER BY recorded_at DESC
    LIMIT @limit
  `).all({ route_id: filters.route_id, limit: filters.limit }) as TrafficSnapshot[];
}