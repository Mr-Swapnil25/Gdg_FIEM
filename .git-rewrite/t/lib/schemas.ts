export const TripItinerarySchema = {
  type: "object",
  properties: {
    aboutThePlace: { type: "string", description: "About the place in at least 50 words" },
    bestTimeToVisit: { type: "string", description: "Best time to visit" },

    adventuresActivitiesToDo: {
      type: "array",
      description: "Top adventure activities, at least 5, each as a string with location",
      items: { type: "string" },
    },
    localCuisineRecommendations: {
      type: "array",
      description: "Local cuisine recommendations",
      items: { type: "string" },
    },
    packingChecklist: {
      type: "array",
      description: "Packing checklist items",
      items: { type: "string" },
    },

    itinerary: {
      type: "array",
      description: "Itinerary for the specified number of days",
      items: {
        type: "object",
        properties: {
          title: { type: "string" },
          activities: {
            type: "object",
            properties: {
              morning: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    itineraryItem: { type: "string" },
                    briefDescription: { type: "string" },
                  },
                  required: ["itineraryItem", "briefDescription"],
                },
              },
              afternoon: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    itineraryItem: { type: "string" },
                    briefDescription: { type: "string" },
                  },
                  required: ["itineraryItem", "briefDescription"],
                },
              },
              evening: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    itineraryItem: { type: "string" },
                    briefDescription: { type: "string" },
                  },
                  required: ["itineraryItem", "briefDescription"],
                },
              },
            },
            required: ["morning", "afternoon", "evening"],
          },
        },
        required: ["title", "activities"],
      },
    },

    topPlacesToVisit: {
      type: "array",
      description: "Top places to visit with coordinates",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          coordinates: {
            type: "object",
            properties: {
              lat: { type: "number" },
              lng: { type: "number" },
            },
            required: ["lat", "lng"],
          },
        },
        required: ["name", "coordinates"],
      },
    },
  },
  required: [
    "aboutThePlace",
    "bestTimeToVisit",
    "adventuresActivitiesToDo",
    "localCuisineRecommendations",
    "packingChecklist",
    "itinerary",
    "topPlacesToVisit",
  ],
} as const;

// TypeScript interfaces matching the schema for strict typing
export interface ItineraryItem {
  itineraryItem: string;
  briefDescription: string;
}

export interface DayActivities {
  morning: ItineraryItem[];
  afternoon: ItineraryItem[];
  evening: ItineraryItem[];
}

export interface ItineraryDay {
  title: string;
  activities: DayActivities;
}

export interface TopPlace {
  name: string;
  coordinates: { lat: number; lng: number };
}

export interface TripItinerary {
  aboutThePlace: string;
  bestTimeToVisit: string;

  adventuresActivitiesToDo: string[];
  localCuisineRecommendations: string[];
  packingChecklist: string[];

  itinerary: ItineraryDay[];
  topPlacesToVisit: TopPlace[];
}

export default TripItinerarySchema;
