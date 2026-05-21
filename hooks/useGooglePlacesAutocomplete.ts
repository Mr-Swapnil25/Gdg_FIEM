import {useEffect, useState} from "react";

import {GooglePlacePredictionItem} from "@/lib/google-places";

type UseGooglePlacesAutocompleteOptions = {
  input: string;
  enabled?: boolean;
  includedRegionCodes?: string[];
};

export function useGooglePlacesAutocomplete({
  input,
  enabled = true,
  includedRegionCodes = ["in"],
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
        const {AutocompleteSuggestion} = (await google.maps.importLibrary(
          "places"
        )) as google.maps.PlacesLibrary;

        const {suggestions} = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input: trimmedInput,
          includedRegionCodes,
        });

        if (cancelled) return;

        setPredictions(
          suggestions
            .filter((suggestion) => suggestion.placePrediction)
            .map((suggestion, index) => ({
              key: `${suggestion.placePrediction!.text.text}-${index}`,
              description: suggestion.placePrediction!.text.text,
              placePrediction: suggestion.placePrediction!,
            }))
        );
      } catch {
        if (!cancelled) setPredictions([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [enabled, includedRegionCodes, input]);

  return {predictions, isLoading};
}
