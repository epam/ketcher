import {
  type Action,
  type getItemsToFuse,
  type ImageReferencePositionInfo,
  type Vec2,
  IMAGE_KEY,
} from 'ketcher-core';
import type { ClosestItemWithMap } from '../../shared/closest.types';
import type {
  CommonArrowDragContext,
  MultitailArrowClosestItem,
  ReactionArrowClosestItem,
} from '../arrow/arrow.types';

export type SelectMode = 'lasso' | 'structure' | 'rectangle';

type MergeItems = ReturnType<typeof getItemsToFuse>;

type SharedDragContext = {
  copyAction?: Action;
  mergeItems?: MergeItems;
  stopTapping?: () => void;
};

export type SelectionMoveDragContext = SharedDragContext & {
  action?: Action | null;
  item: ClosestItemWithMap<unknown>;
  xy0: Vec2;
};

export type SimpleObjectSelectionDragContext = SelectionMoveDragContext & {
  item: ClosestItemWithMap<Vec2, 'simpleObjects'> & {
    ref: Vec2;
  };
};

export type ImageSelectionDragContext = SelectionMoveDragContext & {
  item: ClosestItemWithMap<ImageReferencePositionInfo, typeof IMAGE_KEY> & {
    ref: ImageReferencePositionInfo;
  };
};

export type ArrowDragContext = CommonArrowDragContext<
  ReactionArrowClosestItem | MultitailArrowClosestItem
> &
  SharedDragContext;

export type DragContext = SelectionMoveDragContext | ArrowDragContext | null;

export function isSelectionMoveDragContext(
  dragContext: DragContext,
): dragContext is SelectionMoveDragContext {
  return !!dragContext && 'item' in dragContext && 'xy0' in dragContext;
}

export function isArrowDragContext(
  dragContext: DragContext,
): dragContext is ArrowDragContext {
  return (
    !!dragContext &&
    'closestItem' in dragContext &&
    'originalPosition' in dragContext
  );
}

export function isImageSelectionDragContext(
  dragContext: SelectionMoveDragContext,
): dragContext is ImageSelectionDragContext {
  return dragContext.item.map === IMAGE_KEY && !!dragContext.item.ref;
}

export function isSimpleObjectSelectionDragContext(
  dragContext: SelectionMoveDragContext,
): dragContext is SimpleObjectSelectionDragContext {
  return dragContext.item.map === 'simpleObjects' && !!dragContext.item.ref;
}
