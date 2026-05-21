//Since the map will be laoded and displayed on client side
"use client";

import {SkeletonForTopPlacesToVisit} from "@/components/sections/TopPlacesToVisit";
import {ENV_CONFIG} from "@/lib/env-config";
// Import necessary modules and functions from our own project
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

  console.log("[MAP] GoogleMapsApiProvider - Starting map loader");

  const {isLoaded, loadError} = useJsApiLoader({
    googleMapsApiKey,
    libraries: libraries as Libraries,
  });

  if (loadError) {
    console.error("[MAP] CRITICAL MAP LOAD ERROR:", loadError.message, loadError.stack);
  }

  if (isLoaded) {
    console.log("[MAP] Google Maps API loaded successfully");
  }

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

  console.log("[MAP] MapProvider - isLoading:", isLoading, "googleMapsApi?.isLoaded:", googleMapsApi?.isLoaded);

  // Load the Google Maps JavaScript API asynchronously
  const {isLoaded: scriptLoaded, loadError} = useJsApiLoader({
    googleMapsApiKey,
    libraries: libraries as Libraries,
  });

  // Step 3: Map Loader Verification - Handle both isLoaded and loadError states
  if (loadError || googleMapsApi?.loadError) {
    console.error("[MAP] Encountered error while loading google maps:", loadError || googleMapsApi?.loadError);
    return <div>Error loading maps: {(loadError || googleMapsApi?.loadError)?.message}</div>;
  }

  if ((!scriptLoaded || !googleMapsApi?.isLoaded) || isLoading) {
    return <SkeletonForTopPlacesToVisit isMaps />;
  }

  console.log("[MAP] Map rendering - all conditions met");

  // Return the children prop wrapped by this MapProvider component
  return children;
}
