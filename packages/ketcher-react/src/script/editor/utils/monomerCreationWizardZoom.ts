type MonomerCreationWizardZoomConfig = {
  minZoom: number;
  maxZoom: number;
  defaultZoom: number;
  viewportFillRatio: number;
  roundingStepsPer100Percent: number;
};

type StructBoundingBox = {
  min: { x: number; y: number };
  max: { x: number; y: number };
};

type MonomerCreationWizardZoomInput = {
  // Bounding box of the structure in Ketcher's model units.
  structBoundingBox: StructBoundingBox;
  // Pixels per model unit at 100% zoom.
  microModeScale: number;
  // Available viewport size in pixels.
  viewportWidth: number;
  viewportHeight: number;
  // Current zoom level (1 = 100%).
  currentZoom: number;
};

/**
 * Creates the zoom calculator used when a structure is loaded into the
 * monomer creation wizard (epam/ketcher#11416).
 *
 * The defaults come from the issue requirements. They can be overridden,
 * e.g. in tests.
 */
export const createMonomerCreationWizardZoomCalculator = (
  config: Partial<MonomerCreationWizardZoomConfig> = {},
) => {
  const {
    // The calculated zoom is never lower than 50%. If the structure does not
    // fit even at 50%, that is accepted.
    minZoom = 0.5,
    // The calculated zoom is never higher than 200%. A small structure may
    // still take up less than half of the viewport at 200%, that is accepted.
    maxZoom = 2,
    // 100%: when choosing between two zoom levels, the one closer to this
    // value wins.
    defaultZoom = 1,
    // The structure should take up at least this part of the viewport,
    // horizontally or vertically.
    viewportFillRatio = 0.5,
    // The zoom is rounded to the nearest multiple of 10%.
    // Multiplying and dividing by 10 avoids floating point errors that
    // rounding with a 0.1 step would cause (e.g. 18 * 0.1 = 1.8000000000000003).
    roundingStepsPer100Percent = 10,
  } = config;

  /**
   * Returns the zoom level to use for the structure in the wizard.
   *
   * The zoom is only changed when the structure, at the current zoom:
   * - is outside of the viewport (wider or taller than it), or
   * - takes up less than half of the viewport both horizontally and
   *   vertically.
   * Otherwise the current zoom is kept, even if it is above maxZoom
   * (e.g. a structure that fits well at 300% stays at 300%).
   */
  return ({
    structBoundingBox,
    microModeScale,
    viewportWidth,
    viewportHeight,
    currentZoom,
  }: MonomerCreationWizardZoomInput): number => {
    // Structure size in pixels at 100% zoom (model units -> pixels).
    const structWidth =
      (structBoundingBox.max.x - structBoundingBox.min.x) * microModeScale;
    const structHeight =
      (structBoundingBox.max.y - structBoundingBox.min.y) * microModeScale;

    // Structure size on the screen at the current zoom.
    const width = structWidth * currentZoom;
    const height = structHeight * currentZoom;

    // The size the structure has to reach in at least one direction.
    const minFilledWidth = viewportWidth * viewportFillRatio;
    const minFilledHeight = viewportHeight * viewportFillRatio;

    const isOutsideViewport = width > viewportWidth || height > viewportHeight;
    const isTooSmall = width < minFilledWidth && height < minFilledHeight;

    // The structure fits and is big enough: leave the zoom as it is.
    if (!isOutsideViewport && !isTooSmall) {
      return currentZoom;
    }

    // Candidate zoom levels: the zoom at which the structure takes up exactly
    // half of the viewport horizontally, and the same vertically.
    // They depend only on the structure size at 100% and the viewport size,
    // not on the current zoom.
    // A size of 0 (e.g. a horizontal line has no height) gives Infinity,
    // so that direction is never chosen unless both are Infinity
    // (a single atom), in which case the result is capped at maxZoom.
    const zoomToFillWidth = minFilledWidth / structWidth;
    const zoomToFillHeight = minFilledHeight / structHeight;

    // The candidate closer to 100% wins. On a tie, the vertical one is used.
    const targetZoom =
      Math.abs(zoomToFillWidth - defaultZoom) <
      Math.abs(zoomToFillHeight - defaultZoom)
        ? zoomToFillWidth
        : zoomToFillHeight;

    // Round to the nearest 10% (1.83 -> 1.8). Rounding up may make a structure
    // that barely fits go slightly outside the viewport; that is accepted.
    const roundedZoom =
      Math.round(targetZoom * roundingStepsPer100Percent) /
      roundingStepsPer100Percent;

    // Keep the result between 50% and 200%.
    return Math.min(maxZoom, Math.max(minZoom, roundedZoom));
  };
};
