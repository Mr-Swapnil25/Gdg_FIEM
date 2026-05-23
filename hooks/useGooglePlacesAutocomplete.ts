import {useEffect, useState} from "react";

import {GooglePlacePredictionItem, getLocalPlaceSuggestions} from "@/lib/google-places";

const DEFAULT_INCLUDED_REGION_CODES: string[] = ["in"];

type UseGooglePlacesAutocompleteOptions = {
  input: string;
  enabled?: boolean;
  includedRegionCodes?: string[];
};

export function useGooglePlacesAutocomplete({
  input,
  enabled = true,
  includedRegionCodes = DEFAULT_INCLUDED_REGION_CODES,
}: UseGooglePlacesAutocompleteOptions) {
  const [predictions, setPredictions] = useState<GooglePlacePredictionItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const trimmedInput = input.trim();

    if (!enabled || !trimmedInput) {
      setPredictions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    void (async () => {
      try {
        console.log("[1] Starting generation flow... (Google Places Fetching suggestions)", {
          input: trimmedInput,
          includedRegionCodes,
        });

        if (!globalThis.google?.maps?.importLibrary) {
          throw new Error("Google Maps Places library is not available yet.");
        }

        const {AutocompleteSuggestion} = (await globalThis.google.maps.importLibrary(
          "places"
        )) as {
          AutocompleteSuggestion: typeof google.maps.places.AutocompleteSuggestion;
        };

        const fetchPromise = AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: trimmedInput,
          includedRegionCodes,
        });

        const timeoutPromise = new Promise<any>((_, reject) => {
          setTimeout(() => reject(new Error("Request Timed Out")), 30000);
        });

        const response = await Promise.race([fetchPromise, timeoutPromise]);

        const suggestions = response.suggestions
          .map((suggestion: any) => suggestion.placePrediction)
          .filter((prediction: any): prediction is google.maps.places.PlacePrediction => Boolean(prediction));

        console.log("[2] API responded successfully! (Google Places API responded)", {
          count: suggestions.length,
        });

        if (cancelled) return;

        setPredictions(
          suggestions.map((prediction: any, index: number) => ({
            key: `${prediction.text.text}-${index}`,
            description: prediction.text.text,
            placeId: prediction.placeId,
          }))
        );
        console.log("[3] UI state updated. (Google Places)");
      } catch (error: any) {
        console.error("CRITICAL FETCH ERROR:", error?.message, error?.stack);
        if (!cancelled) {
          const fallback = getLocalPlaceSuggestions(trimmedInput);
          console.log("[3] UI state updated. (Google Places) Local fallback suggestions", {
            count: fallback.length,
          });
          setPredictions(fallback);
        }
      } finally {
        console.log("[useGooglePlacesAutocomplete] [FINALLY] loading complete");
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, includedRegionCodes, input]);

  return {predictions, isLoading};
}
