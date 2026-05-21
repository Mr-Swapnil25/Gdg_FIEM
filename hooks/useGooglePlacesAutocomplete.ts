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

        if (!globalThis.google?.maps?.places?.AutocompleteService) {
          throw new Error("Google Maps Places library is not available yet.");
        }

        const autocompleteService = new globalThis.google.maps.places.AutocompleteService();

        const suggestions = await new Promise<google.maps.places.AutocompletePrediction[]>((resolve, reject) => {
          autocompleteService.getPlacePredictions(
            {
              input: trimmedInput,
              componentRestrictions: {
                country: includedRegionCodes[0]?.toUpperCase() ?? "IN",
              },
            },
            (predictions, status) => {
              if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                resolve([]);
                return;
              }

              if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) {
                reject(new Error(`AutocompleteService failed with status ${status}`));
                return;
              }

              resolve(predictions);
            }
          );
        });

        console.log("[useGooglePlacesAutocomplete] [2] Legacy Places API responded", {
          count: suggestions.length,
        });

        if (cancelled) return;

        setPredictions(
          suggestions.map((prediction, index) => ({
            key: `${prediction.description}-${index}`,
            description: prediction.description,
            placeId: prediction.place_id,
          }))
        );
      } catch (error) {
        console.error("[useGooglePlacesAutocomplete] Fetch failed", error);
        if (!cancelled) {
          const fallback = getLocalPlaceSuggestions(trimmedInput);
          console.log("[useGooglePlacesAutocomplete] [3] Local fallback suggestions", {
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
