import { SORT_TYPE, AtomXy, BondXy } from '@utils/canvas/types';

export function sortItems(
  sortBy: SORT_TYPE,
  coords: (AtomXy | BondXy)[]
): (AtomXy | BondXy)[] {
  const currentItems = [...coords];
  switch (sortBy) {
    case SORT_TYPE.DESC_X:
      currentItems.sort(
        (firstCoord, secondCoord) => secondCoord.x - firstCoord.x
      );
      break;
    case SORT_TYPE.ASC_Y:
      currentItems.sort(
        (firstCoord, secondCoord) => firstCoord.y - secondCoord.y
      );
      break;
    case SORT_TYPE.DESC_Y:
      currentItems.sort(
        (firstCoord, secondCoord) => secondCoord.y - firstCoord.y
      );
      break;
    default:
      currentItems.sort(
        (firstCoord, secondCoord) => firstCoord.x - secondCoord.x
      );
      break;
  }

  return currentItems;
}
