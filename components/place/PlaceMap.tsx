"use client";

import { useEffect, useRef } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";
import "leaflet/dist/leaflet.css";

const FALLBACK = { latitude: 42.6629, longitude: 21.1655 };

type PlaceMapProps = {
  latitude: number | null;
  longitude: number | null;
  label: string;
  interactive?: boolean;
  onPick?: (latitude: number, longitude: number) => void;
};

export function PlaceMap({
  latitude,
  longitude,
  label,
  interactive = false,
  onPick,
}: PlaceMapProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const pointRef = useRef({ latitude, longitude });
  const onPickRef = useRef(onPick);

  useEffect(() => {
    pointRef.current = { latitude, longitude };
    onPickRef.current = onPick;
  }, [latitude, longitude, onPick]);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) {
      return;
    }

    let cancelled = false;

    void (async () => {
      const L = await import("leaflet");
      if (cancelled || nodeRef.current == null) {
        return;
      }

      const start = pointRef.current;
      const hasPin = start.latitude != null && start.longitude != null;
      const lat = start.latitude ?? FALLBACK.latitude;
      const lng = start.longitude ?? FALLBACK.longitude;

      const map = L.map(node, {
        scrollWheelZoom: false,
      }).setView([lat, lng], hasPin ? 16 : 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const icon = L.divIcon({
        className: "place-pin",
        html: '<span class="place-pin__mark"></span>',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      const marker = L.marker([lat, lng], {
        icon,
        draggable: interactive,
        title: label,
        opacity: hasPin ? 1 : 0,
      }).addTo(map);

      marker.on("dragend", () => {
        const next = marker.getLatLng();
        marker.setOpacity(1);
        onPickRef.current?.(next.lat, next.lng);
      });

      if (interactive) {
        map.on("click", (event) => {
          marker.setLatLng(event.latlng);
          marker.setOpacity(1);
          onPickRef.current?.(event.latlng.lat, event.latlng.lng);
        });
      }

      mapRef.current = map;
      markerRef.current = marker;
      window.setTimeout(() => map.invalidateSize(), 50);
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [interactive, label]);

  useEffect(() => {
    const map = mapRef.current;
    const marker = markerRef.current;
    if (!map || !marker || latitude == null || longitude == null) {
      return;
    }

    marker.setLatLng([latitude, longitude]);
    marker.setOpacity(1);
    map.panTo([latitude, longitude]);
    if (map.getZoom() < 15) {
      map.setZoom(16);
    }
  }, [latitude, longitude]);

  return (
    <div
      ref={nodeRef}
      className="place-map"
      role="img"
      aria-label={label}
    />
  );
}
