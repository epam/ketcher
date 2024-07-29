import { ReStruct, Vec2 } from 'ketcher-core';

export function getSelectionMap(structure: ReStruct) {
  return Object.keys(ReStruct.maps).reduce((result, map) => {
    result[map] = Array.from(structure[map].keys());
    return result;
  }, {});
}

export function getStructCenter(reStruct: ReStruct, selection?) {
  const bb = reStruct.getVBoxObj(selection || {});
  return Vec2.lc2(bb.p0, 0.5, bb.p1, 0.5);
}
