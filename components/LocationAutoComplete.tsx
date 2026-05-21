"use client";
import {Input} from "@/components/ui/input";
import {ChangeEvent, MouseEvent, useEffect, useRef, useState} from "react";
import {Loading} from "@/components/shared/Loading";
import {Search} from "lucide-react";
import {useToast} from "@/components/ui/use-toast";
import {updatePlaceToVisit} from "@/lib/firebase/firestore-db";
import {
  extractPlaceCoordinates,
  fetchLegacyPlaceDetails,
  GooglePlacePredictionItem,
} from "@/lib/google-places";
import {useGooglePlacesAutocomplete} from "@/hooks/useGooglePlacesAutocomplete";
import {useGoogleMapsApi} from "@/contexts/MapProvider";

type LocationAutoCompletePropType = {
  planId: string;
  addNewPlaceToTopPlaces: (lat: number, lng: number, placeName: string) => void;
};

const LocationAutoComplete = ({planId, addNewPlaceToTopPlaces}: LocationAutoCompletePropType) => {
  const [showResults, setShowResults] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const {toast} = useToast();
  const googleMapsApi = useGoogleMapsApi();
  const hasShownMapsErrorToastRef = useRef(false);

  const [searchQuery, setSearchQuery] = useState("");

  const {predictions: placePredictions, isLoading: isPlacePredictionsLoading} =
    useGooglePlacesAutocomplete({input: searchQuery});

  const isGooglePlacesUnavailable = Boolean(
    googleMapsApi?.isKeyMissing || googleMapsApi?.loadError || googleMapsApi?.isTimedOut
  );

  useEffect(() => {
    if (!isGooglePlacesUnavailable || hasShownMapsErrorToastRef.current) return;

    const description = googleMapsApi?.isKeyMissing
      ? "Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY. Using local destination suggestions."
      : googleMapsApi?.isTimedOut
      ? "Google Places did not load within 3 seconds. Using local destination suggestions."
      : `Google Places failed to load${
          googleMapsApi?.loadError ? `: ${googleMapsApi.loadError.message}` : "."
        } Using local destination suggestions.`;

    toast({
      title: "Places autocomplete unavailable",
      description,
      variant: "destructive",
    });

    hasShownMapsErrorToastRef.current = true;
  }, [googleMapsApi, isGooglePlacesUnavailable, toast]);

  const hadleSelectItem = async (
    e: MouseEvent<HTMLLIElement>,
    item: GooglePlacePredictionItem
  ) => {
    e.stopPropagation();
    setShowResults(false);
    setIsSaving(true);
    const {dismiss} = toast({
      description: `Adding the selected place!`,
    });

    try {
      console.log("[LocationAutoComplete] [1] Fetching selected place details", {
        placeId: item.placeId,
        placeDescription: item.description,
      });

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

      if (!coordinates || !place.name) return;

      await updatePlaceToVisit(planId, {
        placeName: place.name || item.description,
        lat: coordinates.lat,
        lng: coordinates.lng,
      });

      setSearchQuery("");
      dismiss();
      addNewPlaceToTopPlaces(coordinates.lat, coordinates.lng, place.name || item.description);
    } catch (error) {
      console.error("Failed to add selected place:", error);
      dismiss();
      toast({
        title: "Unable to add this place",
        description: "Please choose another suggestion or verify your Maps API setup.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowResults(Boolean(value));
  };

  return (
    <div className="relative">
      <div className="relative ">
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
          <div className="absolute right-3 top-0 h-full flex items-center">
            <Loading className="w-6 h-6" />
          </div>
        ) : (
          <div className="absolute right-3 top-0 h-full flex items-center">
            <Search className="w-4 h-4" />
          </div>
        )}
      </div>
      {showResults && (
        <div
          className="absolute w-full
        mt-2 shadow-2xl rounded-xl p-1 bg-white border border-gray-100 max-h-80 overflow-auto
        z-[9999]"
          onMouseDown={(e) => e.preventDefault()}
        >
          <ul className="w-full flex flex-col gap-2" onMouseDown={(e) => e.preventDefault()}>
            {placePredictions.map((item) => (
              <li
                className="cursor-pointer
                border-b border-gray-100/50 
                flex justify-between items-center text-black font-medium
                hover:bg-blue-50 hover:text-blue-600 hover:rounded-lg
                px-2 py-3 text-sm"
                onMouseDown={(e) => hadleSelectItem(e, item)}
                key={item.key}
              >
                {item.description}
              </li>
            ))}
          </ul>
        </div>
      )}
      {isGooglePlacesUnavailable && (
        <p className="pt-2 text-xs text-muted-foreground">
          Google Places is unavailable. Showing local fallback suggestions only.
        </p>
      )}
    </div>
  );
};

export default LocationAutoComplete;
