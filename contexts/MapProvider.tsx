//Since the map will be laoded and displayed on client side
"use client";

import {SkeletonForTopPlacesToVisit} from "@/components/sections/TopPlacesToVisit";
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
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const {isLoaded, loadError} = useJsApiLoader({
    googleMapsApiKey: googleMapsApiKey ?? "",
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
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const googleMapsApi = useGoogleMapsApi();

  // Load the Google Maps JavaScript API asynchronously
  const {isLoaded: scriptLoaded, loadError} = useJsApiLoader({
    googleMapsApiKey: googleMapsApiKey ?? "",
    libraries: libraries as Libraries,
  });

  if (!googleMapsApiKey) return <p>Missing Google Maps API key</p>;

  if (loadError || googleMapsApi?.loadError) return <p>Encountered error while loading google maps</p>;

  if ((!scriptLoaded || !googleMapsApi?.isLoaded) || isLoading) return <SkeletonForTopPlacesToVisit isMaps />;

  // Return the children prop wrapped by this MapProvider component
  return children;
}
