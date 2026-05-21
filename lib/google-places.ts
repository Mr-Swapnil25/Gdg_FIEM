export type GooglePlacePredictionItem = {
  key: string;
  description: string;
  placeId?: string;
  coordinates?: {lat: number; lng: number};
};

export const LOCAL_PLACE_SUGGESTIONS: Array<{
  name: string;
  lat: number;
  lng: number;
}> = [
  {name: "Kolkata", lat: 22.5726, lng: 88.3639},
  {name: "Mumbai", lat: 19.076, lng: 72.8777},
  {name: "Delhi", lat: 28.6139, lng: 77.209},
  {name: "Bengaluru", lat: 12.9716, lng: 77.5946},
  {name: "Chennai", lat: 13.0827, lng: 80.2707},
  {name: "Hyderabad", lat: 17.385, lng: 78.4867},
  {name: "Pune", lat: 18.5204, lng: 73.8567},
  {name: "Ahmedabad", lat: 23.0225, lng: 72.5714},
  {name: "Jaipur", lat: 26.9124, lng: 75.7873},
  {name: "Goa", lat: 15.2993, lng: 74.124},
  {name: "Kerala", lat: 10.8505, lng: 76.2711},
  {name: "Varanasi", lat: 25.3176, lng: 82.9739},
  {name: "Srinagar", lat: 34.0837, lng: 74.7973},
  {name: "Udaipur", lat: 24.5854, lng: 73.7125},
  {name: "Mysuru", lat: 12.2958, lng: 76.6394},
  {name: "Rishikesh", lat: 30.0869, lng: 78.2676},
  {name: "Darjeeling", lat: 27.041, lng: 88.2663},
  {name: "Shimla", lat: 31.1048, lng: 77.1734},
  {name: "Kochi", lat: 9.9312, lng: 76.2673},
  {name: "Puri", lat: 19.8135, lng: 85.8312},
];

export function getLocalPlaceSuggestions(query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return [];

  return LOCAL_PLACE_SUGGESTIONS.filter((place) =>
    place.name.toLowerCase().includes(normalized)
  ).map((place, index) => ({
    key: `local-${place.name}-${index}`,
    description: place.name,
    coordinates: {lat: place.lat, lng: place.lng},
  }));
}

export function extractPlaceCoordinates(
  location: google.maps.LatLng | google.maps.LatLngLiteral | null | undefined
) {
  if (!location) return null;

  const lat = typeof location.lat === "function" ? location.lat() : location.lat;
  const lng = typeof location.lng === "function" ? location.lng() : location.lng;

  if (typeof lat !== "number" || typeof lng !== "number") return null;

  return {lat, lng};
}

export async function fetchLegacyPlaceDetails(placeId: string) {
  if (!globalThis.google?.maps?.places?.PlacesService) {
    throw new Error("Google PlacesService is not available.");
  }

  const service = new globalThis.google.maps.places.PlacesService(
    document.createElement("div")
  );

  return await new Promise<{
    name: string;
    location: google.maps.LatLng | google.maps.LatLngLiteral | null | undefined;
  }>((resolve, reject) => {
    service.getDetails(
      {
        placeId,
        fields: ["name", "geometry"],
      },
      (place, status) => {
        if (status !== google.maps.places.PlacesServiceStatus.OK || !place) {
          reject(new Error(`PlacesService.getDetails failed with status ${status}`));
          return;
        }

        resolve({
          name: place.name ?? "",
          location: place.geometry?.location,
        });
      }
    );
  });
}
