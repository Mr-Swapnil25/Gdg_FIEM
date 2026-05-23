"use client";
import SectionWrapper from "@/components/sections/SectionWrapper";
import {Input} from "@/components/ui/input";
import {Skeleton} from "@/components/ui/skeleton";
import {usePlanContext} from "@/contexts/PlanContextProvider";
import {
  Cloud,
  Compass,
  Droplets,
  Eye,
  EyeOff,
  Thermometer,
  ThermometerSnowflake,
  ThermometerSun,
  Waves,
  Wind,
} from "lucide-react";
import {ReactNode, useEffect, useState} from "react";

type GoogleGeocodeResponse = {
  status: string;
  error_message?: string;
  results: Array<{
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
  }>;
};

type GoogleWeatherResponse = {
  weatherCondition?: {
    iconBaseUri?: string;
    description?: {
      text?: string;
    };
  };
  temperature?: {
    degrees?: number;
  };
  feelsLikeTemperature?: {
    degrees?: number;
  };
  currentConditionsHistory?: {
    maxTemperature?: {
      degrees?: number;
    };
    minTemperature?: {
      degrees?: number;
    };
  };
  relativeHumidity?: number;
  wind?: {
    direction?: {
      degrees?: number;
    };
    speed?: {
      value?: number;
      unit?: string;
    };
  };
  visibility?: {
    distance?: number;
    unit?: string;
  };
  airPressure?: {
    meanSeaLevelMillibars?: number;
  };
};

type WeatherViewModel = {
  placeName: string;
  iconUrl?: string;
  weatherDescription: string;
  temperature: number;
  windSpeed: number;
  windUnit: string;
  windDirection: number;
  humidity: number;
  maxTemperature: number;
  minTemperature: number;
  feelsLikeTemperature: number;
  visibility: number;
  visibilityUnit: string;
  seaLevel?: number;
};

const Weather = ({placeName}: {placeName: string | undefined}) => {
  const {setPlanState} = usePlanContext();
  const [weatherData, setWeatherData] = useState<WeatherViewModel | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!placeName) return;

    let cancelled = false;

    const weatherApiKey =
      process.env.NEXT_PUBLIC_GOOGLE_WEATHER_API_KEY ?? process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;
    const mapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!weatherApiKey) {
      setErrorMessage("Missing Google Weather API key.");
      setPlanState((state) => ({...state, weather: true}));
      return;
    }

    if (!mapsApiKey) {
      setErrorMessage("Missing Google Maps API key for weather lookup.");
      setPlanState((state) => ({...state, weather: true}));
      return;
    }

    setWeatherData(null);
    setErrorMessage(null);

    const resolveLocation = async () => {
      const geocodeQueries = [placeName, `${placeName}, India`];

      for (const query of geocodeQueries) {
        if (globalThis.google?.maps?.Geocoder) {
          const geocoder = new globalThis.google.maps.Geocoder();
          const geocodeData = await geocoder.geocode({address: query});

          if (geocodeData.results.length > 0) {
            return {
              formatted_address: geocodeData.results[0].formatted_address ?? query,
              geometry: {
                location: {
                  lat: geocodeData.results[0].geometry.location.lat(),
                  lng: geocodeData.results[0].geometry.location.lng(),
                },
              },
            };
          }
          continue;
        }

        const geocodeResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            query
          )}&key=${mapsApiKey}`
        );
        const geocodeData = (await geocodeResponse.json()) as GoogleGeocodeResponse;

        if (geocodeData.status === "OK" && geocodeData.results.length > 0) {
          return geocodeData.results[0];
        }
      }

      throw new Error(`Could not resolve coordinates for ${placeName}.`);
    };

    const loadWeather = async () => {
      console.log("[1] Starting generation flow... (Weather)");
      try {
        const resolvedPlace = await resolveLocation();
        const {lat, lng} = resolvedPlace.geometry.location;

        const fetchPromise = fetch(
          `https://weather.googleapis.com/v1/currentConditions:lookup?key=${weatherApiKey}&location.latitude=${lat}&location.longitude=${lng}&unitsSystem=METRIC`
        );
        const timeoutPromise = new Promise<Response>((_, reject) => {
          setTimeout(() => reject(new Error("Request Timed Out")), 30000);
        });

        const weatherResponse = await Promise.race([fetchPromise, timeoutPromise]);

        const weatherData = (await weatherResponse.json()) as GoogleWeatherResponse;

        if (!weatherResponse.ok) {
          throw new Error("Google Weather API request failed.");
        }

        console.log("[2] API responded successfully! (Weather)");

        if (cancelled) return;

        setWeatherData({
          placeName: resolvedPlace.formatted_address ?? placeName,
          iconUrl: weatherData.weatherCondition?.iconBaseUri
            ? `${weatherData.weatherCondition.iconBaseUri}.svg`
            : undefined,
          weatherDescription:
            weatherData.weatherCondition?.description?.text ?? "Weather unavailable",
          temperature: weatherData.temperature?.degrees ?? 0,
          windSpeed: weatherData.wind?.speed?.value ?? 0,
          windUnit: formatWindUnit(weatherData.wind?.speed?.unit),
          windDirection: weatherData.wind?.direction?.degrees ?? 0,
          humidity: weatherData.relativeHumidity ?? 0,
          maxTemperature:
            weatherData.currentConditionsHistory?.maxTemperature?.degrees ??
            weatherData.temperature?.degrees ??
            0,
          minTemperature:
            weatherData.currentConditionsHistory?.minTemperature?.degrees ??
            weatherData.temperature?.degrees ??
            0,
          feelsLikeTemperature:
            weatherData.feelsLikeTemperature?.degrees ?? weatherData.temperature?.degrees ?? 0,
          visibility: weatherData.visibility?.distance ?? 0,
          visibilityUnit: formatDistanceUnit(weatherData.visibility?.unit),
          seaLevel: weatherData.airPressure?.meanSeaLevelMillibars,
        });
        console.log("[3] UI state updated. (Weather)");
      } catch (error: any) {
        console.error("CRITICAL FETCH ERROR:", error?.message, error?.stack);
        if (!cancelled) {
          setWeatherData(null);
          setErrorMessage(`Error loading weather information for ${placeName}`);
        }
      } finally {
        if (!cancelled) {
          setPlanState((state) => ({...state, weather: true}));
        }
      }
    };

    void loadWeather();

    return () => {
      cancelled = true;
    };
  }, [placeName, setPlanState]);

  return (
    <SectionWrapper id="weather">
      <h2 className="mb-2 text-lg font-semibold tracking-wide flex items-center">
        <Cloud className="mr-2" /> Weather
      </h2>
      {errorMessage ? (
        <p className="ml-8">{errorMessage}</p>
      ) : !weatherData ? (
        <WeatherLoadingSkeleton />
      ) : (
        <div className="grid md:grid-cols-2 auto-rows-auto grid-cols-1 grid-flow-row justify-center items-center min-h-[100px] gap-5">
          <WeatherTile>
            <Temperature
              placeName={weatherData.placeName}
              iconUrl={weatherData.iconUrl}
              weatherDesc={weatherData.weatherDescription}
              temp={weatherData.temperature}
            />
          </WeatherTile>
          <WeatherTile>
            <WindDeatils
              speed={weatherData.windSpeed}
              deg={weatherData.windDirection}
              speedUnit={weatherData.windUnit}
            />
          </WeatherTile>
          <WeatherTile>
            <TempHumdityDetails weatherData={weatherData} />
          </WeatherTile>
          <WeatherTile>
            <VisibilityDetails
              visibility={weatherData.visibility}
              visibilityUnit={weatherData.visibilityUnit}
            />
          </WeatherTile>
        </div>
      )}
    </SectionWrapper>
  );
};

const WeatherTile = ({children}: {children: ReactNode}) => {
  return (
    <div
      className="min-h-[184px] rounded-xl flex-grow 
                    w-full h-full flex flex-col justify-center items-center
                    p-5 shadow-md dark:border dark:border-border"
    >
      {children}
    </div>
  );
};

const Temperature = ({
  placeName,
  iconUrl,
  weatherDesc,
  temp,
}: {
  placeName: string;
  iconUrl?: string;
  weatherDesc: string;
  temp: number;
}) => {
  return (
    <>
      <div className="flex justify-center items-center">
        <span>{placeName}</span>
      </div>
      <div className="flex justify-center items-center gap-1">
        {iconUrl ? <img alt="weather icon" className="h-24 w-24" src={iconUrl} /> : null}
        <span className="text-4xl font-semibold">{Math.round(temp)}°</span>
      </div>
      <span className="capitalize text-muted-foreground text-sm">{weatherDesc}</span>
    </>
  );
};

const VisibilityDetails = ({
  visibility,
  visibilityUnit,
}: {
  visibility: number;
  visibilityUnit: string;
}) => {
  return (
    <>
      <div className="flex justify-center items-center">
        <span>Visibility</span>
      </div>
      <Input
        type="range"
        max={10000}
        value={visibility}
        onChange={(e) => {}}
        className="p-0 text-background bg-background accent-foreground"
        readOnly
      />
      <div className="flex justify-between items-center w-full">
        <EyeOff />
        {visibility} {visibilityUnit}
        <Eye />
      </div>
    </>
  );
};

const TempHumdityDetails = ({weatherData}: {weatherData: WeatherViewModel}) => {
  return (
    <>
      <div className="flex gap-2 justify-between w-full">
        <div className="flex items-center gap-1">
          <Droplets className="h-4 w-4" />
          <span>Humidity</span>
        </div>
        <span>{Math.round(weatherData.humidity)}%</span>
      </div>
      <div className="flex gap-2 justify-between w-full">
        <div className="flex items-center gap-1">
          <ThermometerSun className="h-4 w-4" />
          <span>Max Temperature</span>
        </div>
        <span>{Math.round(weatherData.maxTemperature)}°</span>
      </div>
      <div className="flex gap-2 justify-between w-full">
        <div className="flex items-center gap-1">
          <ThermometerSnowflake className="h-4 w-4" />
          <span>Min Temperature</span>
        </div>
        <span>{Math.round(weatherData.minTemperature)}°</span>
      </div>
      <div className="flex gap-2 justify-between w-full">
        <div className="flex items-center gap-1">
          <Thermometer className="h-4 w-4" />
          <span>Feels like</span>
        </div>
        <span>{Math.round(weatherData.feelsLikeTemperature)}°</span>
      </div>
      {weatherData?.seaLevel !== undefined && (
        <div className="flex gap-2 justify-between w-full">
          <div className="flex items-center gap-1">
            <Waves className="h-4 w-4" />
            <span>Sea Level</span>
          </div>
          <span>{Math.round(weatherData.seaLevel)} hPa</span>
        </div>
      )}
    </>
  );
};

const WindDeatils = ({
  speed,
  deg,
  speedUnit,
}: {
  speed: number;
  deg: number;
  speedUnit: string;
}) => {
  return (
    <div className="flex gap-5 justify-center items-center">
      <svg className="" height="100px" width="100px" version="1.1" viewBox="0 0 512 512">
        <path
          fill="#38A287"
          d="M256.001,451.314c-88.826,0-172.898,20.338-247.828,56.597h495.655
	C428.899,471.652,344.827,451.314,256.001,451.314z"
          opacity="1"
        ></path>
        <circle fill="#9CA9A4" cx="255.999" cy="130.308" r="16.34" opacity="1"></circle>
        <path
          className="fill-current text-black dark:text-white"
          d="M352.671,311.112c-3.908,2.256-5.246,7.253-2.99,11.16c1.513,2.621,4.259,4.086,7.083,4.086
	c1.387,0,2.792-0.353,4.077-1.096l53.116-30.666l53.116,30.666c1.288,0.743,2.692,1.096,4.077,1.096c2.824,0,5.57-1.465,7.083-4.086
	c2.256-3.908,0.917-8.904-2.99-11.16l-53.116-30.666v-61.333c0-4.512-3.657-8.17-8.17-8.17c-4.513,0-8.17,3.658-8.17,8.17v61.333
	L352.671,311.112z"
          opacity="1"
        >
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="0 415 285"
            to="360 415 285"
            dur="1.4836795252225519s"
            repeatCount="indefinite"
          ></animateTransform>
        </path>
        <path
          className="fill-current text-black dark:text-white"
          d="M40.852,326.359c1.386,0,2.792-0.353,4.077-1.096l53.116-30.666l53.116,30.666c1.288,0.743,2.692,1.096,4.077,1.096
	c2.824,0,5.57-1.465,7.083-4.086c2.256-3.908,0.917-8.904-2.99-11.16l-53.116-30.666v-61.333c0-4.512-3.657-8.17-8.17-8.17
	c-4.513,0-8.17,3.658-8.17,8.17v61.333l-53.116,30.666c-3.908,2.256-5.246,7.253-2.99,11.16
	C35.282,324.894,38.028,326.359,40.852,326.359z"
          opacity="1"
        >
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="0 98 289"
            to="360 98 289"
            dur="1.4836795252225519s"
            repeatCount="indefinite"
          ></animateTransform>
        </path>
        <path
          className="fill-current text-black dark:text-white"
          d="M151.884,196.691c1.386,0,2.792-0.353,4.077-1.096l84.129-48.571c4.284,3.668,9.841,5.89,15.911,5.89
	c6.069,0,11.627-2.222,15.911-5.89l84.129,48.571c1.288,0.743,2.692,1.096,4.077,1.096c2.824,0,5.57-1.465,7.083-4.086
	c2.256-3.908,0.917-8.904-2.99-11.16l-84.117-48.564c0.269-1.452,0.417-2.947,0.417-4.476c0-10.651-6.831-19.733-16.34-23.105V8.171
	c0-4.512-3.657-8.17-8.17-8.17c-4.513,0-8.17,3.658-8.17,8.17v97.128c-9.51,3.373-16.34,12.455-16.34,23.105
	c0,1.529,0.148,3.024,0.417,4.476l-84.117,48.564c-3.908,2.256-5.246,7.253-2.99,11.16
	C146.313,195.226,149.06,196.691,151.884,196.691z M256.001,120.234c4.506,0,8.17,3.666,8.17,8.17s-3.665,8.17-8.17,8.17
	c-4.506,0-8.17-3.666-8.17-8.17C247.831,123.899,251.495,120.234,256.001,120.234z"
          opacity="1"
        >
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="0 256 129"
            to="360 256 129"
            dur="1.4836795252225519s"
            repeatCount="indefinite"
          ></animateTransform>
        </path>
        <path
          className="fill-current text-black dark:text-white"
          d="M507.387,496.472c-27.727-13.418-56.183-24.494-85.26-33.23V317.844c0-4.512-3.657-8.17-8.17-8.17s-8.17,3.658-8.17,8.17
	v140.757c-45.858-12.293-93.193-18.827-141.616-19.485V177.425c0-4.512-3.657-8.17-8.17-8.17s-8.17,3.658-8.17,8.17v261.691
	c-48.423,0.659-95.757,7.193-141.616,19.485V317.844c0-4.512-3.657-8.17-8.17-8.17s-8.17,3.658-8.17,8.17v145.399
	c-29.076,8.736-57.532,19.812-85.26,33.23c-4.061,1.965-5.762,6.851-3.795,10.913c1.966,4.062,6.851,5.762,10.913,3.795
	c28.438-13.761,57.665-24.995,87.558-33.685c0.711-0.109,1.393-0.304,2.032-0.584c49.888-14.296,101.627-21.513,154.679-21.513
	c53.051,0,104.79,7.217,154.678,21.513c0.639,0.28,1.322,0.476,2.034,0.585c29.894,8.69,59.12,19.923,87.557,33.684
	c1.147,0.554,2.358,0.818,3.552,0.818c3.035,0,5.95-1.698,7.361-4.613C513.148,503.323,511.449,498.437,507.387,496.472z"
          opacity="1"
        ></path>
      </svg>
      <div className="flex items-start justify-center gap-5 flex-col">
        <div className="flex justify-center items-center gap-1">
          <Wind className="h-5 w-5" />
          <span className="text-sm">Wind Speed: {speed} {speedUnit}</span>
        </div>
        <div className="flex justify-center items-center gap-1">
          <Compass className="h-5 w-5" />
          <span className="text-sm">Wind Direction: {deg}°</span>
        </div>
      </div>
    </div>
  );
};

const WeatherLoadingSkeleton = () => {
  return (
    <div className="grid md:grid-cols-2 grid-cols-1 grid-flow-row justify-center items-center min-h-[100px] gap-5">
      {Array.from({length: 4}).map((_, i) => (
        <div
          key={i}
          className="rounded-xl w-full h-full flex flex-col justify-center items-center p-5 shadow-md"
        >
          <Skeleton />
        </div>
      ))}
    </div>
  );
};

export default Weather;

function formatWindUnit(unit?: string) {
  switch (unit) {
    case "KILOMETERS_PER_HOUR":
      return "km/h";
    case "MILES_PER_HOUR":
      return "mph";
    case "METERS_PER_SECOND":
      return "m/s";
    case "KNOTS":
      return "knots";
    default:
      return "km/h";
  }
}

function formatDistanceUnit(unit?: string) {
  switch (unit) {
    case "KILOMETERS":
      return "km";
    case "MILES":
      return "miles";
    default:
      return "km";
  }
}
