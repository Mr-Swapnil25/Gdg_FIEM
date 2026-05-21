"use server";

import {differenceInDays} from "date-fns";
import {Client} from "@googlemaps/google-maps-services-js";

import {formSchemaType} from "@/components/NewPlanForm";
import {saveTripToFirestore} from "@/lib/firebase/firestore-db";
import {generateTripWithGemini} from "@/lib/gemini-client";

export async function generatePlanAction(formData: formSchemaType, userId: string): Promise<string | null> {
  const {placeName, activityPreferences, datesOfTravel, companion} = formData;
  const noOfDays = differenceInDays(datesOfTravel.to, datesOfTravel.from) + 1;
  
  console.log("[ACTION] Starting generatePlanAction for place:", placeName);

  try {
    const prompt = [
      `Create a ${noOfDays}-day travel itinerary for ${placeName}.`,
      "Assume the traveller is planning primarily for India unless the destination explicitly says otherwise.",
      "Use Indian regional context, INR currency, metric distances in kilometres, local transit options, realistic Indian food/activity costs, and India-friendly routing.",
    ].join(" ");

    console.log("[ACTION] Calling Gemini API with prompt...");
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
    
    console.log("[ACTION] Gemini API call completed successfully!");

    let mainImageUrl: string | null = null;
    
    // Google Maps Connection - Fetch exact coordinates for topPlacesToVisit and a main image for the plan
    const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (googleMapsApiKey) {
      console.log("[ACTION] Google Maps API key found, fetching place data...");
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
            console.log("[ACTION] Main image URL fetched successfully");
          }
        }
      } catch (e) {
        console.warn(`Failed to fetch image for place ${placeName}`, e);
      }

      console.log("[ACTION] Fetching coordinates for top places to visit...");
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
      console.log("[ACTION] Top places coordinates updated");
    }

    console.log("[ACTION] Saving trip to Firestore...");
    const planId = await saveTripToFirestore(userId, {
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

    console.log("[ACTION] Plan saved successfully with ID:", planId);
    return planId;
  } catch (error) {
    console.error("CRITICAL FETCH ERROR in generatePlanAction:", error instanceof Error ? error.message : error, error instanceof Error ? error.stack : "");
    return null; /* Important: Return null or throw custom error for the client to handle */
  } finally {
    console.log("[ACTION] generatePlanAction completed (finally block executed)");
  }
}
