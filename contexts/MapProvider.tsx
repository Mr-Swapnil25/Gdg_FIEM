"use client";

import {Libraries, useJsApiLoader} from "@react-google-maps/api";
import {ReactNode, createContext, useContext, useEffect, useMemo, useState} from "react";

import {SkeletonForTopPlacesToVisit} from "@/components/sections/TopPlacesToVisit";
import {ENV_CONFIG, isGoogleMapsApiKeyMissing} from "@/lib/env-config";

const GOOGLE_MAPS_LIBRARIES: Libraries = ["places"];
const MAPS_LOAD_TIMEOUT_MS = 3000;

type GoogleMapsApiState = {
  isLoaded: boolean;
  loadError: Error | undefined;
  isKeyMissing: boolean;
  isTimedOut: boolean;
};

const GoogleMapsApiContext = createContext<GoogleMapsApiState | null>(null);

export function GoogleMapsApiProvider({children}: {children: ReactNode}) {
  const [isTimedOut, setIsTimedOut] = useState(false);
  const isKeyMissing = isGoogleMapsApiKeyMissing();

  const {isLoaded, loadError} = useJsApiLoader({
    id: "google-maps-script",
    googleMapsApiKey: ENV_CONFIG.GOOGLE_MAPS_API_KEY ?? "",
    libraries: GOOGLE_MAPS_LIBRARIES,
  });

  useEffect(() => {
    if (isKeyMissing || loadError || isLoaded) {
      setIsTimedOut(false);
      return;
    }

    const timer = setTimeout(() => setIsTimedOut(true), MAPS_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [isKeyMissing, isLoaded, loadError]);

  const value = useMemo(
    () => ({
      isLoaded,
      loadError,
      isKeyMissing,
      isTimedOut,
    }),
    [isLoaded, loadError, isKeyMissing, isTimedOut]
  );

  return <GoogleMapsApiContext.Provider value={value}>{children}</GoogleMapsApiContext.Provider>;
}

export function useGoogleMapsApi() {
  return useContext(GoogleMapsApiContext);
}

export function MapProvider({children, isLoading}: {children: ReactNode; isLoading: boolean}) {
  const googleMapsApi = useGoogleMapsApi();

  if (!googleMapsApi) {
    return <SkeletonForTopPlacesToVisit isMaps />;
  }

  if (googleMapsApi.loadError) {
    return (
      <div className="flex h-full items-center justify-center rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
        Error loading maps. Please try again later.
      </div>
    );
  }

  if (googleMapsApi.isKeyMissing || googleMapsApi.isTimedOut) {
    return (
      <div className="flex h-full items-center justify-center rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
        Google Maps is unavailable. Enter destination manually.
      </div>
    );
  }

  if (!googleMapsApi.isLoaded || isLoading) {
    return <SkeletonForTopPlacesToVisit isMaps />;
  }

  return children;
}
