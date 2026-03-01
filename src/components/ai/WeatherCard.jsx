/**
 * src/components/ai/WeatherCard.jsx
 * Weather-Aware card — shown on FlightResults and HotelDetail.
 * Fetches live weather data for the destination city.
 */
import React, { useState, useEffect } from 'react';
import { CloudSun, Wind, Droplets, AlertTriangle, RefreshCw } from 'lucide-react';
import { api } from '../../services/api.js';

export default function WeatherCard({ city, className = '' }) {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(true);

    useEffect(() => {
        if (!city) return;
        setLoading(true);
        api.ai.weather(city)
            .then(res => { setWeather(res.data); setLoading(false); })
            .catch(() => setLoading(false));
    }, [city]);

    if (!city || (!loading && !weather)) return null;
    if (!open) return null;

    return (
        <div className={`card p-4 border-l-4 ${weather?.condition?.toLowerCase().includes('rain') || weather?.condition?.toLowerCase().includes('thunder') ? 'border-l-blue-400 bg-blue-50/40' : 'border-l-orange bg-orange/5'} ${className}`}>
            {loading ? (
                <div className="flex items-center gap-3 text-warmgray text-sm">
                    <RefreshCw className="w-4 h-4 animate-spin text-orange" />
                    <span>Loading weather for {city}…</span>
                </div>
            ) : (
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                        <span className="text-3xl leading-none">{weather.emoji}</span>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-charcoal text-sm">{weather.city} Weather</p>
                                {weather.isFallback && <span className="tag text-xs">Estimated</span>}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 mt-1">
                                <span className="text-2xl font-bold text-charcoal">{weather.temp}°C</span>
                                <span className="text-warmgray text-sm">{weather.condition}</span>
                                <div className="flex items-center gap-1 text-xs text-warmgray">
                                    <Droplets className="w-3 h-3 text-blue-400" /> {weather.humidity}%
                                </div>
                                <div className="flex items-center gap-1 text-xs text-warmgray">
                                    <Wind className="w-3 h-3" /> {weather.wind} km/h
                                </div>
                            </div>
                            <p className="text-xs text-charcoal/70 mt-2 leading-relaxed">{weather.tip}</p>
                        </div>
                    </div>
                    <button onClick={() => setOpen(false)} className="text-warmgray hover:text-charcoal text-lg leading-none flex-shrink-0">×</button>
                </div>
            )}
        </div>
    );
}
