import type { Theme } from "@/lib/theme";

const ESRI_TILES = "https://services.arcgisonline.com/ArcGIS/rest/services";

export type TileLayerSpec = {
  url: string;
  options: {
    attribution?: string;
    maxZoom: number;
    /** Last zoom with real tiles; Leaflet upscales beyond it instead of requesting blanks. */
    maxNativeZoom?: number;
    pane?: string;
  };
};

/**
 * Esri public basemap tile services (same provider and keyless usage as the previous
 * World_Imagery layer). Attribution is based on each service's `copyrightText`
 * (`<service>/MapServer?f=json`; the light string is shortened) plus "Powered by Esri", which
 * Esri asks for when its services are used through a non-Esri library (Leaflet here).
 *
 * - light: World_Street_Map, labels are baked in, real tiles to z19 at our location.
 * - dark: Canvas/World_Dark_Gray_Base (+ Reference labels overlay). The base cache ends at
 *   z16; deeper tiles are a "data not available" placeholder, hence maxNativeZoom 16.
 */
export function tileLayersFor(theme: Theme): TileLayerSpec[] {
  if (theme === "dark") {
    return [
      {
        url: `${ESRI_TILES}/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}`,
        options: {
          attribution:
            "&copy; Esri, HERE, Garmin, &copy; OpenStreetMap contributors, and the GIS user community | Powered by Esri",
          maxZoom: 19,
          maxNativeZoom: 16,
        },
      },
      {
        url: `${ESRI_TILES}/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}`,
        options: { maxZoom: 19, maxNativeZoom: 16, pane: "overlayPane" },
      },
    ];
  }

  return [
    {
      url: `${ESRI_TILES}/World_Street_Map/MapServer/tile/{z}/{y}/{x}`,
      options: {
        attribution:
          "&copy; Esri, HERE, Garmin, USGS, Intermap, INCREMENT P, NRCan, METI, &copy; OpenStreetMap contributors, and the GIS User Community | Powered by Esri",
        maxZoom: 19,
      },
    },
  ];
}

/** Current app theme: `data-theme` on <html> (set by the boot script, the toggle, and dashboards). */
export function currentTheme(root: HTMLElement = document.documentElement): Theme {
  return root.getAttribute("data-theme") === "dark" ? "dark" : "light";
}
