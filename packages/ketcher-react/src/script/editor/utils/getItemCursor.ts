import { ClosestItemWithMap } from '../shared/closest.types';
import {
  IMAGE_KEY,
  imageReferencePositionToCursor,
  MULTITAIL_ARROW_KEY,
  multitailArrowReferenceLinesToCursor,
  multitailReferencePositionToCursor,
  ImageReferencePositionInfo,
  MultitailArrowReferencePosition,
  Render,
} from 'ketcher-core';

export function getItemCursor(
  render: Render,
  item?: ClosestItemWithMap | null,
): string {
  const defaultCursor = render.options.movingStyle.cursor as string;
  if (!item) {
    return defaultCursor;
  }
  switch (item.map) {
    case MULTITAIL_ARROW_KEY: {
      const closestItem = (
        item as ClosestItemWithMap<MultitailArrowReferencePosition>
      ).ref;
      if (!closestItem) {
        return defaultCursor;
      }
      return closestItem.isLine
        ? multitailArrowReferenceLinesToCursor[closestItem.name]
        : multitailReferencePositionToCursor[closestItem.name];
    }
    case IMAGE_KEY: {
      const closestItem =
        item.ref as ClosestItemWithMap<ImageReferencePositionInfo>;
      return closestItem.ref
        ? imageReferencePositionToCursor[closestItem.ref.name]
        : defaultCursor;
    }
    default:
      return defaultCursor;
  }
}
