/**
 * server/services/weather.js
 * OpenWeatherMap free-tier wrapper.
 * Set OPENWEATHER_API_KEY in server/.env
 */

const BASE = 'https://api.openweathermap.org/data/2.5';

// Map OWM condition codes to emoji
function weatherEmoji(code) {
    if (code >= 200 && code < 300) return '⛈️';
    if (code >= 300 && code < 400) return '🌦️';
    if (code >= 500 && code < 600) return '🌧️';
    if (code >= 600 && code < 700) return '❄️';
    if (code >= 700 && code < 800) return '🌫️';
    if (code === 800) return '☀️';
    if (code > 800) return '⛅';
    return '🌡️';
}

// Fallback data when no API key is set
function fallbackWeather(city) {
    return {
        city,
        temp: 28,
        feels_like: 31,
        condition: 'Clear',
        description: 'clear sky',
        humidity: 65,
        wind: 12,
        emoji: '☀️',
        icon: '01d',
        tip: `Weather data unavailable. Add OPENWEATHER_API_KEY to server/.env for live forecasts.`,
        isFallback: true,
    };
}

export async function getWeather(city) {
    const key = process.env.OPENWEATHER_API_KEY;
    if (!key || key === 'your_openweather_api_key_here') return fallbackWeather(city);
    try {
        const url = `${BASE}/weather?q=${encodeURIComponent(city)},IN&appid=${key}&units=metric`;
        const res = await fetch(url);
        if (!res.ok) return fallbackWeather(city);
        const d = await res.json();
        const emoji = weatherEmoji(d.weather[0].id);
        let tip = `${emoji} ${Math.round(d.main.temp)}°C in ${city}. `;
        const cond = d.weather[0].main.toLowerCase();
        if (cond.includes('rain') || cond.includes('drizzle')) tip += 'Pack an umbrella and consider travel insurance.';
        else if (cond.includes('thunder')) tip += 'Thunderstorms expected — check for flight delays.';
        else if (cond.includes('snow')) tip += 'Snow conditions — dress warmly and allow extra travel time.';
        else if (d.main.temp > 38) tip += 'Extreme heat — stay hydrated and use sunscreen.';
        else if (d.main.temp < 10) tip += 'Cold weather — pack warm layers.';
        else tip += 'Great weather for travel!';
        return {
            city: d.name,
            temp: Math.round(d.main.temp),
            feels_like: Math.round(d.main.feels_like),
            condition: d.weather[0].main,
            description: d.weather[0].description,
            humidity: d.main.humidity,
            wind: Math.round(d.wind.speed * 3.6), // m/s → km/h
            emoji,
            icon: d.weather[0].icon,
            tip,
            isFallback: false,
        };
    } catch {
        return fallbackWeather(city);
    }
}
