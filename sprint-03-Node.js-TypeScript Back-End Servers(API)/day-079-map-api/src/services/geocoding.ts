// Thin wrapper around the Google Maps Geocoding API.
//
// The API endpoint is a simple HTTPS GET:
//   https://maps.googleapis.com/maps/api/geocode/json?address=QUERY&key=API_KEY
//
// It returns a `results` array. We take the first result (the best match).
// From that result we extract:
//   - geometry.location  → { lat, lng }
//   - formatted_address  → human-readable full address
//   - address_components → structured parts (city, state, country, postal code)
//
// address_components is an array of objects each with a `types` array.
// We use those types to find the specific component we need, e.g.:
//   types: ["locality"]              → city
//   types: ["administrative_area_level_1"] → state/region
//   types: ["country"]               → country
//   types: ["postal_code"]           → postal code

import axios from "axios";
import { GoogleGeocodeResult } from "../types";
import { ServiceUnavailableError, UnprocessableError } from "../middleware/errorHandler";

const MAPS_BASE = "https://maps.googleapis.com/maps/api/geocode/json";

export interface GeocodeResult {
    formatted_address: string;
    lat: number;
    lng: number;
    city: string;
    state: string;
    country: string;
    postal_code: string;
}

// Extract a specific address component from the Google result by its type string
function getComponent(components: GoogleGeocodeResult["address_components"], type: string): string {
    const found = components.find((c) => c.types.includes(type));
    return found ? found.long_name : "";
}

export async function geocodeAddress(address: string): Promise<GeocodeResult> {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey || apiKey === "your_api_key_here") {
        throw new ServiceUnavailableError(
            "GOOGLE_MAPS_API_KEY is not set. Add it to .env — see README for instructions."
        );
    }

    let response;
    try {
        response = await axios.get(MAPS_BASE, {
            params: { address, key: apiKey },
            timeout: Number(process.env.MAPS_FETCH_TIMEOUT_MS) || 5000,
        });
    } catch (err: any) {
        throw new ServiceUnavailableError(`Google Maps request failed: ${err.message}`);
    }

    const { status, results } = response.data;

    if (status === "REQUEST_DENIED") {
        throw new ServiceUnavailableError("Google Maps API key is invalid or lacks Geocoding API access.");
    }

    if (status === "ZERO_RESULTS" || !results || results.length === 0) {
        throw new UnprocessableError(`No results found for address: "${address}"`);
    }

    if (status !== "OK") {
        throw new ServiceUnavailableError(`Google Maps API returned status: ${status}`);
    }

    const result: GoogleGeocodeResult = results[0];
    const components = result.address_components;

    return {
        formatted_address: result.formatted_address,
        lat:               result.geometry.location.lat,
        lng:               result.geometry.location.lng,
        city:              getComponent(components, "locality") || getComponent(components, "sublocality_level_1"),
        state:             getComponent(components, "administrative_area_level_1"),
        country:           getComponent(components, "country"),
        postal_code:       getComponent(components, "postal_code"),
    };
}