export type GooglePlacePredictionItem = {
  key: string;
  description: string;
  placePrediction: google.maps.places.PlacePrediction;
};

export function extractPlaceCoordinates(
  location: google.maps.LatLng | google.maps.LatLngLiteral | null | undefined
) {
  if (!location) return null;

  const lat = typeof location.lat === "function" ? location.lat() : location.lat;
  const lng = typeof location.lng === "function" ? location.lng() : location.lng;

  if (typeof lat !== "number" || typeof lng !== "number") return null;

  return {lat, lng};
}
