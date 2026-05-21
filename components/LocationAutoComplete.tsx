"use client";

import {Input} from "@/components/ui/input";
import {Loading} from "@/components/shared/Loading";
import {Search} from "lucide-react";
import {useToast} from "@/components/ui/use-toast";
import {updatePlaceToVisit} from "@/lib/firebase/firestore-db";
import {
  extractPlaceCoordinates,
  fetchLegacyPlaceDetails,
  getLocalPlaceSuggestions,
  GooglePlacePredictionItem,
} from "@/lib/google-places";
import {useGooglePlacesAutocomplete} from "@/hooks/useGooglePlacesAutocomplete";
import {useGoogleMapsApi} from "@/contexts/MapProvider";
import {
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type LocationAutoCompletePropType = {
  planId: string;
  addNewPlaceToTopPlaces: (lat: number, lng: number, placeName: string) => void;
};

const FALLBACK_COORDINATES = {lat: 20.5937, lng: 78.9629};

const LocationAutoComplete = ({planId, addNewPlaceToTopPlaces}: LocationAutoCompletePropType) => {
  const [showResults, setShowResults] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const {toast} = useToast();
  const googleMapsApi = useGoogleMapsApi();
  const hasShownMapsErrorToastRef = useRef(false);

  const isKeyMissing = googleMapsApi?.isKeyMissing ?? false;
  const isTimedOut = googleMapsApi?.isTimedOut ?? false;
  const loadError = googleMapsApi?.loadError;
  const isLoaded = googleMapsApi?.isLoaded ?? false;
  const isGooglePlacesUnavailable = isKeyMissing || isTimedOut || Boolean(loadError);
  const isMapsLoading = !isGooglePlacesUnavailable && !isLoaded;
  const isAutocompleteReady = isLoaded && !isGooglePlacesUnavailable;

  const {predictions: placePredictions, isLoading: isPlacePredictionsLoading} =
    useGooglePlacesAutocomplete({
      input: searchQuery,
      enabled: isAutocompleteReady,
    });

  useEffect(() => {
    if (!isGooglePlacesUnavailable || hasShownMapsErrorToastRef.current) return;

    const description = isKeyMissing
      ? "Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY. Switching to manual destination entry."
      : isTimedOut
      ? "Google Places did not load within 3 seconds. Switching to manual destination entry."
      : `Google Places failed to load${loadError ? `: ${loadError.message}` : "."} Switching to manual destination entry.`;

    toast({
      title: "Places autocomplete unavailable",
      description,
      variant: "destructive",
    });

    hasShownMapsErrorToastRef.current = true;
  }, [isGooglePlacesUnavailable, isKeyMissing, isTimedOut, loadError, toast]);

  const handleSelectItem = async (
    event: MouseEvent<HTMLLIElement>,
    item: GooglePlacePredictionItem
  ) => {
    event.stopPropagation();
    setShowResults(false);
    setIsSaving(true);
    const {dismiss} = toast({
      description: "Adding the selected place!",
    });

    try {
      if (item.coordinates) {
        await updatePlaceToVisit(planId, {
          placeName: item.description,
          lat: item.coordinates.lat,
          lng: item.coordinates.lng,
        });
        setSearchQuery("");
        dismiss();
        addNewPlaceToTopPlaces(item.coordinates.lat, item.coordinates.lng, item.description);
        return;
      }

      if (!item.placeId) {
        throw new Error("Missing placeId for selected location");
      }

      const place = await fetchLegacyPlaceDetails(item.placeId);
      const coordinates = extractPlaceCoordinates(place.location);
      if (!coordinates) {
        throw new Error("Coordinates unavailable for selected place");
      }

      const placeName = place.name || item.description;
      await updatePlaceToVisit(planId, {
        placeName,
        lat: coordinates.lat,
        lng: coordinates.lng,
      });

      setSearchQuery("");
      dismiss();
      addNewPlaceToTopPlaces(coordinates.lat, coordinates.lng, placeName);
    } catch (error) {
      console.error("Failed to add selected place:", error);
      dismiss();
      toast({
        title: "Unable to add this place",
        description: "Please choose another suggestion or enter a destination manually.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addManualPlace = async () => {
    const trimmed = searchQuery.trim();
    if (!trimmed || isSaving) return;

    setIsSaving(true);
    const {dismiss} = toast({
      description: "Adding destination manually...",
    });

    try {
      const localSuggestion = getLocalPlaceSuggestions(trimmed)[0];
      const coordinates = localSuggestion?.coordinates ?? FALLBACK_COORDINATES;

      await updatePlaceToVisit(planId, {
        placeName: trimmed,
        lat: coordinates.lat,
        lng: coordinates.lng,
      });

      addNewPlaceToTopPlaces(coordinates.lat, coordinates.lng, trimmed);
      setSearchQuery("");
      dismiss();
    } catch (error) {
      console.error("Failed to add manual place:", error);
      dismiss();
      toast({
        title: "Unable to add destination",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
    setShowResults(Boolean(value));
  };

  const handleManualKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    void addManualPlace();
  };

  if (isGooglePlacesUnavailable) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Enter destination manually</p>
        <Input
          disabled={isSaving}
          type="text"
          className="font-light h-12"
          placeholder="Enter destination manually"
          onChange={(event) => setSearchQuery(event.target.value)}
          onKeyDown={handleManualKeyDown}
          value={searchQuery}
        />
      </div>
    );
  }

  if (isMapsLoading) {
    return (
      <div className="flex h-12 items-center rounded-md border border-dashed px-3 text-sm text-muted-foreground">
        <Loading className="mr-2 h-5 w-5" />
        <span>Loading destination autocomplete...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Input
          disabled={isSaving}
          type="text"
          className="font-light h-12"
          placeholder="Search new location"
          onChange={handleSearch}
          value={searchQuery}
          onBlur={() => setShowResults(false)}
        />
        {isPlacePredictionsLoading ? (
          <div className="absolute right-3 top-0 flex h-full items-center">
            <Loading className="h-6 w-6" />
          </div>
        ) : (
          <div className="absolute right-3 top-0 flex h-full items-center">
            <Search className="h-4 w-4" />
          </div>
        )}
      </div>

      {showResults && placePredictions.length > 0 && (
        <div
          className="absolute z-[9999] mt-2 max-h-80 w-full overflow-auto rounded-xl border border-gray-100 bg-white p-1 shadow-2xl"
          onMouseDown={(event) => event.preventDefault()}
        >
          <ul className="flex w-full flex-col gap-2" onMouseDown={(event) => event.preventDefault()}>
            {placePredictions.map((item) => (
              <li
                className="flex cursor-pointer items-center justify-between border-b border-gray-100/50 px-2 py-3 text-sm font-medium text-black hover:rounded-lg hover:bg-blue-50 hover:text-blue-600"
                onMouseDown={(event) => handleSelectItem(event, item)}
                key={item.key}
              >
                {item.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default LocationAutoComplete;
