import { useState } from "react";
import { Search, Cloud, Droplets, Wind, Thermometer } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface WeatherData {
  name: string;
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  sys: {
    country: string;
  };
}

export default function WeatherPage() {
  const [city, setCity] = useState("");
  const [searchedCity, setSearchedCity] = useState("");
  const { toast } = useToast();

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ["weather", searchedCity],
    queryFn: async () => {
      if (!searchedCity) return null;
      
      const API_KEY = "4a50788f77e213e7da212e8e9de593cf"; // Normally store this in .env
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${searchedCity}&appid=${API_KEY}&units=metric`
      );
      
      if (!response.ok) {
        throw new Error("City not found");
      }
      
      return response.json() as Promise<WeatherData>;
    },
    enabled: !!searchedCity,
  });

  const handleSearch = () => {
    if (!city.trim()) {
      toast({
        title: "Please enter a city name",
        variant: "destructive",
      });
      return;
    }
    
    setSearchedCity(city.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">Weather App</h1>
      
      <div className="flex gap-2 mb-8">
        <Input
          placeholder="Enter city name..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1"
        />
        <Button onClick={handleSearch}>
          <Search className="mr-2 h-4 w-4" /> Search
        </Button>
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4">Loading weather data...</p>
        </div>
      )}

      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6">
            <p className="text-red-600 text-center">
              {error instanceof Error ? error.message : "Failed to load weather data"}
            </p>
          </CardContent>
        </Card>
      )}

      {data && !isLoading && (
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardTitle className="text-2xl flex items-center justify-between">
              <span>
                {data.name}, {data.sys.country}
              </span>
              <span>{Math.round(data.main.temp)}°C</span>
            </CardTitle>
            <div className="flex items-center mt-2">
              <img 
                src={`https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`} 
                alt={data.weather[0].description}
                className="w-16 h-16"
              />
              <span className="text-xl capitalize">{data.weather[0].description}</span>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Thermometer className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Feels Like</p>
                  <p className="font-medium">{Math.round(data.main.feels_like)}°C</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Humidity</p>
                  <p className="font-medium">{data.main.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Wind Speed</p>
                  <p className="font-medium">{data.wind.speed} m/s</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!data && !isLoading && !error && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6 flex flex-col items-center py-12">
            <Cloud className="h-16 w-16 text-blue-400 mb-4" />
            <p className="text-center text-gray-600">
              Enter a city name to get the current weather information
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}