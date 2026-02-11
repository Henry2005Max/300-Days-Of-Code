# Day 4: Weather API Fetcher with Axios

##  Description
A real-time weather application that fetches live weather data from OpenWeatherMap API. Get current conditions, compare cities, and view weather for popular locations around the world!

##  Features
-  **Weather by City** - Get weather for any city worldwide
-  **Weather by Coordinates** - Use latitude/longitude for precise locations
-  **City Comparison** - Compare weather between two cities
-  **Popular Cities** - Quick view of Lagos, London, New York, Tokyo
-  **Temperature Units** - Support for Celsius, Fahrenheit, and Kelvin
-  **Detailed Info** - Wind speed/direction, humidity, pressure, visibility
-  **Sun Times** - Sunrise and sunset times
-  **Weather Emojis** - Visual weather indicators
-  **Fast** - Uses Axios for efficient HTTP requests

##  Technologies Used
- TypeScript
- Node.js
- Axios (HTTP client)
- OpenWeatherMap API
- Async/await for API calls

##  API Key Setup

This project uses the OpenWeatherMap API (free tier).

### Get Your Free API Key:
1. Go to: https://openweathermap.org/api
2. Click "Sign Up" (it's free!)
3. Verify your email
4. Go to your account → API keys
5. Copy your API key

### Add Your API Key:
Open `weather-api.ts` and replace this line:
```typescript
const API_KEY = 'demo'; // Replace with your actual API key
```

With:
```typescript
const API_KEY = 'your-actual-api-key-here';
```

**Note:** The demo key has limited functionality. Get your own for full features!

##  Installation

1. Make sure you have Node.js installed
2. Install dependencies:
   ```bash
   npm install
   ```

##  How to Run

### Quick Run (with ts-node):
```bash
ts-node weather-api.ts
```

### Build and Run:
```bash
npm run build
npm start
```

### Development Mode:
```bash
npm run dev
```

##  Example Usage

### Example 1: Get Weather for Lagos
```
Choose an option: 1
Enter city name: Lagos
Temperature unit (C/F/K): C

☀️  WEATHER FOR LAGOS, NG  ☀️
=============================================================
📊 CURRENT CONDITIONS
   Weather: Clear - clear sky
   Temperature: 28.5°C
   Feels Like: 31.2°C
   Min/Max: 27.0°C / 30.0°C

🌬️  WIND & ATMOSPHERE
   Wind Speed: 3.5 m/s
   Wind Direction: SW (225°)
   Humidity: 75%
   Pressure: 1013 hPa
   Visibility: 10.0 km
   Cloudiness: 20%

 SUN TIMES
   Sunrise: 06:45 AM
   Sunset: 06:52 PM
```

### Example 2: Compare Cities
```
Choose an option: 3
Enter first city: Lagos
Enter second city: London

🌍 WEATHER COMPARISON
=============================================================
☀️  Lagos, NG              🌧️  London, GB
-------------------------------------------------------------
Temperature:       28.5°C                 12.3°C
Feels Like:        31.2°C                 10.1°C
Weather:           Clear                  Rain
Humidity:          75%                    85%
Wind Speed:        3.5 m/s                5.2 m/s
-------------------------------------------------------------

🌡️  Lagos is 16.2°C warmer than London
```

### Example 3: Popular Cities
```
Choose an option: 4

 POPULAR CITIES

☀️  Lagos        | 28.5°C | clear sky
🌧️  London       | 12.3°C | light rain
☁️  New York     | 15.8°C | overcast clouds
☀️  Tokyo        | 22.1°C | few clouds
```

### Example 4: Weather by Coordinates
```
Choose an option: 2
Enter latitude: 6.5244
Enter longitude: 3.3792

(Shows weather for Lagos using coordinates)
```

##  Menu Options

1. **Get weather by city name** - Search any city worldwide
2. **Get weather by coordinates** - Use GPS coordinates
3. **Compare two cities** - Side-by-side comparison
4. **Popular cities** - Quick overview of major cities
5. **Exit** - Close the application

## What I Learned
- Making HTTP requests with Axios
- Working with REST APIs
- Handling API responses and errors
- TypeScript interfaces for API data
- Async/await for asynchronous operations
- Error handling with try/catch
- HTTP status codes (404, 401, etc.)
- Temperature conversion formulas
- Parsing and formatting JSON data
- Promise.all for concurrent API calls

##  How It Works

### API Call Flow:
```typescript
1. User enters city name
   ↓
2. Build API URL with parameters
   ↓
3. Send GET request using Axios
   ↓
4. Receive JSON response
   ↓
5. Parse and format data
   ↓
6. Display to user
```

### Temperature Conversion:
```typescript
Celsius to Fahrenheit: (C × 9/5) + 32
Celsius to Kelvin: C + 273.15
```

##  Weather Emojis

- ☀️ Clear
- ☁️ Clouds
- 🌧️ Rain
- 🌦️ Drizzle
- ⛈️ Thunderstorm
- ❄️ Snow
- 🌫️ Fog/Mist/Haze
- 💨 Squall
- 🌪️ Tornado

##  Error Handling

The app handles:
- **404** - City not found
- **401** - Invalid API key
- **Network errors** - Connection issues
- **Invalid coordinates** - Non-numeric lat/lon
- **Malformed responses** - Unexpected data format

##  Future Improvements
- 5-day weather forecast
- Weather alerts and warnings
- Historical weather data
- Weather maps visualization
- Save favorite locations
- Air quality index
- UV index
- Precipitation probability
- Hourly forecast
- Weather-based recommendations

##  Use Cases

✅ **Travel Planning** - Check weather before trips  
✅ **Daily Updates** - Morning weather check  
✅ **City Comparison** - Compare destinations  
✅ **Event Planning** - Check conditions for outdoor events  
✅ **Learning** - Understand API integration  

##  Troubleshooting

**Problem:** "Invalid API key"
- **Solution:** Get your free key from OpenWeatherMap and add it to the code

**Problem:** "City not found"
- **Solution:** Check spelling, try adding country code (e.g., "Lagos,NG")

**Problem:** "Network error"
- **Solution:** Check your internet connection

**Problem:** "Cannot find module 'axios'"
- **Solution:** Run `npm install` to install dependencies

##  API Endpoints Used

```
Current Weather by City:
https://api.openweathermap.org/data/2.5/weather?q={city}&appid={key}&units=metric

Current Weather by Coordinates:
https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={key}&units=metric
```

##  Challenge Info
**Day:** 4/300  
**Sprint:** 1 - Foundations  
**Date:** Mon Feb 9
**Previous Day:** [Day 3 - File Renamer](../day-003-file-renamer)  
**Next Day:** [Day 5 - Todo List CLI](../day-005-todo-cli)  

---

Part of my 300 Days of Code Challenge! 🚀
