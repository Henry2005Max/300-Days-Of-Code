#!/usr/bin/env node

// Weather API Fetcher with Axios
// Day 4 of 300 Days of Code Challenge

import axios from 'axios';
import * as readline from 'readline';

// Create interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// OpenWeatherMap API key 
// Get your own key at: https://openweathermap.org/api
const API_KEY = '2365fa9d8d14640c6b9bde128d7ef986'; // Replace with your actual API key

// Function to ask questions
function askQuestion(question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Interface for weather data
interface WeatherData {
  name: string;
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  visibility: number;
}

// Function to get weather by city name
async function getWeatherByCity(city: string): Promise<WeatherData | null> {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        console.log('\n❌ City not found! Please check the spelling.');
      } else if (error.response?.status === 401) {
        console.log('\n❌ Invalid API key! Please get a free key at https://openweathermap.org/api');
      } else {
        console.log('\n❌ Error fetching weather data:', error.message);
      }
    }
    return null;
  }
}

// Function to get weather by coordinates
async function getWeatherByCoords(lat: number, lon: number): Promise<WeatherData | null> {
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log('\n❌ Error fetching weather data:', error.message);
    }
    return null;
  }
}

// Function to convert temperature
function convertTemp(celsius: number, unit: string): number {
  if (unit === 'F') {
    return (celsius * 9/5) + 32;
  } else if (unit === 'K') {
    return celsius + 273.15;
  }
  return celsius;
}

// Function to get wind direction
function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

// Function to get weather emoji
function getWeatherEmoji(weatherMain: string): string {
  const emojiMap: { [key: string]: string } = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Drizzle': '🌦️',
    'Thunderstorm': '⛈️',
    'Snow': '❄️',
    'Mist': '🌫️',
    'Smoke': '🌫️',
    'Haze': '🌫️',
    'Dust': '🌫️',
    'Fog': '🌫️',
    'Sand': '🌫️',
    'Ash': '🌋',
    'Squall': '💨',
    'Tornado': '🌪️'
  };
  return emojiMap[weatherMain] || '🌡️';
}

// Function to format time
function formatTime(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

// Function to display weather information
function displayWeather(data: WeatherData, tempUnit: string = 'C'): void {
  const emoji = getWeatherEmoji(data.weather[0].main);
  const temp = convertTemp(data.main.temp, tempUnit);
  const feelsLike = convertTemp(data.main.feels_like, tempUnit);
  const tempMin = convertTemp(data.main.temp_min, tempUnit);
  const tempMax = convertTemp(data.main.temp_max, tempUnit);
  const windDir = getWindDirection(data.wind.deg);
  
  console.log('\n' + '='.repeat(60));
  console.log(`${emoji}  WEATHER FOR ${data.name.toUpperCase()}, ${data.sys.country}  ${emoji}`);
  console.log('='.repeat(60));
  
  console.log('\n📊 CURRENT CONDITIONS\n');
  console.log(`   Weather: ${data.weather[0].main} - ${data.weather[0].description}`);
  console.log(`   Temperature: ${temp.toFixed(1)}°${tempUnit}`);
  console.log(`   Feels Like: ${feelsLike.toFixed(1)}°${tempUnit}`);
  console.log(`   Min/Max: ${tempMin.toFixed(1)}°${tempUnit} / ${tempMax.toFixed(1)}°${tempUnit}`);
  
  console.log('\n🌬️  WIND & ATMOSPHERE\n');
  console.log(`   Wind Speed: ${data.wind.speed} m/s`);
  console.log(`   Wind Direction: ${windDir} (${data.wind.deg}°)`);
  console.log(`   Humidity: ${data.main.humidity}%`);
  console.log(`   Pressure: ${data.main.pressure} hPa`);
  console.log(`   Visibility: ${(data.visibility / 1000).toFixed(1)} km`);
  console.log(`   Cloudiness: ${data.clouds.all}%`);
  
  console.log('\n🌅 SUN TIMES\n');
  console.log(`   Sunrise: ${formatTime(data.sys.sunrise)}`);
  console.log(`   Sunset: ${formatTime(data.sys.sunset)}`);
  
  console.log('\n' + '='.repeat(60));
}

// Function to display weather comparison
function displayComparison(city1Data: WeatherData, city2Data: WeatherData): void {
  console.log('\n' + '='.repeat(60));
  console.log('🌍 WEATHER COMPARISON');
  console.log('='.repeat(60));
  
  const emoji1 = getWeatherEmoji(city1Data.weather[0].main);
  const emoji2 = getWeatherEmoji(city2Data.weather[0].main);
  
  console.log('\n' + '-'.repeat(60));
  console.log(`${emoji1}  ${city1Data.name}, ${city1Data.sys.country}`.padEnd(35) + 
              `${emoji2}  ${city2Data.name}, ${city2Data.sys.country}`);
  console.log('-'.repeat(60));
  
  console.log(`Temperature:`.padEnd(20) + 
              `${city1Data.main.temp.toFixed(1)}°C`.padEnd(35) + 
              `${city2Data.main.temp.toFixed(1)}°C`);
  
  console.log(`Feels Like:`.padEnd(20) + 
              `${city1Data.main.feels_like.toFixed(1)}°C`.padEnd(35) + 
              `${city2Data.main.feels_like.toFixed(1)}°C`);
  
  console.log(`Weather:`.padEnd(20) + 
              `${city1Data.weather[0].main}`.padEnd(35) + 
              `${city2Data.weather[0].main}`);
  
  console.log(`Humidity:`.padEnd(20) + 
              `${city1Data.main.humidity}%`.padEnd(35) + 
              `${city2Data.main.humidity}%`);
  
  console.log(`Wind Speed:`.padEnd(20) + 
              `${city1Data.wind.speed} m/s`.padEnd(35) + 
              `${city2Data.wind.speed} m/s`);
  
  console.log('-'.repeat(60));
  
  // Temperature difference
  const tempDiff = Math.abs(city1Data.main.temp - city2Data.main.temp);
  if (city1Data.main.temp > city2Data.main.temp) {
    console.log(`\n🌡️  ${city1Data.name} is ${tempDiff.toFixed(1)}°C warmer than ${city2Data.name}`);
  } else if (city2Data.main.temp > city1Data.main.temp) {
    console.log(`\n🌡️  ${city2Data.name} is ${tempDiff.toFixed(1)}°C warmer than ${city1Data.name}`);
  } else {
    console.log(`\n🌡️  Both cities have the same temperature!`);
  }
  
  console.log('='.repeat(60));
}

// Main application
async function runWeatherApp() {
  console.clear();
  console.log('='.repeat(60));
  console.log('🌤️  WEATHER API FETCHER 🌤️');
  console.log('='.repeat(60));
  console.log('\nGet real-time weather data from anywhere in the world!\n');
  console.log('='.repeat(60));
  
  // Check if API key is set
  if (API_KEY === 'demo') {
    console.log('\n⚠️  DEMO MODE - Using sample API key');
    console.log('   Get your free API key at: https://openweathermap.org/api');
    console.log('   Then replace the API_KEY in the code\n');
  }

  let continueRunning = true;

  while (continueRunning) {
    try {
      console.log('\n📋 MAIN MENU\n');
      console.log('   1. Get weather by city name');
      console.log('   2. Get weather by coordinates');
      console.log('   3. Compare two cities');
      console.log('   4. Popular cities (Lagos, London, New York, Tokyo)');
      console.log('   5. Exit\n');

      const choice = await askQuestion('Choose an option (1-5): ');

      if (choice === '5') {
        console.log('\n👋 Thanks for using Weather API Fetcher! Stay dry! 🌂\n');
        continueRunning = false;
        break;
      }

      switch (choice) {
        case '1': {
          // Get weather by city
          const city = await askQuestion('\nEnter city name (e.g., Lagos, London, Tokyo): ');
          const tempUnitInput = await askQuestion('Temperature unit (C/F/K) [default: C]: ');
          const tempUnit = tempUnitInput.toUpperCase() || 'C';
          
          console.log('\n🔍 Fetching weather data...');
          const weatherData = await getWeatherByCity(city);
          
          if (weatherData) {
            displayWeather(weatherData, tempUnit);
          }
          break;
        }

        case '2': {
          // Get weather by coordinates
          const latInput = await askQuestion('\nEnter latitude (e.g., 6.5244 for Lagos): ');
          const lonInput = await askQuestion('Enter longitude (e.g., 3.3792 for Lagos): ');
          
          const lat = parseFloat(latInput);
          const lon = parseFloat(lonInput);
          
          if (isNaN(lat) || isNaN(lon)) {
            console.log('\n❌ Invalid coordinates! Please enter valid numbers.');
            break;
          }
          
          console.log('\n🔍 Fetching weather data...');
          const weatherData = await getWeatherByCoords(lat, lon);
          
          if (weatherData) {
            displayWeather(weatherData);
          }
          break;
        }

        case '3': {
          // Compare two cities
          const city1 = await askQuestion('\nEnter first city: ');
          const city2 = await askQuestion('Enter second city: ');
          
          console.log('\n🔍 Fetching weather data for both cities...');
          
          const [data1, data2] = await Promise.all([
            getWeatherByCity(city1),
            getWeatherByCity(city2)
          ]);
          
          if (data1 && data2) {
            displayComparison(data1, data2);
          } else {
            console.log('\n❌ Could not fetch data for one or both cities.');
          }
          break;
        }

        case '4': {
          // Popular cities
          console.log('\n🌍 POPULAR CITIES\n');
          const cities = ['Lagos', 'London', 'New York', 'Tokyo'];
          
          console.log('🔍 Fetching weather for popular cities...\n');
          
          for (const city of cities) {
            const data = await getWeatherByCity(city);
            if (data) {
              const emoji = getWeatherEmoji(data.weather[0].main);
              console.log(`${emoji}  ${city.padEnd(12)} | ${data.main.temp.toFixed(1)}°C | ${data.weather[0].description}`);
            }
          }
          console.log('');
          break;
        }

        default:
          console.log('\n❌ Invalid option! Please choose 1-5.');
      }

      // Ask to continue
      const again = await askQuestion('\nCheck another location? (yes/no): ');
      if (again.toLowerCase() !== 'yes' && again.toLowerCase() !== 'y') {
        console.log('\n👋 Thanks for using Weather API Fetcher! Stay dry! 🌂\n');
        continueRunning = false;
      }

    } catch (error) {
      if (error instanceof Error) {
        console.log(`\n❌ Error: ${error.message}\n`);
      }
    }
  }

  rl.close();
}

// Run the application
runWeatherApp();
