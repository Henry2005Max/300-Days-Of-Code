import { City, WeatherReading } from '../types';

const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// Realistic mock readings per city
const MOCK_DATA: Record<string, Omit<WeatherReading, 'cityName' | 'fetchedAt'>> = {
    'Lagos':         { tempC: 31.2, feelsLikeC: 36.8, humidity: 88, windKph: 18.4, rain1h: 0,    condition: 'Scattered Clouds', conditionId: 802, visibility: 10000 },
    'Abuja':         { tempC: 34.5, feelsLikeC: 38.2, humidity: 62, windKph: 22.0, rain1h: 0,    condition: 'Clear Sky',        conditionId: 800, visibility: 10000 },
    'Kano':          { tempC: 39.1, feelsLikeC: 41.0, humidity: 28, windKph: 31.5, rain1h: 0,    condition: 'Clear Sky',        conditionId: 800, visibility: 10000 },
    'Port Harcourt': { tempC: 29.8, feelsLikeC: 34.5, humidity: 92, windKph: 14.0, rain1h: 12.4, condition: 'Heavy Rain',       conditionId: 502, visibility: 5000  },
    'Ibadan':        { tempC: 32.0, feelsLikeC: 37.1, humidity: 79, windKph: 16.8, rain1h: 2.1,  condition: 'Light Rain',       conditionId: 500, visibility: 8000  },
    'Enugu':         { tempC: 30.4, feelsLikeC: 34.9, humidity: 75, windKph: 12.0, rain1h: 0,    condition: 'Partly Cloudy',    conditionId: 801, visibility: 9500  },
};

function isMock(): boolean {
    return !process.env.OPENWEATHER_API_KEY || process.env.OPENWEATHER_API_KEY === 'demo';
}

function addJitter(base: number, range: number): number {
    return parseFloat((base + (Math.random() - 0.5) * range).toFixed(1));
}

function getMockReading(city: City): WeatherReading {
    const base = MOCK_DATA[city.name] || MOCK_DATA['Lagos'];
    return {
        cityName:    city.name,
        tempC:       addJitter(base.tempC, 2),
        feelsLikeC:  addJitter(base.feelsLikeC, 2),
        humidity:    Math.min(100, Math.max(0, Math.round(addJitter(base.humidity, 5)))),
        windKph:     Math.max(0, addJitter(base.windKph, 4)),
        rain1h:      Math.max(0, addJitter(base.rain1h, 3)),
        condition:   base.condition,
        conditionId: base.conditionId,
        visibility:  base.visibility,
        fetchedAt:   new Date().toISOString(),
    };
}

async function fetchLive(city: City, apiKey: string): Promise<WeatherReading> {
    const url = `${BASE_URL}?lat=${city.lat}&lon=${city.lon}&appid=${apiKey}&units=metric`;
    const res  = await fetch(url, { signal: AbortSignal.timeout(8000) });

    if (!res.ok) throw new Error(`OpenWeatherMap API ${res.status} for ${city.name}`);

    const data = await res.json() as Record<string, unknown>;

    const main    = data.main    as Record<string, number>;
    const wind    = data.wind    as Record<string, number>;
    const weather = (data.weather as { id: number; description: string }[])[0];
    const rain    = data.rain    as Record<string, number> | undefined;

    return {
        cityName:    city.name,
        tempC:       parseFloat(main.temp.toFixed(1)),
        feelsLikeC:  parseFloat(main.feels_like.toFixed(1)),
        humidity:    main.humidity,
        windKph:     parseFloat(((wind.speed || 0) * 3.6).toFixed(1)),
        rain1h:      rain?.['1h'] ?? 0,
        condition:   weather.description.replace(/\b\w/g, (c) => c.toUpperCase()),
        conditionId: weather.id,
        visibility:  (data.visibility as number) || 10000,
        fetchedAt:   new Date().toISOString(),
    };
}

export async function fetchWeather(city: City): Promise<WeatherReading> {
    if (isMock()) {
        return getMockReading(city);
    }
    try {
        return await fetchLive(city, process.env.OPENWEATHER_API_KEY!);
    } catch (err) {
        console.warn(`  [Fetch] ${city.name} failed: ${(err as Error).message}. Using mock.`);
        return getMockReading(city);
    }
}