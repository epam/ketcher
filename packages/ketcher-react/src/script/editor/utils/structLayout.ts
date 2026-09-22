import { ReStruct, Vec2 } from 'ketcher-core';

export function getSelectionMap(structure: ReStruct) {
  return Object.keys(ReStruct.maps).reduce((result, map) => {
    result[map] = Array.from(structure[map].keys());
    return result;
  }, {});
}

export function getStructCenter(reStruct: ReStruct, selection?) {
  // Prefer getSelectionBoxCenter: it derives atom contribution from struct
  // coordinates (reAtom.a.pp) rather than the DOM-measured SVG visel bbox,
  // so the result doesn't depend on whether a render/reflow has happened
  // yet for label glyphs (see the comment on ReStruct.getSelectionBoxCenter).
  // getVBoxObj is kept only as a fallback for the degenerate case of an
  // empty structure, where there's no bounding box to derive a center from
  // and the legacy (0,0)-based center is preserved for compatibility.
  const center = reStruct.getSelectionBoxCenter(selection);
  if (center) return center;

  const bb = reStruct.getVBoxObj(selection ?? {});
  return Vec2.lc2(bb.p0, 0.5, bb.p1, 0.5);
}
