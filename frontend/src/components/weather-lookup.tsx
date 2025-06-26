"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface WeatherInfo {
  location?: {
    name: string;
    country: string;
    region: string;
    localtime: string;
  };
  current?: {
    temperature: number;
    weather_descriptions: string[];
    wind_speed: number;
    wind_dir: string;
    pressure: number;
    humidity: number;
    visibility: number;
    uv_index: number;
    feelslike: number;
  };
  error?: {
    code: number;
    type: string;
    info: string;
  };
}

interface WeatherData {
  date: string;
  location: string;
  notes: string;
  weather_info: WeatherInfo;
}



export function WeatherLookup() {
  const [weatherId, setWeatherId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weatherId.trim()) return;

    setIsLoading(true);
    setError(null);
    setWeatherData(null);

    try {
      const response = await fetch(`http://localhost:8000/weather/${weatherId.trim()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setWeatherData(data);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Failed to fetch weather data");
      }
    } catch {
      setError("Network error: Could not connect to the server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWeatherId(e.target.value);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Weather Data Lookup</CardTitle>
        <CardDescription>
          Enter a weather request ID to view the stored weather data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="weatherId">Weather Request ID</Label>
            <Input
              id="weatherId"
              name="weatherId"
              type="text"
              placeholder="Enter weather request ID"
              value={weatherId}
              onChange={handleInputChange}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || !weatherId.trim()}>
            {isLoading ? "Loading..." : "Lookup Weather Data"}
          </Button>

          {error && (
            <div className="p-3 rounded-md bg-red-900/20 text-red-500 border border-red-500">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* [// TODO : Style the displayed weather data instead of just dumping the JSON] */}

          {weatherData && (
            <div className="space-y-3">
              <div className="p-3 rounded-md bg-green-900/20 text-green-500 border border-green-500">
                <p className="text-sm font-medium">Weather data found!</p>
              </div>
              
              <div className="space-y-3 p-4 border rounded-md bg-muted/20">
                <div>
                  <Label className="text-sm font-medium">Date:</Label>
                  <p className="text-sm mt-1">{weatherData.date}</p>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Location:</Label>
                  <p className="text-sm mt-1">{weatherData.location}</p>
                </div>
                
                {weatherData.notes && (
                  <div>
                    <Label className="text-sm font-medium">Notes:</Label>
                    <p className="text-sm mt-1">{weatherData.notes}</p>
                  </div>
                )}
                
                <div>
                  <Label className="text-sm font-medium">Weather Information:</Label>
                  <div className="p-2 grid grid-cols-2 gap-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Temperature</p>
                          <p className="text-sm font-medium">{weatherData.weather_info.current?.temperature}°C</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Feels Like</p>
                          <p className="text-sm font-medium">{weatherData.weather_info.current?.feelslike}°C</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Description</p>
                          <p className="text-sm font-medium">{weatherData.weather_info.current?.weather_descriptions?.[0] || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Humidity</p>
                          <p className="text-sm font-medium">{weatherData.weather_info.current?.humidity}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Wind Speed</p>
                          <p className="text-sm font-medium">{weatherData.weather_info.current?.wind_speed} km/h</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Wind Direction</p>
                          <p className="text-sm font-medium">{weatherData.weather_info.current?.wind_dir}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">UV Index</p>
                          <p className="text-sm font-medium">{weatherData.weather_info.current?.uv_index}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Pressure</p>
                          <p className="text-sm font-medium">{weatherData.weather_info.current?.pressure} mb</p>
                        </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}