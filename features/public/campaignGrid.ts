/**
 * Flyer card grid. The "card" layout is horizontal (image + text), so three columns only fit
 * from xl: at lg (1024px) a column is ~309px and the 15rem image would leave ~70px for text.
 * At xl the frame is capped at max-w-7xl (1216px content), so a column is ~394px and the
 * image shrinks to 11rem (see CARD_COLUMNS) to keep ~178px for the copy.
 */
export const CAMPAIGN_GRID_COLUMNS = "grid-cols-1 sm:grid-cols-2 xl:grid-cols-3";

export const CAMPAIGN_GRID_CLASS = `m-0 grid list-none gap-4 p-0 ${CAMPAIGN_GRID_COLUMNS}`;

/** Image column of the "card" layout: 15rem from sm, 11rem once the grid is three-up. */
export const CAMPAIGN_CARD_COLUMNS =
  "grid-cols-[9.5rem_minmax(0,1fr)] sm:grid-cols-[15rem_minmax(0,1fr)] xl:grid-cols-[11rem_minmax(0,1fr)]";

/** Rendered image width: 38vw on phones, 240px for 1-2 columns, 176px (11rem) three-up. */
export const CAMPAIGN_CARD_IMAGE_SIZES = "(max-width: 640px) 38vw, (max-width: 1279px) 240px, 176px";
