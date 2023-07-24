import { Editor, ReStruct, Vec2 } from 'ketcher-core';

export function getSelectionMap(structure: ReStruct) {
  return Object.keys(ReStruct.maps).reduce((result, map) => {
    result[map] = Array.from(structure[map].keys());
    return result;
  }, {});
}

export function getStructCenter(ReStruct, selection?) {
  const bb = ReStruct.getVBoxObj(selection || {});
  return Vec2.lc2(bb.p0, 0.5, bb.p1, 0.5);
}

export function recoordinate(editor: Editor, rp?: Vec2) {
  // rp is a point in scaled coordinates, which will be positioned
  console.assert(rp, 'Reference point not specified');
  if (rp) {
    editor.render.setScrollOffset(rp.x, rp.y);
  } else {
    editor.render.setScrollOffset(0, 0);
  }
}
