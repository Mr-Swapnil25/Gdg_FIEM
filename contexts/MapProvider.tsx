//Since the map will be laoded and displayed on client side
"use client";

import {SkeletonForTopPlacesToVisit} from "@/components/sections/TopPlacesToVisit";
import {ENV_CONFIG} from "@/lib/env-config";
// Import necessary modules and functions from external libraries and our own project
import {Libraries, useJsApiLoader} from "@react-google-maps/api";
import {ReactNode, createContext, useContext} from "react";

// Define a list of libraries to load from the Google Maps API
const libraries = ["places", "drawing", "geometry"];

type GoogleMapsApiState = {
  isLoaded: boolean;
  loadError: Error | undefined;
};

const GoogleMapsApiContext = createContext<GoogleMapsApiState | null>(null);

export function GoogleMapsApiProvider({children}: {children: ReactNode}) {
  const googleMapsApiKey = ENV_CONFIG.GOOGLE_MAPS_API_KEY;

  const {isLoaded, loadError} = useJsApiLoader({
    googleMapsApiKey,
    libraries: libraries as Libraries,
  });

  return (
    <GoogleMapsApiContext.Provider
      value={{
        isLoaded,
        loadError,
      }}
    >
      {children}
    </GoogleMapsApiContext.Provider>
  );
}

export function useGoogleMapsApi() {
  return useContext(GoogleMapsApiContext);
}

// Define a function component called MapProvider that takes a children prop
export function MapProvider({children, isLoading}: {children: ReactNode; isLoading: boolean}) {
  const googleMapsApiKey = ENV_CONFIG.GOOGLE_MAPS_API_KEY;
  const googleMapsApi = useGoogleMapsApi();

  // Load the Google Maps JavaScript API asynchronously
  const {isLoaded: scriptLoaded, loadError} = useJsApiLoader({
    googleMapsApiKey,
    libraries: libraries as Libraries,
  });

  if (loadError || googleMapsApi?.loadError) return <div>Error loading maps: {loadError?.message || googleMapsApi?.loadError?.message}</div>;

  if (!scriptLoaded || !googleMapsApi?.isLoaded || isLoading) return <div>Loading Maps...</div>;

  // Return the children prop wrapped by this MapProvider component
  return children;
}
