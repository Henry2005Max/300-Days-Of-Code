import { City } from '../types';

export const NIGERIAN_CITIES: City[] = [
    { name: 'Lagos',         country: 'NG', lat: 6.5244,  lon: 3.3792  },
    { name: 'Abuja',         country: 'NG', lat: 9.0579,  lon: 7.4951  },
    { name: 'Kano',          country: 'NG', lat: 12.0022, lon: 8.5920  },
    { name: 'Port Harcourt', country: 'NG', lat: 4.8396,  lon: 7.0331  },
    { name: 'Ibadan',        country: 'NG', lat: 7.3775,  lon: 3.9470  },
    { name: 'Enugu',         country: 'NG', lat: 6.4584,  lon: 7.5464  },
];

export function loadThresholds() {
    return {
        tempMax:     parseFloat(process.env.ALERT_TEMP_MAX     || '38'),
        tempMin:     parseFloat(process.env.ALERT_TEMP_MIN     || '15'),
        humidityMax: parseFloat(process.env.ALERT_HUMIDITY_MAX || '95'),
        windMax:     parseFloat(process.env.ALERT_WIND_MAX     || '50'),
        rain1h:      parseFloat(process.env.ALERT_RAIN_1H      || '20'),
    };
}