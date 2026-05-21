"use server";

import {differenceInDays} from "date-fns";
import {Client} from "@googlemaps/google-maps-services-js";

import {formSchemaType} from "@/components/NewPlanForm";
import {saveTripToFirestore} from "@/lib/firebase/firestore-db";
import {
  generateTripWithGemini,
  GeminiGenerationError,
} from "@/lib/gemini-client";
import type {GeminiGenerationErrorCode} from "@/lib/gemini-client";

type GeneratePlanActionErrorCode =
  | GeminiGenerationErrorCode
  | "PLAN_SAVE_FAILED"
  | "PLAN_GENERATION_FAILED";

export type GeneratePlanActionResult =
  | {ok: true; planId: string}
  | {ok: false; errorCode: GeneratePlanActionErrorCode; errorMessage: string};

function toErrorResult(error: unknown): Extract<GeneratePlanActionResult, {ok: false}> {
  if (error instanceof GeminiGenerationError) {
    return {
      ok: false,
      errorCode: error.code,
      errorMessage: error.message,
    };
  }

  if (error instanceof Error) {
    return {
      ok: false,
      errorCode: "PLAN_GENERATION_FAILED",
      errorMessage: error.message,
    };
  }

  return {
    ok: false,
    errorCode: "PLAN_GENERATION_FAILED",
    errorMessage: "Failed to generate AI travel plan. Please try again.",
  };
}

export async function generatePlanAction(
  formData: formSchemaType,
  userId: string
): Promise<GeneratePlanActionResult> {
  const {placeName, activityPreferences, datesOfTravel, companion} = formData;
  const noOfDays = differenceInDays(datesOfTravel.to, datesOfTravel.from) + 1;

  console.log("[generatePlanAction] [1] Starting plan generation", { placeName: formData.placeName });
  try {
    const prompt = [
      `Create a ${noOfDays}-day travel itinerary for ${placeName}.`,
      "Assume the traveller is planning primarily for India unless the destination explicitly says otherwise.",
      "Use Indian regional context, INR currency, metric distances in kilometres, local transit options, realistic Indian food/activity costs, and India-friendly routing.",
    ].join(" ");

    console.log("[generatePlanAction] [2] Sending prompt to Gemini");
    const generated = await generateTripWithGemini(prompt, {
      placeName,
      activityPreferences,
      companion,
      fromDate: datesOfTravel.from.toISOString(),
      toDate: datesOfTravel.to.toISOString(),
      currency: "INR",
      distanceUnit: "km",
      region: "IN",
    });

    let mainImageUrl: string | null = null;
    
    // Google Maps Connection - Fetch exact coordinates for topPlacesToVisit and a main image for the plan
    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (googleMapsApiKey) {
      const mapsClient = new Client({});
      
      try {
        const placeResponse = await mapsClient.textSearch({
          params: {
            query: placeName,
            key: googleMapsApiKey,
          },
          timeout: 3000,
        });

        if (placeResponse.data.results && placeResponse.data.results.length > 0) {
          const mainPlace = placeResponse.data.results[0];
          if (mainPlace.photos && mainPlace.photos.length > 0) {
            const photoReference = mainPlace.photos[0].photo_reference;
            mainImageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${googleMapsApiKey}`;
          }
        }
      } catch (e) {
        console.warn(`Failed to fetch image for place ${placeName}`, e);
      }

      console.log("[generatePlanAction] [3] Resolving topPlacesToVisit geocodes", { count: generated.topPlacesToVisit.length });
      const mappedPlacesData = await Promise.all(
        generated.topPlacesToVisit.map(async (place) => {
          try {
            const geocodeResponse = await mapsClient.textSearch({
              params: {
                query: `${place.name} in ${placeName}`,
                key: googleMapsApiKey,
              },
              timeout: 3000,
            });

            if (geocodeResponse.data.results && geocodeResponse.data.results.length > 0) {
              const exactPlace = geocodeResponse.data.results[0];
              return {
                ...place,
                coordinates: {
                  lat: exactPlace.geometry?.location.lat || place.coordinates.lat,
                  lng: exactPlace.geometry?.location.lng || place.coordinates.lng,
                },
              };
            }
          } catch (mapError) {
            console.warn(`Failed to fetch mapped location for ${place.name}`, mapError);
          }
          return place;
        })
      );
      
      generated.topPlacesToVisit = mappedPlacesData;
    }

    console.log("[generatePlanAction] [4] Saving generated plan to Firestore");
    let planId: string;
    try {
      planId = await saveTripToFirestore(userId, {
        nameoftheplace: placeName,
        userPrompt: prompt,
        noOfDays: noOfDays.toString(),
        imageUrl: mainImageUrl,
        activityPreferences,
        fromDate: datesOfTravel.from.getTime(),
        toDate: datesOfTravel.to.getTime(),
        companion,
        isGeneratedUsingAI: true,
        preferredCurrency: "INR",
        budgetCurrency: "INR",
        distanceUnit: "km",
        regionalContext: "IN",
        abouttheplace: generated.aboutThePlace,
        besttimetovisit: generated.bestTimeToVisit,
        adventuresactivitiestodo: generated.adventuresActivitiesToDo,
        localcuisinerecommendations: generated.localCuisineRecommendations,
        packingchecklist: generated.packingChecklist,
        itinerary: generated.itinerary,
        topplacestovisit: generated.topPlacesToVisit,
        contentGenerationState: {
          imagination: true,
          abouttheplace: true,
          adventuresactivitiestodo: true,
          topplacestovisit: true,
          itinerary: true,
          localcuisinerecommendations: true,
          packingchecklist: true,
          besttimetovisit: true,
        },
      });
    } catch (saveError) {
      console.error("Failed to save generated plan:", saveError);
      return {
        ok: false,
        errorCode: "PLAN_SAVE_FAILED",
        errorMessage: "Failed to save the generated travel plan.",
      };
    }

    return {ok: true, planId};
  } catch (error: any) {
    console.error("Error generating plan (CRITICAL):", error);
    return toErrorResult(error);
  } finally {
    console.log("[generatePlanAction] [FINALLY] generatePlanAction completed for", { placeName: formData.placeName });
  }
}
