export type MapPlace = {
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
};

function pinned(place: MapPlace): place is MapPlace & {
  latitude: number;
  longitude: number;
} {
  return place.latitude != null && place.longitude != null;
}

/** Opens the pin, or a search for the written address. */
export function googleMapsUrl(place: MapPlace): string {
  if (pinned(place)) {
    return `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address ?? "")}`;
}

export function appleMapsUrl(place: MapPlace): string {
  if (pinned(place)) {
    return `https://maps.apple.com/?ll=${place.latitude},${place.longitude}&q=${encodeURIComponent(place.address ?? "Vendndodhja")}`;
  }

  return `https://maps.apple.com/?q=${encodeURIComponent(place.address ?? "")}`;
}

/**
 * Neutral external map link for web. Uses a Google Maps search URL because it
 * works for most visitors; the pin control keeps accessibility label "Shiko lokacionin".
 */
export function mapsUrl(place: MapPlace): string {
  return googleMapsUrl(place);
}
