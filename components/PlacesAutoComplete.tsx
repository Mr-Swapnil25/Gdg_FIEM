"use client";

import {Input} from "@/components/ui/input";
import {Loading} from "@/components/shared/Loading";
import {useToast} from "@/components/ui/use-toast";
import {useGoogleMapsApi} from "@/contexts/MapProvider";
import {useGooglePlacesAutocomplete} from "@/hooks/useGooglePlacesAutocomplete";
import type {formSchemaType} from "@/components/NewPlanForm";
import {ControllerRenderProps, UseFormReturn} from "react-hook-form";
import {ChangeEvent, Dispatch, MouseEvent, SetStateAction, useEffect, useRef, useState} from "react";

type PlacesAutoCompleteProps = {
  selectedFromList: boolean;
  setSelectedFromList: Dispatch<SetStateAction<boolean>>;
  form: UseFormReturn<formSchemaType, any, any>;
  field: ControllerRenderProps<formSchemaType, "placeName">;
};

const PlacesAutoComplete = ({
  form,
  field,
  selectedFromList,
  setSelectedFromList,
}: PlacesAutoCompleteProps) => {
  const [showResults, setShowResults] = useState(false);
  const hasShownMapsErrorToastRef = useRef(false);
  const {toast} = useToast();
  const googleMapsApi = useGoogleMapsApi();

  const isKeyMissing = googleMapsApi?.isKeyMissing ?? false;
  const isTimedOut = googleMapsApi?.isTimedOut ?? false;
  const loadError = googleMapsApi?.loadError;
  const isLoaded = googleMapsApi?.isLoaded ?? false;
  const isMapsUnavailable = isKeyMissing || isTimedOut || Boolean(loadError);
  const isMapsLoading = !isMapsUnavailable && !isLoaded;
  const isAutocompleteReady = isLoaded && !isMapsUnavailable;

  const {predictions: placePredictions, isLoading: isPlacePredictionsLoading} =
    useGooglePlacesAutocomplete({
      input: field.value,
      enabled: isAutocompleteReady,
    });

  useEffect(() => {
    if (!isMapsUnavailable || hasShownMapsErrorToastRef.current) return;

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
  }, [isKeyMissing, isMapsUnavailable, isTimedOut, loadError, toast]);

  const isEnglish = (text: string) => /^[A-Za-z0-9\s,.-]+$/.test(text);

  const handleSelectItem = (event: MouseEvent<HTMLLIElement>, description: string) => {
    event.stopPropagation();
    form.clearErrors("placeName");
    setShowResults(false);
    setSelectedFromList(true);
    form.setValue("placeName", description, {shouldDirty: true, shouldTouch: true, shouldValidate: true});
  };

  const handleSearch = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    field.onChange(value);

    if (!value) {
      setShowResults(false);
      setSelectedFromList(false);
      return;
    }

    if (!isEnglish(value)) {
      form.setError("placeName", {
        message: "This tool supports only english as input as of now.",
        type: "custom",
      });
      setShowResults(false);
      return;
    }

    if (selectedFromList) {
      setSelectedFromList(false);
    }

    setShowResults(true);
  };

  if (isMapsUnavailable) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Enter destination manually</p>
        <Input
          type="text"
          placeholder="Enter destination manually"
          onChange={(event) => {
            setSelectedFromList(false);
            field.onChange(event.target.value);
          }}
          value={field.value}
        />
      </div>
    );
  }

  if (isMapsLoading) {
    return (
      <div className="flex h-11 items-center rounded-md border border-dashed px-3 text-sm text-muted-foreground">
        <Loading className="mr-2 h-5 w-5" />
        <span>Loading destination autocomplete...</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search for your destination city..."
          onChange={handleSearch}
          onBlur={() => setShowResults(false)}
          value={field.value}
        />
        {isPlacePredictionsLoading && (
          <div className="absolute right-3 top-0 flex h-full items-center">
            <Loading className="h-6 w-6" />
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
                onMouseDown={(event) => handleSelectItem(event, item.description)}
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

export default PlacesAutoComplete;
