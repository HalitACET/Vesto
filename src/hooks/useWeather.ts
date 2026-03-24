"use client";

import { useEffect, useState } from "react";
import type { WeatherData } from "@/types";

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

function mapCondition(weatherId: number): WeatherData["condition"] {
    if (weatherId >= 200 && weatherId < 300) return "rainy";
    if (weatherId >= 300 && weatherId < 400) return "rainy";
    if (weatherId >= 500 && weatherId < 600) return "rainy";
    if (weatherId >= 600 && weatherId < 700) return "snowy";
    if (weatherId >= 700 && weatherId < 800) return "windy";
    if (weatherId === 800) return "sunny";
    return "cloudy";
}

export function useWeather(city = "Istanbul") {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!API_KEY) {
            setError("OpenWeather API key not configured");
            setLoading(false);
            return;
        }

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
            city
        )}&units=metric&appid=${API_KEY}`;

        fetch(url)
            .then((r) => r.json())
            .then((data) => {
                const temp = Math.round(data.main.temp);
                setWeather({
                    city: data.name,
                    temperature: temp,
                    feelsLike: Math.round(data.main.feels_like),
                    condition: mapCondition(data.weather[0].id),
                    humidity: data.main.humidity,
                    windSpeed: Math.round(data.wind.speed),
                    icon: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
                    description: data.weather[0].description,
                });
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [city]);

    return { weather, loading, error };
}
