import { Router, Request, Response } from "express";
import { cities, nextId, incrementNextId } from "../data/cities";
import { City, ApiResponse } from "../types";

const router = Router();

/* ── GET /cities ─────────────────────────────────────────────────────
   Returns all cities. Supports THREE query parameters:

   ?region=South-West     → filter by geopolitical region
   ?capital=true          → only return state capitals
   ?search=lagos          → search by name (case-insensitive)

   Query parameters are OPTIONAL. If none are provided, all cities
   are returned. You can combine them:
   GET /cities?region=South-West&capital=true

   req.query is always strings, even if you send a number.
   "true" !== true  — you must compare strings explicitly.
────────────────────────────────────────────────────────────────────── */
router.get("/", (req: Request, res: Response) => {
  const { region, capital, search } = req.query;

  let result = [...cities]; /* copy so we don't mutate the original */

  if (region) {
    result = result.filter(
      (c) => c.region.toLowerCase() === (region as string).toLowerCase()
    );
  }

  if (capital !== undefined) {
    const wantsCapital = (capital as string).toLowerCase() === "true";
    result = result.filter((c) => c.isCapital === wantsCapital);
  }

  if (search) {
    result = result.filter((c) =>
      c.name.toLowerCase().includes((search as string).toLowerCase())
    );
  }

  const response: ApiResponse<City[]> = {
    success: true,
    data: result,
    meta: {
      total: cities.length,
      count: result.length,
    },
  };

  res.status(200).json(response);
});

/* ── GET /cities/regions ─────────────────────────────────────────────
   Returns a summary of all regions with city counts.
   Notice this route is defined BEFORE /cities/:id.
   If it were after, Express would try to match "regions" as an :id.
   Specific routes always go before parameter routes.
────────────────────────────────────────────────────────────────────── */
router.get("/regions", (req: Request, res: Response) => {
  const regionMap: Record<string, number> = {};

  cities.forEach((c) => {
    regionMap[c.region] = (regionMap[c.region] || 0) + 1;
  });

  const regions = Object.entries(regionMap).map(([name, count]) => ({
    name,
    cityCount: count,
  }));

  res.status(200).json({
    success: true,
    data: regions,
    meta: { total: regions.length, count: regions.length },
  });
});

/* ── GET /cities/:id ─────────────────────────────────────────────────
   Returns one city by its numeric ID.
   req.params.id is always a STRING — we must convert with Number().
   If the ID is not a valid number → 400 Bad Request.
   If the city is not found → 404 Not Found.
   If found → 200 OK with the city data.
────────────────────────────────────────────────────────────────────── */
router.get("/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({
      success: false,
      error: "ID must be a number",
    });
    return;
  }

  const city = cities.find((c) => c.id === id);

  if (!city) {
    res.status(404).json({
      success: false,
      error: `City with ID ${id} not found`,
    });
    return;
  }

  res.status(200).json({ success: true, data: city });
});

/* ── POST /cities ────────────────────────────────────────────────────
   Creates a new city. The client sends the city data in the request body.
   We VALIDATE the body — if required fields are missing, we return 400.
   If valid, we add it to the array and return 201 Created.

   201 (Created) vs 200 (OK):
   Use 201 when you create a new resource.
   Use 200 when you return existing data.
   This distinction matters — clients can check the status code to know
   if a resource was created vs just returned.
────────────────────────────────────────────────────────────────────── */
router.post("/", (req: Request, res: Response) => {
  const { name, state, region, population, isCapital, knownFor } = req.body;

  /* Validate required fields */
  const missing: string[] = [];
  if (!name)       missing.push("name");
  if (!state)      missing.push("state");
  if (!region)     missing.push("region");
  if (!population) missing.push("population");
  if (!knownFor)   missing.push("knownFor");

  if (missing.length > 0) {
    res.status(400).json({
      success: false,
      error: `Missing required fields: ${missing.join(", ")}`,
    });
    return;
  }

  /* Check for duplicate name */
  const exists = cities.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  );
  if (exists) {
    res.status(409).json({
      success: false,
      error: `City "${name}" already exists with ID ${exists.id}`,
    });
    return;
  }

  const newCity: City = {
    id: nextId,
    name,
    state,
    region,
    population: Number(population),
    isCapital: Boolean(isCapital),
    knownFor,
  };

  cities.push(newCity);
  incrementNextId();

  /* 201 Created — also set Location header pointing to the new resource */
  res.status(201)
    .header("Location", `/cities/${newCity.id}`)
    .json({ success: true, data: newCity });
});

/* ── PUT /cities/:id ─────────────────────────────────────────────────
   Updates an existing city by ID.
   PUT = replace the entire resource with what you send.
   PATCH = update only the fields you send (more common in practice).
   We implement PUT here — send all fields you want to keep.
────────────────────────────────────────────────────────────────────── */
router.put("/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ success: false, error: "ID must be a number" });
    return;
  }

  const index = cities.findIndex((c) => c.id === id);

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: `City with ID ${id} not found`,
    });
    return;
  }

  const { name, state, region, population, isCapital, knownFor } = req.body;

  /* Merge existing city with updated fields */
  const updated: City = {
    ...cities[index],
    ...(name       && { name }),
    ...(state      && { state }),
    ...(region     && { region }),
    ...(population && { population: Number(population) }),
    ...(isCapital !== undefined && { isCapital: Boolean(isCapital) }),
    ...(knownFor   && { knownFor }),
  };

  cities[index] = updated;

  res.status(200).json({ success: true, data: updated });
});

/* ── DELETE /cities/:id ──────────────────────────────────────────────
   Removes a city by ID.
   Returns 200 with the deleted city's data so the client can confirm
   what was removed. Some APIs return 204 (No Content) with no body.
────────────────────────────────────────────────────────────────────── */
router.delete("/:id", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (isNaN(id)) {
    res.status(400).json({ success: false, error: "ID must be a number" });
    return;
  }

  const index = cities.findIndex((c) => c.id === id);

  if (index === -1) {
    res.status(404).json({
      success: false,
      error: `City with ID ${id} not found`,
    });
    return;
  }

  const deleted = cities.splice(index, 1)[0];

  res.status(200).json({
    success: true,
    data: deleted,
    meta: { total: cities.length, count: 1 },
  });
});

export default router;