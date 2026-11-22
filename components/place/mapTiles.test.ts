import { describe, expect, it } from "vitest";
import { currentTheme, tileLayersFor } from "@/components/place/mapTiles";

describe("tileLayersFor", () => {
  it("uses the Esri street map (labels included, no overlay) in light theme", () => {
    const layers = tileLayersFor("light");
    expect(layers).toHaveLength(1);
    expect(layers[0].url).toBe(
      "https://services.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    );
    expect(layers[0].options.attribution).toContain("Esri");
    expect(layers[0].options.pane).toBeUndefined();
  });

  it("uses Esri dark gray base plus the reference labels overlay in dark theme", () => {
    const [base, labels] = tileLayersFor("dark");
    expect(tileLayersFor("dark")).toHaveLength(2);
    expect(base.url).toContain("/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}");
    expect(labels.url).toContain("/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}");
    expect(base.options.attribution).toContain("Esri");
    expect(labels.options.pane).toBe("overlayPane");
    expect(base.options.maxNativeZoom).toBe(16);
  });

  it("never requests satellite imagery or an API-key host", () => {
    for (const theme of ["light", "dark"] as const) {
      for (const layer of tileLayersFor(theme)) {
        expect(layer.url).toMatch(/^https:\/\/services\.arcgisonline\.com\//);
        expect(layer.url).not.toContain("World_Imagery");
        expect(layer.url).not.toMatch(/token|key=/i);
      }
    }
  });
});

describe("currentTheme", () => {
  it("reads data-theme and defaults to light", () => {
    const root = { getAttribute: (n: string) => (n === "data-theme" ? "dark" : null) } as HTMLElement;
    expect(currentTheme(root)).toBe("dark");
    const other = { getAttribute: () => null } as unknown as HTMLElement;
    expect(currentTheme(other)).toBe("light");
  });
});
