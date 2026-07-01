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
        console.log("[useGooglePlacesAutocomplete] [1] Fetching suggestions", {
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

        const response = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: trimmedInput,
          includedRegionCodes,
        });

        const suggestions = response.suggestions
          .map((suggestion) => suggestion.placePrediction)
          .filter((prediction): prediction is google.maps.places.PlacePrediction => Boolean(prediction));

        console.log("[useGooglePlacesAutocomplete] [2] API responded successfully!", {
          count: suggestions.length,
        });

        if (cancelled) return;

        setPredictions(
          suggestions.map((prediction, index) => ({
            key: `${prediction.text.text}-${index}`,
            description: prediction.text.text,
            placeId: prediction.placeId,
          }))
        );
        console.log("[useGooglePlacesAutocomplete] [3] UI state updated.");
      } catch (error) {
        console.error("CRITICAL FETCH ERROR:", (error as any)?.message, (error as any)?.stack);
        if (!cancelled) {
          const fallback = getLocalPlaceSuggestions(trimmedInput);
          console.log("[useGooglePlacesAutocomplete] [3] Local fallback suggestions", {
            count: fallback.length,
          });
          setPredictions(fallback);
        }
      } finally {
        console.log("[useGooglePlacesAutocomplete] [FINALLY] loading complete");
        setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, includedRegionCodes, input]);

  return {predictions, isLoading};
}
